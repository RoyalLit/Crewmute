/**
 * Feature flag constants.
 *
 * Per *   "Incomplete features that exist in the codebase but are not ready for users
 *   must be gated behind a feature flag."
 *
 * Naming convention: FF_<FEATURE_NAME> (all caps, underscore-separated).
 * All constants are boolean — true means the feature is enabled.
 *
 * Per §8.6: "Removing a flag after a full rollout requires deleting the flag
 * constant and all conditional branches — do not leave dead flag code."
 *
 * No flags are defined yet — this file provides the structure.
 * Add flags here as features are built and need to be gated.
 *
 * Example (do not add until needed):
 *   export const FF_RATINGS_AND_REVIEWS = false; // v1.1 feature, PRD §11
 */

// No feature flags defined for MVP foundation.
// TODO(product): add FF_* constants here as experimental features are built.
export {};
