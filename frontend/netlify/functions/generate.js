// Netlify Function: Generate Posts
const { fetchContent } = require('../../../backend/contentFetcher');
const { generatePosts } = require('../../../backend/aiGenerator');
const { fetchImage } = require('../../../backend/imageFetcher');
const { insertPost } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topics, count } = JSON.parse(event.body);

    console.log('Fetching content for topics:', topics);
    const content = await fetchContent(topics || ['AI', 'Software Development']);

    console.log('Generating posts...');
    // Generate one post set per content item (max 5)
    const postsToGenerate = Math.min(content.length, count || 5);
    const allPosts = [];
    
    for (let i = 0; i < postsToGenerate; i++) {
      try {
        console.log(`🤖 Generating posts with GROQ for content #${i + 1}/${postsToGenerate}...`);
        const generated = await generatePosts(content[i], 'groq', 'professional');
        
        if (!generated || !generated.linkedin || !generated.linkedin.post) {
          console.error(`❌ Generated post #${i + 1} has invalid structure:`, JSON.stringify(generated));
          continue; // Skip this post
        }
        
        // Convert to database format (one row per platform)
        // LinkedIn post
        const linkedinPost = {
          platform: 'linkedin',
          content: generated.linkedin.post
        };
        
        // Add to array
        allPosts.push(linkedinPost);
        console.log(`✅ Post #${i + 1} generated successfully`);
      } catch (err) {
        console.error(`❌ Error generating post #${i + 1}:`, err.message, err.stack);
        // Continue with next post instead of failing entirely
      }
    }

    // Fetch images for each post
    console.log('Fetching images...');
    for (const post of allPosts) {
      try {
        // Pass post content as SECOND parameter for keyword analysis
        const imageData = await fetchImage('technology', post.content);
        if (imageData) {
          post.image_url = imageData.url;
          post.image_data = JSON.stringify(imageData);
        } else {
          post.image_url = null;
          post.image_data = null;
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        post.image_url = null;
        post.image_data = null;
      }
    }

    // Check if we generated any posts
    if (allPosts.length === 0) {
      console.error('❌ No posts were generated successfully');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to generate posts. Content might be filtered out or AI generation failed.'
        })
      };
    }

    // Store posts in database
    for (const post of allPosts) {
      await insertPost(
        post.platform,
        post.content,
        'pending',
        post.image_url,
        post.image_data
      );
    }

    console.log(`✅ Successfully generated and stored ${allPosts.length} posts`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Posts generated successfully',
        count: allPosts.length,
        posts: allPosts
      })
    };
  } catch (error) {
    console.error('Error generating posts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

