# 🚀 Deploy to Netlify (100% FREE, Single Platform)

## ✅ What You Get

- **Frontend + Backend on ONE platform** (Netlify)
- **NO CORS issues** (same domain!)
- **100% FREE** (125K requests/month)
- **Scheduled auto-posting** (4x/day + content fetching)
- **Automatic deployment** from GitHub

---

## 📋 Step-by-Step Deployment (15 minutes)

### ✅ Step 1: Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

---

### ✅ Step 2: Push to GitHub (Already Done! ✅)

Your code is already on GitHub:
https://github.com/Rishab-Kumar09/Auto-Poster-Linkedin

---

### ✅ Step 3: Sign Up for Netlify

1. Go to: https://www.netlify.com/
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (easiest!)
4. Authorize Netlify to access your repos

---

### ✅ Step 4: Create New Site

1. **Dashboard** → Click **"Add new site"** → **"Import an existing project"**

2. **Connect to Git provider:**
   - Click **"GitHub"**
   - Authorize if needed
   - Select **"Auto-Poster-Linkedin"** repository

3. **Site settings:**
   - **Branch to deploy:** `main`
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   - **Functions directory:** `netlify/functions`

4. **Click "Show advanced"** → **"Add environment variable"**

---

### ✅ Step 5: Add Environment Variables

Click **"New variable"** for each of these:

```bash
# AI & Content
GROQ_API_KEY = your_groq_api_key_here
NEWS_API_KEY = your_news_api_key_here
UNSPLASH_ACCESS_KEY = your_unsplash_access_key_here

# LinkedIn API
LINKEDIN_CLIENT_ID = your_linkedin_client_id
LINKEDIN_CLIENT_SECRET = your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN = your_linkedin_access_token
LINKEDIN_PERSON_URN = your_person_urn

# Automation Settings
AUTO_POST_PLATFORMS = linkedin
AUTO_POST = true
REQUIRE_APPROVAL = false
POST_FREQUENCY = 4
TOPICS = AI,Software Development,Coding,Tech Innovation
PREFERRED_AI = groq

# Posting Times (UTC timezone - adjust for your timezone!)
# Example: If you want 8am EST, use 13:00 (8am + 5 hours)
POSTING_TIMES = 08:00,12:00,17:00,20:00
```

**⏰ IMPORTANT - Timezone Note:**
The cron jobs in `netlify.toml` run in **UTC timezone**. The times are currently set to:
- 8:00 UTC = 3:00am EST / 12:00am PST
- 12:00 UTC = 7:00am EST / 4:00am PST
- 17:00 UTC = 12:00pm EST / 9:00am PST
- 20:00 UTC = 3:00pm EST / 12:00pm PST

**To adjust for your timezone**, edit `netlify.toml` after deployment!

---

### ✅ Step 6: Deploy!

1. Click **"Deploy [your-site-name]"**
2. Wait 2-3 minutes for build to complete
3. You'll see **"Site is live"** ✅

---

### ✅ Step 7: Test Your Deployment

1. Click on your site URL (e.g., `https://your-site-name.netlify.app`)
2. You should see your frontend!
3. Click **"Generate Posts"** to test
4. Check the **Functions** tab in Netlify to see logs

---

### ✅ Step 8: Verify Scheduled Functions

1. In Netlify Dashboard → Go to **"Functions"** tab
2. You should see:
   - `fetch-content` (runs every 6 hours)
   - `auto-post-morning` (8am)
   - `auto-post-noon` (12pm)
   - `auto-post-evening` (5pm)
   - `auto-post-night` (8pm)

3. Click on any function → **"Logs"** to see execution history

---

## 🎯 What Happens Now?

### Automatic Content Generation:
- **Every 6 hours**: Fetches content from News API, generates 4 posts with AI, fetches images from Unsplash

### Automatic Posting:
- **8am, 12pm, 5pm, 8pm**: Posts 1 pending post to LinkedIn (4 posts/day total)

### Frontend UI:
- Visit your site to manually generate posts
- Review pending posts
- Delete unwanted posts
- Change images

---

## 🔧 Post-Deployment Configuration

### Change Posting Schedule:

Edit `netlify.toml`:

```toml
# Change cron times (UTC timezone!)
[[functions."auto-post-morning".schedule]]
  cron = "0 13 * * *"  # 8am EST (13:00 UTC)

[[functions."auto-post-noon".schedule]]
  cron = "0 17 * * *"  # 12pm EST (17:00 UTC)

[[functions."auto-post-evening".schedule]]
  cron = "0 22 * * *"  # 5pm EST (22:00 UTC)

[[functions."auto-post-night".schedule]]
  cron = "0 1 * * *"  # 8pm EST (1:00 UTC next day)
```

Then:
```bash
git add netlify.toml
git commit -m "Update posting schedule"
git push
```

Netlify will auto-redeploy! ✅

### Change Topics:

1. Go to Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Edit `TOPICS` variable
4. Click **"Save"**
5. **Deploys** → **"Trigger deploy"** → **"Clear cache and deploy site"**

### Enable Twitter/X Posting:

1. Add X API credentials to environment variables:
   ```bash
   X_API_KEY = your_x_api_key
   X_API_SECRET = your_x_api_secret
   X_ACCESS_TOKEN = your_x_access_token
   X_ACCESS_SECRET = your_x_access_secret
   ```

2. Change `AUTO_POST_PLATFORMS` to:
   ```bash
   AUTO_POST_PLATFORMS = linkedin,x
   ```

3. Redeploy

---

## 📊 Monitoring & Logs

### View Function Logs:
1. Netlify Dashboard → **Functions** tab
2. Click on any function name
3. Click **"Function logs"** to see executions

### View Build Logs:
1. Netlify Dashboard → **Deploys** tab
2. Click on any deploy
3. See full build output

### Check if Automation is Working:
- Check your LinkedIn profile for new posts!
- View Function logs for `auto-post-*` functions
- Should see "✅ Posted to linkedin" messages

---

## 🐛 Troubleshooting

### "Build failed" Error:

**Check:**
1. All environment variables are set correctly
2. No typos in variable names
3. Build logs show which dependency failed

**Fix:** Click **"Trigger deploy"** → **"Deploy site"**

---

### "Function timeout" Error:

**Netlify Functions have a 10-second timeout on free tier.**

**If content fetching times out:**
1. Reduce `POST_FREQUENCY` from 4 to 2
2. Or split into multiple functions

---

### Posts not appearing on LinkedIn:

**Check:**
1. `LINKEDIN_ACCESS_TOKEN` is valid (tokens expire!)
2. Function logs show errors
3. `AUTO_POST` is set to `true`
4. `REQUIRE_APPROVAL` is set to `false`

**Refresh LinkedIn token:**
```bash
node get-linkedin-urn.js
```
Update `LINKEDIN_ACCESS_TOKEN` in Netlify env vars.

---

### No posts being generated:

**Check:**
1. `fetch-content` function logs in Netlify
2. API keys are valid (Groq, News API, Unsplash)
3. Cron schedule is correct

---

### Images not attaching to posts:

**Check:**
1. `UNSPLASH_ACCESS_KEY` is set correctly
2. Function logs for image fetch errors
3. LinkedIn image upload might be failing (check logs)

---

## 🔒 Security Best Practices

### ✅ Environment Variables:
- **NEVER commit `.env` to GitHub** (already in `.gitignore`)
- All secrets stored in Netlify Dashboard (encrypted)

### ✅ API Keys:
- LinkedIn tokens expire - refresh monthly
- Groq/News API have rate limits
- Monitor usage in respective dashboards

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Netlify Functions** | 125K requests/month | ~3K/month | $0 |
| **Netlify Build Minutes** | 300 min/month | ~10 min/month | $0 |
| **Groq API** | FREE | Unlimited | $0 |
| **News API** | 100 requests/day | ~24/day | $0 |
| **Unsplash API** | 50 requests/hour | ~30/day | $0 |
| **LinkedIn API** | FREE | 4 posts/day | $0 |

**Total: $0/month** 🎉

---

## 🚀 Next Steps

### Week 1: Test & Monitor
- Let it run for a week
- Monitor post quality
- Check engagement on LinkedIn
- Adjust topics/timing if needed

### Week 2: Optimize
- Analyze which posts perform best
- Adjust posting times based on engagement
- Fine-tune AI prompts in `backend/aiGenerator.js`

### Week 3: Scale
- Add Twitter/X if desired
- Increase posting frequency
- Add more content sources

---

## 📞 Support

### Netlify Issues:
- https://answers.netlify.com/
- https://docs.netlify.com/

### LinkedIn API Issues:
- https://docs.microsoft.com/en-us/linkedin/

### This Project Issues:
- Check function logs first
- Verify environment variables
- Test API keys individually

---

## ✅ Deployment Checklist

- [x] Code pushed to GitHub
- [ ] Netlify account created
- [ ] Site created and connected to GitHub
- [ ] All environment variables added
- [ ] Site deployed successfully
- [ ] Frontend loads correctly
- [ ] Can generate posts manually
- [ ] Scheduled functions appear in Functions tab
- [ ] First automated post successful
- [ ] Monitoring logs regularly

---

## 🎉 You're Live!

Your automation is now running 24/7 in the cloud!

**Your site:** `https://[your-site-name].netlify.app`

**Next:** Let it run and watch your LinkedIn grow! 🚀

---

## 🔄 Making Changes

**To update your code:**

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push
```

**Netlify auto-deploys from GitHub!** No manual steps needed! ✅

---

**Questions? Check the logs first, then troubleshooting section above!** 💪

