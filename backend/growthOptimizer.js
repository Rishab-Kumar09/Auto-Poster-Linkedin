import { getDatabase } from './database.js';

/**
 * Growth Optimization Features for Rapid Follower Growth
 */

/**
 * Best times to post based on historical engagement
 */
export function getBestPostingTimes() {
  const db = getDatabase();
  
  const bestTimes = db.prepare(`
    SELECT 
      strftime('%H', posted_at) as hour,
      AVG(engagement_score) as avg_engagement,
      COUNT(*) as post_count
    FROM posts
    WHERE status = 'posted' AND posted_at IS NOT NULL
    GROUP BY hour
    ORDER BY avg_engagement DESC
    LIMIT 5
  `).all();
  
  return bestTimes;
}

/**
 * Identify high-performing content patterns
 */
export function getWinningContentPatterns() {
  const db = getDatabase();
  
  // Get top performing posts
  const topPosts = db.prepare(`
    SELECT 
      p.*,
      a.likes,
      a.comments,
      a.shares,
      (a.likes + a.comments * 3 + a.shares * 5) as total_engagement
    FROM posts p
    LEFT JOIN analytics a ON p.id = a.post_id
    WHERE p.status = 'posted'
    ORDER BY total_engagement DESC
    LIMIT 20
  `).all();
  
  // Analyze patterns
  const patterns = {
    topics: {},
    tones: {},
    contentTypes: {},
    avgLength: { twitter: 0, linkedin: 0 }
  };
  
  let twitterLengths = [];
  let linkedinLengths = [];
  
  topPosts.forEach(post => {
    const source = JSON.parse(post.content_source);
    
    // Track topics
    patterns.topics[source.topic] = (patterns.topics[source.topic] || 0) + 1;
    
    // Track tones
    patterns.tones[post.tone] = (patterns.tones[post.tone] || 0) + 1;
    
    // Track content types
    patterns.contentTypes[source.source] = (patterns.contentTypes[source.source] || 0) + 1;
    
    // Track lengths
    if (post.twitter_post) twitterLengths.push(post.twitter_post.length);
    if (post.linkedin_post) linkedinLengths.push(post.linkedin_post.length);
  });
  
  // Calculate average lengths
  if (twitterLengths.length > 0) {
    patterns.avgLength.twitter = Math.round(
      twitterLengths.reduce((a, b) => a + b, 0) / twitterLengths.length
    );
  }
  
  if (linkedinLengths.length > 0) {
    patterns.avgLength.linkedin = Math.round(
      linkedinLengths.reduce((a, b) => a + b, 0) / linkedinLengths.length
    );
  }
  
  return patterns;
}

/**
 * Growth recommendations based on analytics
 */
export function getGrowthRecommendations() {
  const patterns = getWinningContentPatterns();
  const bestTimes = getBestPostingTimes();
  
  const recommendations = [];
  
  // Topic recommendations
  const topTopics = Object.entries(patterns.topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
  
  if (topTopics.length > 0) {
    recommendations.push({
      type: 'topic',
      priority: 'high',
      message: `Focus on: ${topTopics.join(', ')}`,
      reasoning: 'These topics generate the most engagement'
    });
  }
  
  // Tone recommendations
  const topTone = Object.entries(patterns.tones)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topTone) {
    recommendations.push({
      type: 'tone',
      priority: 'medium',
      message: `Use "${topTone[0]}" tone more often`,
      reasoning: 'Highest engagement rate'
    });
  }
  
  // Timing recommendations
  if (bestTimes.length > 0) {
    const topHours = bestTimes.slice(0, 3).map(t => `${t.hour}:00`);
    recommendations.push({
      type: 'timing',
      priority: 'high',
      message: `Post at ${topHours.join(', ')}`,
      reasoning: 'Peak engagement windows'
    });
  }
  
  // Posting frequency
  recommendations.push({
    type: 'frequency',
    priority: 'high',
    message: 'Post 5-7 times per day for maximum growth',
    reasoning: 'Consistency + volume = faster follower growth'
  });
  
  // Content length
  if (patterns.avgLength.twitter > 0) {
    recommendations.push({
      type: 'format',
      priority: 'medium',
      message: `Optimal Twitter length: ${patterns.avgLength.twitter} characters`,
      reasoning: 'Based on your best-performing tweets'
    });
  }
  
  // Engagement tactics
  recommendations.push({
    type: 'engagement',
    priority: 'high',
    message: 'End LinkedIn posts with questions',
    reasoning: 'Drives 3x more comments'
  });
  
  recommendations.push({
    type: 'engagement',
    priority: 'medium',
    message: 'Use controversial/hot takes on Twitter',
    reasoning: 'Creates debate and increases reach'
  });
  
  return recommendations;
}

/**
 * Calculate engagement score for a post
 */
export function calculateEngagementScore(likes, comments, shares, impressions) {
  // Weighted formula: comments and shares are more valuable than likes
  const score = (likes * 1) + (comments * 3) + (shares * 5);
  
  // Engagement rate if impressions available
  const rate = impressions > 0 ? (score / impressions) * 100 : 0;
  
  return {
    rawScore: score,
    engagementRate: rate.toFixed(2) + '%'
  };
}

/**
 * Suggest optimal posting schedule
 */
export function getOptimalSchedule(targetPostsPerDay = 5) {
  const bestTimes = getBestPostingTimes();
  
  if (bestTimes.length === 0) {
    // Default high-engagement times if no data
    return [
      { time: '08:00', reason: 'Morning commute' },
      { time: '11:00', reason: 'Mid-morning break' },
      { time: '14:00', reason: 'Post-lunch' },
      { time: '17:00', reason: 'End of workday' },
      { time: '20:00', reason: 'Evening leisure' }
    ].slice(0, targetPostsPerDay);
  }
  
  return bestTimes.slice(0, targetPostsPerDay).map(t => ({
    time: `${t.hour}:00`,
    avgEngagement: t.avg_engagement,
    posts: t.post_count
  }));
}

/**
 * Growth tracking metrics
 */
export function getGrowthMetrics(days = 30) {
  const db = getDatabase();
  
  const metrics = db.prepare(`
    SELECT 
      DATE(posted_at) as date,
      COUNT(*) as posts,
      SUM(engagement_score) as total_engagement
    FROM posts
    WHERE status = 'posted' 
    AND posted_at >= date('now', '-${days} days')
    GROUP BY date
    ORDER BY date DESC
  `).all();
  
  // Calculate growth rate
  if (metrics.length >= 2) {
    const recent = metrics.slice(0, 7);
    const previous = metrics.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.total_engagement, 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + m.total_engagement, 0) / previous.length;
    
    const growthRate = previousAvg > 0 
      ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1)
      : 0;
    
    return {
      metrics,
      growthRate: `${growthRate}%`,
      trend: growthRate > 0 ? '📈' : growthRate < 0 ? '📉' : '➡️'
    };
  }
  
  return { metrics, growthRate: 'N/A', trend: '➡️' };
}

/**
 * Viral content indicators
 */
export function predictViralPotential(postText) {
  let score = 0;
  const indicators = [];
  
  // Check for viral elements
  if (/[\d]{1,2}[x×]/.test(postText)) {
    score += 10;
    indicators.push('Contains multiplier (3x, 10x, etc.)');
  }
  
  if (/\d{1,2}\s+(steps|ways|tips|secrets|hacks)/i.test(postText)) {
    score += 15;
    indicators.push('Listicle format');
  }
  
  if (/\?$/.test(postText.trim())) {
    score += 10;
    indicators.push('Ends with question');
  }
  
  if (/\b(secret|shocking|nobody|everyone|mistake|wrong)\b/i.test(postText)) {
    score += 15;
    indicators.push('Contains curiosity trigger');
  }
  
  if (postText.length < 100) {
    score += 10;
    indicators.push('Concise and punchy');
  }
  
  const emojiCount = (postText.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  if (emojiCount >= 1 && emojiCount <= 3) {
    score += 8;
    indicators.push('Optimal emoji usage');
  }
  
  // Line breaks for readability
  if ((postText.match(/\n/g) || []).length >= 2) {
    score += 7;
    indicators.push('Good formatting with line breaks');
  }
  
  return {
    score,
    potential: score >= 40 ? 'High' : score >= 25 ? 'Medium' : 'Low',
    indicators
  };
}

export default {
  getBestPostingTimes,
  getWinningContentPatterns,
  getGrowthRecommendations,
  calculateEngagementScore,
  getOptimalSchedule,
  getGrowthMetrics,
  predictViralPotential
};

