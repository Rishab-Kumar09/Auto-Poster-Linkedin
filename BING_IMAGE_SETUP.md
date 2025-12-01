# 🖼️ Bing Image Search Setup (2 Minutes)

## ✅ Why Bing Image Search?

**For getting ACTUAL product images:**
- ✅ Claude 3.5 logo/screenshots
- ✅ GPT-4 / OpenAI branding
- ✅ GitHub Copilot interface
- ✅ Cursor AI screenshots
- ✅ Any AI tool/model imagery

**Unsplash is great for generic tech photos, but Bing finds actual product images!**

---

## 📋 Step 1: Create Azure Account (1 minute)

1. Go to: https://portal.azure.com/
2. Click **"Start free"** or **"Sign in"**
3. Sign in with Microsoft account (or create one - FREE)
4. You may need to add a credit card (but won't be charged on FREE tier!)

---

## 📋 Step 2: Create Bing Search Resource (2 minutes)

### **Option A: Direct Link (Easiest)**

**Click this link:** https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7

### **Option B: Manual Navigation**

1. In Azure Portal, search for **"Bing Search"** in top search bar
2. Click **"Bing Search v7"**
3. Click **"Create"**

---

## 📋 Step 3: Fill the Form

```
Subscription: Free Trial (or your subscription)
Resource Group: Click "Create new" → Name: social-automation
Region: Choose closest to you (e.g., East US, West Europe)
Name: social-media-images (or any name you want)
Pricing Tier: F1 (FREE - 1,000 transactions/month) ← IMPORTANT!
```

**Make sure you select "F1 (FREE)"!**

✅ Click **"Review + create"**  
✅ Click **"Create"**  
⏳ Wait 30 seconds for deployment

---

## 📋 Step 4: Get Your API Key

1. After deployment finishes, click **"Go to resource"**
2. In left sidebar, click **"Keys and Endpoint"**
3. You'll see two keys:
   - **KEY 1**: `abc123...`
   - **KEY 2**: `def456...`
4. Click **"Show"** next to KEY 1
5. Click **copy icon** to copy the key
6. **SAVE IT!**

---

## 📋 Step 5: Add to .env

Add this line to your `.env` file:

```bash
BING_IMAGE_SEARCH_KEY=your_key_here
```

---

## 📋 Step 6: Add to Netlify

1. Go to Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Add:
   ```
   Key: BING_IMAGE_SEARCH_KEY
   Value: [paste your key]
   ```
5. Click **"Create variable"**

---

## 🎯 How It Works:

**When you generate a post:**

### Post mentions specific tool:
```
Post: "Claude 3.5 Sonnet's code understanding..."
→ Detects: "Claude" (specific tool)
→ Uses: BING Image Search
→ Query: "Claude AI Anthropic"
→ Result: Actual Claude logo/screenshot! ✅
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

**Bing Image Search F1 (FREE):**
- ✅ 1,000 searches/month
- ✅ Your usage: ~120/month (4 posts/day × 30 days)
- ✅ Plenty of headroom!

---

## ✅ Checklist:

- [ ] Azure account created
- [ ] Bing Search resource created
- [ ] F1 (FREE) tier selected
- [ ] API key copied
- [ ] Added to `.env` file
- [ ] Added to Netlify environment variables

---

## 🚀 Once Added:

Your posts will automatically get:
- ✅ Product logos when tools mentioned
- ✅ Beautiful generic images otherwise
- ✅ Much better visual matching!

---

**Go set up Bing now, then add the key to Netlify!** 🎉

