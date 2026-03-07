import { useCharacterStore } from '@/store/characterStore';
import { useClasses } from '@/hooks/useGameDatabase';
import type { Feature } from '@/types/game';
import type { DBClass } from '@/db/schema';

export type CardOption = {
  id: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
};

export function useFeatureCardOptions(feature: Feature): CardOption[] {
  const maybeCharacter = useCharacterStore(s => s.character);
  const allClasses = (useClasses() ?? []) as DBClass[];

  // Static options — no character needed
  if (!feature.isCard) return [];
  if (feature.cardOptions?.length) return feature.cardOptions;
  if (!feature.cardOptionSource) return [];

  // Early-return before any character access
  if (maybeCharacter === null || maybeCharacter === undefined) return [];
  // Local non-nullable alias — TypeScript will definitely track this as non-null
  const char = maybeCharacter;

  const { choiceId } = feature.cardOptionSource;

  // 1. Collect unique option IDs selected across all resolved choices
  const selectedIds: string[] = [];
  const seen = new Set<string>();

  const classChoices = char.classes.flatMap((cls) => cls.choices);
  const speciesChoices = char.speciesChoices ?? [];
  const bgChoices = char.backgroundChoices ?? [];
  const allResolved = [...classChoices, ...speciesChoices, ...bgChoices];

  for (const r of allResolved) {
    if (r.choiceId !== choiceId) continue;
    for (const val of r.selectedValues) {
      if (!seen.has(val)) { seen.add(val); selectedIds.push(val); }
    }
  }

  if (selectedIds.length === 0) return [];

  // 2. Enrich with display metadata from DB class definitions
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
              color: (opt as CardOption).color,
              icon: (opt as CardOption).icon,
            };
          }
        }
      }
    }
    for (const choice of cls.creationChoices ?? []) {
      if (choice.id !== choiceId) continue;
      for (const opt of choice.options ?? []) {
        if (!optMeta[opt.id]) {
          optMeta[opt.id] = {
            label: opt.label,
            description: opt.description,
            color: (opt as CardOption).color,
            icon: (opt as CardOption).icon,
          };
        }
      }
    }
  }

  // 3. Build final list — use DB metadata where available
  return selectedIds.map(id => {
    const meta = optMeta[id];
    const rawLabel = meta?.label ?? id;
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
