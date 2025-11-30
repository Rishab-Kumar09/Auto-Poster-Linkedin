import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Extract keywords from generated post text
 * @param {string} postText - The generated post text
 * @returns {Array} Array of keywords
 */
function extractKeywordsFromPost(postText) {
  if (!postText) return [];
  
  const text = postText.toLowerCase();
  
  // Common stop words to ignore
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very']);
  
  // Extract words (alphanumeric + hyphens)
  const words = text.match(/\b[\w-]+\b/g) || [];
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Boost certain tech/AI keywords
  const boostKeywords = ['ai', 'artificial intelligence', 'coding', 'programming', 'developer', 'software', 'machine learning', 'automation', 'productivity', 'startup', 'technology', 'code', 'algorithm', 'data', 'llm', 'gpt', 'claude', 'openai', 'tools', 'development'];
  
  boostKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      wordCount[keyword] = (wordCount[keyword] || 0) + 5; // Boost score
    }
  });
  
  // Sort by frequency
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
  
  return sortedWords.slice(0, 5); // Top 5 keywords
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
    // If we have post text, extract keywords from it
    let searchQuery = topic;
    
    if (postText) {
      const keywords = extractKeywordsFromPost(postText);
      if (keywords.length > 0) {
        // Combine top keywords for better search
        searchQuery = keywords.slice(0, 3).join(' ');
        console.log(`🔍 Using keywords from post: ${searchQuery}`);
      }
    }
    
    // Search for multiple images to find best match
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        per_page: 10, // Get more options
        orientation: 'landscape',
        content_filter: 'high'
      },
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      // Score each image based on relevance to post keywords
      const keywords = postText ? extractKeywordsFromPost(postText) : [topic];
      const scoredImages = response.data.results.map(image => {
        const imageDesc = (image.description || image.alt_description || '').toLowerCase();
        const imageTags = (image.tags || []).map(t => t.title.toLowerCase()).join(' ');
        const combinedText = imageDesc + ' ' + imageTags;
        
        // Score based on keyword matches
        let score = 0;
        keywords.forEach((keyword, index) => {
          if (combinedText.includes(keyword)) {
            score += (5 - index); // Higher score for more important keywords
          }
        });
        
        return { image, score };
      });
      
      // Sort by score and pick best match
      scoredImages.sort((a, b) => b.score - a.score);
      const bestImage = scoredImages[0].image;
      
      console.log(`✅ Best matching image score: ${scoredImages[0].score}`);
      
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

