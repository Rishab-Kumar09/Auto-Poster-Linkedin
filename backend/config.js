import dotenv from 'dotenv';

dotenv.config();

/**
 * Get permanent platform configuration
 * @returns {Array} Array of platforms to post to
 */
export function getAutoPlatforms() {
  const platformsEnv = process.env.AUTO_POST_PLATFORMS || 'linkedin,twitter';
  return platformsEnv.split(',').map(p => p.trim().toLowerCase());
}

/**
 * Check if auto-posting is enabled
 * @returns {boolean}
 */
export function isAutoPostEnabled() {
  return process.env.AUTO_POST === 'true';
}

/**
 * Check if approval is required
 * @returns {boolean}
 */
export function requiresApproval() {
  return process.env.REQUIRE_APPROVAL !== 'false';
}

/**
 * Get posting schedule
 * @returns {Array} Array of posting times
 */
export function getPostingSchedule() {
  const times = process.env.POSTING_TIMES || '08:00,12:00,17:00,20:00';
  return times.split(',').map(t => t.trim());
}

/**
 * Get post frequency per day
 * @returns {number}
 */
export function getPostFrequency() {
  return parseInt(process.env.POST_FREQUENCY) || 5;
}

export default {
  getAutoPlatforms,
  isAutoPostEnabled,
  requiresApproval,
  getPostingSchedule,
  getPostFrequency
};

