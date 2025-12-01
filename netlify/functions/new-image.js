// Netlify Function: Get New Image for Post
const { fetchImage } = require('../../backend/imageFetcher');
const db = require('../../backend/database');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

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
    // Extract postId from path: /api/new-image/123
    const pathParts = event.path.split('/');
    const postId = pathParts[pathParts.length - 1];

    if (!postId || isNaN(postId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid post ID' })
      };
    }

    // Get post from database
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(postId));
    
    if (!post) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Post not found' })
      };
    }

    // Fetch new image
    const imageData = await fetchImage(post.content);

    // Update post with new image
    db.prepare('UPDATE posts SET image_url = ?, image_data = ? WHERE id = ?')
      .run(imageData.url, JSON.stringify(imageData), parseInt(postId));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Image updated successfully',
        imageData
      })
    };
  } catch (error) {
    console.error('Error fetching new image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

