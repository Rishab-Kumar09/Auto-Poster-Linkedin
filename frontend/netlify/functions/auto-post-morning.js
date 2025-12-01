// Netlify Scheduled Function: Auto-Post (8am)
const { postToLinkedIn, postToX } = require('../../backend/autoPost');
const db = require('../../backend/database');

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

    // Get one pending post for each platform
    let posted = 0;
    for (const platform of platforms) {
      const post = db.prepare(
        'SELECT * FROM posts WHERE platform = ? AND status = ? ORDER BY created_at ASC LIMIT 1'
      ).get(platform, 'pending');

      if (!post) {
        console.log(`⚠️ No pending posts for ${platform}`);
        continue;
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
      try {
        let result;
        if (platform === 'linkedin') {
          result = await postToLinkedIn(post.content, imageData);
        } else if (platform === 'x') {
          result = await postToX(post.content, imageData);
        }

        // Update post status
        db.prepare('UPDATE posts SET status = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('posted', post.id);

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

