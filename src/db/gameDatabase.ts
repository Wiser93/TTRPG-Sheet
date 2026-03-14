import { db, makeDBMeta, markDirty, live, type DBItem, type DBSpell, type DBClass, type DBFeat, type DBFeature, type DBSpecies, type DBBackground, type DBSubclass, type DBCondition } from './schema';

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
  const meta = makeDBMeta();
  const record: DBItem = { ...meta, ...item, id: (item as {id?:string}).id ?? meta.id } as DBItem;
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
  const meta = makeDBMeta();
  const record: DBSpell = { ...meta, ...spell, id: (spell as {id?:string}).id ?? meta.id } as DBSpell;
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
  const meta = makeDBMeta();
  const record: DBClass = { ...meta, ...cls, id: (cls as {id?:string}).id ?? meta.id } as DBClass;
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
  const meta = makeDBMeta();
  const record: DBFeat = { ...meta, ...feat, id: (feat as {id?:string}).id ?? meta.id } as DBFeat;
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
  const meta = makeDBMeta();
  const record: DBSpecies = { ...meta, ...s, id: (s as {id?:string}).id ?? meta.id } as DBSpecies;
  await db.species.add(record);
  return record.id;
}

// ============================================================
// BACKGROUNDS
// ============================================================

export async function deleteSpecies(id: string): Promise<void> {
  await db.species.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

export async function getBackgrounds(): Promise<DBBackground[]> {
  return live(db.backgrounds).toArray();
}

export async function upsertBackground(bg: InsertPayload<DBBackground> & { id?: string }): Promise<string> {
  const existing = bg.id ? await db.backgrounds.get(bg.id) : undefined;
  if (existing) {
    await db.backgrounds.put(markDirty<DBBackground>({ ...existing, ...bg }) as DBBackground);
    return existing.id;
  }
  const meta = makeDBMeta();
  const record: DBBackground = { ...meta, ...bg, id: (bg as {id?:string}).id ?? meta.id } as DBBackground;
  await db.backgrounds.add(record);
  return record.id;
}

export async function deleteBackground(id: string): Promise<void> {
  await db.backgrounds.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
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
  const meta = makeDBMeta();
  const record: DBSubclass = { ...meta, ...sc, id: (sc as {id?:string}).id ?? meta.id } as DBSubclass;
  await db.subclasses.add(record);
  return record.id;
}

export async function deleteSubclass(id: string): Promise<void> {
  await db.subclasses.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ============================================================
// STANDALONE FEATURES
// ============================================================

export async function getFeatures(): Promise<DBFeature[]> {
  return live(db.features).toArray();
}

export async function getFeature(id: string): Promise<DBFeature | undefined> {
  return db.features.get(id);
}

export async function getFeaturesBySource(sourceId: string): Promise<DBFeature[]> {
  return live(db.features).filter(f => f.sourceId === sourceId).toArray();
}

export async function upsertFeature(feat: InsertPayload<DBFeature> & { id?: string }): Promise<string> {
  const existing = feat.id ? await db.features.get(feat.id) : undefined;
  if (existing) {
    await db.features.put(markDirty<DBFeature>({ ...existing, ...feat }) as DBFeature);
    return existing.id;
  }
  const meta = makeDBMeta();
  const record: DBFeature = { ...meta, ...feat, id: (feat as {id?:string}).id ?? meta.id } as DBFeature;
  await db.features.add(record);
  return record.id;
}

export async function deleteFeature(id: string): Promise<void> {
  await db.features.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}

// ── Item Property Definitions ──────────────────────────────────

export async function getItemProperties(): Promise<(import('@/types/game').ItemProperty & { updatedAt?: string; deletedAt?: string })[]> {
  return live(db.itemProperties).toArray();
}

export async function upsertItemProperty(prop: Omit<import('@/types/game').ItemProperty, 'id'> & { id?: string }): Promise<string> {
  const id = prop.id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  await db.itemProperties.put({ ...prop, id, updatedAt: now });
  return id;
}

export async function deleteItemProperty(id: string): Promise<void> {
  await db.itemProperties.update(id, { deletedAt: new Date().toISOString() });
}

// ── Clear all game content ─────────────────────────────────────

/**
 * Hard-deletes every row from every game content table (items, spells, classes,
 * subclasses, feats, species, backgrounds, features, itemProperties).
 * Characters are NOT touched.
 */
export async function clearAllGameContent(): Promise<void> {
  await db.transaction('rw',
    [db.items, db.spells, db.classes, db.subclasses, db.feats,
     db.species, db.backgrounds, db.features, db.itemProperties],
    async () => {
      await db.items.clear();
      await db.spells.clear();
      await db.classes.clear();
      await db.subclasses.clear();
      await db.feats.clear();
      await db.species.clear();
      await db.backgrounds.clear();
      await db.features.clear();
      await db.itemProperties.clear();
    }
  );
}

// ============================================================
// CONDITIONS
// ============================================================

export async function getConditions(): Promise<DBCondition[]> {
  return live(db.conditions).toArray();
}

export async function upsertCondition(cond: InsertPayload<DBCondition> & { id?: string }): Promise<string> {
  const existing = cond.id ? await db.conditions.get(cond.id) : undefined;
  if (existing) {
    await db.conditions.put(markDirty<DBCondition>({ ...existing, ...cond }) as DBCondition);
    return existing.id;
  }
  const meta = makeDBMeta();
  const record: DBCondition = { ...meta, ...cond, id: (cond as { id?: string }).id ?? meta.id } as DBCondition;
  await db.conditions.add(record);
  return record.id;
}

export async function deleteCondition(id: string): Promise<void> {
  await db.conditions.update(id, { deletedAt: new Date().toISOString(), isDirty: true });
}
