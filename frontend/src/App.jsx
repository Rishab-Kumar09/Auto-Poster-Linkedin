import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ totalPosts: 0, pendingPosts: 0, todayPosts: 0 })
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState('AI,Startups,Technology')
  const [aiProvider, setAiProvider] = useState('groq')
  const [tone, setTone] = useState('professional')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts')
      const allPosts = response.data
      // Filter for pending posts only
      setPosts(allPosts.filter(p => p.status === 'pending'))
      
      // Update stats
      const today = new Date().toDateString()
      setStats({
        totalPosts: allPosts.length,
        pendingPosts: allPosts.filter(p => p.status === 'pending').length,
        todayPosts: allPosts.filter(p => {
          const postDate = new Date(p.posted_at || p.created_at).toDateString()
          return postDate === today && p.status === 'posted'
        }).length
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchStats = async () => {
    // Stats are now calculated in fetchPosts()
    await fetchPosts()
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/api/generate', {
        topics: topics.split(',').map(t => t.trim()),
        count: 5
      })
      showToast(`✅ Generated ${response.data.count} posts!`)
      fetchPosts()
    } catch (error) {
      showToast('❌ Error generating posts: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (postId) => {
    setLoading(true)
    try {
      await axios.post('/api/post-to-social', { postId })
      showToast('✅ Posted successfully!')
      fetchPosts()
    } catch (error) {
      showToast('❌ Error posting: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }
    
    setLoading(true)
    try {
      await axios.delete(`/api/delete-post/${postId}`)
      showToast('🗑️ Post deleted!')
      fetchPosts()
    } catch (error) {
      showToast('❌ Error deleting: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateImage = async (postId) => {
    setLoading(true)
    try {
      await axios.post(`/api/new-image/${postId}`)
      showToast('🖼️ New image loaded!')
      fetchPosts()
    } catch (error) {
      showToast('❌ Error getting new image: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (postId, scheduledTime) => {
    setLoading(true)
    try {
      await axios.post('/api/schedule-post', { postId, scheduledTime })
      showToast(scheduledTime ? '📅 Post scheduled!' : '🚫 Schedule cleared!')
      fetchPosts()
    } catch (error) {
      showToast('❌ Error scheduling: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="header">
        <h1>🚀 Social Media Automation</h1>
        <p>AI-powered content generation for Twitter & LinkedIn</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>{stats.totalPosts}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingPosts}</h3>
          <p>Pending Review</p>
        </div>
        <div className="stat-card">
          <h3>{stats.todayPosts}</h3>
          <p>Posted Today</p>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <div className="input-group">
            <label>Topics (comma-separated)</label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="AI, Startups, Technology"
            />
          </div>
          <div className="input-group">
            <label>AI Provider</label>
            <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
              <option value="groq">Groq (FREE ⚡)</option>
              <option value="gemini">Gemini (FREE)</option>
              <option value="openai">OpenAI (PAID)</option>
            </select>
          </div>
          <div className="input-group">
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="motivational">Motivational</option>
              <option value="funny">Funny</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>
        </div>
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            🔍 Generate Posts
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchPosts}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading && <div className="loading">⏳ Processing...</div>}

      {posts.length === 0 && !loading && (
        <div className="empty-state">
          <h2>No pending posts</h2>
          <p>Click "Generate Posts" to create your first automated posts!</p>
        </div>
      )}

      <div className="posts-container">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPost={handlePost}
            onDelete={handleDelete}
            onRegenerateImage={handleRegenerateImage}
            onSchedule={handleSchedule}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, onPost, onDelete, onRegenerateImage, onSchedule, loading }) {
  const [content, setContent] = useState(post.content)
  const [scheduledTime, setScheduledTime] = useState(
    post.scheduled_time ? new Date(post.scheduled_time).toISOString().slice(0, 16) : ''
  )
  const imageData = post.image_data ? JSON.parse(post.image_data) : null

  const handleScheduleChange = (newTime) => {
    setScheduledTime(newTime)
    onSchedule(post.id, newTime || null)
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-source">
          <span className="source-badge">{post.platform}</span>
          <span className="source-badge">{new Date(post.created_at).toLocaleString()}</span>
          {post.scheduled_time && (
            <span className="source-badge scheduled-badge">
              📅 Scheduled: {new Date(post.scheduled_time).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {imageData && (
        <div className="post-image">
          <img src={imageData.url} alt={imageData.description || 'Post image'} />
          <div className="image-footer">
            <small className="image-credit">
              Photo by <a href={imageData.photographerUrl} target="_blank" rel="noopener noreferrer">{imageData.photographer}</a> on Unsplash
            </small>
            <button
              className="btn-regenerate-image"
              onClick={() => onRegenerateImage(post.id)}
              disabled={loading}
              title="Get a different image"
            >
              🔄 Change Image
            </button>
          </div>
        </div>
      )}

      <div className="post-content">
        <div className="platform-post">
          <h4>
            {post.platform === 'linkedin' ? '💼 LinkedIn' : '🐦 Twitter'}
          </h4>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <div className="char-count">
            {content.length} characters
          </div>
        </div>
      </div>

      <div className="post-schedule">
        <label htmlFor={`schedule-${post.id}`}>
          📅 Schedule Post:
        </label>
        <input
          id={`schedule-${post.id}`}
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => handleScheduleChange(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          disabled={loading}
        />
        {scheduledTime && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleScheduleChange('')}
            disabled={loading}
          >
            🚫 Clear
          </button>
        )}
      </div>

      <div className="post-actions">
        <button
          className="btn btn-danger"
          onClick={() => onDelete(post.id)}
          disabled={loading}
        >
          🗑️ Delete
        </button>
        <button
          className="btn btn-success"
          onClick={() => onPost(post.id)}
          disabled={loading}
        >
          📤 Post Now
        </button>
      </div>
    </div>
  )
}

export default App

