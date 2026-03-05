import { db, makeDBMeta, markDirty, type DBCharacter } from './schema';
import type { Character } from '@/types/character';
import { buildDefaultCharacter } from '@/lib/characterDefaults';

// ============================================================
// READ
// ============================================================

export async function getAllCharacters(): Promise<DBCharacter[]> {
  return db.characters
    .filter(c => !c.deletedAt)
    .sortBy('meta.updatedAt')
    .then(r => r.reverse());
}

export async function getCharacter(id: string): Promise<DBCharacter | undefined> {
  return db.characters.get(id);
}

// ============================================================
// CREATE
// ============================================================

export async function createCharacter(
  partial: Partial<Character> & { meta: { name: string } }
): Promise<DBCharacter> {
  const base = buildDefaultCharacter(partial.meta.name);
  const merged: Character = { ...base, ...partial, meta: { ...base.meta, ...partial.meta } };
  const record: DBCharacter = { ...merged, ...makeDBMeta(), id: merged.meta.id };

  await db.characters.add(record);
  return record;
}

// ============================================================
// UPDATE
// ============================================================

export async function updateCharacter(
  id: string,
  changes: Partial<Character>
): Promise<void> {
  const dirty = markDirty<DBCharacter>({
    ...changes,
    meta: {
      ...(changes.meta ?? {}),
      updatedAt: new Date().toISOString(),
    },
  });
  await db.characters.update(id, dirty);
}

/** Convenience: update a single top-level key */
export async function patchCharacter<K extends keyof Character>(
  id: string,
  key: K,
  value: Character[K]
): Promise<void> {
  return updateCharacter(id, { [key]: value } as Partial<Character>);
}

// ============================================================
// DELETE (soft)
// ============================================================

export async function deleteCharacter(id: string): Promise<void> {
  await db.characters.update(id, {
    deletedAt: new Date().toISOString(),
    isDirty: true,
  });
}

export async function restoreCharacter(id: string): Promise<void> {
  await db.characters.update(id, { deletedAt: undefined, isDirty: true });
}

// ============================================================
// EXPORT / IMPORT (JSON backup)
// ============================================================

export async function exportCharacter(id: string): Promise<string> {
  const c = await getCharacter(id);
  if (!c) throw new Error(`Character ${id} not found`);
  return JSON.stringify(c, null, 2);
}

export async function importCharacter(json: string): Promise<DBCharacter> {
  const data = JSON.parse(json) as DBCharacter;
  // Assign a fresh local id to avoid collision
  const now = new Date().toISOString();
  const record: DBCharacter = {
    ...data,
    id: crypto.randomUUID(),
    meta: { ...data.meta, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
    createdAt: now,
    updatedAt: now,
    isDirty: true,
    remoteId: data.remoteId,
  };
  await db.characters.add(record);
  return record;
}
