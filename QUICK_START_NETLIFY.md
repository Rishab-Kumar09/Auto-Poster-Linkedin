# 🚀 Quick Start: Deploy to Netlify (5 Minutes)

## ✅ Your Code is Ready!

Everything is set up and pushed to GitHub:
https://github.com/Rishab-Kumar09/Auto-Poster-Linkedin

---

## 🎯 5-Minute Deployment

### 1. Sign Up for Netlify (1 minute)
- Go to: https://www.netlify.com/
- Click **"Sign up with GitHub"**
- Authorize Netlify

### 2. Create New Site (2 minutes)
- Click **"Add new site"** → **"Import an existing project"**
- Select **GitHub** → Choose **"Auto-Poster-Linkedin"**
- Configure:
  ```
  Base directory: frontend
  Build command: npm run build
  Publish directory: frontend/dist
  ```

### 3. Add Environment Variables (2 minutes)
Click **"Add environment variable"** and paste these:

```bash
GROQ_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here
LINKEDIN_CLIENT_ID=your_id_here
LINKEDIN_CLIENT_SECRET=your_secret_here
LINKEDIN_ACCESS_TOKEN=your_token_here
LINKEDIN_PERSON_URN=your_urn_here
AUTO_POST_PLATFORMS=linkedin
AUTO_POST=true
REQUIRE_APPROVAL=false
POST_FREQUENCY=4
TOPICS=AI,Software Development,Coding,Tech Innovation
PREFERRED_AI=groq
```

**Copy values from your `.env` file!**

### 4. Deploy!
- Click **"Deploy site"**
- Wait 2-3 minutes
- **Done!** ✅

---

## 🎉 What You Get

### ✅ Frontend UI:
`https://[your-site-name].netlify.app`
- Generate posts manually
- Review and edit posts
- Change images
- Delete posts

### ✅ Automated Content Fetching:
**Every 6 hours:**
- Fetches latest tech news
- Generates 4 AI-powered posts
- Finds relevant images from Unsplash

### ✅ Automated Posting:
**4 times per day (8am, 12pm, 5pm, 8pm UTC):**
- Posts 1 pending post to LinkedIn
- Includes images
- Professional AI-generated content

---

## 📊 Monitor Your Automation

### View Logs:
1. Netlify Dashboard → **Functions** tab
2. Click any function → **"Function logs"**
3. See real-time execution

### Check Posts:
- Visit your LinkedIn profile
- Should see new posts appearing!

---

## ⚙️ Customize

### Change Topics:
Netlify Dashboard → **Site settings** → **Environment variables** → Edit `TOPICS`

### Change Posting Times:
Edit `netlify.toml` → Commit → Push → Auto-redeploys!

### Add Twitter/X:
Add X API credentials to env vars → Change `AUTO_POST_PLATFORMS` to `linkedin,x`

---

## 🆘 Troubleshooting

### Build Failed?
- Check all environment variables are set
- View build logs in **Deploys** tab

### No Posts Appearing?
- Check function logs for errors
- Verify LinkedIn token is valid
- Make sure `AUTO_POST=true`

### Need Help?
See full guide: **DEPLOY_NETLIFY.md**

---

## 🎯 Next Steps

1. **Week 1:** Monitor post quality and engagement
2. **Week 2:** Adjust topics and timing
3. **Week 3:** Scale to multiple platforms!

---

**Your automation is now running 24/7 in the cloud!** 🎉

**No computer needed. No maintenance. Just growth!** 🚀

