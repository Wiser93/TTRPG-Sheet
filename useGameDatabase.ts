import { useCharacterStore } from '@/store/characterStore';
import { useClasses } from '@/hooks/useGameDatabase';
import type { Feature } from '@/types/game';

export type CardOption = {
  id: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
};

/**
 * For an isCard feature with cardOptionSource, returns the resolved list of
 * options available to this character — i.e. the union of option IDs the player
 * has selected across all choices with the matching choiceId, enriched with
 * display metadata (label, color, icon) pulled from the class DB definitions.
 */
export function useFeatureCardOptions(feature: Feature): CardOption[] {
  const character = useCharacterStore(s => s.character);
  const allClasses = useClasses() ?? [];

  if (!feature.isCard) return [];
  if (feature.cardOptions?.length) return feature.cardOptions;
  if (!feature.cardOptionSource) return [];
  if (!character) return [];

  const { choiceId } = feature.cardOptionSource;

  // 1. Collect every unique option ID the character has selected in any
  //    resolved choice with this choiceId (across all classes/levels)
  const selectedIds: string[] = [];
  const seen = new Set<string>();
  const allResolved = [
    ...character.classes.flatMap(cls => cls.choices),
    ...(character.speciesChoices ?? []),
    ...(character.backgroundChoices ?? []),
  ];
  for (const r of allResolved) {
    if (r.choiceId !== choiceId) continue;
    for (const val of r.selectedValues) {
      if (!seen.has(val)) { seen.add(val); selectedIds.push(val); }
    }
  }

  if (selectedIds.length === 0) return [];

  // 2. Find option metadata from class DB definitions
  //    Walk every level entry's choices looking for one with the matching id
  const optMeta: Record<string, Omit<CardOption, 'id'>> = {};
  for (const cls of allClasses) {
    for (const level of cls.levelEntries ?? []) {
      for (const choice of level.choices ?? []) {
        if (choice.id !== choiceId) continue;
        for (const opt of choice.options ?? []) {
          if (!optMeta[opt.id]) {
            optMeta[opt.id] = {
              label: opt.label,
              description: opt.description,
              color: opt.color,
              icon: opt.icon,
            };
          }
        }
      }
    }
    // Also check top-level creationChoices
    for (const choice of cls.creationChoices ?? []) {
      if (choice.id !== choiceId) continue;
      for (const opt of choice.options ?? []) {
        if (!optMeta[opt.id]) {
          optMeta[opt.id] = {
            label: opt.label,
            description: opt.description,
            color: opt.color,
            icon: opt.icon,
          };
        }
      }
    }
  }

  // 3. Build final list — use DB metadata where available, fall back to id
  return selectedIds.map(id => {
    const meta = optMeta[id];
    const rawLabel = meta?.label ?? id;
    // Strip " — Tier X / subtext" so the pill shows just the element name
    const shortLabel = rawLabel.split(' — ')[0].split('(')[0].trim();
    return {
      id,
      label: shortLabel,
      description: meta?.description,
      color: meta?.color,
      icon: meta?.icon,
    };
  });
}
