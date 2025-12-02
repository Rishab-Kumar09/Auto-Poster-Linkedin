# Automation Setup Guide

## Step 1: Create Automation Settings Table in Supabase

Go to your **Supabase Dashboard** → **SQL Editor** → **New Query**

Run this SQL:

```sql
-- Create automation_settings table
CREATE TABLE IF NOT EXISTS automation_settings (
  id BIGSERIAL PRIMARY KEY,
  auto_generate BOOLEAN DEFAULT false,
  auto_post BOOLEAN DEFAULT false,
  post_frequency INTEGER DEFAULT 4,
  platforms TEXT[] DEFAULT ARRAY['linkedin'],
  topics TEXT[] DEFAULT ARRAY['AI', 'Startups', 'Technology'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO automation_settings (auto_generate, auto_post, post_frequency, platforms, topics)
VALUES (false, false, 4, ARRAY['linkedin'], ARRAY['AI', 'Startups', 'Technology'])
ON CONFLICT DO NOTHING;
```

## Step 2: Set Up GitHub Actions Secrets

Go to your GitHub repository:
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

Click **"New repository secret"** and add these:

### Required Secrets:

1. **NETLIFY_SITE_URL**
   - Value: `https://your-site-name.netlify.app`

2. **GROQ_API_KEY**
   - Your Groq API key from: https://console.groq.com

3. **NEWS_API_KEY**
   - Your News API key from: https://newsapi.org

4. **UNSPLASH_ACCESS_KEY**
   - Your Unsplash API key

5. **GOOGLE_SEARCH_API_KEY**
   - Your Google Custom Search API key

6. **GOOGLE_SEARCH_ENGINE_ID**
   - Your Google Search Engine ID

### LinkedIn Credentials:

7. **LINKEDIN_CLIENT_ID**
8. **LINKEDIN_CLIENT_SECRET**
9. **LINKEDIN_ACCESS_TOKEN**
10. **LINKEDIN_PERSON_URN**

### Optional (if posting to X/Twitter):

11. **X_CLIENT_ID**
12. **X_CLIENT_SECRET**

### Optional (fallback):

13. **OPENAI_API_KEY** (optional - for fallback when Groq hits rate limit)

## Step 3: Enable Automation in UI

1. Open your app
2. Click **"⚙️ Automation Settings"** button
3. Toggle settings:
   - **Auto-Generation**: ON (generates posts every 6 hours)
   - **Auto-Posting**: ON (posts scheduled content 4x daily)
   - **Post Frequency**: 3-4 posts per day
   - **Platforms**: LinkedIn, X (or both)
   - **Topics**: AI, Startups, Technology (customize as needed)
4. Click **"💾 Save Settings"**

## How It Works:

### With Auto-Generation ON:
- Every 6 hours, GitHub Actions triggers content fetching
- System generates 3 posts automatically
- Posts are created with no scheduled time (pending manual review)
- OR if you want fully automated: System can auto-schedule them

### With Auto-Posting ON:
- At 8am, 12pm, 5pm, 8pm daily, GitHub Actions checks for scheduled posts
- Any posts with scheduled time <= now will be posted automatically
- Works whether posts were manually or automatically generated

## Workflow Options:

### Option A: Fully Automated (No Manual Work)
1. Enable **both** Auto-Generation and Auto-Posting
2. System generates posts every 6 hours
3. System posts them at next scheduled slot
4. **Zero manual work!**

### Option B: Manual Review + Auto-Posting (Recommended)
1. Enable **only** Auto-Posting
2. **You** generate posts manually when you want
3. **You** review and schedule each post
4. System posts them at scheduled times
5. **You control content, automation handles posting**

### Option C: Fully Manual
1. Disable both toggles
2. Generate posts manually
3. Post manually with "Post Now" button
4. **Full control over everything**

## Testing Automation:

1. Enable Auto-Generation
2. Wait 6 hours OR manually trigger the GitHub Action
3. Check your app - new posts should appear
4. Schedule a post for 2 minutes from now
5. Enable Auto-Posting
6. Wait 2 minutes - post should go live!

## Troubleshooting:

### Automation not working?
- Check GitHub Actions tab for errors
- Verify all secrets are set correctly
- Check Netlify function logs

### Posts not generating?
- Check Groq API key is valid
- Verify News API key is active
- Check function logs for rate limit errors

### Posts not posting?
- Verify LinkedIn/X credentials are correct
- Check scheduled time is in the past
- Enable Auto-Posting toggle in settings
