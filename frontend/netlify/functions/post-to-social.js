// Netlify Function: Post to Social Media
const { postToLinkedIn, postToX } = require('../../backend/autoPost');
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
    const { postId } = JSON.parse(event.body);

    // Get post from database
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    
    if (!post) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Post not found' })
      };
    }

    // Parse image data
    let imageData = null;
    if (post.image_data) {
      try {
        imageData = JSON.parse(post.image_data);
      } catch (e) {
        console.error('Error parsing image data:', e);
      }
    }

    // Post to platform
    let result;
    if (post.platform === 'linkedin') {
      result = await postToLinkedIn(post.content, imageData);
    } else if (post.platform === 'x') {
      result = await postToX(post.content, imageData);
    } else {
      throw new Error(`Unknown platform: ${post.platform}`);
    }

    // Update post status
    db.prepare('UPDATE posts SET status = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('posted', postId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Post published successfully',
        result
      })
    };
  } catch (error) {
    console.error('Error posting to social media:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

