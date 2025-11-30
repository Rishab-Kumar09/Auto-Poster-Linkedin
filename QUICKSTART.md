# 🚀 Quick Start Guide (5 Minutes)

## Step 1: Install (1 minute)

```bash
npm install
```

## Step 2: Get FREE API Keys (3 minutes)

### Groq API (30 seconds - REQUIRED)
1. Visit https://console.groq.com/
2. Sign up with Google/GitHub
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_`)

### News API (30 seconds - REQUIRED)
1. Visit https://newsapi.org/register
2. Enter email
3. Copy the API key from your email

### Optional: YouTube API (2 minutes)
1. Visit https://console.cloud.google.com/
2. Create project
3. Enable "YouTube Data API v3"
4. Create API key

## Step 3: Configure (30 seconds)

Create `.env` file:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` and add your keys:

```env
GROQ_API_KEY=gsk_your_key_here
NEWS_API_KEY=your_news_key_here
YOUTUBE_API_KEY=your_youtube_key_here

TOPICS=AI,Startups,Technology

PREFERRED_AI=groq
```

## Step 4: Test AI (30 seconds)

```bash
npm run test-ai
```

This will show you:
- ✅ Which AI providers work
- ⚡ Speed comparison
- 💰 Cost comparison
- 📝 Sample generated posts

## Step 5: Run the App (30 seconds)

**Open 2 terminals:**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

**Open http://localhost:3000** 🎉

## Step 6: Generate Your First Posts

1. Click "Fetch & Generate Content"
2. Wait 5-10 seconds
3. Review the generated posts
4. Edit if needed

**That's it!** You now have AI-generated social media posts.

---

## What's Next?

### To Actually Post (Twitter + LinkedIn)

You need posting credentials. This takes longer:

#### Twitter API (FREE - 10 minutes)
1. Visit https://developer.twitter.com/en/portal/dashboard
2. Sign up for FREE tier (no credit card!)
3. Create app
4. Get API keys
5. Add to `.env`:
```env
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_ACCESS_TOKEN=xxxxx
TWITTER_ACCESS_SECRET=xxxxx
```

#### LinkedIn API (Official - 1-3 days for approval)
1. Visit https://www.linkedin.com/developers/apps
2. Create app (requires company page)
3. Submit for verification (1-3 days)
4. Get OAuth token
5. Add to `.env`:
```env
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx
LINKEDIN_ACCESS_TOKEN=xxxxx
LINKEDIN_PERSON_URN=urn:li:person:xxxxx
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

---

## Automated Posting

Once you have posting credentials:

```bash
npm run post
```

This starts the scheduler that:
- Fetches content every 6 hours
- Generates posts automatically
- Posts at scheduled times
- Tracks analytics

---

## Troubleshooting

### "Cannot find module"
```bash
npm install
cd frontend && npm install
```

### "Groq API key not configured"
- Check your `.env` file exists
- Verify the key starts with `gsk_`
- Make sure there are no quotes around the key

### Port 3000 already in use
```bash
# Kill the process
npx kill-port 3000

# Or change port in frontend/vite.config.js
```

### Database errors
```bash
# Delete and recreate
rm -rf data/
npm run dev
```

---

## FAQ

**Q: Is this really free?**
A: Yes! Groq and News API are 100% free. You only pay if you want OpenAI or hit rate limits.

**Q: How many posts can I generate?**
A: Unlimited! Groq allows 14,400 requests/day.

**Q: Can I post without Twitter/LinkedIn API?**
A: No, you need API access to post. But you can generate content without it.

**Q: How do I add more topics?**
A: Edit `TOPICS` in `.env`: `TOPICS=AI,Crypto,Fitness,Marketing`

**Q: Can I change the posting schedule?**
A: Yes! Edit `POSTING_TIMES` in `.env`: `POSTING_TIMES=08:00,12:00,18:00`

---

## 📞 Need Help?

1. Check [README.md](./README.md) for full docs
2. Check [ENV_SETUP.md](./ENV_SETUP.md) for API setup
3. Check `.env.example` for all config options

---

## 🎉 You're All Set!

Start generating posts and watch your social media presence grow on autopilot! 🚀

**Pro tip**: Run `npm run test-ai` first to compare AI providers before choosing one.

