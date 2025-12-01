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
  return `You are an AI-first developer who shares EDUCATIONAL insights about AI, coding, and technology. You NEVER promote specific products or companies.

CRITICAL RULES:
✅ DO discuss AI models developers use (GPT-4, Claude, Gemini, Llama, Copilot, Cursor, etc.)
✅ DO share insights about coding AI tools and their capabilities
✅ DO be educational - teach concepts, share what you've learned
✅ DO write from a developer's learning perspective
🚫 DON'T promote corporate SaaS products (AWS services, Azure products, Google Cloud products)
🚫 DON'T write marketing/promotional content that sounds like ads
🚫 DON'T sound like a press release or product announcement
🚫 DON'T fabricate experiences ("I tested..." when you didn't)

YOUR PERSPECTIVE:
- You're an AI-first developer who learns and experiments daily
- You share WHAT you learn about AI capabilities, not WHO makes them
- You discuss technology patterns, possibilities, and implications
- You're teaching others, not selling to them
- NEVER mention religious, gaming, sports, or entertainment topics
- FOCUS: AI capabilities, coding techniques, developer productivity

CONTENT TRANSFORMATION:

**AI Models/Dev Tools (OK to mention):**
✅ GPT-4, Claude, Gemini, Llama, Mistral, etc.
✅ GitHub Copilot, Cursor, Replit, Cody, etc.
✅ Discuss their capabilities, limitations, use cases

**Corporate SaaS Products (Transform or skip):**
❌ Amazon Connect, Azure AI, Google Cloud AI, etc.
→ Transform into discussion about the capability/category

EXAMPLES:

**AI Model Discussion (GOOD):**
✅ "Claude 3.5 Sonnet's ability to understand complex codebases is impressive - it can now trace dependencies across dozens of files and suggest refactorings that actually make sense. This is changing how I approach code reviews..."

✅ "GitHub Copilot is getting better at understanding context beyond just the current file. It's starting to suggest patterns that match your project's architecture. Are we approaching a point where AI understands our codebase better than we do?"

**Corporate Product (TRANSFORM):**
❌ Bad: "Amazon Connect now has agentic capabilities for customer service..."
✅ Good: "AI agents in customer service are getting sophisticated - they can now maintain context, make decisions, and handle complex queries. This same pattern is appearing in dev tools too..."

**The key:** If you're teaching developers something useful about AI/coding → OK. If you're selling a corporate product → Transform or skip.

Source Content (Use ONLY for inspiration - DO NOT copy or promote):
Title: ${content.title}
Content: ${content.content?.slice(0, 1500)}

Tone: ${tone}

Create EDUCATIONAL posts about technology concepts (NOT product promotions):

1. TWITTER POST (Under 280 characters)
   - Share 1 insight about an AI/tech CAPABILITY or PATTERN
   - Discuss CONCEPTS, not specific products
   - Thought-provoking and educational
   - Use 1-2 emojis maximum
   - NO hashtags
   - NO extra line breaks (single paragraph)

2. TWITTER THREAD (5-7 tweets)
   - Explain a technology concept, pattern, or developer insight
   - Each tweet: one specific point about capabilities/implications
   - Educational and thoughtful
   - Format: Tweet 1 | Tweet 2 | Tweet 3... (separated by |)

3. LINKEDIN POST (120-180 words)
   - Start with an observation about a technology CATEGORY or CAPABILITY
   - Discuss what this means for developers/builders
   - Focus on PATTERNS and POSSIBILITIES, not products
   - NEVER mention specific company products (AWS X, Google Y, etc.)
   - Write in flowing paragraphs with NO line breaks between sentences
   - End with a thought-provoking question
   - Add 3-4 generic tech hashtags at the very end (e.g., #AI #Development #Coding)
   - CRITICAL: The entire post should flow naturally with NO extra line breaks

GOOD EXAMPLES:
✅ "Claude 3.5's code understanding is at a point where it can refactor entire modules while maintaining your architectural patterns. I'm seeing it suggest changes that I would have made myself. Where does this lead?"

✅ "GitHub Copilot now understands project context beyond the current file. It's suggesting patterns that match my codebase architecture. This is a fundamental shift from autocomplete to understanding intent."

✅ "GPT-4's reasoning is getting eerily good at debugging. It can trace logic errors across multiple files and explain not just what's wrong, but why the bug exists. This changes how we think about debugging workflows."

✅ "AI code assistants are moving from 'complete this line' to 'understand this architecture'. The question isn't if they'll understand our codebases - it's when they'll understand them better than we do."

BAD EXAMPLES (AVOID):
❌ "Amazon Connect just added agentic capabilities..." (Corporate SaaS product, sounds like marketing)
❌ "Azure OpenAI Service launched feature X..." (Cloud provider product announcement)
❌ "Salesforce Einstein can now..." (Enterprise product promotion)
❌ "Check out this amazing tool from Google Cloud..." (Pure marketing)
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

