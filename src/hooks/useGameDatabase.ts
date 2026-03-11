import { useLiveQuery } from 'dexie-react-hooks';
import { db, live } from '@/db/schema';

/** Live list of all (non-deleted) items */
export function useItems() {
  return useLiveQuery(() => live(db.items).sortBy('name'), []);
}

/** Live list of all spells, optionally filtered by level */
export function useSpells(level?: number) {
  return useLiveQuery(
    () => level !== undefined
      ? live(db.spells).filter(s => s.level === level).sortBy('name')
      : live(db.spells).sortBy('name'),
    [level]
  );
}

/** Live list of all classes */
export function useClasses() {
  return useLiveQuery(() => live(db.classes).sortBy('name'), []);
}

/** Subclasses for a given parent class */
export function useSubclasses(parentClassId?: string) {
  return useLiveQuery(
    () => parentClassId
      ? live(db.subclasses).filter(s => s.parentClassId === parentClassId).sortBy('name')
      : live(db.subclasses).sortBy('name'),
    [parentClassId]
  );
}

/** Live list of all feats */
export function useFeats() {
  return useLiveQuery(() => live(db.feats).sortBy('name'), []);
}

/** Live list of all species */
export function useAllSpecies() {
  return useLiveQuery(() => live(db.species).sortBy('name'), []);
}

/** Live list of all backgrounds */
export function useBackgrounds() {
  return useLiveQuery(() => live(db.backgrounds).sortBy('name'), []);
}

/** Single item by id */
export function useItem(id: string | undefined) {
  return useLiveQuery(() => id ? db.items.get(id) : undefined, [id]);
}

/** Single spell by id */
export function useSpell(id: string | undefined) {
  return useLiveQuery(() => id ? db.spells.get(id) : undefined, [id]);
}

/** Single class by id */
export function useClass(id: string | undefined) {
  return useLiveQuery(() => id ? db.classes.get(id) : undefined, [id]);
}

// ── Tag/category-filtered queries ─────────────────────────────

/** Items filtered by a tag (e.g. 'martial') */
export function useItemsByTag(tag: string | undefined) {
  return useLiveQuery(
    () => tag
      ? live(db.items).filter(i => (i.tags ?? []).includes(tag)).sortBy('name')
      : live(db.items).sortBy('name'),
    [tag]
  );
}

/** Items filtered by category */
export function useItemsByCategory(category: string | undefined) {
  return useLiveQuery(
    () => category
      ? live(db.items).filter(i => i.category === category).sortBy('name')
      : live(db.items).sortBy('name'),
    [category]
  );
}

/**
 * Resolve a ChoiceDbSource into a live list of { id, name } options.
 * Used by DbSourcedChoicePicker to populate dropdowns/lists dynamically.
 */
export function useDbSourceOptions(source: import('@/types/game').ChoiceDbSource | undefined) {
  const tag = source?.filterTag;
  const category = source?.filterCategory;
  const entity = source?.entity;

  return useLiveQuery(async () => {
    if (!source) return [];
    if (entity === 'items') {
      const all = await live(db.items).sortBy('name');
      return all
        .filter(i => (!tag || (i.tags ?? []).includes(tag)) && (!category || i.category === category))
        .map(i => ({ id: i.id, name: i.name, description: i.description }));
    }
    if (entity === 'spells') {
      const all = await live(db.spells).sortBy('name');
      return all
        .filter(i => !tag || (i.tags ?? []).includes(tag))
        .map(i => ({ id: i.id, name: i.name, description: i.description }));
    }
    if (entity === 'feats') {
      const all = await live(db.feats).sortBy('name');
      return all.map(i => ({ id: i.id, name: i.name, description: i.description }));
    }
    if (entity === 'features') {
      const all = await live(db.features).sortBy('name');
      return all
        .filter(f => !tag || (f.tags ?? []).includes(tag))
        .map(f => ({
          id: f.id,
          name: f.name,
          description: [
            f.actionType ? f.actionType.replace('_', ' ') : '',
            f.cost ?? '',
            f.description,
          ].filter(Boolean).join(' · '),
        }));
    }
    if (entity === 'subclasses') {
      const all = await live(db.subclasses).sortBy('name');
      const parentId = source?.parentClassId;
      return all
        .filter(s => !parentId || s.parentClassId === parentId)
        .map(s => ({ id: s.id, name: s.name, description: s.description }));
    }
    return [];
  }, [entity, tag, category]);
}

/** Live list of all standalone features */
export function useFeatures() {
  return useLiveQuery(() => live(db.features).sortBy('name'), []);
}

/** Single feature by id */
export function useFeature(id: string | undefined) {
  return useLiveQuery(() => id ? db.features.get(id) : Promise.resolve(undefined), [id]);
}

/** Features linked to a specific source (e.g. a class id) */
export function useFeaturesBySource(sourceId: string | undefined) {
  return useLiveQuery(
    () => sourceId
      ? live(db.features).filter(f => f.sourceId === sourceId).toArray()
      : Promise.resolve([] as import('@/db/schema').DBFeature[]),
    [sourceId]
  );
}

/** Live list of all weapon property definitions */
export function useItemProperties() {
  return useLiveQuery(() => live(db.weaponProperties).sortBy('name'), []);
}
