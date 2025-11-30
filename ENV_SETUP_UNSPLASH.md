# 🖼️ Unsplash API Setup (FREE Images)

## Why Unsplash?
- ✅ **100% FREE** (50 requests/hour = 1200/day)
- ✅ **Legal** to use commercially
- ✅ **High quality** curated photos
- ✅ **Auto-search** by keywords
- ✅ No copyright issues

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Create Unsplash Account
1. Go to: https://unsplash.com/join
2. Sign up (it's free!)

### Step 2: Create Developer Account
1. Go to: https://unsplash.com/developers
2. Click "Register as a developer"
3. Accept the API terms

### Step 3: Create an App
1. Go to: https://unsplash.com/oauth/applications
2. Click "New Application"
3. Fill in:
   - **Application name**: "Social Media Automation"
   - **Description**: "Automated social media posting with relevant images"
4. Check all the boxes (agree to terms)
5. Click "Create application"

### Step 4: Get Your Access Key
1. On your app page, find **"Access Key"**
2. Copy it (looks like: `abc123xyz...`)
3. Add to your `.env` file:

```env
UNSPLASH_ACCESS_KEY=your_access_key_here
```

---

## ✅ That's It!

Now your posts will automatically include relevant images!

---

## 📊 Usage Limits

**Free Tier:**
- 50 requests per hour
- 1200+ requests per day
- More than enough for 5-10 posts/day

**If you post 5x/day:**
- Uses only 5 requests/day
- Way under the limit! ✅

---

## 🎨 How It Works

1. System generates post about "AI tools"
2. Searches Unsplash for "AI tools technology"
3. Gets high-quality relevant image
4. Attaches to your LinkedIn/Twitter post
5. Automatic credit to photographer (required by Unsplash)

---

## 🖼️ Example Images You'll Get

| Topic | Image Type |
|-------|-----------|
| AI Tools | Tech, coding, AI graphics |
| Startups | Business, office, team |
| Productivity | Workspace, laptop, planning |
| Technology | Innovation, digital, modern |

---

## ⚠️ Important: Unsplash Terms

You must:
- ✅ Use their API (you're doing this)
- ✅ Trigger download endpoint (system does this)
- ✅ Credit photographers (system adds this)
- ❌ Don't claim images as your own

The system handles all of this automatically! ✅

---

## 🔧 Testing

After adding the key, restart backend:

```bash
npm run dev
```

Generate a post and you'll see:
```
🖼️  Fetching relevant image...
✅ Image found: https://images.unsplash.com/...
```

---

## 💡 Pro Tips

### Custom Search Terms
The system automatically searches based on:
- Post topic (AI, Startups, etc.)
- Post content keywords
- Optimized for relevance

### Image Quality
- Gets "regular" size (best for social media)
- Landscape orientation (looks best)
- High content filter (professional quality)

### Backup Plan
If Unsplash is down or no images found:
- Posts still work without images
- No errors, just continues posting

---

## 🆘 Troubleshooting

**"403 Forbidden" error**
→ Check your Access Key is correct in `.env`

**"401 Unauthorized"**
→ Make sure you registered as a developer

**"No images found"**
→ System will post without image (not a problem!)

**"Rate limit exceeded"**
→ You're over 50/hour (very unlikely)

---

## 📚 Links

- Unsplash Developer Portal: https://unsplash.com/developers
- API Documentation: https://unsplash.com/documentation
- Your Applications: https://unsplash.com/oauth/applications

---

**Now your posts will look PROFESSIONAL with relevant images!** 🎨✨

