import { db, makeDBMeta, markDirty, live, type DBItem, type DBSpell, type DBClass, type DBFeat, type DBSpecies, type DBBackground, type DBSubclass } from './schema';
import type { Item, Spell, GameClass, Feat, Species, Background } from '@/types/game';

// ============================================================
// GENERIC HELPERS
// ============================================================

type InsertPayload<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isDirty' | 'remoteId' | 'deletedAt'>;

// ============================================================
// ITEMS
// ============================================================

export async function getItems(): Promise<DBItem[]> {
  return live(db.items).toArray();
}

export async function getItem(id: string): Promise<DBItem | undefined> {
  return db.items.get(id);
}

export async function searchItems(query: string): Promise<DBItem[]> {
  const q = query.toLowerCase();
  return live(db.items)
    .filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    .toArray();
}

export async function upsertItem(item: InsertPayload<DBItem> & { id?: string }): Promise<string> {
  const existing = item.id ? await db.items.get(item.id) : undefined;
  if (existing) {
    const updated = markDirty<DBItem>({ ...existing, ...item });
    await db.items.put(updated as DBItem);
    return existing.id;
  }
  const record: DBItem = { ...item, ...makeDBMeta() } as DBItem;
  await db.items.add(record);
  return record.id;
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ============================================================
// SPELLS
// ============================================================

export async function getSpells(): Promise<DBSpell[]> {
  return live(db.spells).toArray();
}

export async function getSpell(id: string): Promise<DBSpell | undefined> {
  return db.spells.get(id);
}

export async function getSpellsByLevel(level: number): Promise<DBSpell[]> {
  return live(db.spells).filter(s => s.level === level).toArray();
}

export async function searchSpells(query: string): Promise<DBSpell[]> {
  const q = query.toLowerCase();
  return live(db.spells)
    .filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    .toArray();
}

export async function upsertSpell(spell: InsertPayload<DBSpell> & { id?: string }): Promise<string> {
  const existing = spell.id ? await db.spells.get(spell.id) : undefined;
  if (existing) {
    await db.spells.put(markDirty<DBSpell>({ ...existing, ...spell }) as DBSpell);
    return existing.id;
  }
  const record: DBSpell = { ...spell, ...makeDBMeta() } as DBSpell;
  await db.spells.add(record);
  return record.id;
}

export async function deleteSpell(id: string): Promise<void> {
  await db.spells.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ============================================================
// CLASSES
// ============================================================

export async function getClasses(): Promise<DBClass[]> {
  return live(db.classes).toArray();
}

export async function getClass(id: string): Promise<DBClass | undefined> {
  return db.classes.get(id);
}

export async function upsertClass(cls: InsertPayload<DBClass> & { id?: string }): Promise<string> {
  const existing = cls.id ? await db.classes.get(cls.id) : undefined;
  if (existing) {
    await db.classes.put(markDirty<DBClass>({ ...existing, ...cls }) as DBClass);
    return existing.id;
  }
  const record: DBClass = { ...cls, ...makeDBMeta() } as DBClass;
  await db.classes.add(record);
  return record.id;
}

export async function deleteClass(id: string): Promise<void> {
  await db.classes.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ============================================================
// FEATS
// ============================================================

export async function getFeats(): Promise<DBFeat[]> {
  return live(db.feats).toArray();
}

export async function upsertFeat(feat: InsertPayload<DBFeat> & { id?: string }): Promise<string> {
  const existing = feat.id ? await db.feats.get(feat.id) : undefined;
  if (existing) {
    await db.feats.put(markDirty<DBFeat>({ ...existing, ...feat }) as DBFeat);
    return existing.id;
  }
  const record: DBFeat = { ...feat, ...makeDBMeta() } as DBFeat;
  await db.feats.add(record);
  return record.id;
}

export async function deleteFeat(id: string): Promise<void> {
  await db.feats.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ============================================================
// SPECIES
// ============================================================

export async function getSpecies(): Promise<DBSpecies[]> {
  return live(db.species).toArray();
}

export async function upsertSpecies(s: InsertPayload<DBSpecies> & { id?: string }): Promise<string> {
  const existing = s.id ? await db.species.get(s.id) : undefined;
  if (existing) {
    await db.species.put(markDirty<DBSpecies>({ ...existing, ...s }) as DBSpecies);
    return existing.id;
  }
  const record: DBSpecies = { ...s, ...makeDBMeta() } as DBSpecies;
  await db.species.add(record);
  return record.id;
}

// ============================================================
// BACKGROUNDS
// ============================================================

export async function getBackgrounds(): Promise<DBBackground[]> {
  return live(db.backgrounds).toArray();
}

export async function upsertBackground(bg: InsertPayload<DBBackground> & { id?: string }): Promise<string> {
  const existing = bg.id ? await db.backgrounds.get(bg.id) : undefined;
  if (existing) {
    await db.backgrounds.put(markDirty<DBBackground>({ ...existing, ...bg }) as DBBackground);
    return existing.id;
  }
  const record: DBBackground = { ...bg, ...makeDBMeta() } as DBBackground;
  await db.backgrounds.add(record);
  return record.id;
}

// ============================================================
// SUBCLASSES (linked to classes)
// ============================================================

export async function getSubclasses(parentClassId?: string): Promise<DBSubclass[]> {
  if (parentClassId) {
    return live(db.subclasses).filter(s => s.parentClassId === parentClassId).toArray();
  }
  return live(db.subclasses).toArray();
}

export async function upsertSubclass(sc: InsertPayload<DBSubclass> & { id?: string }): Promise<string> {
  const existing = sc.id ? await db.subclasses.get(sc.id) : undefined;
  if (existing) {
    await db.subclasses.put(markDirty<DBSubclass>({ ...existing, ...sc }) as DBSubclass);
    return existing.id;
  }
  const record: DBSubclass = { ...sc, ...makeDBMeta() } as DBSubclass;
  await db.subclasses.add(record);
  return record.id;
}
