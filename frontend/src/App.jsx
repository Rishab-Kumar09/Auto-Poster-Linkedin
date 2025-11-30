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
      const response = await axios.get('/api/posts/pending')
      setPosts(response.data.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/analytics')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleFetchContent = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/api/fetch-content', {
        topics: topics.split(',').map(t => t.trim())
      })
      showToast(`✅ Fetched ${response.data.count} content items!`)
      
      // Generate posts for first item
      if (response.data.content.length > 0) {
        await handleGeneratePosts(response.data.content[0])
      }
    } catch (error) {
      showToast('❌ Error fetching content: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePosts = async (content) => {
    setLoading(true)
    try {
      await axios.post('/api/generate-posts', {
        content,
        aiProvider,
        tone
      })
      showToast(`✅ Posts generated with ${aiProvider.toUpperCase()}!`)
      fetchPosts()
      fetchStats()
    } catch (error) {
      showToast('❌ Error generating posts: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (postId, platforms, editedContent) => {
    setLoading(true)
    try {
      const response = await axios.post(`/api/post/${postId}`, {
        platforms,
        editedContent
      })
      showToast('✅ Posted successfully!')
      fetchPosts()
      fetchStats()
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
      await axios.delete(`/api/post/${postId}`)
      showToast('🗑️ Post deleted!')
      fetchPosts()
      fetchStats()
    } catch (error) {
      showToast('❌ Error deleting: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateImage = async (postId) => {
    setLoading(true)
    try {
      await axios.post(`/api/post/${postId}/regenerate-image`)
      showToast('🖼️ New image loaded!')
      fetchPosts()
    } catch (error) {
      showToast('❌ Error getting new image: ' + error.message, 'error')
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
            onClick={handleFetchContent}
            disabled={loading}
          >
            🔍 Fetch & Generate Content
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
          <p>Click "Fetch & Generate Content" to create your first automated posts!</p>
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
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, onPost, onDelete, onRegenerateImage, loading }) {
  const [twitterText, setTwitterText] = useState(post.twitter_post)
  const [linkedinText, setLinkedinText] = useState(post.linkedin_post)
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin'])

  const source = post.content_source
  const imageData = post.image_data ? JSON.parse(post.image_data) : null

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handlePost = () => {
    onPost(post.id, selectedPlatforms, {
      twitter: twitterText,
      linkedin: linkedinText
    })
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-source">
          <h3>{source.title}</h3>
          <div>
            <span className="source-badge">{source.source}</span>
            <span className="source-badge">{source.topic}</span>
          </div>
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
            <input
              type="checkbox"
              checked={selectedPlatforms.includes('twitter')}
              onChange={() => togglePlatform('twitter')}
            />
            🐦 Twitter
          </h4>
          <textarea
            value={twitterText}
            onChange={(e) => setTwitterText(e.target.value)}
            maxLength={280}
          />
          <div className={`char-count ${twitterText.length > 260 ? 'warning' : ''} ${twitterText.length > 280 ? 'error' : ''}`}>
            {twitterText.length}/280
          </div>
        </div>

        <div className="platform-post">
          <h4>
            <input
              type="checkbox"
              checked={selectedPlatforms.includes('linkedin')}
              onChange={() => togglePlatform('linkedin')}
            />
            💼 LinkedIn
          </h4>
          <textarea
            value={linkedinText}
            onChange={(e) => setLinkedinText(e.target.value)}
          />
          <div className="char-count">
            {linkedinText.length} characters
          </div>
        </div>
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
          onClick={handlePost}
          disabled={loading || selectedPlatforms.length === 0}
        >
          📤 Post to {selectedPlatforms.length} platform(s)
        </button>
      </div>
    </div>
  )
}

export default App

