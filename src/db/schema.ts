import Dexie, { type Table } from 'dexie';
import type { Item, Spell, GameClass, Subclass, Feat, Species, Background, Feature } from '@/types/game';
import type { Character } from '@/types/character';

// ============================================================
// EXTRA DB-ONLY TYPES (wrappers for sync metadata)
// ============================================================

export interface DBRecord {
  /** Local UUID */
  id: string;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
  /** Remote ID if synced */
  remoteId?: string;
  /** True when local changes haven't been pushed */
  isDirty?: boolean;
  /** Soft delete — keep row but exclude from queries */
  deletedAt?: string;
}

// Game database entries extend DBRecord for sync support
export type DBItem = Item & DBRecord;
export type DBSpell = Spell & DBRecord;
export type DBClass = GameClass & DBRecord;
export type DBSubclass = Subclass & DBRecord;
export type DBFeat = Feat & DBRecord;
export type DBSpecies = Species & DBRecord;
export type DBBackground = Background & DBRecord;
export type DBFeature = Feature & DBRecord;
export type DBCharacter = Character & DBRecord;

// ============================================================
// DATABASE
// ============================================================

export class AppDatabase extends Dexie {
  // Game content tables
  items!: Table<DBItem>;
  spells!: Table<DBSpell>;
  classes!: Table<DBClass>;
  subclasses!: Table<DBSubclass>;
  feats!: Table<DBFeat>;
  species!: Table<DBSpecies>;
  backgrounds!: Table<DBBackground>;
  features!: Table<DBFeature>;
  itemProperties!: Table<import('@/types/game').ItemProperty & { updatedAt?: string; deletedAt?: string }>;

  // Character data
  characters!: Table<DBCharacter>;

  constructor() {
    super('TTRPGSheet');

    // ── Version 1: initial schema ──────────────────────────
    this.version(1).stores({
      // Game DB — indexed columns only (Dexie stores full objects)
      items:       '&id, name, category, rarity, *tags, updatedAt, deletedAt',
      spells:      '&id, name, level, school, *tags, updatedAt, deletedAt',
      classes:     '&id, name, updatedAt, deletedAt',
      subclasses:  '&id, name, parentClassId, updatedAt, deletedAt',
      feats:       '&id, name, updatedAt, deletedAt',
      species:     '&id, name, updatedAt, deletedAt',
      backgrounds: '&id, name, updatedAt, deletedAt',
      features:    '&id, name, sourceId, sourceType, updatedAt, deletedAt',

      // Characters
      characters:  '&id, [meta.name+id], meta.updatedAt, meta.remoteId, meta.isDirty',
    });

    // ── Version 2: weapon property definitions ─────────────
    this.version(2).stores({
      weaponProperties: '&id, name, updatedAt, deletedAt',
    });

    // ── Version 3: rename weaponProperties → itemProperties ─
    this.version(3).stores({
      itemProperties:   '&id, name, updatedAt, deletedAt',
      weaponProperties: null, // drop old table
    }).upgrade(async tx => {
      const existing = await tx.table('weaponProperties').toArray();
      if (existing.length > 0) {
        await tx.table('itemProperties').bulkAdd(existing);
      }
    });
  }
}

// Singleton instance
export const db = new AppDatabase();

// ============================================================
// HELPERS
// ============================================================

/** Returns only non-deleted records */
export function live<T extends { deletedAt?: string }>(table: Table<T>) {
  return table.filter(r => !r.deletedAt);
}

/** Create the metadata fields for a new record */
export function makeDBMeta(): DBRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    isDirty: false,
  };
}

/** Stamp updatedAt and isDirty=true when saving a local change */
export function markDirty<T extends DBRecord>(record: Partial<T>): Partial<T> {
  return { ...record, updatedAt: new Date().toISOString(), isDirty: true };
}

// ============================================================
// SEED HELPERS (import game content from JSON)
// ============================================================

/**
 * Bulk-import game content. Skips records that already exist by id.
 * Use for initial data seeding or importing community content packs.
 */
export async function seedGameContent(data: {
  items?: Omit<DBItem, keyof DBRecord>[];
  spells?: Omit<DBSpell, keyof DBRecord>[];
  classes?: Omit<DBClass, keyof DBRecord>[];
  subclasses?: Omit<DBSubclass, keyof DBRecord>[];
  feats?: Omit<DBFeat, keyof DBRecord>[];
  species?: Omit<DBSpecies, keyof DBRecord>[];
  backgrounds?: Omit<DBBackground, keyof DBRecord>[];
  features?: Omit<DBFeature, keyof DBRecord>[];
}) {
  const wrap = <T>(items: T[] = []): (T & DBRecord)[] =>
    items.map(i => ({ ...i, ...makeDBMeta() })) as (T & DBRecord)[];

  await db.transaction('rw', db.tables, async () => {
    if (data.items?.length)       await db.items.bulkAdd(wrap(data.items), { allKeys: true }).catch(() => {});
    if (data.spells?.length)      await db.spells.bulkAdd(wrap(data.spells), { allKeys: true }).catch(() => {});
    if (data.classes?.length)     await db.classes.bulkAdd(wrap(data.classes), { allKeys: true }).catch(() => {});
    if (data.subclasses?.length)  await db.subclasses.bulkAdd(wrap(data.subclasses), { allKeys: true }).catch(() => {});
    if (data.feats?.length)       await db.feats.bulkAdd(wrap(data.feats), { allKeys: true }).catch(() => {});
    if (data.species?.length)     await db.species.bulkAdd(wrap(data.species), { allKeys: true }).catch(() => {});
    if (data.backgrounds?.length) await db.backgrounds.bulkAdd(wrap(data.backgrounds), { allKeys: true }).catch(() => {});
    if (data.features?.length)    await db.features.bulkAdd(wrap(data.features), { allKeys: true }).catch(() => {});
  });
}
