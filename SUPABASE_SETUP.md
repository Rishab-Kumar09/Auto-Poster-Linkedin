# 🗄️ Supabase Setup Guide (5 Minutes)

## ✅ Step 1: Create Supabase Account

1. Go to: https://supabase.com/dashboard/sign-up
2. Click **"Sign up with GitHub"** (easiest)
3. Authorize Supabase

---

## ✅ Step 2: Create New Project

1. Click **"New project"**
2. Fill in:
   ```
   Name: social-automation
   Database Password: [CREATE A STRONG PASSWORD - SAVE IT!]
   Region: Choose closest to you (e.g., US West, EU West)
   Pricing Plan: Free
   ```
3. Click **"Create new project"**
4. **WAIT 2 MINUTES** for database to provision

---

## ✅ Step 3: Get API Credentials

Once project is ready:

1. Click on **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. You'll see:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

**SAVE THESE TWO VALUES!** You'll need them for Netlify!

---

## ✅ Step 4: Create Database Table

1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**
3. **PASTE THIS EXACT SQL:**

```sql
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  image_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see **"Success. No rows returned"** ✅

---

## ✅ Step 5: Verify Table Creation

1. Click **"Table Editor"** in the left sidebar
2. You should see **"posts"** table listed
3. Click on it - it should show columns: `id`, `platform`, `content`, `status`, `image_url`, `image_data`, `created_at`, `posted_at`

✅ **Table created successfully!**

---

## ✅ Step 6: Copy Your Credentials

You need **TWO values** for Netlify:

### 1. Project URL:
```
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```

### 2. Anon Key:
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

**SAVE THESE IN A TEXT FILE!** You'll paste them into Netlify next!

---

## 🎯 Next Step: Add to Netlify

Once you have these two values, you'll add them as environment variables in Netlify!

---

## 📊 Supabase Dashboard Overview:

- **Table Editor**: View your posts data
- **SQL Editor**: Run custom queries
- **Database**: Monitor size and activity
- **API Docs**: Auto-generated API documentation
- **Logs**: See database queries in real-time

---

## 🛡️ Keep-Alive (Already Handled!)

Your app includes a daily keep-alive function that pings the database to prevent it from pausing after 7 days of inactivity.

**You don't need to do anything!** ✅

---

## ✅ Checklist:

- [ ] Supabase account created
- [ ] Project created and provisioned
- [ ] SQL table created
- [ ] Project URL copied
- [ ] Anon Key copied
- [ ] Ready to add to Netlify!

---

## 🚀 You're Done!

**Tell me when you have your Supabase URL and Key ready!**

Then we'll add them to Netlify and deploy! 🎉

