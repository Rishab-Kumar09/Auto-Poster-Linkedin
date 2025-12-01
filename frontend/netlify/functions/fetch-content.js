// Netlify Scheduled Function: Fetch Content (Every 6 hours)
const { fetchContent } = require('../../../backend/contentFetcher');
const { generatePosts } = require('../../../backend/aiGenerator');
const { fetchImage } = require('../../../backend/imageFetcher');
const { insertPost } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  console.log('🔄 Scheduled: Fetching content...');

  try {
    // Get topics from environment or use defaults
    const topics = process.env.TOPICS 
      ? process.env.TOPICS.split(',').map(t => t.trim())
      : ['AI', 'Software Development', 'Coding', 'Tech Innovation'];

    const postFrequency = parseInt(process.env.POST_FREQUENCY || '4');
    const autoPost = process.env.AUTO_POST === 'true';

    console.log(`Topics: ${topics.join(', ')}`);
    console.log(`Generating ${postFrequency} posts...`);

    // Fetch content
    const content = await fetchContent(topics);
    console.log(`✅ Content fetched: ${content.length} items`);

    // Generate posts
    const postsToGenerate = Math.min(content.length, postFrequency);
    const allPosts = [];
    
    for (let i = 0; i < postsToGenerate; i++) {
      const generated = await generatePosts(content[i], 'groq', 'professional');
      
      // Convert to database format (one row per platform)
      allPosts.push({
        platform: 'linkedin',
        content: generated.linkedin.post
      });
    }
    console.log(`✅ Posts generated: ${allPosts.length}`);

    // Fetch images for each post
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
    console.log('✅ Images fetched');

    // Store posts in database
    const status = autoPost ? 'pending' : 'draft';
    for (const post of allPosts) {
      await insertPost(
        post.platform,
        post.content,
        status,
        post.image_url,
        post.image_data
      );
    }

    console.log(`✅ ${allPosts.length} posts saved to database with status: ${status}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content fetched and posts generated',
        count: allPosts.length
      })
    };
  } catch (error) {
    console.error('❌ Error in fetch-content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

