/**
 * Date utility functions for handling Singapore timezone (UTC+8)
 */

/**
 * Get today's date in Singapore timezone formatted as YYYY-MM-DD
 * Singapore is UTC+8
 */
export function getTodayInSingapore(): string {
  const now = new Date();
  
  // Convert to Singapore time (UTC+8)
  const singaporeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  
  const year = singaporeTime.getFullYear();
  const month = String(singaporeTime.getMonth() + 1).padStart(2, '0');
  const day = String(singaporeTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
