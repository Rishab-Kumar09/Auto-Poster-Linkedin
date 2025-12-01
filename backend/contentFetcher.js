import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import snoowrap from 'snoowrap';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
// Database handled by calling functions, not by contentFetcher itself

dotenv.config();

// Initialize Groq for AI-powered content filtering
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
 * Use AI to evaluate if a news article is relevant for AI-first developers
 * @param {Object} article - Article object with title and content
 * @returns {Promise<boolean>} True if relevant, false if should be filtered out
 */
async function isArticleRelevant(article) {
  if (!process.env.GROQ_API_KEY) {
    // If no AI available, fall back to basic check
    return true;
  }
  
  try {
    const articleText = `Title: ${article.title}\nContent: ${article.content || article.description || ''}`;
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a content curator for an AI-first developer audience. Evaluate if this article is RELEVANT and should be posted.

ARTICLE:
${articleText.slice(0, 1000)}

RELEVANT TOPICS (✅ KEEP):
- AI models and capabilities (Claude, GPT-4, Gemini, Llama, etc.)
- Developer tools and coding assistants (GitHub Copilot, Cursor, Replit)
- AI/ML technology breakthroughs and research
- Tech startups and funding (especially AI-related)
- Software development, programming, coding
- AI applications in tech (drug discovery, automation, robotics)
- Developer productivity and workflows
- Open source AI projects
- Tech industry news and innovation

IRRELEVANT TOPICS (❌ FILTER OUT):
- Politics, politicians, elections, government (Trump, Biden, any political figures)
- Geopolitics, wars, military, diplomatic issues (Ukraine, Venezuela, NATO)
- Religious content
- Sports and entertainment (unless AI-tech related like James Cameron discussing AI in film)
- Gaming consoles and video games
- Celebrity gossip
- Generic business news without tech/AI angle
- Hardware deals and consumer products (unless developer-focused like gaming laptops for AI work)

EVALUATION CRITERIA:
1. Would an AI-first developer find this interesting and relevant?
2. Does it teach something about AI, coding, or technology innovation?
3. Is it focused on technology/AI capabilities rather than politics or entertainment?
4. Is it educational rather than purely commercial/promotional?

Respond with ONLY one word:
- "RELEVANT" if the article should be kept
- "FILTER" if the article should be removed

Your response:`
      }],
      temperature: 0.2,
      max_tokens: 10
    });
    
    const decision = response.choices[0]?.message?.content?.trim().toUpperCase();
    
    if (decision === 'FILTER') {
      console.log(`🚫 AI filtered out: ${article.title}`);
      return false;
    }
    
    console.log(`✅ AI approved: ${article.title}`);
    return true;
    
  } catch (error) {
    console.warn(`⚠️ AI filtering failed for article, keeping it:`, error.message);
    return true; // If AI fails, keep the article
  }
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
  
  console.log(`📦 Fetched ${allContent.length} raw content items`);
  
  // AI-powered filtering: Let AI decide which articles are relevant
  console.log(`🤖 AI is evaluating content relevance...`);
  const filteredContent = [];
  
  for (const item of allContent) {
    const isRelevant = await isArticleRelevant(item);
    if (isRelevant) {
      filteredContent.push(item);
    }
  }
  
  console.log(`✅ AI approved ${filteredContent.length}/${allContent.length} content items`);
  return filteredContent;
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
        // Basic validation - AI will do intelligent filtering later
        return article.title && (article.description || article.content);
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

