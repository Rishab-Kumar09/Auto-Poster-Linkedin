import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Analyze post content and generate smart image search query
 * @param {string} postText - The generated post text
 * @returns {string} Smart search query for images
 */
function analyzePostForImageSearch(postText) {
  if (!postText) return 'technology workspace';
  
  const text = postText.toLowerCase();
  
  // PRIORITY 1: Check for specific AI models/tools mentioned
  // These should get their actual branded images
  const specificTools = [
    { pattern: /claude\s*(3\.5|3|ai)?/i, search: 'Claude AI Anthropic' },
    { pattern: /gpt-4|gpt4|chatgpt/i, search: 'OpenAI ChatGPT GPT-4' },
    { pattern: /gemini\s*(pro)?/i, search: 'Google Gemini AI' },
    { pattern: /copilot/i, search: 'GitHub Copilot coding' },
    { pattern: /cursor\s*(ai|editor)?/i, search: 'Cursor AI code editor' },
    { pattern: /replit/i, search: 'Replit coding AI' },
    { pattern: /llama\s*\d*/i, search: 'Meta Llama AI model' },
    { pattern: /mistral/i, search: 'Mistral AI model' },
    { pattern: /anthropic/i, search: 'Anthropic Claude AI' },
    { pattern: /openai/i, search: 'OpenAI artificial intelligence' },
  ];
  
  // Check if any specific tool is mentioned
  for (const tool of specificTools) {
    if (tool.pattern.test(text)) {
      console.log(`🎯 Specific tool detected: ${tool.search}`);
      return tool.search;
    }
  }
  
  // PRIORITY 2: Detect main themes and map to visual concepts
  const themePatterns = [
    // AI + Coding (most specific)
    { 
      keywords: ['ai code', 'ai coding', 'code assistant', 'code generation', 'ai developer'],
      search: 'artificial intelligence coding software development',
      score: 0
    },
    // AI/ML themes
    { 
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'neural network', 'llm', 'model'],
      search: 'artificial intelligence technology neural',
      score: 0
    },
    // Coding/Programming themes
    { 
      keywords: ['code', 'coding', 'programming', 'developer', 'software', 'debug', 'function', 'api'],
      search: 'programming code screen developer',
      score: 0
    },
    // Productivity/Workflow
    { 
      keywords: ['productivity', 'workflow', 'automation', 'efficient', 'optimize'],
      search: 'minimal workspace productivity setup',
      score: 0
    },
    // Architecture/System Design
    { 
      keywords: ['architecture', 'system', 'design pattern', 'structure', 'scalable'],
      search: 'software architecture technology',
      score: 0
    },
    // Data/Analytics
    { 
      keywords: ['data', 'analytics', 'visualization', 'dashboard'],
      search: 'data visualization dashboard',
      score: 0
    }
  ];
  
  // Score each theme based on keyword matches
  themePatterns.forEach(theme => {
    theme.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        theme.score += keyword.split(' ').length; // Multi-word matches score higher
      }
    });
  });
  
  // Find highest scoring theme
  themePatterns.sort((a, b) => b.score - a.score);
  
  // If we found a strong match (score > 0), use it
  if (themePatterns[0].score > 0) {
    console.log(`🎨 Theme detected: ${themePatterns[0].search} (score: ${themePatterns[0].score})`);
    return themePatterns[0].search;
  }
  
  // Fallback: generic tech workspace
  return 'modern technology workspace developer';
}

/**
 * Fetch relevant image from Unsplash based on topic and post content
 * @param {string} topic - Topic to search for
 * @param {string} postText - The generated post text (optional)
 * @returns {Promise<Object>} Image data with URL and metadata
 */
export async function fetchImage(topic, postText = null) {
  // If no Unsplash key, return null (posts will work without images)
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn('⚠️  Unsplash API key not found, posting without image');
    return null;
  }
  
  try {
    // If we have post text, use AI analysis to generate smart search query
    let searchQuery = topic;
    
    if (postText) {
      searchQuery = analyzePostForImageSearch(postText);
      console.log(`🔍 Smart search query: ${searchQuery}`);
    }
    
    // Search for multiple images to find best match
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        per_page: 15, // Get more options for better selection
        orientation: 'landscape',
        content_filter: 'high'
      },
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      // Pick a high-quality image (prefer higher ranked results)
      // Unsplash already ranks by relevance, so first few are usually best
      const topImages = response.data.results.slice(0, 5);
      
      // Pick one with good quality metrics
      const bestImage = topImages.reduce((best, current) => {
        const currentScore = (current.likes || 0) + (current.downloads || 0) / 10;
        const bestScore = (best.likes || 0) + (best.downloads || 0) / 10;
        return currentScore > bestScore ? current : best;
      });
      
      console.log(`✅ Selected image: ${bestImage.alt_description || 'tech image'}`);
      
      return {
        url: bestImage.urls.regular,
        downloadUrl: bestImage.links.download_location,
        photographer: bestImage.user.name,
        photographerUrl: bestImage.user.links.html,
        description: bestImage.description || bestImage.alt_description
      };
    }
    
    console.warn(`⚠️  No images found for: ${searchQuery}`);
    return null;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error.message);
    return null;
  }
}

/**
 * Download image to buffer for API upload
 * @param {string} imageUrl - URL of image to download
 * @returns {Promise<Buffer>} Image buffer
 */
export async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading image:', error.message);
    throw error;
  }
}

/**
 * Get image keywords based on content
 * @param {Object} content - Content object with title and topic
 * @returns {string} Search keywords for image
 */
export function getImageKeywords(content) {
  if (!content.title && !content.topic) {
    return 'technology innovation';
  }
  
  const title = (content.title || '').toLowerCase();
  const titleWords = title.split(' ').filter(w => w.length > 3);
  
  // Extract specific tool names or technologies
  const toolPatterns = [
    /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\b/g,  // CamelCase names (ChatGPT, OpenAI, etc.)
    /\b([a-z]+-[a-z]+)\b/g,                 // hyphenated names (agentic-coder)
    /\bgpt-?\d+\b/gi,                       // GPT models
    /\bclaude\b/gi,
    /\bgemini\b/gi,
    /\bcopilot\b/gi
  ];
  
  let specificTerms = [];
  toolPatterns.forEach(pattern => {
    const matches = title.match(pattern);
    if (matches) {
      specificTerms = specificTerms.concat(matches);
    }
  });
  
  // Build smart keywords
  const keywords = [];
  
  // Priority 1: Specific tools or products mentioned
  if (specificTerms.length > 0 && !title.includes('ps5') && !title.includes('playstation')) {
    // Use the specific term + generic descriptor
    keywords.push(specificTerms[0].toLowerCase());
    keywords.push('software technology');
    return keywords.join(' ');
  }
  
  // Priority 2: Specific tech topics
  if (title.includes('ai') || title.includes('artificial intelligence') || title.includes('machine learning')) {
    keywords.push('artificial intelligence');
    if (title.includes('code') || title.includes('coding') || title.includes('programming')) {
      keywords.push('coding developer');
    } else {
      keywords.push('technology');
    }
  } else if (title.includes('code') || title.includes('coding') || title.includes('programming') || title.includes('developer')) {
    keywords.push('software development programming');
  } else if (title.includes('startup') || title.includes('entrepreneur') || title.includes('founder')) {
    keywords.push('startup entrepreneur workspace');
  } else if (title.includes('productivity') || title.includes('workflow')) {
    keywords.push('productivity workspace computer');
  } else if (title.includes('design') || title.includes('ui') || title.includes('ux')) {
    keywords.push('design interface technology');
  } else if (title.includes('data') || title.includes('analytics')) {
    keywords.push('data analytics dashboard');
  } else {
    // Priority 3: Use topic + generic tech term
    if (content.topic) {
      keywords.push(content.topic.toLowerCase());
    }
    keywords.push('technology innovation');
  }
  
  return keywords.join(' ').trim() || 'technology workspace';
}

/**
 * Trigger download on Unsplash (required by their API terms)
 * @param {string} downloadUrl - Download location URL from Unsplash
 */
export async function triggerDownload(downloadUrl) {
  if (!downloadUrl || !process.env.UNSPLASH_ACCESS_KEY) return;
  
  try {
    await axios.get(downloadUrl, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
  } catch (error) {
    // Silent fail - not critical
    console.warn('Could not trigger Unsplash download:', error.message);
  }
}

export default {
  fetchImage,
  downloadImage,
  getImageKeywords,
  triggerDownload
};

