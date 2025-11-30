# 🌐 Deploy to Render (FREE 24/7 Hosting)

## 🎯 What This Does

Deploys your automation to Render's cloud servers:
- ✅ Runs 24/7 (even when your computer is off!)
- ✅ FREE tier available
- ✅ Automatic restarts
- ✅ Built-in HTTPS
- ✅ No maintenance needed

---

## ⚠️ Before You Start

**You need a GitHub account** to deploy to Render.

If you don't have one:
1. Go to: https://github.com/join
2. Create free account (2 minutes)

---

## 🚀 Deployment Steps (15 Minutes)

### Step 1: Push Code to GitHub (5 minutes)

**In your project folder:**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Social media automation"

# Create repository on GitHub
# Go to: https://github.com/new
# Repository name: "social-media-automation"
# Make it PRIVATE (contains your .env later)
# Click "Create repository"

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/social-media-automation.git
git branch -M main
git push -u origin main
```

---

### Step 2: Sign Up for Render (2 minutes)

1. Go to: https://render.com/
2. Click "Get Started"
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repos

---

### Step 3: Create Web Service (5 minutes)

1. **Dashboard** → Click "New +" → "Web Service"

2. **Connect Repository:**
   - Select "social-media-automation"
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `social-automation`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/scheduler.js`
   - **Instance Type:** Select **"Free"**

4. Click **"Advanced"** → Add environment variables:

Click "Add Environment Variable" for each:

```
GROQ_API_KEY = your_groq_key
NEWS_API_KEY = your_news_key
UNSPLASH_ACCESS_KEY = your_unsplash_key
LINKEDIN_CLIENT_ID = your_linkedin_id
LINKEDIN_CLIENT_SECRET = your_linkedin_secret
LINKEDIN_ACCESS_TOKEN = your_linkedin_token
LINKEDIN_PERSON_URN = your_person_urn
AUTO_POST_PLATFORMS = linkedin
AUTO_POST = true
REQUIRE_APPROVAL = false
POSTING_TIMES = 08:00,12:00,17:00,20:00
POST_FREQUENCY = 4
TOPICS = AI,Software Development,Coding,Tech Innovation
PREFERRED_AI = groq
```

5. Click **"Create Web Service"**

---

### Step 4: Wait for Deployment (2 minutes)

Render will:
- Build your app
- Install dependencies
- Start the scheduler
- You'll see logs in real-time!

---

### Step 5: It's Live! ✅

Your automation is now running 24/7 in the cloud!

Check the logs in Render dashboard to see it working.

---

## 📊 Monitoring on Render

### View Logs:
- Render Dashboard → Your service → "Logs" tab
- See all automation activity in real-time

### Check Status:
- Green = Running ✅
- Red = Error (check logs)

### Restart:
- Click "Manual Deploy" → "Deploy latest commit"

---

## 💰 Cost

**FREE Tier Includes:**
- 750 hours/month (enough for 24/7!)
- 512 MB RAM
- Shared CPU
- Auto-sleeps after 15 min inactivity

**But cron jobs keep it alive!** Your scheduled posts will wake it up. ✅

**If you need more:** Upgrade to $7/month for always-on

---

## 🔒 Security

### Keep .env Secret:
- **DON'T commit .env to GitHub!**
- Your `.gitignore` already blocks it ✅
- Add secrets in Render dashboard only

### Make Repo Private:
- GitHub repo should be **Private** (not Public)
- Contains your automation logic

---

## 🎛️ Alternative: Railway (Also Great)

**If Render doesn't work:**

1. Go to: https://railway.app/
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add environment variables
6. Deploy!

**Cost:** $5/month (no free tier, but more reliable)

---

## 🆘 Troubleshooting

### "Build failed"
- Check `package.json` is in root folder
- Check all dependencies are listed
- Check Build Command is `npm install`

### "Service keeps stopping"
- Check Start Command is `node backend/scheduler.js`
- Check logs for errors
- Make sure all env vars are set

### "Posts not appearing"
- Check environment variables on Render
- View logs for errors
- Verify API keys are correct

### "Database not working"
- Database is ephemeral on Render free tier
- Posts reset on restart (this is OK for your use case)
- For persistent database, upgrade to paid tier

---

## ✅ Without Cloud Hosting?

**You can still automate locally:**

### Use PM2 on Your Computer:
```bash
npm install -g pm2
pm2 start backend/scheduler.js --name "social-bot"
pm2 startup
pm2 save
```

**Benefits:**
- Runs in background
- Auto-starts on computer boot
- Survives terminal close

**Requirement:**
- Computer must stay on 24/7
- Not truly cloud-hosted

---

## 🎯 My Recommendation

**For True 24/7 Automation:**

1. **Week 1:** Test locally with `npm run post`
2. **Week 2:** Deploy to Render (FREE)
3. **Month 2+:** If growing fast, upgrade to Railway ($5/mo) for always-on

**For Now (Testing):**
- Just use `npm run post` on your computer
- Run it for a day or two
- See how it works
- Then deploy to cloud

---

## 📝 Quick Summary

| Method | Cost | 24/7 | Difficulty |
|--------|------|------|------------|
| Your Computer | $0 | ❌ | Easy |
| PM2 (Local) | $0 | ⚠️ If PC on | Easy |
| **Render** | **$0** | **✅** | **Medium** ⭐ |
| Railway | $5/mo | ✅ | Easy |

---

## 🚀 What Do You Want?

**Option A:** Test locally first (run `npm run post` now)
**Option B:** Deploy to Render immediately (I'll guide you step-by-step)
**Option C:** I'll create a full deployment guide with screenshots

**Which one?** Tell me and I'll help! 🎉
