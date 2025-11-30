import cron from 'node-cron';
import { fetchContent } from './contentFetcher.js';
import { generatePosts } from './aiGenerator.js';
import { postToTwitter, postToLinkedIn, checkPostingLimits } from './autoPost.js';
import { getDatabase } from './database.js';
import { fetchImage, getImageKeywords } from './imageFetcher.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Main scheduler for automated content generation and posting
 */
export function startScheduler() {
  console.log('⏰ Starting automated scheduler...\n');
  
  const topics = process.env.TOPICS?.split(',') || ['AI', 'Startups'];
  const postingTimes = process.env.POSTING_TIMES?.split(',') || ['09:00', '14:00', '19:00'];
  const autoPost = process.env.AUTO_POST === 'true';
  const requireApproval = process.env.REQUIRE_APPROVAL !== 'false';
  
  console.log('📋 Configuration:');
  console.log(`   Topics: ${topics.join(', ')}`);
  console.log(`   Posting times: ${postingTimes.join(', ')}`);
  console.log(`   Auto-post: ${autoPost ? '✅' : '❌ (requires approval)'}`);
  console.log(`   AI Provider: ${process.env.PREFERRED_AI || 'groq'}\n`);
  
  // Fetch fresh content every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n🔍 [Scheduled] Fetching fresh content...');
    try {
      const content = await fetchContent(topics);
      console.log(`✅ Fetched ${content.length} items`);
      
      // Generate posts for top 3 items
      const topContent = content.slice(0, 3);
      for (const item of topContent) {
        await generateAndStore(item);
      }
    } catch (error) {
      console.error('❌ Error in content fetch:', error.message);
    }
  });
  
  // Schedule posts at specific times
  postingTimes.forEach(time => {
    const [hours, minutes] = time.split(':');
    const cronTime = `${minutes} ${hours} * * *`;
    
    cron.schedule(cronTime, async () => {
      console.log(`\n📤 [Scheduled] Post time: ${time}`);
      
      if (autoPost && !requireApproval) {
        await postNextApprovedContent();
      } else {
        console.log('⏸️  Auto-post disabled. Posts waiting for approval.');
      }
    });
    
    console.log(`✅ Scheduled posting at ${time}`);
  });
  
  // Check limits daily
  cron.schedule('0 0 * * *', async () => {
    console.log('\n📊 [Daily] Checking posting limits...');
    const limits = await checkPostingLimits();
    console.log('Twitter:', limits.twitter);
    console.log('LinkedIn:', limits.linkedin);
    
    if (limits.twitter.remaining < 50) {
      console.warn('⚠️  WARNING: Approaching Twitter monthly limit!');
    }
  });
  
  // Growth optimization: Post high-performing content types
  cron.schedule('0 12 * * *', async () => {
    console.log('\n📈 [Growth] Analyzing top-performing content...');
    await analyzeAndOptimize();
  });
  
  console.log('\n✅ Scheduler started successfully!');
  console.log('Press Ctrl+C to stop.\n');
}

/**
 * Generate and store posts
 */
async function generateAndStore(content) {
  try {
    console.log(`\n🤖 Generating posts for: ${content.title.slice(0, 50)}...`);
    
    const posts = await generatePosts(
      content,
      process.env.PREFERRED_AI || 'groq',
      'professional'
    );
    
    // Fetch relevant image based on post content
    console.log('🖼️  Fetching relevant image...');
    const imageKeywords = getImageKeywords(content);
    const image = await fetchImage(imageKeywords, posts.linkedin.post);
    
    if (image) {
      console.log(`✅ Image found: ${image.url.slice(0, 60)}...`);
    }
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO posts (content_source, twitter_post, twitter_thread, linkedin_post, tone, image_url, image_data, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      JSON.stringify(content),
      posts.twitter.tweet,
      JSON.stringify(posts.twitter.thread),
      posts.linkedin.post,
      'professional',
      image?.url || null,
      image ? JSON.stringify(image) : null,
      'pending'
    );
    
    console.log('✅ Posts generated and stored with image');
  } catch (error) {
    console.error('❌ Error generating posts:', error.message);
  }
}

/**
 * Post next approved content
 */
async function postNextApprovedContent() {
  try {
    const db = getDatabase();
    
    // Get next pending post
    const post = db.prepare(`
      SELECT * FROM posts 
      WHERE status = 'pending' 
      ORDER BY created_at ASC 
      LIMIT 1
    `).get();
    
    if (!post) {
      console.log('📭 No pending posts to publish');
      return;
    }
    
    console.log(`📤 Publishing post ID ${post.id}...`);
    
    // Get configured platforms
    const platforms = (process.env.AUTO_POST_PLATFORMS || 'linkedin,twitter')
      .split(',')
      .map(p => p.trim().toLowerCase());
    
    console.log(`📱 Posting to: ${platforms.join(', ')}`);
    
    // Post to Twitter if enabled
    if (platforms.includes('twitter')) {
      try {
        const twitterResult = await postToTwitter(post.twitter_post);
        console.log('✅ Posted to Twitter:', twitterResult.url);
      } catch (error) {
        console.error('❌ Twitter error:', error.message);
      }
    }
    
    // Post to LinkedIn if enabled
    if (platforms.includes('linkedin')) {
      try {
        const imageUrl = post.image_url || null;
        const linkedinResult = await postToLinkedIn(post.linkedin_post, null, imageUrl);
        console.log('✅ Posted to LinkedIn:', linkedinResult.url);
        if (linkedinResult.hasImage) {
          console.log('   📸 With image attached');
        }
      } catch (error) {
        console.error('❌ LinkedIn error:', error.message);
      }
    }
    
    // Update status
    db.prepare('UPDATE posts SET status = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('posted', post.id);
    
    console.log('✅ Post published successfully');
  } catch (error) {
    console.error('❌ Error in auto-posting:', error.message);
  }
}

/**
 * Analyze top-performing content for growth optimization
 */
async function analyzeAndOptimize() {
  try {
    const db = getDatabase();
    
    // Get posts with engagement data
    const topPosts = db.prepare(`
      SELECT p.*, a.likes, a.comments, a.shares, a.impressions
      FROM posts p
      LEFT JOIN analytics a ON p.id = a.post_id
      WHERE p.status = 'posted'
      ORDER BY a.engagement_score DESC
      LIMIT 10
    `).all();
    
    if (topPosts.length === 0) {
      console.log('📊 Not enough data yet for optimization');
      return;
    }
    
    console.log('📈 Top-performing posts analysis:');
    
    // Analyze patterns
    const patterns = {
      topics: {},
      tones: {},
      postingTimes: {}
    };
    
    topPosts.forEach(post => {
      const source = JSON.parse(post.content_source);
      patterns.topics[source.topic] = (patterns.topics[source.topic] || 0) + 1;
      patterns.tones[post.tone] = (patterns.tones[post.tone] || 0) + 1;
    });
    
    console.log('\n🎯 Best-performing topics:');
    Object.entries(patterns.topics)
      .sort((a, b) => b[1] - a[1])
      .forEach(([topic, count]) => {
        console.log(`   ${topic}: ${count} top posts`);
      });
    
    console.log('\n🎨 Best-performing tones:');
    Object.entries(patterns.tones)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tone, count]) => {
        console.log(`   ${tone}: ${count} top posts`);
      });
    
    console.log('\n💡 Recommendation: Focus on these topics and tones for faster growth!');
  } catch (error) {
    console.error('❌ Error in optimization:', error.message);
  }
}

/**
 * Run immediate test cycle
 */
export async function runTestCycle() {
  console.log('🧪 Running test cycle...\n');
  
  const topics = ['AI'];
  
  // 1. Fetch content
  console.log('1️⃣  Fetching content...');
  const content = await fetchContent(topics);
  console.log(`   ✅ Fetched ${content.length} items\n`);
  
  // 2. Generate posts
  console.log('2️⃣  Generating posts...');
  const testContent = content[0];
  const posts = await generatePosts(testContent, 'groq', 'professional');
  console.log('   ✅ Posts generated\n');
  
  console.log('📝 Preview:\n');
  console.log('Twitter:', posts.twitter.tweet);
  console.log('\nLinkedIn:', posts.linkedin.post.slice(0, 150) + '...\n');
  
  // 3. Store in database
  console.log('3️⃣  Storing in database...');
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO posts (content_source, twitter_post, twitter_thread, linkedin_post, tone, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  
  const result = stmt.run(
    JSON.stringify(testContent),
    posts.twitter.tweet,
    JSON.stringify(posts.twitter.thread),
    posts.linkedin.post,
    'professional'
  );
  
  console.log(`   ✅ Stored as post ID ${result.lastInsertRowid}\n`);
  
  console.log('✅ Test cycle complete! Check the frontend to review and post.');
}

// Start scheduler if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduler();
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down scheduler...');
    process.exit(0);
  });
}

