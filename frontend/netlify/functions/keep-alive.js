// Netlify Scheduled Function: Keep-Alive (Daily ping to keep Supabase active)
const { getAllPosts } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  console.log('🏓 Keep-alive ping...');

  try {
    // Simple query to keep database active
    await getAllPosts();
    
    console.log('✅ Database pinged successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Database keep-alive successful',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('❌ Error in keep-alive:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

