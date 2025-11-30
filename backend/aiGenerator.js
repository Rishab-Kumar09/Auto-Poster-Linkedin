import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Generate social media posts from content
 * @param {Object} content - Content object with title, content, url
 * @param {string} aiProvider - 'openai', 'groq', or 'gemini'
 * @param {string} tone - Tone of the post
 * @returns {Promise<Object>} Generated posts for Twitter and LinkedIn
 */
export async function generatePosts(content, aiProvider = 'groq', tone = 'professional') {
  const provider = aiProvider || process.env.PREFERRED_AI || 'groq';
  
  console.log(`🤖 Generating posts with ${provider.toUpperCase()}...`);
  
  const prompt = createPrompt(content, tone);
  
  let response;
  
  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        response = await generateWithOpenAI(prompt);
        break;
      case 'groq':
        response = await generateWithGroq(prompt);
        break;
      case 'gemini':
        response = await generateWithGemini(prompt);
        break;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
    
    return parsePosts(response);
  } catch (error) {
    console.error(`Error with ${provider}:`, error.message);
    
    // Fallback to another provider
    if (provider !== 'groq' && groq) {
      console.log('Falling back to Groq...');
      response = await generateWithGroq(prompt);
      return parsePosts(response);
    }
    
    throw error;
  }
}

/**
 * Create prompt for AI
 */
function createPrompt(content, tone) {
  return `You are an AI-first developer who explores AI tools and their possibilities. You share practical AI tips, tools, and insights while subtly showcasing your expertise.

YOUR PERSPECTIVE:
- You're passionate about AI and build with AI tools daily
- You discover and test new AI tools constantly  
- You share what works, what doesn't, and hidden features
- You educate others about AI possibilities through your experiences
- You're NOT selling - you're teaching and inspiring
- NEVER mention religious topics
- NEVER post about gaming, consoles, sports, or entertainment
- FOCUS: AI development, coding tools, productivity, startups, technology

WRITING STYLE:
- Observational perspective about AI capabilities and possibilities
- NEVER use "new", "just dropped", "just launched" - tools might be old!
- Focus on INSIGHTS, PATTERNS, POSSIBILITIES, not fake announcements
- Share observations about what AI CAN DO, not what's "breaking news"
- Be enthusiastic but HONEST - don't fabricate or exaggerate
- Talk about capabilities, use cases, potential - NOT fake releases

GOOD APPROACHES:
- "AI coding tools are getting powerful enough to..."
- "The way AI handles X is fascinating because..."
- "Did you know AI can now do X? Here's why it matters..."
- "Thinking about how AI is changing Y..."
- "The most underutilized AI feature I see is..."

BAD APPROACHES (AVOID):
- ❌ "New AI tool just dropped..."
- ❌ "X just launched..."
- ❌ "I recently discovered..." (unless true)
- ❌ Treating old tools as breaking news

Source Content for Inspiration:
Title: ${content.title}
Content: ${content.content?.slice(0, 1500)}

Tone: ${tone}

Create posts showcasing AI possibilities:

1. TWITTER POST (Under 280 characters)
   - Share 1 AI insight, capability, or thought-provoking question
   - Focus on WHAT AI CAN DO, not fake announcements
   - Make it timeless - avoid "new", "just released", "breaking"
   - Use 1-2 emojis maximum
   - NO hashtags
   - NO extra line breaks (single paragraph)

2. TWITTER THREAD (5-7 tweets)
   - Share a complete AI workflow, tool comparison, or technique
   - Each tweet: specific, actionable point
   - Use "I" perspective
   - Format: Tweet 1 | Tweet 2 | Tweet 3... (separated by |)

3. LINKEDIN POST (120-180 words)
   - Start with an AI insight, observation, or capability
   - Discuss implications, use cases, or possibilities
   - AVOID time-sensitive language ("new", "just", "recently")
   - Write in flowing paragraphs with NO line breaks between sentences
   - Separate ideas with a single space, not line breaks
   - End with a thought-provoking question
   - Add 3-4 AI-related hashtags at the very end
   - CRITICAL: The entire post should flow naturally with NO extra line breaks
   - Format as ONE continuous block of text with spaces between sentences

EXAMPLES OF GOOD TOPICS:
- "AI coding assistants can now X. Here's what that means..."
- "Most developers don't realize AI can Y. Here's the impact..."
- "The gap between human and AI at Z is closing. Thoughts?"
- "AI's ability to X is underrated. Here's why..."
- "What if AI could handle Y entirely? Let's explore..."
- "The biggest AI limitation in Z is still..."

EXAMPLES TO AVOID:
- ❌ "New tool just dropped..." (might be old!)
- ❌ "X just announced..." (source might be old news)
- ❌ "I tested..." (unless you actually did)
- ❌ "Breaking: ..." (news articles might be old)
- ❌ Treating any specific tool as "new" without checking

BE TIMELESS: Focus on capabilities, insights, and possibilities - not fake announcements!
- IMPORTANT: Use proper paragraph formatting - don't break every sentence into a new line
- Keep sentences together in natural paragraphs, separate paragraphs with ONE blank line only

CRITICAL: Format response EXACTLY as this JSON (linkedin must be an object, not a string!):
{
  "twitter": {
    "tweet": "your tweet text here",
    "thread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"]
  },
  "linkedin": {
    "post": "your linkedin post text here"
  }
}`;
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(prompt) {
  if (!openai) throw new Error('OpenAI API key not configured');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });
  
  return completion.choices[0].message.content;
}

/**
 * Generate with Groq (FREE and FAST!)
 */
async function generateWithGroq(prompt) {
  if (!groq) throw new Error('Groq API key not configured');
  
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });
  
  return completion.choices[0].message.content;
}

/**
 * Generate with Google Gemini
 */
async function generateWithGemini(prompt) {
  if (!gemini) throw new Error('Gemini API key not configured');
  
  const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt + '\n\nRespond ONLY with valid JSON.');
  const response = await result.response;
  return response.text();
}

/**
 * Parse AI response into structured format
 */
function parsePosts(responseText) {
  try {
    // Remove markdown code blocks if present
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    const parsed = JSON.parse(cleaned.trim());
    
    // Normalize structure - handle both formats
    if (parsed.linkedin && typeof parsed.linkedin === 'string') {
      // If linkedin is a string, wrap it in an object
      parsed.linkedin = { post: parsed.linkedin };
    }
    
    // Validate structure
    if (!parsed.twitter?.tweet || !parsed.linkedin?.post) {
      throw new Error('Invalid response structure');
    }
    
    // AGGRESSIVELY clean up LinkedIn post formatting
    if (parsed.linkedin?.post) {
      parsed.linkedin.post = parsed.linkedin.post
        .replace(/\r\n/g, '\n')        // Normalize line endings
        .replace(/\n{2,}/g, '\n')      // Replace ALL multiple newlines with single newline
        .replace(/[ \t]+/g, ' ')       // Replace multiple spaces/tabs with single space
        .replace(/\n /g, '\n')         // Remove spaces after newlines
        .replace(/ \n/g, '\n')         // Remove spaces before newlines
        .trim();
    }
    
    // Clean up Twitter post
    if (parsed.twitter?.tweet) {
      parsed.twitter.tweet = parsed.twitter.tweet
        .replace(/\r\n/g, '\n')        // Normalize line endings
        .replace(/\n+/g, ' ')          // Replace ALL newlines with spaces (Twitter = single paragraph)
        .replace(/[ \t]+/g, ' ')       // Replace multiple spaces with single space
        .trim();
    }
    
    // Clean up Twitter thread
    if (parsed.twitter?.thread && Array.isArray(parsed.twitter.thread)) {
      parsed.twitter.thread = parsed.twitter.thread.map(tweet => 
        tweet
          .replace(/\r\n/g, '\n')
          .replace(/\n+/g, ' ')
          .replace(/[ \t]+/g, ' ')
          .trim()
      );
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error.message);
    console.error('Response:', responseText);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Test all AI providers side-by-side
 */
export async function testAllProviders(content) {
  console.log('\n🧪 Testing all AI providers side-by-side...\n');
  
  const results = {};
  const testContent = content || {
    title: 'OpenAI Releases GPT-5: A New Era in AI',
    content: 'OpenAI has announced GPT-5, featuring breakthrough improvements in reasoning, coding, and multimodal understanding. The model shows human-level performance on complex tasks.',
    url: 'https://example.com/gpt5'
  };
  
  // Test Groq
  if (groq) {
    console.log('Testing Groq (FREE) 🚀');
    const start = Date.now();
    try {
      results.groq = {
        posts: await generatePosts(testContent, 'groq', 'professional'),
        time: Date.now() - start,
        cost: 'FREE',
        status: '✅'
      };
    } catch (error) {
      results.groq = { error: error.message, status: '❌' };
    }
  }
  
  // Test Gemini
  if (gemini) {
    console.log('Testing Gemini (FREE) 🌟');
    const start = Date.now();
    try {
      results.gemini = {
        posts: await generatePosts(testContent, 'gemini', 'professional'),
        time: Date.now() - start,
        cost: 'FREE',
        status: '✅'
      };
    } catch (error) {
      results.gemini = { error: error.message, status: '❌' };
    }
  }
  
  // Test OpenAI
  if (openai) {
    console.log('Testing OpenAI (PAID) 💰');
    const start = Date.now();
    try {
      results.openai = {
        posts: await generatePosts(testContent, 'openai', 'professional'),
        time: Date.now() - start,
        cost: '~$0.001',
        status: '✅'
      };
    } catch (error) {
      results.openai = { error: error.message, status: '❌' };
    }
  }
  
  // Print comparison
  console.log('\n📊 COMPARISON RESULTS:\n');
  console.log('═'.repeat(80));
  
  for (const [provider, result] of Object.entries(results)) {
    console.log(`\n${provider.toUpperCase()} ${result.status}`);
    if (result.time) {
      console.log(`⏱️  Speed: ${result.time}ms`);
      console.log(`💰 Cost: ${result.cost}`);
      console.log(`\n📝 Twitter Post:\n${result.posts.twitter.tweet}\n`);
      console.log(`📝 LinkedIn Post:\n${result.posts.linkedin.post.slice(0, 200)}...\n`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    console.log('─'.repeat(80));
  }
  
  return results;
}

// Run standalone test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllProviders().then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

