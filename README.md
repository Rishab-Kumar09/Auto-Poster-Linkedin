# 🚀 AI-Powered Social Media Automation

**Automate your social media presence and grow faster with AI-generated content.**

This tool automatically:
- 🔍 Fetches trending content from News, YouTube, Reddit
- 🤖 Generates engaging posts using AI (Groq, OpenAI, or Gemini)
- 📤 Posts to Twitter & LinkedIn via official APIs
- 📈 Optimizes for maximum engagement and follower growth
- ⏰ Schedules posts at optimal times

---

## ✨ Features

### Content Automation
- **Multi-Source Fetching**: News API, YouTube, Reddit, RSS feeds
- **AI Generation**: Creates platform-optimized posts (tweets, threads, LinkedIn posts)
- **3 AI Providers**: Groq (FREE ⚡), Gemini (FREE), OpenAI (Paid)
- **Tone Control**: Professional, casual, funny, controversial, motivational

### Posting
- **Twitter**: Official API (FREE tier: 500 posts/month)
- **LinkedIn**: Official API (requires company verification)
- **Multi-Platform**: Post to both with one click
- **Edit Before Posting**: Review and edit all generated content

### Growth Optimization
- 📊 Engagement analytics
- 🎯 Best posting times based on your data
- 🔥 Viral content prediction
- 📈 Growth rate tracking
- 💡 AI-powered recommendations

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Setup API Keys

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Minimum to get started (ALL FREE):**
```env
GROQ_API_KEY=gsk_xxxxx
NEWS_API_KEY=xxxxx
TOPICS=AI,Startups,Technology
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

### 3. Run the App

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

### 4. Test AI Providers

```bash
npm run test-ai
```

This will test Groq, Gemini, and OpenAI side-by-side and show you:
- Speed comparison
- Cost comparison
- Generated content quality

---

## 📖 Usage

### Basic Workflow

1. **Fetch Content**: Click "Fetch & Generate Content"
   - Pulls trending content from your selected topics
   - AI generates posts automatically

2. **Review**: Edit generated posts if needed
   - Adjust tone, length, messaging
   - Check character counts

3. **Post**: Select platforms and click "Post"
   - Posts to Twitter and/or LinkedIn
   - Tracks analytics

### Automated Workflow

Run the scheduler for fully automated posting:

```bash
npm run post
```

This will:
- Fetch content every 6 hours
- Generate posts automatically
- Post at scheduled times (if `AUTO_POST=true`)
- Track engagement and optimize

---

## 🔑 API Setup Guide

### Free APIs (Start Here)

#### 1. Groq (FREE - RECOMMENDED ⚡)
- Go to https://console.groq.com/
- Sign up and get API key
- **FREE**: 30 requests/min, 14,400/day
- **Speed**: Insanely fast (2-3 seconds per generation)

#### 2. News API (FREE)
- https://newsapi.org/register
- 100 requests/day free
- Get latest news on any topic

#### 3. YouTube Data API (FREE)
- https://console.cloud.google.com/
- Enable YouTube Data API v3
- 10,000 quota units/day (≈100 searches)

### Social Media APIs

#### Twitter (FREE Tier Available!)
- https://developer.twitter.com/en/portal/dashboard
- Sign up for **FREE tier**: 500 posts/month (≈16/day)
- Get API keys and access tokens
- See [ENV_SETUP.md](./ENV_SETUP.md) for detailed steps

#### LinkedIn (Requires Company Verification)
- https://www.linkedin.com/developers/apps
- Create app with company page
- Submit for verification (1-3 days)
- Get OAuth tokens

**Full setup guide**: [ENV_SETUP.md](./ENV_SETUP.md)

---

## 🎯 Growth Strategy

### For Maximum Follower Growth:

1. **Post Frequency**: 5-7 times per day
   ```env
   POST_FREQUENCY=5
   POSTING_TIMES=08:00,11:00,14:00,17:00,20:00
   ```

2. **Content Mix**:
   - 40% Educational/Insights
   - 30% Thought-provoking/Controversial
   - 20% Motivational/Inspirational
   - 10% Personal stories

3. **Platform Optimization**:
   - **Twitter**: Short, punchy, controversial
   - **LinkedIn**: Longer, professional, storytelling

4. **Engagement Tactics**:
   - End LinkedIn posts with questions
   - Use numbers and lists
   - Create curiosity gaps
   - Line breaks for readability

5. **Best Times** (Default):
   - 8:00 AM - Morning commute
   - 11:00 AM - Mid-morning
   - 2:00 PM - Post-lunch
   - 5:00 PM - End of workday
   - 8:00 PM - Evening leisure

The system will learn YOUR best times after collecting data!

---

## 📊 Features in Detail

### Content Fetcher
- **News API**: Latest articles on your topics
- **YouTube**: Trending videos + transcripts
- **Reddit**: Top posts from relevant subreddits
- **RSS Feeds**: Blog aggregation (coming soon)

### AI Generator
Tests all 3 providers and shows comparison:

| Provider | Speed | Cost | Quality |
|----------|-------|------|---------|
| Groq | ⚡ 2-3s | FREE | Excellent |
| Gemini | ⚡ 3-5s | FREE | Excellent |
| OpenAI | 🐌 5-8s | $0.001/post | Best |

### Auto-Poster
- Twitter API v2 (official)
- LinkedIn API v2 (official)
- Rate limit tracking
- Error handling & retries

### Growth Optimizer
- Analyzes your top posts
- Identifies winning patterns
- Recommends topics, tones, times
- Predicts viral potential

---

## 🛠️ Advanced Configuration

### Scheduling Options

```env
# Post 3 times per day at specific times
POST_FREQUENCY=3
POSTING_TIMES=09:00,14:00,19:00

# Require manual approval before posting
REQUIRE_APPROVAL=true
AUTO_POST=false

# Max posts per day (safety limit)
MAX_POSTS_PER_DAY=10
```

### Topic Configuration

```env
# Add as many topics as you want
TOPICS=AI,Machine Learning,Startups,Product Design,Marketing,Productivity,HealthTech
```

### Tone Presets

Available tones:
- `professional` - Standard business tone
- `casual` - Friendly and conversational
- `motivational` - Inspirational and uplifting
- `funny` - Humorous and entertaining
- `controversial` - Thought-provoking hot takes

---

## 📈 Analytics & Tracking

The system tracks:
- Total posts published
- Engagement scores (likes + comments × 3 + shares × 5)
- Best performing topics
- Optimal posting times
- Growth rate week-over-week

Access via:
- Frontend dashboard
- Database queries
- Growth optimizer module

---

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Add `OPENAI_API_KEY` to `.env` OR use Groq (free)
- Set `PREFERRED_AI=groq`

### "Twitter API error"
- Verify API keys are correct
- Check you haven't hit rate limit (500/month)
- Ensure you have Free tier access

### "LinkedIn API error"
- Company verification required (takes 1-3 days)
- Check OAuth token is valid
- Ensure Person URN is correct

### "No content fetched"
- Verify News API key works
- Check topic spelling
- Try different topics

---

## 🎓 Learning Resources

- [Twitter API Docs](https://developer.twitter.com/en/docs)
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [Groq Documentation](https://console.groq.com/docs)
- [News API Docs](https://newsapi.org/docs)

---

## 🚀 Roadmap

- [ ] Instagram posting (via Graph API)
- [ ] TikTok posting
- [ ] Image generation for posts (AI-generated visuals)
- [ ] Carousel post generator for LinkedIn
- [ ] A/B testing different post versions
- [ ] Chrome extension for manual control
- [ ] Mobile app

---

## 📝 License

MIT

---

## 💡 Tips for Rapid Growth

1. **Consistency is key**: Post every day at same times
2. **Engage back**: Reply to comments on your posts
3. **Cross-promote**: Share Twitter content on LinkedIn and vice versa
4. **Use data**: Let the growth optimizer guide your strategy
5. **Test tones**: Try controversial posts for maximum reach
6. **Quality > Quantity**: Review and edit AI posts before publishing

---

## ⚠️ Important Notes

### Twitter Free Tier Limits:
- 500 posts/month = ~16 posts/day
- If you post 5x/day, you'll use 150/month (plenty of buffer!)
- Upgrade to Basic ($200/mo) if you need more

### LinkedIn API:
- Company verification required
- Can take 1-3 days
- Worth it for automation!

### Rate Limits:
The system automatically tracks and respects:
- Twitter: 500/month
- News API: 100/day
- YouTube: 10,000 quota/day
- Groq: 30/min

---

## 🎉 You're Ready!

Start with:
1. `npm install`
2. Setup Groq (free) + News API (free)
3. `npm run test-ai` to test
4. `npm run dev` to start
5. Open http://localhost:3000 and grow! 🚀

Questions? Check [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup.

**Happy automating! 🤖📈**

