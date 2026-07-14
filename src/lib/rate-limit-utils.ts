import { headers } from 'next/headers';

/**
 * Get a unique identifier for rate limiting
 * Combines IP address, user agent, and optional user session
 * This provides better isolation between different users/browsers
 */
export async function getRateLimitIdentifier(userId?: string): Promise<string> {
  const headersList = await headers();
  
  // Extract IP address (handles proxies)
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : realIp || 'unknown';
  
  // Get user agent for additional uniqueness
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  // Create a hash-like identifier combining IP and partial user agent
  // Use first 20 chars of user agent to differentiate browsers
  const uaFingerprint = userAgent.substring(0, 20);
  
  // If userId provided, use that as primary identifier
  if (userId) {
    return `user:${userId}`;
  }
  
  // Otherwise combine IP and UA fingerprint
  return `ip:${ip}:${uaFingerprint}`;
}

/**
 * Get IP address only (for logging purposes)
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : realIp || 'unknown';
}

/**
 * Get user agent
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || 'unknown';
}
