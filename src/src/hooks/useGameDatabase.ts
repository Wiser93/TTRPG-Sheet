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
