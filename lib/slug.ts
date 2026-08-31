import { z } from "zod";

/**
 * Lowercase alphanumeric groups separated by a single dot or hyphen.
 * Rejects uppercase, leading/trailing separators, and repeated separators
 * such as ".." — the last matters because "." and ".." are special URL path
 * segments. Mirrors `validateSlug` in the Go backend.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

export const SLUG_MESSAGE =
  "Use lowercase letters, numbers, dots, and hyphens (e.g. bmw-x5-3.0)";

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(SLUG_PATTERN, SLUG_MESSAGE);
