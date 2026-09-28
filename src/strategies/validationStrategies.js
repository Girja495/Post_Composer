/**
 * STRATEGY PATTERN — one validation strategy per platform.
 *
 * Each strategy is a self-contained object with the same shape:
 *   { label, limit, validate(text) -> string[] (error messages) }
 *
 * The composer never uses if/else on the platform name. It just picks
 * a strategy at runtime:  strategies[platform].validate(text)
 *
 * TO ADD A NEW PLATFORM: add one more entry below (e.g. `facebook`).
 * No other file needs to change (open/closed principle).
 */

// ----- Separate validation functions (one per platform) -----
const validateTwitter = (text) => {
  const errors = [];
  if (text.length > 280) {
    errors.push(`Exceeds Twitter limit by ${text.length - 280} characters.`);
  }
  return errors;
};

const validateLinkedIn = (text) => {
  const errors = [];
  if (text.length > 3000) {
    errors.push(`Exceeds LinkedIn limit by ${text.length - 3000} characters.`);
  }
  return errors;
};

const validateInstagram = (text) => {
  const errors = [];
  if (text.length > 2200) {
    errors.push(`Caption exceeds 2,200 characters by ${text.length - 2200}.`);
  }
  const hashtags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
  if (hashtags.length > 30) {
    errors.push(`Instagram allows at most 30 hashtags (you have ${hashtags.length}).`);
  }
  return errors;
};

// ----- Strategy registry -----
export const strategies = {
  twitter: { label: "Twitter / X", limit: 280, validate: validateTwitter },
  linkedin: { label: "LinkedIn", limit: 3000, validate: validateLinkedIn },
  instagram: { label: "Instagram", limit: 2200, validate: validateInstagram },
};

export const platformList = Object.entries(strategies).map(([id, s]) => ({
  id,
  label: s.label,
  limit: s.limit,
}));

/** Selects the right strategy dynamically and returns a uniform result. */
export function validatePost(platform, text) {
  const strategy = strategies[platform];
  if (!strategy) return { valid: false, errors: ["Select a platform."], limit: 0 };

  const errors = [];
  if (!text.trim()) errors.push("Post cannot be empty.");
  errors.push(...strategy.validate(text));

  return { valid: errors.length === 0, errors, limit: strategy.limit };
}
