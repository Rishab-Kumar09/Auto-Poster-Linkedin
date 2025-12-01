// Netlify Function: Generate Posts
const { fetchContent } = require('../../backend/contentFetcher');
const { generatePosts } = require('../../backend/aiGenerator');
const { fetchImage } = require('../../backend/imageFetcher');
const db = require('../../backend/database');

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
    const posts = await generatePosts(content, count || 5);

    // Fetch images for each post
    console.log('Fetching images...');
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

    // Store posts in database
    const insertStmt = db.prepare(`
      INSERT INTO posts (platform, content, status, image_url, image_data)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const post of posts) {
      insertStmt.run(post.platform, post.content, 'pending', post.image_url, post.image_data);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Posts generated successfully',
        count: posts.length,
        posts
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

