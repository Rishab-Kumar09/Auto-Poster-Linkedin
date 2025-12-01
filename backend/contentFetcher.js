import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import snoowrap from 'snoowrap';
import dotenv from 'dotenv';
// Database handled by calling functions, not by contentFetcher itself

dotenv.config();

// Initialize Reddit client (optional)
let reddit = null;
if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
  reddit = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'social-automation-bot/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN
  });
}

/**
 * Fetch content from multiple sources
 * @param {string[]} topics - Array of topics to fetch content for
 * @returns {Promise<Array>} Array of content objects
 */
export async function fetchContent(topics) {
  console.log(`🔍 Fetching content for topics: ${topics.join(', ')}`);
  
  const allContent = [];
  
  for (const topic of topics) {
    try {
      // Fetch from all sources in parallel
      const [newsItems, youtubeItems, redditItems] = await Promise.all([
        fetchNews(topic),
        fetchYouTube(topic),
        fetchReddit(topic)
      ]);
      
      allContent.push(...newsItems, ...youtubeItems, ...redditItems);
    } catch (error) {
      console.error(`Error fetching content for ${topic}:`, error.message);
    }
  }
  
  // No caching needed - posts stored in Supabase by calling functions
  console.log(`✅ Fetched ${allContent.length} content items`);
  return allContent;
}

/**
 * Fetch news articles from News API
 */
async function fetchNews(topic) {
  if (!process.env.NEWS_API_KEY) {
    console.warn('⚠️  News API key not found, skipping news fetch');
    return [];
  }
  
  try {
    // Get date from 7 days ago for recent news only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: topic,
        from: fromDate,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
        apiKey: process.env.NEWS_API_KEY
      }
    });
    
    return response.data.articles
      .filter(article => {
        const title = (article.title || '').toLowerCase();
        const content = (article.description || article.content || '').toLowerCase();
        const combined = title + ' ' + content;
        
        // Filter out POLITICAL content (CRITICAL!)
        const politicalKeywords = [
          'trump', 'biden', 'president', 'election', 'congress', 'senate', 'republican', 'democrat', 
          'political', 'politics', 'government', 'white house', 'administration', 'campaign', 'vote', 'voting',
          'geopolitical', 'diplomatic', 'sanctions', 'ukraine', 'russia', 'china policy', 'venezuela',
          'nato', 'military', 'war', 'defense', 'pentagon', 'state department'
        ];
        if (politicalKeywords.some(keyword => combined.includes(keyword))) {
          console.log(`🚫 Filtered political content: ${title}`);
          return false;
        }
        
        // Filter out religious content
        const religiousKeywords = ['bible', 'church', 'prayer', 'faith', 'god', 'jesus', 'christian', 'islam', 'muslim', 'hindu', 'buddhist', 'religion'];
        if (religiousKeywords.some(keyword => combined.includes(keyword))) {
          return false;
        }
        
        // Filter out gaming/entertainment (not relevant for AI development)
        const gamingKeywords = ['playstation', 'ps5', 'xbox', 'nintendo', 'gaming', 'game console', 'video game', 'gamer'];
        if (gamingKeywords.some(keyword => combined.includes(keyword))) {
          return false;
        }
        
        // Filter out sports/entertainment
        const entertainmentKeywords = ['sports', 'football', 'basketball', 'celebrity', 'movie', 'film'];
        if (entertainmentKeywords.some(keyword => combined.includes(keyword))) {
          return false;
        }
        
        return true;
      })
      .map(article => ({
        source: 'news',
        topic,
        url: article.url,
        title: article.title,
        content: article.description || article.content,
        publishedAt: article.publishedAt
      }));
  } catch (error) {
    console.error('News API error:', error.message);
    return [];
  }
}

/**
 * Fetch trending YouTube videos
 */
async function fetchYouTube(topic) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('⚠️  YouTube API key not found, skipping YouTube fetch');
    return [];
  }
  
  try {
    // Get date from 30 days ago for recent videos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();
    
    // Search for videos
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: topic,
        type: 'video',
        order: 'date', // Changed from 'viewCount' to 'date' for recent content
        publishedAfter: publishedAfter,
        maxResults: 3,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    const videos = [];
    
    for (const item of searchResponse.data.items) {
      const videoId = item.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // Fetch transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const transcriptText = transcript.map(t => t.text).join(' ').slice(0, 2000);
        
        videos.push({
          source: 'youtube',
          topic,
          url: videoUrl,
          title: item.snippet.title,
          content: transcriptText,
          publishedAt: item.snippet.publishedAt
        });
      } catch (error) {
        // Transcript not available, use description
        videos.push({
          source: 'youtube',
          topic,
          url: videoUrl,
          title: item.snippet.title,
          content: item.snippet.description,
          publishedAt: item.snippet.publishedAt
        });
      }
    }
    
    return videos;
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return [];
  }
}

/**
 * Fetch top posts from Reddit
 */
async function fetchReddit(topic) {
  if (!reddit) {
    console.warn('⚠️  Reddit credentials not found, skipping Reddit fetch');
    return [];
  }
  
  try {
    // Map topics to subreddits
    const subredditMap = {
      'AI': 'MachineLearning+artificial+OpenAI',
      'Startups': 'startups+Entrepreneur',
      'Product Design': 'ProductManagement+UXDesign',
      'Marketing': 'marketing+growth_hacking',
      'Technology': 'technology+tech'
    };
    
    const subreddit = subredditMap[topic] || topic.toLowerCase();
    
    const posts = await reddit.search({
      query: topic,
      subreddit,
      sort: 'hot',
      time: 'week',
      limit: 5
    });
    
    return posts.map(post => ({
      source: 'reddit',
      topic,
      url: `https://reddit.com${post.permalink}`,
      title: post.title,
      content: post.selftext || post.title,
      score: post.score,
      publishedAt: new Date(post.created_utc * 1000).toISOString()
    }));
  } catch (error) {
    console.error('Reddit API error:', error.message);
    return [];
  }
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const topics = process.env.TOPICS?.split(',') || ['AI', 'Startups'];
  fetchContent(topics).then(content => {
    console.log('\n📦 Fetched Content:');
    console.log(JSON.stringify(content, null, 2));
    process.exit(0);
  });
}

