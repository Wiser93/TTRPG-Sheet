/**
 * bundleIO.ts — Export/Import for TTRPG database content
 *
 * An ExportBundle is a JSON file that can be shared between users.
 * It carries any combination of DB tables and can be imported with
 * a single call, upserting all records into the local database.
 *
 * Export granularity:
 *   - Full table dumps (all non-deleted records)
 *   - Class bundle: class + all its subclasses + all linked features
 *   - Arbitrary ID selection per table
 */

import type {
  Item, Spell, GameClass, Subclass, Feat,
  Species, Background, Feature, ItemProperty, Condition,
} from '@/types/game';
import {
  getItems, getSpells, getClasses, getSubclasses, getFeats,
  getSpecies, getBackgrounds, getFeatures, getItemProperties, getConditions,
  getFeaturesBySource,
  upsertItem, upsertSpell, upsertClass, upsertSubclass, upsertFeat,
  upsertSpecies, upsertBackground, upsertFeature, upsertItemProperty, upsertCondition,
} from './gameDatabase';

// ============================================================
// BUNDLE FORMAT
// ============================================================

export const BUNDLE_VERSION = 1;

export interface ExportBundle {
  /** Format version — bump when structure changes incompatibly */
  version: number;
  /** ISO timestamp when this bundle was created */
  exportedAt: string;
  /** Human-readable name for the bundle, shown in the import UI */
  name: string;
  /** Optional description */
  description?: string;
  /** Tables included — only present keys were exported */
  tables: {
    items?:          Omit<Item,          'id'>[] & { id: string }[];
    spells?:         Omit<Spell,         'id'>[] & { id: string }[];
    classes?:        Omit<GameClass,     'id'>[] & { id: string }[];
    subclasses?:     Omit<Subclass,      'id'>[] & { id: string }[];
    feats?:          Omit<Feat,          'id'>[] & { id: string }[];
    species?:        Omit<Species,       'id'>[] & { id: string }[];
    backgrounds?:    Omit<Background,    'id'>[] & { id: string }[];
    features?:       Omit<Feature,       'id'>[] & { id: string }[];
    itemProperties?: Omit<ItemProperty,  'id'>[] & { id: string }[];
    conditions?:     Omit<Condition,     'id'>[] & { id: string }[];
  };
}

// ============================================================
// EXPORT HELPERS
// ============================================================

/** Strip Dexie metadata fields before bundling */
function strip<T>(records: T[]): T[] {
  return records.map(r => {
    const obj = r as Record<string, unknown>;
    const { createdAt: _c, updatedAt: _u, isDirty: _d, remoteId: _r, deletedAt: _del, ...rest } = obj;
    void _c; void _u; void _d; void _r; void _del;
    return rest as T;
  });
}

/**
 * Export a single class together with all its subclasses and
 * every feature whose sourceId matches the class or any subclass.
 */
export async function exportClassBundle(classId: string): Promise<ExportBundle> {
  const allClasses  = await getClasses();
  const cls = allClasses.find(c => c.id === classId);
  if (!cls) throw new Error(`Class '${classId}' not found`);

  const allSubclasses = await getSubclasses(classId);
  const subIds = allSubclasses.map(s => s.id);

  // Features sourced directly from the class or any of its subclasses
  const classFeatures    = await getFeaturesBySource(classId);
  const subclassFeatures = (await Promise.all(subIds.map(id => getFeaturesBySource(id)))).flat();
  const features = [...classFeatures, ...subclassFeatures];

  return {
    version:    BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    name:       cls.name,
    description: `Class bundle: ${cls.name}${allSubclasses.length ? ` + ${allSubclasses.length} subclass(es)` : ''}`,
    tables: {
      classes:    strip([cls]) as ExportBundle['tables']['classes'],
      subclasses: allSubclasses.length ? strip(allSubclasses) as ExportBundle['tables']['subclasses'] : undefined,
      features:   features.length      ? strip(features)      as ExportBundle['tables']['features']   : undefined,
    },
  };
}

/** Export every record from every table */
export async function exportAll(): Promise<ExportBundle> {
  const [items, spells, classes, subclasses, feats, species,
         backgrounds, features, itemProperties, conditions] = await Promise.all([
    getItems(), getSpells(), getClasses(), getSubclasses(), getFeats(),
    getSpecies(), getBackgrounds(), getFeatures(), getItemProperties(), getConditions(),
  ]);

  return {
    version:    BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    name:       'Full Database Export',
    description: `All tables — exported ${new Date().toLocaleDateString()}`,
    tables: {
      items:          items.length          ? strip(items)          as ExportBundle['tables']['items']          : undefined,
      spells:         spells.length         ? strip(spells)         as ExportBundle['tables']['spells']         : undefined,
      classes:        classes.length        ? strip(classes)        as ExportBundle['tables']['classes']        : undefined,
      subclasses:     subclasses.length     ? strip(subclasses)     as ExportBundle['tables']['subclasses']     : undefined,
      feats:          feats.length          ? strip(feats)          as ExportBundle['tables']['feats']          : undefined,
      species:        species.length        ? strip(species)        as ExportBundle['tables']['species']        : undefined,
      backgrounds:    backgrounds.length    ? strip(backgrounds)    as ExportBundle['tables']['backgrounds']    : undefined,
      features:       features.length       ? strip(features)       as ExportBundle['tables']['features']       : undefined,
      itemProperties: itemProperties.length ? strip(itemProperties) as ExportBundle['tables']['itemProperties'] : undefined,
      conditions:     conditions.length     ? strip(conditions)     as ExportBundle['tables']['conditions']     : undefined,
    },
  };
}

/**
 * Export a subset of tables. Pass a map of table → array of IDs to include.
 * Omit a table key (or pass undefined) to skip it entirely.
 */
export async function exportSelection(
  selection: Partial<Record<keyof ExportBundle['tables'], string[] | 'all'>>
): Promise<ExportBundle> {
  const bundle: ExportBundle = {
    version: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    name: 'Custom Export',
    tables: {},
  };

  async function pickTable<T extends { id: string }>(
    getter: () => Promise<T[]>,
    key: keyof ExportBundle['tables'],
    ids: string[] | 'all'
  ) {
    const all = await getter();
    const picked = ids === 'all' ? all : all.filter(r => ids.includes(r.id));
    if (picked.length) (bundle.tables as Record<string, unknown>)[key] = strip(picked);
  }

  if (selection.items)          await pickTable(getItems,          'items',          selection.items);
  if (selection.spells)         await pickTable(getSpells,         'spells',         selection.spells);
  if (selection.classes)        await pickTable(getClasses,        'classes',        selection.classes);
  if (selection.subclasses)     await pickTable(() => getSubclasses(), 'subclasses', selection.subclasses);
  if (selection.feats)          await pickTable(getFeats,          'feats',          selection.feats);
  if (selection.species)        await pickTable(getSpecies,        'species',        selection.species);
  if (selection.backgrounds)    await pickTable(getBackgrounds,    'backgrounds',    selection.backgrounds);
  if (selection.features)       await pickTable(getFeatures,       'features',       selection.features);
  if (selection.itemProperties) await pickTable(getItemProperties, 'itemProperties', selection.itemProperties);
  if (selection.conditions)     await pickTable(getConditions,     'conditions',     selection.conditions);

  return bundle;
}

// ============================================================
// IMPORT
// ============================================================

export interface ImportResult {
  counts: Partial<Record<keyof ExportBundle['tables'], number>>;
  errors: string[];
}

/**
 * Import a bundle, upserting all records.
 * Existing records with the same ID are overwritten.
 * Returns a summary of what was imported.
 */
export async function importBundle(bundle: ExportBundle): Promise<ImportResult> {
  const counts: ImportResult['counts'] = {};
  const errors: string[] = [];

  async function importTable<T extends { id: string }>(
    records: T[] | undefined,
    key: keyof ExportBundle['tables'],
    upsert: (r: T) => Promise<unknown>
  ) {
    if (!records?.length) return;
    let n = 0;
    for (const r of records) {
      try { await upsert(r); n++; }
      catch (e) { errors.push(`${key}[${r.id}]: ${e}`); }
    }
    if (n) counts[key] = n;
  }

  const t = bundle.tables;
  // Import in dependency order: properties before items, classes before subclasses/features
  await importTable(t.itemProperties, 'itemProperties', upsertItemProperty as (r: { id: string }) => Promise<unknown>);
  await importTable(t.conditions,     'conditions',     upsertCondition     as (r: { id: string }) => Promise<unknown>);
  await importTable(t.classes,        'classes',        upsertClass         as (r: { id: string }) => Promise<unknown>);
  await importTable(t.subclasses,     'subclasses',     upsertSubclass      as (r: { id: string }) => Promise<unknown>);
  await importTable(t.features,       'features',       upsertFeature       as (r: { id: string }) => Promise<unknown>);
  await importTable(t.items,          'items',          upsertItem          as (r: { id: string }) => Promise<unknown>);
  await importTable(t.spells,         'spells',         upsertSpell         as (r: { id: string }) => Promise<unknown>);
  await importTable(t.feats,          'feats',          upsertFeat          as (r: { id: string }) => Promise<unknown>);
  await importTable(t.species,        'species',        upsertSpecies       as (r: { id: string }) => Promise<unknown>);
  await importTable(t.backgrounds,    'backgrounds',    upsertBackground    as (r: { id: string }) => Promise<unknown>);

  return { counts, errors };
}

// ============================================================
// FILE UTILITIES
// ============================================================

/** Trigger a browser download of the bundle as a .ttrpg.json file */
export function downloadBundle(bundle: ExportBundle, filename?: string) {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = (filename ?? bundle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()) + '.ttrpg.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse a File object as an ExportBundle. Throws if invalid. */
export async function parseBundle(file: File): Promise<ExportBundle> {
  const text = await file.text();
  const obj  = JSON.parse(text);
  if (!obj || typeof obj !== 'object' || !obj.tables)
    throw new Error('Not a valid .ttrpg.json bundle');
  return obj as ExportBundle;
}
