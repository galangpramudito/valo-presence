// Application Constants

// Authentication
export const AUTH_COOKIE_NAME = 'auth_token';
export const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

// Admin credentials (migrated to database - see supabase/migrations/20260715000005_create_default_admin.sql)

// File upload constraints
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Rate limiting
export const RATE_LIMIT = {
  LOGIN: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  UPLOAD: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  ADMIN_ACTION: { max: 30, windowMs: 60 * 60 * 1000 }, // 30 actions per hour
};

// Storage
export const STORAGE_BUCKET = 'image';

// Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
