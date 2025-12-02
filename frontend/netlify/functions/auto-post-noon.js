// Netlify Scheduled Function: Auto-Post (12pm)
const { postToLinkedIn, postToX } = require('../../../backend/autoPost');
const { getScheduledPosts, updatePostStatus } = require('../../../backend/supabase');

exports.handler = async (event, context) => {
  console.log('📤 Scheduled: Auto-posting (8am slot)...');

  try {
    const autoPost = process.env.AUTO_POST === 'true';
    const requireApproval = process.env.REQUIRE_APPROVAL === 'true';
    const platforms = process.env.AUTO_POST_PLATFORMS 
      ? process.env.AUTO_POST_PLATFORMS.split(',').map(p => p.trim())
      : ['linkedin'];

    if (!autoPost || requireApproval) {
      console.log('⏸️ Auto-posting disabled or requires approval');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Auto-posting skipped' })
      };
    }

    // Get posts that are scheduled to post now
    let posted = 0;
    for (const platform of platforms) {
      const posts = await getScheduledPosts(platform);
      const post = posts[0]; // Get first scheduled post for this platform

      if (!post) {
        console.log(`⚠️ No scheduled posts for ${platform} at this time`);
        continue;
      }

      console.log(`📅 Posting scheduled post #${post.id} to ${platform}`);

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
      try {
        let result;
        const imageUrl = imageData?.url || null;
        
        if (platform === 'linkedin') {
          result = await postToLinkedIn(post.content, null, imageUrl);
        } else if (platform === 'x') {
          result = await postToX(post.content, imageData);
        }

        // Update post status
        await updatePostStatus(post.id, 'posted');

        console.log(`✅ Posted to ${platform}: Post ID ${post.id}`);
        posted++;
      } catch (error) {
        console.error(`❌ Error posting to ${platform}:`, error);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Auto-posting complete',
        posted
      })
    };
  } catch (error) {
    console.error('❌ Error in auto-post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

