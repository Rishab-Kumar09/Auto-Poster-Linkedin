// Netlify Function: Get Automation Settings
const { supabase } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get settings from database
    const { data, error } = await supabase
      .from('automation_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return default settings if none exist
    const settings = data || {
      auto_generate: false,
      auto_post: false,
      post_frequency: 4,
      platforms: ['linkedin'],
      topics: ['AI', 'Startups', 'Technology']
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(settings)
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

