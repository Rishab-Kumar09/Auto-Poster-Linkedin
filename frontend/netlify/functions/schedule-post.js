// Netlify Function: Schedule a Post
const { updateScheduledTime } = require('../../../backend/supabase');

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
    const { postId, scheduledTime } = JSON.parse(event.body);

    if (!postId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Post ID is required' })
      };
    }

    // Update scheduled time (null to clear schedule)
    const updatedPost = await updateScheduledTime(postId, scheduledTime);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: scheduledTime ? 'Post scheduled successfully' : 'Schedule cleared',
        post: updatedPost
      })
    };
  } catch (error) {
    console.error('Error scheduling post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

