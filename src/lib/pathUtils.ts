/**
 * Path progress utilities
 *
 * Derives each path's current tier by counting how many times it has been
 * selected across all resolved path_advance choices — so pathProgress is
 * never stored as a separate field; it is always recomputed from choices.
 */

import type { GameClass, Subclass } from '@/types/game';
import type { CharacterClassEntry } from '@/types/character';

/**
 * Returns { pathId: currentTier } derived from all resolved path_advance
 * choices for one class entry.
 *
 * IMPORTANT: subclass-granted advancements also count.  Pass the active
 * subclass (if any) so its level-entry path_advance choices are included
 * in the whitelist.  Without it, advancements recorded via subclass choices
 * would be silently ignored everywhere.
 */
export function computePathProgress(
  cls: GameClass,
  classEntry: CharacterClassEntry,
  subclass?: Subclass,
): Record<string, number> {
  const progress: Record<string, number> = {};

  // Build the whitelist of choice IDs that represent path advancements.
  // Scan both the class AND the active subclass (their level entries +
  // creation choices) so subclass-sourced advancements are recognised.
  const pathChoiceIds = new Set<string>();

  function scanChoices(choices: { id: string; type: string }[] | undefined) {
    for (const ch of choices ?? []) {
      if (ch.type === 'path_advance') pathChoiceIds.add(ch.id);
    }
  }

  for (const le of cls.levelEntries ?? [])        scanChoices(le.choices);
  scanChoices(cls.creationChoices);
  for (const le of subclass?.levelEntries ?? [])  scanChoices(le.choices);
  scanChoices((subclass as { creationChoices?: { id: string; type: string }[] } | undefined)?.creationChoices);

  // Count advancements from all resolved choices whose choiceId is in the
  // whitelist.  Each occurrence of a pathId counts as one tier.
  for (const resolved of classEntry.choices ?? []) {
    if (!pathChoiceIds.has(resolved.choiceId)) continue;
    for (const pathId of resolved.selectedValues) {
      progress[pathId] = (progress[pathId] ?? 0) + 1;
    }
  }

  return progress;
}
