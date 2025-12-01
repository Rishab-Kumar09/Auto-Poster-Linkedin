// Supabase Database Connection
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Database operations will fail.');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Initialize database (create tables if they don't exist)
async function initDatabase() {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return;
  }

  try {
    // Check if posts table exists by trying to query it
    const { error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist - need to create it via SQL
      console.log('⚠️ Posts table not found. Please create it in Supabase dashboard.');
      console.log('Run this SQL in your Supabase SQL Editor:');
      console.log(`
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
      `);
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Insert a new post
async function insertPost(platform, content, status = 'pending', imageUrl = null, imageData = null) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .insert([{
      platform,
      content,
      status,
      image_url: imageUrl,
      image_data: imageData
    }])
    .select();

  if (error) throw error;
  return data[0];
}

// Get all posts
async function getAllPosts() {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get posts by status
async function getPostsByStatus(status) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Get a single post by ID
async function getPostById(id) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Update post status
async function updatePostStatus(id, status) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .update({ 
      status, 
      posted_at: status === 'posted' ? new Date().toISOString() : null 
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

// Update post image
async function updatePostImage(id, imageUrl, imageData) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('posts')
    .update({
      image_url: imageUrl,
      image_data: imageData
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

// Delete a post
async function deletePost(id) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

module.exports = {
  supabase,
  initDatabase,
  insertPost,
  getAllPosts,
  getPostsByStatus,
  getPostById,
  updatePostStatus,
  updatePostImage,
  deletePost
};

