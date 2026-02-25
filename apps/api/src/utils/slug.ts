import slugify from 'slugify';
import crypto from 'crypto';

/**
 * Generate a URL-friendly slug from a string.
 * Appends a short random suffix to ensure uniqueness.
 */
export function generateSlug(text: string): string {
  const base = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

/**
 * Generate a slug without random suffix (for deterministic slugs).
 */
export function generateBaseSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}
