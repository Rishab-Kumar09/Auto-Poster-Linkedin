# 🔑 API Keys Setup Guide

## 1. X (Twitter) API - FREE TIER ✅

**Steps:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign up for Free tier (no credit card needed!)
3. Create a new project + app
4. Go to your app settings → Keys and Tokens
5. Generate:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
6. Save these in `.env` file

**Limits:**
- 500 posts/month (≈16 posts/day) ← Perfect for starting!
- 100 reads/month

---

## 2. LinkedIn API - Official ✅

**Steps:**
1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in:
   - App name: "Social Media Automation"
   - LinkedIn Page: Your company page (create one if needed)
4. Submit for company verification (takes 1-3 days)
5. Once approved, go to "Auth" tab
6. Get:
   - Client ID
   - Client Secret
7. Add redirect URL: `http://localhost:3001/auth/linkedin/callback`
8. Generate Access Token using OAuth 2.0 flow
9. Get your Person URN from: https://api.linkedin.com/v2/me

**Required Products:**
- Sign In with LinkedIn
- Share on LinkedIn
- Marketing Developer Platform (for posting)

---

## 3. Content Source APIs (All FREE)

### News API
1. Go to https://newsapi.org/register
2. Sign up (100 requests/day FREE)
3. Copy your API key

### YouTube Data API
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API key
5. Limit: 10,000 quota units/day (≈100 searches)

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create app"
3. Choose "script"
4. Get Client ID and Secret
5. Optional: Generate refresh token for better access

---

## 4. AI APIs

### Groq (FREE - RECOMMENDED) ⭐
1. Go to https://console.groq.com/
2. Sign up
3. Get API key
4. **FREE tier: 30 requests/min, 14,400/day** ← AMAZING!

### Google Gemini (FREE)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. FREE tier: 60 requests/min

### OpenAI (PAID)
1. Go to https://platform.openai.com/api-keys
2. Create API key
3. Add credits ($5 minimum)
4. Use GPT-4o-mini (cheapest: $0.15 per 1M input tokens)

---

## 5. Final .env File

Copy `.env.example` to `.env` and fill in your keys:

```bash
# AI (Use Groq for FREE)
GROQ_API_KEY=gsk_xxxxx
PREFERRED_AI=groq

# Content Sources
NEWS_API_KEY=xxxxx
YOUTUBE_API_KEY=xxxxx
REDDIT_CLIENT_ID=xxxxx
REDDIT_CLIENT_SECRET=xxxxx

# X (Twitter) - FREE TIER
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_ACCESS_TOKEN=xxxxx
TWITTER_ACCESS_SECRET=xxxxx

# LinkedIn - Official API
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx
LINKEDIN_ACCESS_TOKEN=xxxxx
LINKEDIN_PERSON_URN=urn:li:person:xxxxx

# Topics
TOPICS=AI,Startups,Technology,Marketing
```

---

## Quick Start Order:

1. **Start with Groq** (instant, FREE) ✅
2. **Setup News API** (5 mins) ✅
3. **Setup YouTube API** (10 mins) ✅
4. **Setup Reddit** (optional, 5 mins)
5. **Setup X API** (10 mins) ✅
6. **Setup LinkedIn API** (submit for verification - wait 1-3 days)

You can start testing immediately with just Groq + News API!

