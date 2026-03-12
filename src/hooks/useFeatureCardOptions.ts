import { useCharacterStore } from '@/store/characterStore';
import { computePathProgress } from '@/lib/pathUtils';
import { useClasses, useSubclasses, useFeatures } from '@/hooks/useGameDatabase';
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
  const allSubclasses = useSubclasses() ?? [];
  const allDbFeatures = useFeatures() ?? [];

  if (!feature.isCard) return [];
  if (feature.cardOptions?.length) return feature.cardOptions;
  if (!feature.cardOptionSource) return [];

  if (maybeCharacter === null || maybeCharacter === undefined) return [];
  const char = maybeCharacter;

  // ── Path-based options (from pathProgress) ──────────────────
  // If cardOptionSource has pathBased:true, read from pathProgress
  const src = feature.cardOptionSource as { choiceId?: string; pathBased?: boolean };

  if (src.pathBased) {
    const options: CardOption[] = [];
    for (const classEntry of char.classes) {
      // Find the class definition to derive path progress from resolved choices
      const clsDef = allClasses.find(c => c.id === classEntry.classId);
      if (!clsDef) continue;
      const activeSub = classEntry.subclassId
        ? allSubclasses.find(s => s.id === classEntry.subclassId)
        : undefined;
      const pathProgress = computePathProgress(clsDef, classEntry, activeSub as import('@/types/game').Subclass | undefined);
      for (const [pathId] of Object.entries(pathProgress)) {
        const pathFeat = allDbFeatures.find(f => f.id === pathId && f.isPath);
        if (!pathFeat) continue;
        if (options.some(o => o.id === pathId)) continue;
        options.push({
          id: pathId,
          label: pathFeat.name.replace(' Path', ''),
          description: feature.cardOptionTexts?.[pathId] ?? pathFeat.description,
          color: (pathFeat as Feature & { color?: string }).color,
          icon: (pathFeat as Feature & { icon?: string }).icon,
        });
      }
    }
    return options;
  }

  // ── Choice-based options (from resolved choice selections) ───
  const { choiceId } = src as { choiceId: string };

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

  // Enrich with display metadata from DB class definitions
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
