// Netlify Function: Save Automation Settings
const { supabase } = require('../../../backend/supabase');

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
    const settings = JSON.parse(event.body);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('automation_settings')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('automation_settings')
        .update({
          auto_generate: settings.auto_generate,
          auto_post: settings.auto_post,
          post_frequency: settings.post_frequency,
          platforms: settings.platforms,
          topics: settings.topics,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('automation_settings')
        .insert([{
          auto_generate: settings.auto_generate,
          auto_post: settings.auto_post,
          post_frequency: settings.post_frequency,
          platforms: settings.platforms,
          topics: settings.topics
        }])
        .select();

      if (error) throw error;
      result = data[0];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Settings saved successfully',
        settings: result
      })
    };
  } catch (error) {
    console.error('Error saving settings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

