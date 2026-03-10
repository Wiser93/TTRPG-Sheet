/**
 * Path progress utilities
 *
 * Derives each path's current tier by counting how many times it has been
 * selected across all resolved path_advance choices — so pathProgress is
 * never stored as a separate field; it is always recomputed from choices.
 */

import type { GameClass } from '@/types/game';
import type { CharacterClassEntry } from '@/types/character';

/**
 * Returns { pathId: currentTier } derived from all resolved path_advance
 * choices for one class entry. Each occurrence of a path ID in a resolved
 * choice's selectedValues counts as one tier advancement.
 */
export function computePathProgress(
  cls: GameClass,
  classEntry: CharacterClassEntry,
): Record<string, number> {
  const progress: Record<string, number> = {};

  // Collect IDs of all path_advance choices in this class
  const pathChoiceIds = new Set<string>();
  for (const le of cls.levelEntries ?? []) {
    for (const ch of le.choices ?? []) {
      if (ch.type === 'path_advance') pathChoiceIds.add(ch.id);
    }
  }
  for (const ch of cls.creationChoices ?? []) {
    if (ch.type === 'path_advance') pathChoiceIds.add(ch.id);
  }

  // Count advancements
  for (const resolved of classEntry.choices ?? []) {
    if (!pathChoiceIds.has(resolved.choiceId)) continue;
    for (const pathId of resolved.selectedValues) {
      progress[pathId] = (progress[pathId] ?? 0) + 1;
    }
  }

  return progress;
}
