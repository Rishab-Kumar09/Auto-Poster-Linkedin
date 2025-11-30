# 🏗️ System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│              React Frontend (Port 3000)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │ Controls │  │Post Queue│  │Analytics │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   API SERVER                                │
│              Express.js (Port 3001)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: /api/fetch-content, /api/generate-posts    │  │
│  │          /api/post/:id, /api/analytics               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┘
      │          │          │          │          │
┌─────▼─────┐┌──▼──────┐┌──▼──────┐┌──▼──────┐┌──▼──────────┐
│  Content  ││   AI    ││  Auto   ││Schedule ││   Growth    │
│  Fetcher  ││Generator││  Post   ││   r     ││  Optimizer  │
└─────┬─────┘└──┬──────┘└──┬──────┘└──┬──────┘└──┬──────────┘
      │          │          │          │          │
┌─────▼──────────▼──────────▼──────────▼──────────▼──────────┐
│                    SQLite Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Posts   │  │ Content  │  │Analytics │  │ Schedule │  │
│  │  Table   │  │  Cache   │  │  Table   │  │  Table   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
      │          │          │          
┌─────▼─────┐┌───▼────┐┌───▼──────┐
│ News API  ││YouTube ││ Reddit   │
│  (FREE)   ││ (FREE) ││ (FREE)   │
└───────────┘└────────┘└──────────┘

┌───────────┐┌────────┐┌──────────┐
│  Groq AI  ││Gemini  ││ OpenAI   │
│  (FREE)   ││ (FREE) ││ (PAID)   │
└───────────┘└────────┘└──────────┘

┌───────────┐┌────────────┐
│Twitter API││LinkedIn API│
│ (FREE)    ││ (FREE)     │
└───────────┘└────────────┘
```

---

## Component Details

### 1. Content Fetcher (`contentFetcher.js`)

**Purpose:** Gather trending content from multiple sources

**Sources:**
- **News API**: Latest articles on chosen topics
  - Endpoint: `https://newsapi.org/v2/everything`
  - Rate: 100 requests/day (FREE)
  - Returns: Title, description, URL, published date

- **YouTube Data API**: Trending videos + transcripts
  - Endpoint: `https://www.googleapis.com/youtube/v3/search`
  - Rate: 10,000 quota units/day (FREE)
  - Transcripts: `youtube-transcript` library (unlimited)

- **Reddit API**: Top posts from relevant subreddits
  - Library: `snoowrap`
  - Rate: Reasonable limits
  - Returns: Title, text, score, comments

**Output:**
```javascript
{
  source: 'news' | 'youtube' | 'reddit',
  topic: 'AI',
  url: 'https://...',
  title: 'Article Title',
  content: 'Full text content...',
  publishedAt: '2024-01-01T12:00:00Z'
}
```

**Caching:**
- Stores in `content_cache` table
- Prevents duplicate fetching
- Tracks usage status

---

### 2. AI Generator (`aiGenerator.js`)

**Purpose:** Transform content into platform-optimized posts

**AI Providers:**

| Provider | Speed | Cost | Model |
|----------|-------|------|-------|
| Groq | 2-3s | FREE | Llama 3.1 70B |
| Gemini | 3-5s | FREE | Gemini Pro |
| OpenAI | 5-8s | $0.001/post | GPT-4o-mini |

**Prompt Engineering:**
```
Input: Content source (title, text, URL)
Tone: professional | casual | funny | controversial | motivational

Output:
1. Twitter post (<280 chars, punchy, viral hooks)
2. Twitter thread (5-7 tweets, structured narrative)
3. LinkedIn post (150-250 words, professional, story-driven)
```

**Key Features:**
- Viral content patterns (hooks, curiosity gaps, numbers)
- Platform-specific formatting
- Emoji optimization (1-2 per post)
- Line breaks for readability
- Hashtag generation

**Output:**
```javascript
{
  twitter: {
    tweet: "AI is not replacing jobs—it's replacing tasks...",
    thread: ["Tweet 1", "Tweet 2", "Tweet 3", ...]
  },
  linkedin: {
    post: "I've been thinking about AI automation...\n\nHere's what..."
  }
}
```

---

### 3. Auto-Poster (`autoPost.js`)

**Purpose:** Publish posts via official APIs

**Twitter API (v2):**
```javascript
// FREE tier: 500 posts/month
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

await client.v2.tweet({ text: "..." });
```

**LinkedIn API (v2):**
```javascript
// Requires company verification
await axios.post('https://api.linkedin.com/v2/ugcPosts', {
  author: personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: postText },
      shareMediaCategory: 'NONE'
    }
  }
});
```

**Features:**
- Rate limit tracking
- Error handling & retries
- Thread support (Twitter)
- Post history tracking

---

### 4. Scheduler (`scheduler.js`)

**Purpose:** Automate content generation and posting

**Cron Jobs:**

```javascript
// Fetch fresh content every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await fetchContent(topics);
});

// Post at scheduled times
cron.schedule('0 9 * * *', async () => {
  await postNextApprovedContent();
});
```

**Configuration:**
```env
POSTING_TIMES=08:00,11:00,14:00,17:00,20:00
POST_FREQUENCY=5
AUTO_POST=true
REQUIRE_APPROVAL=false
```

**Modes:**
- **Manual:** Generate content, require approval
- **Auto:** Generate and post automatically
- **Scheduled:** Post at optimal times

---

### 5. Growth Optimizer (`growthOptimizer.js`)

**Purpose:** Analyze performance and optimize strategy

**Features:**

1. **Best Posting Times**
   - Analyzes historical engagement
   - Identifies peak windows
   - Returns optimal schedule

2. **Content Pattern Analysis**
   - Top-performing topics
   - Best tones
   - Optimal post length
   - Engagement rates

3. **Viral Potential Prediction**
   - Scans for viral elements:
     - Numbers (3x, 10x growth)
     - Lists (7 ways to...)
     - Questions (engagement)
     - Curiosity triggers
     - Emoji usage
     - Line breaks

4. **Growth Metrics**
   - Week-over-week growth rate
   - Engagement trends
   - Post frequency impact

5. **Recommendations**
   - AI-powered suggestions
   - Topic recommendations
   - Timing optimization
   - Tone adjustments

---

### 6. Database (`database.js`)

**Schema:**

```sql
-- Posts table
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  content_source TEXT,      -- JSON: source content
  twitter_post TEXT,
  twitter_thread TEXT,      -- JSON: array of tweets
  linkedin_post TEXT,
  tone TEXT,
  status TEXT,              -- 'pending' | 'posted' | 'cancelled'
  created_at DATETIME,
  posted_at DATETIME,
  engagement_score INTEGER
);

-- Content cache table
CREATE TABLE content_cache (
  id INTEGER PRIMARY KEY,
  source TEXT,              -- 'news' | 'youtube' | 'reddit'
  topic TEXT,
  url TEXT UNIQUE,
  title TEXT,
  content TEXT,
  fetched_at DATETIME,
  used INTEGER              -- 0 or 1
);

-- Analytics table
CREATE TABLE analytics (
  id INTEGER PRIMARY KEY,
  post_id INTEGER,
  platform TEXT,            -- 'twitter' | 'linkedin'
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  impressions INTEGER,
  recorded_at DATETIME
);
```

**Benefits:**
- Zero maintenance (SQLite)
- Persistent storage
- Efficient queries
- No external database needed

---

## Data Flow

### Content Generation Flow

```
1. User clicks "Fetch & Generate Content"
   ↓
2. Frontend → POST /api/fetch-content
   ↓
3. Backend calls contentFetcher.js
   ↓
4. Fetches from News API, YouTube, Reddit
   ↓
5. Stores in content_cache table
   ↓
6. Returns top 5 items to frontend
   ↓
7. Frontend → POST /api/generate-posts (for each item)
   ↓
8. Backend calls aiGenerator.js
   ↓
9. Calls Groq/Gemini/OpenAI API
   ↓
10. Returns generated posts
    ↓
11. Stores in posts table (status='pending')
    ↓
12. Frontend displays posts
    ↓
13. User edits and clicks "Post"
    ↓
14. Frontend → POST /api/post/:id
    ↓
15. Backend calls autoPost.js
    ↓
16. Posts to Twitter/LinkedIn APIs
    ↓
17. Updates posts table (status='posted')
    ↓
18. Returns success
```

### Automated Flow

```
1. Cron job triggers (every 6 hours)
   ↓
2. Fetch latest content
   ↓
3. Generate posts for top 3 items
   ↓
4. Store in database (status='pending')
   ↓
5. Cron job triggers at posting time (e.g., 9:00 AM)
   ↓
6. Check if AUTO_POST=true
   ↓
7. Get next pending post
   ↓
8. Post to Twitter/LinkedIn
   ↓
9. Update status to 'posted'
   ↓
10. Record analytics
```

---

## API Endpoints

### Content

```
POST /api/fetch-content
Body: { topics: ['AI', 'Startups'] }
Returns: { content: [...], count: 10 }
```

### Generation

```
POST /api/generate-posts
Body: { content: {...}, aiProvider: 'groq', tone: 'professional' }
Returns: { posts: { twitter: {...}, linkedin: {...} } }
```

### Posting

```
POST /api/post/:id
Body: { platforms: ['twitter', 'linkedin'], editedContent: {...} }
Returns: { results: { twitter: {...}, linkedin: {...} } }
```

### Analytics

```
GET /api/analytics
Returns: { stats: { totalPosts, pendingPosts, todayPosts } }

GET /api/growth/recommendations
Returns: { recommendations: [...] }

GET /api/growth/schedule?postsPerDay=5
Returns: { schedule: [...] }

GET /api/growth/metrics?days=30
Returns: { metrics: [...], growthRate: '15%' }

POST /api/growth/predict-viral
Body: { text: "..." }
Returns: { prediction: { score: 45, potential: 'High' } }
```

### Posts

```
GET /api/posts/pending
Returns: { posts: [...] }
```

---

## Technology Stack

### Backend
- **Node.js**: Runtime
- **Express.js**: Web server
- **better-sqlite3**: Database
- **node-cron**: Scheduling
- **axios**: HTTP requests
- **dotenv**: Configuration

### AI Libraries
- **openai**: OpenAI SDK
- **groq-sdk**: Groq SDK
- **@google/generative-ai**: Gemini SDK

### Social Media
- **twitter-api-v2**: Twitter SDK
- LinkedIn: Native axios calls

### Content Fetching
- **youtube-transcript**: YouTube transcripts
- **snoowrap**: Reddit API wrapper

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **axios**: API calls

---

## Configuration

### Environment Variables

```env
# AI (Choose at least one)
OPENAI_API_KEY=sk-xxxxx
GROQ_API_KEY=gsk_xxxxx
GEMINI_API_KEY=xxxxx
PREFERRED_AI=groq

# Content Sources (All FREE)
NEWS_API_KEY=xxxxx
YOUTUBE_API_KEY=xxxxx
REDDIT_CLIENT_ID=xxxxx
REDDIT_CLIENT_SECRET=xxxxx

# Social Media
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_ACCESS_TOKEN=xxxxx
TWITTER_ACCESS_SECRET=xxxxx

LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx
LINKEDIN_ACCESS_TOKEN=xxxxx
LINKEDIN_PERSON_URN=urn:li:person:xxxxx

# Configuration
TOPICS=AI,Startups,Technology
POSTING_TIMES=08:00,11:00,14:00,17:00,20:00
POST_FREQUENCY=5
AUTO_POST=false
REQUIRE_APPROVAL=true
MAX_POSTS_PER_DAY=10
```

---

## Growth Strategy Implementation

### 1. Frequency Optimization
- Target: 5-7 posts/day
- Cron jobs scheduled at optimal times
- Rate limit tracking prevents overposting

### 2. Content Optimization
- AI prompts engineered for virality
- A/B testing different tones
- Pattern analysis of top posts

### 3. Timing Optimization
- Learns from historical data
- Adjusts schedule based on engagement
- Timezone-aware posting

### 4. Platform Optimization
- Twitter: Short, punchy, controversial
- LinkedIn: Longer, professional, storytelling
- Custom prompts per platform

### 5. Engagement Tracking
- Records likes, comments, shares
- Calculates engagement scores
- Identifies winning patterns

---

## Scalability

### Current Limits (FREE tier)
- **Content**: 100 news/day, 100 YouTube searches/day
- **AI**: 14,400 Groq requests/day (unlimited for practical use)
- **Posting**: 500 Twitter posts/month (≈16/day)

### Upgrade Path
- **Twitter Basic**: $200/mo → 3,000 posts/month
- **OpenAI**: ~$10/mo for better quality
- **More content sources**: RSS feeds, blogs, newsletters

### Architecture Benefits
- **Horizontal scaling**: Can run multiple instances
- **Async processing**: Non-blocking operations
- **Caching**: Reduces API calls
- **SQLite**: Can upgrade to PostgreSQL for scale

---

## Security

### API Keys
- Stored in `.env` (gitignored)
- Never committed to repo
- Loaded via dotenv

### Rate Limiting
- Built-in tracking
- Prevents hitting limits
- Automatic backoff

### Data Privacy
- All data local (SQLite)
- No third-party tracking
- You own everything

---

## Monitoring

### Logs
- All operations logged to console
- Error tracking
- API call tracking

### Analytics
- Dashboard shows key metrics
- Growth rate tracking
- Engagement monitoring

### Health Checks
- `npm run verify` - Check setup
- `npm run test-ai` - Test AI providers
- `npm run test-cycle` - Full system test

---

## Future Enhancements

### Planned Features
- [ ] Instagram posting (Graph API)
- [ ] Image generation (DALL-E/Midjourney)
- [ ] Carousel post generator
- [ ] A/B testing framework
- [ ] Chrome extension
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Multi-account support

### Community Contributions Welcome!
- Add new content sources
- Improve AI prompts
- Add new platforms
- Enhance analytics

---

## Performance

### Typical Timings
- Content fetch: 2-5 seconds
- AI generation: 2-8 seconds (depends on provider)
- Post publishing: 1-2 seconds
- Total cycle: ~10-15 seconds

### Optimization Tips
- Use Groq (fastest AI)
- Cache content aggressively
- Batch API calls
- Use SQLite indexes

---

## Troubleshooting

### Common Issues

**"API key not configured"**
→ Check `.env` file

**"Rate limit exceeded"**
→ Wait and retry, or upgrade plan

**"Database locked"**
→ Restart server, delete `data/` folder

**"Port already in use"**
→ Kill existing process: `npx kill-port 3000`

**"Module not found"**
→ Run `npm install`

---

## Resources

### Documentation
- [START_HERE.md](./START_HERE.md) - Quick start
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Complete guide
- [ENV_SETUP.md](./ENV_SETUP.md) - API configuration
- [README.md](./README.md) - Full documentation

### External APIs
- [Twitter API](https://developer.twitter.com/en/docs)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Groq](https://console.groq.com/docs)
- [News API](https://newsapi.org/docs)
- [YouTube API](https://developers.google.com/youtube/v3)

---

**Built with ❤️ for rapid social media growth 🚀**

