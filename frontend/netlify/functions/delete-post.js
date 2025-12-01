// Netlify Function: Delete Post
const { deletePost } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Extract postId from path: /api/delete-post/123
    const pathParts = event.path.split('/');
    const postId = pathParts[pathParts.length - 1];

    if (!postId || isNaN(postId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid post ID' })
      };
    }

    await deletePost(parseInt(postId));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Post deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

