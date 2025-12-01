// Netlify Scheduled Function: Fetch Content (Every 6 hours)
const { fetchContent } = require('../../backend/contentFetcher');
const { generatePosts } = require('../../backend/aiGenerator');
const { fetchImage } = require('../../backend/imageFetcher');
const db = require('../../backend/database');

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
    const posts = await generatePosts(content, postFrequency);
    console.log(`✅ Posts generated: ${posts.length}`);

    // Fetch images for each post
    for (const post of posts) {
      try {
        const imageData = await fetchImage(post.content);
        post.image_url = imageData.url;
        post.image_data = JSON.stringify(imageData);
      } catch (err) {
        console.error('Error fetching image:', err);
        post.image_url = null;
        post.image_data = null;
      }
    }
    console.log('✅ Images fetched');

    // Store posts in database
    const insertStmt = db.prepare(`
      INSERT INTO posts (platform, content, status, image_url, image_data)
      VALUES (?, ?, ?, ?, ?)
    `);

    const status = autoPost ? 'pending' : 'draft';
    for (const post of posts) {
      insertStmt.run(post.platform, post.content, status, post.image_url, post.image_data);
    }

    console.log(`✅ ${posts.length} posts saved to database with status: ${status}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content fetched and posts generated',
        count: posts.length
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

