import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchContent } from './contentFetcher.js';
import { generatePosts } from './aiGenerator.js';
import { postToTwitter, postToLinkedIn } from './autoPost.js';
import { initDatabase } from './supabase.js';
import { fetchImage, getImageKeywords } from './imageFetcher.js';
import axios from 'axios';
import { 
  getGrowthRecommendations, 
  predictViralPotential,
  getOptimalSchedule,
  getGrowthMetrics 
} from './growthOptimizer.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// API Routes

// Fetch fresh content
app.post('/api/fetch-content', async (req, res) => {
  try {
    const { topics } = req.body;
    const topicsArray = topics || process.env.TOPICS.split(',');
    
    console.log('Fetching content for topics:', topicsArray);
    const content = await fetchContent(topicsArray);
    
    res.json({
      success: true,
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate posts from content
app.post('/api/generate-posts', async (req, res) => {
  try {
    const { content, aiProvider, tone } = req.body;
    
    console.log(`Generating posts with ${aiProvider || 'default'} AI...`);
    const posts = await generatePosts(content, aiProvider, tone);
    
    // Fetch relevant image based on generated post content
    console.log('🖼️  Analyzing post and fetching relevant image...');
    const imageKeywords = getImageKeywords(content);
    // Use LinkedIn post text for keyword extraction (it's longer and more detailed)
    const postText = posts.linkedin.post;
    const image = await fetchImage(imageKeywords, postText);
    
    if (image) {
      console.log(`✅ Image found: ${image.url}`);
    }
    
    // Save to database
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
      tone || 'professional',
      image?.url || null,
      image ? JSON.stringify(image) : null,
      'pending'
    );
    
    res.json({
      success: true,
      posts,
      image
    });
  } catch (error) {
    console.error('Error generating posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all pending posts
app.get('/api/posts/pending', (req, res) => {
  try {
    const db = getDatabase();
    const posts = db.prepare(`
      SELECT * FROM posts 
      WHERE status = 'pending' 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all();
    
    res.json({
      success: true,
      posts: posts.map(post => ({
        ...post,
        content_source: JSON.parse(post.content_source),
        twitter_thread: JSON.parse(post.twitter_thread)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete post
app.delete('/api/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regenerate image for post
app.post('/api/post/:id/regenerate-image', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    const content = JSON.parse(post.content_source);
    
    // Get new image analyzing the post text
    console.log('🔄 Analyzing post and fetching new image...');
    const imageKeywords = getImageKeywords(content);
    
    // Use the LinkedIn post text for better keyword extraction
    const postText = post.linkedin_post;
    
    // Fetch multiple images and score them
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: imageKeywords,
        per_page: 10,
        orientation: 'landscape',
        content_filter: 'high'
      },
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      // Pick a different random image (skip the first one if possible)
      const startIndex = response.data.results.length > 1 ? 1 : 0;
      const randomIndex = startIndex + Math.floor(Math.random() * Math.min(5, response.data.results.length - startIndex));
      const image = response.data.results[randomIndex];
      
      const newImageData = {
        url: image.urls.regular,
        downloadUrl: image.links.download_location,
        photographer: image.user.name,
        photographerUrl: image.user.links.html,
        description: image.description || image.alt_description
      };
      
      // Update post with new image
      db.prepare('UPDATE posts SET image_url = ?, image_data = ? WHERE id = ?')
        .run(newImageData.url, JSON.stringify(newImageData), id);
      
      console.log(`✅ New image found: ${newImageData.url}`);
      
      res.json({
        success: true,
        image: newImageData
      });
    } else {
      res.status(404).json({ success: false, error: 'No images found' });
    }
  } catch (error) {
    console.error('Error regenerating image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve and post
app.post('/api/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms, editedContent } = req.body;
    
    const db = getDatabase();
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    const results = {};
    
    // Post to Twitter
    if (platforms.includes('twitter')) {
      const tweetText = editedContent?.twitter || post.twitter_post;
      results.twitter = await postToTwitter(tweetText);
    }
    
    // Post to LinkedIn
    if (platforms.includes('linkedin')) {
      const linkedinText = editedContent?.linkedin || post.linkedin_post;
      const imageUrl = post.image_url || null;
      results.linkedin = await postToLinkedIn(linkedinText, null, imageUrl);
    }
    
    // Update status
    db.prepare('UPDATE posts SET status = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('posted', id);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error posting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics
app.get('/api/analytics', (req, res) => {
  try {
    const db = getDatabase();
    
    const stats = {
      totalPosts: db.prepare('SELECT COUNT(*) as count FROM posts WHERE status = "posted"').get().count,
      pendingPosts: db.prepare('SELECT COUNT(*) as count FROM posts WHERE status = "pending"').get().count,
      todayPosts: db.prepare(`
        SELECT COUNT(*) as count FROM posts 
        WHERE status = "posted" AND DATE(posted_at) = DATE('now')
      `).get().count
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get growth recommendations
app.get('/api/growth/recommendations', (req, res) => {
  try {
    const recommendations = getGrowthRecommendations();
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get optimal posting schedule
app.get('/api/growth/schedule', (req, res) => {
  try {
    const postsPerDay = parseInt(req.query.postsPerDay) || 5;
    const schedule = getOptimalSchedule(postsPerDay);
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get growth metrics
app.get('/api/growth/metrics', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const metrics = getGrowthMetrics(days);
    res.json({ success: true, ...metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Predict viral potential
app.post('/api/growth/predict-viral', (req, res) => {
  try {
    const { text } = req.body;
    const prediction = predictViralPotential(text);
    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Social Media Automation Server running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized`);
  console.log(`🤖 AI Providers: OpenAI, Groq, Gemini`);
  console.log(`📱 Platforms: Twitter (Playwright), LinkedIn (Official API)`);
});

