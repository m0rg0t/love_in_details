/**
 * Application feature flags / runtime configuration.
 *
 * Centralized toggles so integrations can be enabled/disabled without
 * touching component code.
 */

/**
 * Toggles the Otredach (Отредач) integration — the "Создать открытку" /
 * "Создать романтическое фото" buttons and their standalone-mode mention.
 *
 * Set to `true` to re-enable the integration everywhere it's referenced.
 * Typed as `boolean` (not the inferred `false` literal) so the enabled
 * code paths aren't flagged as unreachable.
 */
export const ENABLE_OTREDACH: boolean = false;
