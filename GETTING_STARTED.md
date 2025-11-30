# 🎯 Getting Started - Complete Guide

## What You're Building

An **AI-powered social media automation system** that:
1. Finds trending content about your topics (AI, startups, etc.)
2. Uses AI to generate engaging posts
3. Posts automatically to Twitter & LinkedIn
4. Optimizes for maximum growth

**Time to first post: ~5 minutes** (with free APIs)
**Time to full automation: ~20 minutes** (with Twitter/LinkedIn APIs)

---

## Installation

### Prerequisites
- Node.js 18+ installed
- Text editor (VS Code recommended)
- Twitter account (for posting)
- LinkedIn account (for posting)

### Install Dependencies

```bash
# Clone or download this project
cd social-media-automation

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Configuration (Choose Your Path)

### Path A: Just Test It (2 minutes) ✅

**You'll be able to:**
- Generate AI posts
- See the UI
- Test all features

**You won't be able to:**
- Actually post to social media

**Setup:**
1. Get Groq API key (FREE, 30 seconds)
   - Visit https://console.groq.com/
   - Sign up → Get API key

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env`:
```env
GROQ_API_KEY=gsk_your_key_here
TOPICS=AI,Startups,Technology
PREFERRED_AI=groq
```

4. Done! Skip to "Running the App"

---

### Path B: Full Automation (20 minutes) 🚀

**You'll be able to:**
- Generate posts
- Post to Twitter
- Post to LinkedIn
- Full automation

**Setup:**

#### 1. Groq API (FREE - 1 min) ⚡
https://console.groq.com/
- Sign up
- Create API key
- Add to `.env`: `GROQ_API_KEY=gsk_xxxxx`

#### 2. News API (FREE - 1 min) 📰
https://newsapi.org/register
- Enter email
- Copy API key
- Add to `.env`: `NEWS_API_KEY=xxxxx`

#### 3. Twitter API (FREE - 10 mins) 🐦

**Step-by-step:**

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign up for developer account
3. Choose **"Free" tier** (500 posts/month)
4. Create a new project:
   - Name: "Social Automation"
   - Use case: "Making a bot"
5. Create an app under the project
6. Go to app settings → "Keys and tokens"
7. Generate:
   - API Key & Secret
   - Access Token & Secret
8. Copy all 4 values to `.env`:

```env
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_ACCESS_TOKEN=xxxxx
TWITTER_ACCESS_SECRET=xxxxx
```

**Free Tier Limits:**
- 500 tweets/month (≈16/day)
- 100 reads/month
- Perfect for starting!

#### 4. LinkedIn API (OPTIONAL - 3 days approval) 💼

**Why optional?** Takes 1-3 days for company verification.

**Steps:**

1. Create LinkedIn Company Page (if you don't have one):
   - Go to https://www.linkedin.com/company/setup/new/
   - Enter company name
   - Add logo and description

2. Create LinkedIn App:
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in details:
     - App name: "Social Media Automation"
     - LinkedIn Page: Select your company page
     - App logo: Upload any logo
   - Submit

3. Verify your company:
   - LinkedIn will ask to verify you own the company
   - This takes 1-3 business days
   - They'll email you when approved

4. After approval:
   - Go to app → "Auth" tab
   - Copy Client ID and Secret
   - Add to `.env`:
```env
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx
```

5. Get Access Token:
```bash
npm run linkedin-auth
```
   - Opens browser
   - Login to LinkedIn
   - Grant permissions
   - Copy access token to `.env`

**For now:** You can skip LinkedIn and just use Twitter!

---

## Running the App

### 1. Start Backend

```bash
npm run dev
```

You should see:
```
🚀 Social Media Automation Server running on http://localhost:3001
📊 Database initialized
🤖 AI Providers: OpenAI, Groq, Gemini
📱 Platforms: Twitter, LinkedIn
```

### 2. Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 328 ms

  ➜  Local:   http://localhost:3000/
```

### 3. Open Browser

Go to **http://localhost:3000**

You should see a beautiful purple gradient UI! 🎨

---

## First Test

### Test AI Generation

In the UI:
1. Topics: Leave as "AI,Startups,Technology"
2. AI Provider: Select "Groq (FREE ⚡)"
3. Tone: Select "Professional"
4. Click **"Fetch & Generate Content"**

Wait 10-20 seconds...

You'll see generated posts for Twitter and LinkedIn! ✨

### Review & Edit

- Edit the text if needed
- Check character counts
- Select platforms (Twitter/LinkedIn)

### Post (if you have API keys)

Click **"Post to platforms"**

Your post goes live! 🚀

---

## Test AI Providers (Comparison)

Want to compare Groq vs OpenAI vs Gemini?

```bash
npm run test-ai
```

This shows you:
- ⚡ Speed: Which is fastest
- 💰 Cost: Which is cheapest
- 📝 Quality: Sample posts from each
- ✅ Status: Which APIs work

**Expected output:**
```
🧪 Testing all AI providers side-by-side...

Testing Groq (FREE) 🚀
Testing Gemini (FREE) 🌟
Testing OpenAI (PAID) 💰

📊 COMPARISON RESULTS:
═══════════════════════════════════════

GROQ ✅
⏱️  Speed: 2847ms
💰 Cost: FREE
📝 Twitter Post:
AI is not replacing jobs—it's replacing tasks.

The winners will be those who learn to use it.

Are you adapting or resisting?
```

---

## Enable Automated Posting

Want it to run on autopilot?

### 1. Edit `.env`

```env
# Schedule posts at these times
POSTING_TIMES=08:00,12:00,17:00,20:00

# How many posts per day
POST_FREQUENCY=4

# Auto-post without approval
AUTO_POST=true
REQUIRE_APPROVAL=false
```

### 2. Start Scheduler

```bash
npm run post
```

Now it will:
- Fetch content every 6 hours
- Generate posts automatically
- Post at scheduled times (8am, 12pm, 5pm, 8pm)
- Track analytics

**Leave it running!** Press Ctrl+C to stop.

---

## Understanding the System

### Architecture

```
┌─────────────────┐
│  Content Fetch  │  ← Every 6 hours
│  (News/YouTube) │
└────────┬────────┘
         ↓
┌─────────────────┐
│  AI Generator   │  ← Groq/OpenAI/Gemini
│  (Posts)        │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Review Queue   │  ← You review (if enabled)
│  (Frontend)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Auto-Post      │  ← Twitter/LinkedIn APIs
│  (Scheduled)    │
└─────────────────┘
```

### File Structure

```
backend/
  ├── server.js          # API server
  ├── contentFetcher.js  # Fetch from News/YouTube/Reddit
  ├── aiGenerator.js     # Generate posts with AI
  ├── autoPost.js        # Post to Twitter/LinkedIn
  ├── scheduler.js       # Automation & cron jobs
  ├── growthOptimizer.js # Analytics & recommendations
  └── database.js        # SQLite database

frontend/
  └── src/
      └── App.jsx        # React UI

.env                     # Your API keys (KEEP SECRET!)
package.json             # Dependencies
```

---

## Growth Strategy

### For Maximum Follower Growth

**1. Posting Frequency**
- Start: 3-5 posts/day
- Goal: 5-7 posts/day
- Twitter FREE tier: 16 posts/day max

**2. Best Times to Post**
```env
POSTING_TIMES=08:00,11:00,14:00,17:00,20:00
```
- 8am: Morning commute
- 11am: Mid-morning break
- 2pm: Post-lunch
- 5pm: Evening commute
- 8pm: Leisure time

**3. Content Mix**
- 40% Educational (AI insights, tips)
- 30% Thought-provoking (hot takes)
- 20% Motivational (inspiration)
- 10% Personal (your experiences)

**4. Engagement Tactics**
- End LinkedIn posts with questions
- Use line breaks for readability
- Add 1-2 emojis (not more!)
- Keep tweets under 200 chars
- Use numbers/lists

**5. Track Performance**
The system learns your best:
- Topics
- Posting times
- Tone
- Content types

Check dashboard for recommendations!

---

## Troubleshooting

### Backend won't start

**Error: "Cannot find module"**
```bash
npm install
```

**Error: "Port 3001 in use"**
```bash
npx kill-port 3001
npm run dev
```

**Error: "Groq API key not configured"**
- Check `.env` exists
- Verify `GROQ_API_KEY=gsk_...` (no quotes)
- Key should start with `gsk_`

### Frontend won't start

**Error: "Cannot find module"**
```bash
cd frontend
npm install
npm run dev
```

**Error: "Port 3000 in use"**
```bash
npx kill-port 3000
cd frontend
npm run dev
```

### AI Generation fails

**Error: "OpenAI API key not configured"**
→ Use Groq instead (it's free!)
```env
PREFERRED_AI=groq
GROQ_API_KEY=gsk_xxxxx
```

**Error: "Rate limit exceeded"**
→ You hit the limit. Wait 1 minute and try again.

### Twitter posting fails

**Error: "401 Unauthorized"**
- Check all 4 credentials in `.env`
- Verify Access Token & Secret are correct
- Make sure app has "Read and Write" permissions

**Error: "429 Too Many Requests"**
- You hit 500 posts/month limit
- Check remaining: https://developer.twitter.com/en/portal/dashboard
- Consider upgrading to Basic tier ($200/mo)

### LinkedIn posting fails

**Error: "Company verification required"**
- This is normal! Takes 1-3 days
- You can use Twitter in the meantime

**Error: "Invalid access token"**
- Token expired (LinkedIn tokens last 60 days)
- Run `npm run linkedin-auth` again to refresh

### Database errors

**Error: "Database is locked"**
```bash
# Stop all processes
# Delete database
rm -rf data/
npm run dev
```

---

## Next Steps

### After Your First Posts

1. **Check Analytics**
   - Dashboard shows engagement
   - Identifies best topics
   - Recommends optimal times

2. **Refine Strategy**
   - Try different tones
   - Test new topics
   - Adjust posting times

3. **Scale Up**
   - Increase frequency
   - Add more topics
   - Enable full automation

### Add More Features

- **YouTube API**: More content sources
- **Reddit API**: Community insights
- **Image Generation**: Visual content
- **A/B Testing**: Test multiple versions

---

## Cost Breakdown

### Free Tier (Perfect for Starting)

- **Groq**: FREE (14,400 requests/day)
- **News API**: FREE (100 requests/day)
- **Twitter**: FREE (500 posts/month)
- **YouTube**: FREE (10,000 quota/day)

**Total: $0/month** for ~16 posts/day! 🎉

### Paid Options (For Scaling)

If you grow fast:
- **Twitter Basic**: $200/mo (3,000 posts/month)
- **OpenAI**: ~$10/mo (if you prefer over Groq)

---

## FAQ

**Q: Do I need OpenAI?**
No! Groq is free and excellent quality.

**Q: Can I post without Twitter API?**
No, you need API access to post. But you can generate content without it.

**Q: Is LinkedIn API worth the wait?**
Yes! But start with Twitter while waiting for approval.

**Q: How long until I see growth?**
- Week 1: Setup + testing
- Week 2-4: Consistent posting + optimization
- Month 2+: Noticeable follower growth

**Q: Can I customize the AI prompts?**
Yes! Edit `backend/aiGenerator.js` → `createPrompt()` function

**Q: How do I add my own content sources?**
Edit `backend/contentFetcher.js` → add new fetch functions

**Q: Can I schedule specific posts?**
Not yet, but coming soon! For now, use the review queue.

---

## Support

**Documentation:**
- [README.md](./README.md) - Full documentation
- [ENV_SETUP.md](./ENV_SETUP.md) - Detailed API setup
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup

**Check Logs:**
```bash
# Backend logs show all activity
npm run dev

# Test AI providers
npm run test-ai

# Run a test cycle
npm run test-cycle
```

---

## 🎉 You're Ready!

Start with:
1. ✅ `npm install` (both backend + frontend)
2. ✅ Setup Groq API (free)
3. ✅ `npm run test-ai` (compare providers)
4. ✅ `npm run dev` + frontend
5. ✅ Generate your first posts!
6. ✅ Setup Twitter API when ready
7. ✅ Submit LinkedIn for approval
8. ✅ Enable automation
9. ✅ Watch your follower count grow! 📈

**Happy automating! 🤖🚀**

