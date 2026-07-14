import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './constants';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Format file tidak valid. Hanya ${ALLOWED_FILE_TYPES.join(', ')} yang diperbolehkan`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent directory traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 100); // Limit length
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const sanitized = sanitizeFilename(originalName);
  const extension = sanitized.substring(sanitized.lastIndexOf('.'));
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${prefix}${nameWithoutExt}-${timestamp}-${random}${extension}`;
}
