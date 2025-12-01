# 🖼️ Google Custom Search API Setup (5 Minutes)

## ✅ Why Google Custom Search?

**For getting ACTUAL product images:**
- ✅ Claude 3.5 logo/screenshots
- ✅ GPT-4 / OpenAI branding  
- ✅ GitHub Copilot interface
- ✅ Cursor AI screenshots
- ✅ Any AI tool/model imagery

**FREE Tier: 100 searches/day** (You need ~4-5/day = perfect!) ✅

---

## 📋 Step 1: Enable Custom Search API (2 minutes)

1. **Go to:** https://console.cloud.google.com/
2. **Sign in** with Google account (or create one - FREE)
3. **Create a new project:**
   - Click **"Select a project"** (top left)
   - Click **"New Project"**
   - Name: `social-automation`
   - Click **"Create"**
   - Wait 30 seconds

4. **Enable Custom Search API:**
   - Go to: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   - Make sure your project is selected (top left)
   - Click **"Enable"**
   - Wait 10 seconds

---

## 📋 Step 2: Create API Key (1 minute)

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** (top)
3. Select **"API key"**
4. Copy the API key that appears
5. **SAVE IT!**
6. (Optional) Click **"Restrict key"** → **"Custom Search API"** for security

---

## 📋 Step 3: Create Search Engine (2 minutes)

1. **Go to:** https://programmablesearchengine.google.com/controlpanel/create
2. **Fill in:**
   ```
   Search engine name: Social Media Images
   What to search: Search the entire web
   ```
3. ✅ Toggle **"Image search"** to ON
4. ✅ Toggle **"SafeSearch"** to ON
5. Click **"Create"**

6. **Get your Search Engine ID:**
   - You'll see a confirmation page
   - Click **"Customize"**
   - Copy the **"Search engine ID"** (looks like: `a1b2c3d4e5f6g7h8i`)
   - **SAVE IT!**

---

## 📋 Step 4: Add to .env

Add these TWO lines to your `.env` file:

```bash
GOOGLE_SEARCH_API_KEY=AIzaSy...your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

---

## 📋 Step 5: Add to Netlify

1. Go to Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Add TWO new variables:

**First variable:**
```
Key: GOOGLE_SEARCH_API_KEY
Value: [paste your API key]
```

**Second variable:**
```
Key: GOOGLE_SEARCH_ENGINE_ID
Value: [paste your Search Engine ID]
```

4. Click **"Save"** for each

---

## 🎯 How It Works:

### Post mentions specific tool:
```
Post: "Claude 3.5 Sonnet's code understanding..."
→ Detects: "Claude" (specific tool)
→ Uses: GOOGLE Custom Search
→ Query: "Claude AI Anthropic"
→ Result: Actual Claude logo/screenshot from web! ✅
```

### Generic AI/tech post:
```
Post: "AI code assistants are evolving..."
→ No specific tool detected
→ Uses: UNSPLASH
→ Query: "artificial intelligence coding"
→ Result: Beautiful tech photo ✅
```

---

## 💰 FREE Tier Limits:

**Google Custom Search API (FREE):**
- ✅ 100 searches/day
- ✅ Your usage: ~5/day (well under limit!)
- ✅ No credit card required

**If you exceed 100/day:**
- $5 per 1,000 additional queries
- But you won't hit this with 4-5 posts/day!

---

## ✅ Checklist:

- [ ] Google Cloud project created
- [ ] Custom Search API enabled
- [ ] API key created
- [ ] Search Engine created (with image search ON)
- [ ] Search Engine ID copied
- [ ] Both added to `.env` file
- [ ] Both added to Netlify environment variables

---

## 🚀 Once Added:

Your posts will automatically get:
- ✅ Claude posts → Claude logo/branding
- ✅ GPT-4 posts → OpenAI imagery
- ✅ Copilot posts → GitHub Copilot screenshots
- ✅ Generic posts → Beautiful Unsplash photos
- ✅ VARIETY (no more duplicates!)

---

## 🆘 Quick Links:

- **Google Cloud Console:** https://console.cloud.google.com/
- **Enable API:** https://console.cloud.google.com/apis/library/customsearch.googleapis.com
- **Create Credentials:** https://console.cloud.google.com/apis/credentials
- **Create Search Engine:** https://programmablesearchengine.google.com/controlpanel/create

---

**GO SET UP GOOGLE CUSTOM SEARCH NOW!** 🚀

**Tell me when you have both keys and I'll help add them!** 💪
