import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { downloadImage } from './imageFetcher.js';

dotenv.config();

// Initialize Twitter client (FREE tier)
const twitterClient = process.env.TWITTER_API_KEY ? new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
}) : null;

/**
 * Post to Twitter using FREE API
 * Limit: 500 posts/month (≈16 posts/day)
 */
export async function postToTwitter(text, isThread = false) {
  if (!twitterClient) {
    throw new Error('Twitter API credentials not configured');
  }
  
  try {
    if (isThread && Array.isArray(text)) {
      // Post thread
      console.log(`🐦 Posting Twitter thread (${text.length} tweets)...`);
      
      let previousTweetId = null;
      const tweetIds = [];
      
      for (const tweet of text) {
        const response = await twitterClient.v2.tweet({
          text: tweet,
          reply: previousTweetId ? { in_reply_to_tweet_id: previousTweetId } : undefined
        });
        
        previousTweetId = response.data.id;
        tweetIds.push(previousTweetId);
        
        // Small delay between tweets
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Thread posted! IDs: ${tweetIds.join(', ')}`);
      return {
        success: true,
        tweetIds,
        url: `https://twitter.com/i/status/${tweetIds[0]}`
      };
    } else {
      // Single tweet
      console.log('🐦 Posting to Twitter...');
      const response = await twitterClient.v2.tweet({ text });
      
      console.log(`✅ Tweet posted! ID: ${response.data.id}`);
      return {
        success: true,
        tweetId: response.data.id,
        url: `https://twitter.com/i/status/${response.data.id}`
      };
    }
  } catch (error) {
    console.error('Twitter API error:', error);
    throw new Error(`Failed to post to Twitter: ${error.message}`);
  }
}

/**
 * Upload image to LinkedIn
 */
async function uploadLinkedInImage(imageUrl, personUrn, accessToken) {
  try {
    // Step 1: Register upload
    const registerResponse = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.data.value.asset;
    
    // Step 2: Download image
    const imageBuffer = await downloadImage(imageUrl);
    
    // Step 3: Upload image
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
    
    console.log('✅ Image uploaded to LinkedIn');
    return asset;
  } catch (error) {
    console.error('LinkedIn image upload error:', error.response?.data || error.message);
    return null; // Return null on error, post will go without image
  }
}

/**
 * Post to LinkedIn using Official API
 * Requires: Company verification + OAuth access token
 */
export async function postToLinkedIn(text, personUrn = null, imageUrl = null) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = personUrn || process.env.LINKEDIN_PERSON_URN;
  
  if (!accessToken || !authorUrn) {
    throw new Error('LinkedIn credentials not configured. Run LinkedIn OAuth flow first.');
  }
  
  try {
    console.log('💼 Posting to LinkedIn...');
    
    let imageAsset = null;
    if (imageUrl) {
      console.log('📤 Uploading image to LinkedIn...');
      imageAsset = await uploadLinkedInImage(imageUrl, authorUrn, accessToken);
    }
    
    // Build post content
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: imageAsset ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // Add image if uploaded
    if (imageAsset) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: 'Image'
          },
          media: imageAsset,
          title: {
            text: 'Image'
          }
        }
      ];
    }
    
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    const postId = response.headers['x-restli-id'];
    console.log(`✅ LinkedIn post published${imageAsset ? ' with image' : ''}! ID: ${postId}`);
    
    return {
      success: true,
      postId,
      url: `https://www.linkedin.com/feed/update/${postId}`,
      hasImage: !!imageAsset
    };
  } catch (error) {
    console.error('LinkedIn API error:', error.response?.data || error.message);
    throw new Error(`Failed to post to LinkedIn: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get LinkedIn OAuth URL for initial authentication
 */
export function getLinkedInAuthUrl() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = 'http://localhost:3001/auth/linkedin/callback';
  const scope = 'r_liteprofile w_member_social';
  
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
}

/**
 * Exchange LinkedIn OAuth code for access token
 */
export async function getLinkedInAccessToken(code) {
  const response = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: 'http://localhost:3001/auth/linkedin/callback'
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  
  return response.data.access_token;
}

/**
 * Get LinkedIn Person URN
 */
export async function getLinkedInPersonUrn(accessToken) {
  const response = await axios.get('https://api.linkedin.com/v2/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  return `urn:li:person:${response.data.id}`;
}

/**
 * Check posting limits (Twitter FREE tier: 500/month)
 */
export async function checkPostingLimits() {
  // This would query your database to count posts this month
  const db = getDatabase();
  
  const twitterCount = db.prepare(`
    SELECT COUNT(*) as count FROM posts 
    WHERE status = 'posted' 
    AND posted_at >= date('now', 'start of month')
    AND (twitter_post IS NOT NULL OR twitter_thread IS NOT NULL)
  `).get().count;
  
  const linkedinCount = db.prepare(`
    SELECT COUNT(*) as count FROM posts 
    WHERE status = 'posted' 
    AND posted_at >= date('now', 'start of month')
    AND linkedin_post IS NOT NULL
  `).get().count;
  
  return {
    twitter: {
      used: twitterCount,
      limit: 500,
      remaining: 500 - twitterCount,
      dailyAverage: Math.floor((500 - twitterCount) / 30)
    },
    linkedin: {
      used: linkedinCount,
      limit: 'Unlimited',
      remaining: 'Unlimited'
    }
  };
}

// Test posting (commented out for safety)
/*
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('⚠️  This would post to your actual accounts!');
  console.log('Uncomment the code below to test posting.\n');
  
  // Uncomment to test:
  // postToTwitter('🚀 Testing my new AI-powered social media automation tool! This is going to be epic. #AI #Automation')
  //   .then(result => console.log('Twitter result:', result));
  
  // postToLinkedIn('I just built an AI-powered social media automation tool that generates and posts content automatically.\n\nIt fetches trending content from YouTube, Reddit, and news sources, then uses AI to create engaging posts for Twitter and LinkedIn.\n\nExcited to see how this grows my reach! 🚀\n\n#AI #Automation #SocialMedia #ContentMarketing')
  //   .then(result => console.log('LinkedIn result:', result));
}
*/

