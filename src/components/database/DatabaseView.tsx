import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useItems, useSpells, useClasses, useSubclasses, useFeats, useAllSpecies, useBackgrounds, useFeatures, useItemProperties, useConditions } from '@/hooks/useGameDatabase';
import { upsertItem, deleteItem, upsertSpell, deleteSpell, upsertClass, deleteClass, upsertFeat, deleteFeat, upsertSpecies, deleteSpecies, upsertBackground, deleteBackground, upsertFeature, deleteFeature, upsertSubclass, deleteSubclass, upsertItemProperty, deleteItemProperty, upsertCondition, deleteCondition, clearAllGameContent } from '@/db/gameDatabase';
import { exportClassBundle, exportAll, exportSelection, importBundle, downloadBundle, parseBundle } from '@/db/bundleIO';
import type { ImportResult } from '@/db/bundleIO';
import { elementalShaperClass, elementalShaperFeatures } from '@/data/elementalShaper';
import { theHarmonist, theHarmonistFeatures } from '@/data/theHarmonist';
import { seedSrdProperties } from '@/data/srdProperties';
import { seedSrdItems } from '@/data/srdItems';
import { seedSrdConditions } from '@/data/srdConditions';
import { seedSrdSpecies } from '@/data/srdSpecies';
import { seedSrdFeats } from '@/data/srdFeats';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { ItemForm } from './forms/ItemForm';
import { SpellForm } from './forms/SpellForm';
import { ClassForm } from './forms/ClassForm';
import { FeatForm } from './forms/FeatForm';
import { SpeciesForm } from './forms/SpeciesForm';
import { BackgroundForm } from './forms/BackgroundForm';
import { FeatureForm } from './forms/FeatureForm';
import { SubclassForm } from './forms/SubclassForm';
import { PropertyForm } from './forms/PropertyForm';
import { ConditionForm } from './forms/ConditionForm';
import type { Item, Spell, GameClass, Subclass, Feat, Species, Background, Feature, ItemProperty, Condition } from '@/types/game';

type SectionKey = 'items' | 'spells' | 'classes' | 'subclasses' | 'feats' | 'species' | 'backgrounds' | 'features' | 'properties' | 'conditions' | 'library';

type EditTarget =
  | { type: 'items'; record?: Item }
  | { type: 'spells'; record?: Spell }
  | { type: 'conditions'; record?: Condition }
  | { type: 'classes'; record?: GameClass }
  | { type: 'feats'; record?: Feat }
  | { type: 'species'; record?: Species }
  | { type: 'backgrounds'; record?: Background }
  | { type: 'features'; record?: Feature }
  | { type: 'subclasses'; record?: Subclass }
  | { type: 'properties'; record?: ItemProperty };

// ── Delete modal payload ───────────────────────────────────────

type DeleteModal = {
  title: string;
  body: string;
  /** Label shown on the single-delete button */
  singleLabel: string;
  /** Label shown on the cascade-delete button, or null if no cascade is available */
  cascadeLabel: string | null;
  /** Warning shown under the cascade button */
  cascadeWarning?: string;
  onSingle: () => Promise<void>;
  onCascade?: () => Promise<void>;
};

export function DatabaseView() {
  const { databaseSection, setDatabaseSection, setView } = useUIStore();
  const items = useItems();
  const spells = useSpells();
  const classes = useClasses();
  const feats = useFeats();
  const species = useAllSpecies();
  const backgrounds = useBackgrounds();
  const features = useFeatures();
  const subclasses = useSubclasses();
  const itemProperties = useItemProperties();
  const conditions = useConditions();

  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  // ── Nav sections (excludes 'library' — handled separately) ──
  const DATA_SECTIONS = [
    { key: 'items' as const,       label: 'Items',       icon: '⚔️',  data: items },
    { key: 'spells' as const,      label: 'Spells',      icon: '✨',  data: spells },
    { key: 'classes' as const,     label: 'Classes',     icon: '📜',  data: classes },
    { key: 'feats' as const,       label: 'Feats',       icon: '⭐',  data: feats },
    { key: 'species' as const,     label: 'Species',     icon: '🧬',  data: species },
    { key: 'backgrounds' as const, label: 'Backgrounds', icon: '📖',  data: backgrounds },
    { key: 'features' as const,    label: 'Features',    icon: '⚡',  data: features },
    { key: 'subclasses' as const,  label: 'Subclasses',  icon: '🌀',  data: subclasses },
    { key: 'properties' as const,  label: 'Properties',  icon: '🏷️',  data: itemProperties },
    { key: 'conditions' as const,  label: 'Conditions',  icon: '🩹',  data: conditions },
  ];

  const isLibrary = databaseSection === 'library';
  const activeSection = DATA_SECTIONS.find(s => s.key === databaseSection);
  const q = search.toLowerCase();
  const filtered = activeSection
    ? (activeSection.data ?? []).filter((e: { name: string }) => !q || e.name.toLowerCase().includes(q))
    : [];

  // ── Save handlers ────────────────────────────────────────────

  async function handleSave(data: unknown) {
    setIsSaving(true);
    try {
      const id = (editing?.record as { id?: string })?.id;
      if (editing?.type === 'items')       await upsertItem({ ...(data as Omit<Item,'id'>), id });
      else if (editing?.type === 'spells') await upsertSpell({ ...(data as Omit<Spell,'id'>), id });
      else if (editing?.type === 'classes') await upsertClass({ ...(data as Omit<GameClass,'id'>), id });
      else if (editing?.type === 'feats')  await upsertFeat({ ...(data as Omit<Feat,'id'>), id });
      else if (editing?.type === 'species') await upsertSpecies({ ...(data as Omit<Species,'id'>), id });
      else if (editing?.type === 'backgrounds') await upsertBackground({ ...(data as Omit<Background,'id'>), id });
      else if (editing?.type === 'features')    await upsertFeature({ ...(data as Omit<Feature,'id'>), id });
      else if (editing?.type === 'subclasses')  await upsertSubclass({ ...(data as Omit<Subclass,'id'>), id });
      else if (editing?.type === 'properties')  await upsertItemProperty({ ...(data as Omit<ItemProperty,'id'>), id });
      else if (editing?.type === 'conditions')  await upsertCondition({ ...(data as Omit<Condition,'id'>), id });
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete helpers ────────────────────────────────────────────

  function pathFeaturesOf(pathId: string) {
    return (features ?? []).filter(f => f.sourceId === pathId && f.sourceType === 'path');
  }
  function subclassFeaturesOf(scId: string) {
    return (features ?? []).filter(f => f.sourceId === scId && f.sourceType === 'subclass');
  }
  function classFeaturesOf(classId: string) {
    return (features ?? []).filter(f => f.sourceId === classId && f.sourceType === 'class');
  }

  function handleDelete(type: SectionKey, id: string) {
    if (type === 'classes')    { buildClassDeleteModal(id);    return; }
    if (type === 'subclasses') { buildSubclassDeleteModal(id); return; }
    if (type === 'features')   { buildFeatureDeleteModal(id);  return; }

    const label = type === 'items' ? 'item'
      : type === 'spells' ? 'spell' : type === 'feats' ? 'feat'
      : type === 'species' ? 'species entry' : type === 'backgrounds' ? 'background' : 'property';

    setDeleteModal({
      title: `Delete ${label}?`,
      body: 'This cannot be undone.',
      singleLabel: 'Delete',
      cascadeLabel: null,
      onSingle: async () => {
        if (type === 'items')            await deleteItem(id);
        else if (type === 'spells')      await deleteSpell(id);
        else if (type === 'feats')       await deleteFeat(id);
        else if (type === 'species')     await deleteSpecies(id);
        else if (type === 'backgrounds') await deleteBackground(id);
        else if (type === 'properties')  await deleteItemProperty(id);
        else if (type === 'conditions')  await deleteCondition(id);
      },
    });
  }

  function buildFeatureDeleteModal(id: string) {
    const feat = (features ?? []).find(f => f.id === id);
    if (!feat) return;
    const pathChildren = feat.isPath ? pathFeaturesOf(id) : [];
    setDeleteModal({
      title: `Delete "${feat.name}"?`,
      body: feat.isPath && pathChildren.length > 0
        ? `This path has ${pathChildren.length} connected feature(s). Deleting only the path will orphan them.`
        : 'This cannot be undone.',
      singleLabel: feat.isPath && pathChildren.length > 0 ? 'Delete path only (orphan features)' : 'Delete',
      cascadeLabel: feat.isPath && pathChildren.length > 0
        ? `Cascade delete (path + ${pathChildren.length} features)` : null,
      cascadeWarning: pathChildren.length > 0
        ? `Will also permanently delete: ${pathChildren.map(f => f.name).join(', ')}` : undefined,
      onSingle: async () => { await deleteFeature(id); },
      onCascade: pathChildren.length > 0 ? async () => {
        for (const f of pathChildren) await deleteFeature(f.id);
        await deleteFeature(id);
      } : undefined,
    });
  }

  function buildSubclassDeleteModal(id: string) {
    const sc = (subclasses ?? []).find(s => s.id === id);
    if (!sc) return;
    const scFeats = subclassFeaturesOf(id);
    setDeleteModal({
      title: `Delete subclass "${sc.name}"?`,
      body: scFeats.length > 0
        ? `${scFeats.length} feature(s) are linked to this subclass. Deleting only the subclass will orphan them.`
        : 'This cannot be undone.',
      singleLabel: scFeats.length > 0 ? 'Delete subclass only (orphan features)' : 'Delete',
      cascadeLabel: scFeats.length > 0 ? `Cascade delete (subclass + ${scFeats.length} features)` : null,
      cascadeWarning: scFeats.length > 0
        ? `Will also permanently delete: ${scFeats.map(f => f.name).join(', ')}` : undefined,
      onSingle: async () => { await deleteSubclass(id); },
      onCascade: scFeats.length > 0 ? async () => {
        for (const f of scFeats) await deleteFeature(f.id);
        await deleteSubclass(id);
      } : undefined,
    });
  }

  function buildClassDeleteModal(id: string) {
    const cls = (classes ?? []).find(c => c.id === id);
    if (!cls) return;
    const linkedSubclasses = (subclasses ?? []).filter(s => s.parentClassId === id);
    const classFeats = classFeaturesOf(id);
    const pathFeats = classFeats.filter(f => f.isPath);
    const pathChildren = pathFeats.flatMap(p => pathFeaturesOf(p.id));
    const allSubclassFeats = linkedSubclasses.flatMap(s => subclassFeaturesOf(s.id));
    const cascadeCount = linkedSubclasses.length + classFeats.length + pathChildren.length + allSubclassFeats.length;

    const bodyParts: string[] = [];
    if (linkedSubclasses.length > 0)
      bodyParts.push(`${linkedSubclasses.length} subclass(es): ${linkedSubclasses.map(s => s.name).join(', ')}`);
    if (classFeats.length > 0)
      bodyParts.push(`${classFeats.length} class feature(s)${pathFeats.length > 0 ? ` (including ${pathFeats.length} path(s))` : ''}`);
    if (pathChildren.length > 0)
      bodyParts.push(`${pathChildren.length} path feature(s) across ${pathFeats.length} path(s)`);
    if (allSubclassFeats.length > 0)
      bodyParts.push(`${allSubclassFeats.length} subclass feature(s)`);

    setDeleteModal({
      title: `Delete class "${cls.name}"?`,
      body: bodyParts.length > 0
        ? `Linked content that will become orphaned on single delete:\n• ${bodyParts.join('\n• ')}`
        : 'This cannot be undone.',
      singleLabel: cascadeCount > 0 ? 'Delete class only (orphan linked content)' : 'Delete',
      cascadeLabel: cascadeCount > 0 ? `Cascade delete (class + ${cascadeCount} linked records)` : null,
      cascadeWarning: cascadeCount > 0
        ? 'Will permanently delete the class, all its subclasses, and all linked features including path features.' : undefined,
      onSingle: async () => { await deleteClass(id); },
      onCascade: cascadeCount > 0 ? async () => {
        for (const f of pathChildren)     await deleteFeature(f.id);
        for (const f of classFeats)       await deleteFeature(f.id);
        for (const f of allSubclassFeats) await deleteFeature(f.id);
        for (const s of linkedSubclasses) await deleteSubclass(s.id);
        await deleteClass(id);
      } : undefined,
    });
  }

  function handleClearDatabase() {
    setDeleteModal({
      title: '⚠️ Clear entire database?',
      body: 'This will permanently erase ALL game content — every item, spell, class, subclass, feat, species, background, feature, and property. Your characters will not be affected.',
      singleLabel: 'Cancel',
      cascadeLabel: 'Delete everything',
      cascadeWarning: 'This action cannot be undone.',
      onSingle: async () => { /* no-op: cancel just closes the modal */ },
      onCascade: async () => {
        setIsClearing(true);
        try { await clearAllGameContent(); }
        finally { setIsClearing(false); }
      },
    });
  }

  // ── Panel title ─────────────────────────────────────────────

  function panelTitle() {
    const isEdit = !!editing?.record;
    const labels: Record<Exclude<SectionKey, 'library'>, string> = {
      items: 'Item', spells: 'Spell', classes: 'Class', subclasses: 'Subclass',
      feats: 'Feat', species: 'Species', backgrounds: 'Background',
      features: 'Feature', properties: 'Property', conditions: 'Condition',
    };
    return `${isEdit ? 'Edit' : 'New'} ${labels[editing?.type ?? 'items']}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <header style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => setView('home')} style={{ fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>Game Database</h1>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, color: 'var(--accent-2)' }}
          onClick={handleClearDatabase}
          disabled={isClearing}
          title="Permanently delete all game content"
        >
          {isClearing ? 'Clearing…' : '🗑 Clear DB'}
        </button>
        {!isLibrary && (
          <button className="btn btn-primary" style={{ fontSize: 13 }}
            onClick={() => setEditing({ type: databaseSection as Exclude<SectionKey,'library'> })}>
            + New {activeSection?.label.slice(0, -1)}
          </button>
        )}
      </header>

      {/* Section tabs */}
      <nav style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', padding: '0 8px', flexShrink: 0 }}>
        {DATA_SECTIONS.map(s => (
          <button key={s.key}
            onClick={() => { setDatabaseSection(s.key); setSearch(''); }}
            style={{
              padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap',
              color: databaseSection === s.key ? 'var(--accent)' : 'var(--text-2)',
              borderBottom: databaseSection === s.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            {s.icon} {s.label} ({s.data?.length ?? 0})
          </button>
        ))}
        {/* Library tab — always at the end */}
        <button
          onClick={() => { setDatabaseSection('library'); setSearch(''); setShowExportImport(false); }}
          style={{
            padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 'auto',
            color: (isLibrary && !showExportImport) ? 'var(--accent-4)' : 'var(--text-2)',
            borderBottom: (isLibrary && !showExportImport) ? '2px solid var(--accent-4)' : '2px solid transparent',
          }}>
          📦 Library
        </button>
        <button
          onClick={() => { setShowExportImport(true); setDatabaseSection('library'); setSearch(''); }}
          style={{
            padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap',
            color: showExportImport ? 'var(--accent-4)' : 'var(--text-2)',
            borderBottom: showExportImport ? '2px solid var(--accent-4)' : '2px solid transparent',
          }}>
          📤 Export / Import
        </button>
      </nav>

      {/* Export / Import panel */}
      {showExportImport ? (
        <ExportImportPanel
          classes={classes ?? []}
        />
      ) : isLibrary ? (
        <LibraryPanel
          installedClassIds={(classes ?? []).map(c => c.id)}
          installedSubclassIds={(subclasses ?? []).map(s => s.id)}
          installedPropertyCount={itemProperties?.length ?? 0}
          installedConditionCount={conditions?.length ?? 0}
          installedSpeciesCount={species?.length ?? 0}
          installedFeatCount={feats?.length ?? 0}
          onNavigate={setDatabaseSection}
        />
      ) : (
        <>
          {/* Search */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', flexShrink: 0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeSection?.label.toLowerCase() ?? ''}…`}
              style={{ margin: 0 }} />
          </div>

          {/* List */}
          <main style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '48px 0' }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>{activeSection?.icon}</p>
                {search ? (
                  <p>No results for "{search}"</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 600 }}>No {activeSection?.label.toLowerCase()} yet</p>
                    <p style={{ fontSize: 13, marginTop: 6 }}>
                      Click <strong>+ New {activeSection?.label.slice(0,-1)}</strong> to create one,
                      {' '}or visit the <button
                        onClick={() => setDatabaseSection('library')}
                        style={{ color: 'var(--accent-4)', textDecoration: 'underline', fontSize: 13 }}>
                        Library
                      </button> to install content packs.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(filtered as unknown as Array<{ id: string; name: string; description?: string; [k: string]: unknown }>).map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    section={databaseSection as Exclude<SectionKey,'library'>}
                    onEdit={() => setEditing({ type: databaseSection as Exclude<SectionKey,'library'>, record: entry as never })}
                    onDelete={() => handleDelete(databaseSection, entry.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Slide panel */}
      <SlidePanel isOpen={!!editing} onClose={() => setEditing(null)} title={panelTitle()}>
        {editing?.type === 'items' && <ItemForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'spells' && <SpellForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'classes' && <ClassForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'feats' && <FeatForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'species' && <SpeciesForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'backgrounds' && <BackgroundForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'features' && <FeatureForm initial={editing.record as Partial<Feature>} onSave={handleSave} isSaving={isSaving} />}
        {editing?.type === 'subclasses' && <SubclassForm initial={editing.record as Partial<Subclass>} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'properties' && <PropertyForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
        {editing?.type === 'conditions' && <ConditionForm initial={editing.record as Partial<Condition>} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
      </SlidePanel>

      {/* Delete / cascade confirmation modal */}
      {deleteModal && (
        <ConfirmModal
          modal={deleteModal}
          isExecuting={isDeleting}
          onClose={() => setDeleteModal(null)}
          onExecute={async (cascade) => {
            setIsDeleting(true);
            try {
              if (cascade && deleteModal.onCascade) await deleteModal.onCascade();
              else await deleteModal.onSingle();
            } finally {
              setIsDeleting(false);
              setDeleteModal(null);
            }
          }}
        />
      )}
    </div>
  );
}

// ── Library panel ──────────────────────────────────────────────

interface ContentPack {
  id: string;
  name: string;
  version: string;
  type: 'class' | 'subclass' | 'adventure' | 'compendium';
  typeLabel: string;
  icon: string;
  description: string;
  includes: string[];
  /** ID to check against installed classes/subclasses. Omit for compendium packs. */
  rootId?: string;
  rootType?: 'class' | 'subclass';
  /** Where to navigate after a successful install */
  navigateTo?: ReturnType<typeof useUIStore.getState>['databaseSection'];
  /** Dependency pack IDs that must be installed first */
  requires?: string[];
  install: () => Promise<void>;
}

function LibraryPanel({
  installedClassIds,
  installedSubclassIds,
  installedPropertyCount,
  installedConditionCount,
  installedSpeciesCount,
  installedFeatCount,
  onNavigate,
}: {
  installedClassIds: string[];
  installedSubclassIds: string[];
  installedPropertyCount: number;
  installedConditionCount: number;
  installedSpeciesCount: number;
  installedFeatCount: number;
  onNavigate: (s: ReturnType<typeof useUIStore.getState>['databaseSection']) => void;
}) {
  const [installing, setInstalling] = useState<string | null>(null);
  const [justInstalled, setJustInstalled] = useState<string | null>(null);

  const PACKS: ContentPack[] = [
    {
      id: 'elemental-shaper',
      name: 'Elemental Shaper',
      version: '1.0',
      type: 'class',
      typeLabel: 'Class',
      icon: '🔥',
      description:
        'A martial combatant who channels elemental energy through their body. ' +
        'Accumulates Elemental Charges and spends them on techniques, building ' +
        'toward a chosen combination of four Elemental Paths.',
      includes: [
        '1 class (levels 1–20)',
        '10 class features',
        '52 elemental path features across Water, Earth, Fire, and Air',
      ],
      rootId: 'elemental-shaper',
      rootType: 'class',
      install: async () => {
        for (const f of elementalShaperFeatures) await upsertFeature(f);
        await upsertClass(elementalShaperClass);
      },
    },
    {
      id: 'the-harmonist',
      name: 'The Harmonist',
      version: '1.0',
      type: 'subclass',
      typeLabel: 'Subclass',
      icon: '🌀',
      description:
        'An Elemental Shaper subclass that prioritises versatility over specialisation. ' +
        'The Harmonist learns all four elements, mastering breadth rather than depth.',
      includes: [
        '1 subclass (Elemental Shaper, level 3)',
        '4 subclass features',
      ],
      rootId: 'the-harmonist',
      rootType: 'subclass',
      requires: ['elemental-shaper'],
      install: async () => {
        for (const f of theHarmonistFeatures) await upsertFeature(f);
        await upsertSubclass(theHarmonist);
      },
    },
    {
      id: 'srd-properties',
      name: 'SRD Item Properties',
      version: '1.0',
      type: 'compendium',
      typeLabel: 'Compendium',
      icon: '🏷️',
      description:
        'All standard item properties from the 5e System Reference Document — weapon ' +
        'properties, armour properties, and the eight weapon mastery properties from the ' +
        '2024 Player\'s Handbook. Install this first so property tooltips resolve correctly.',
      includes: [
        '10 weapon properties (finesse, light, reach, thrown…)',
        '1 armour property (stealth disadvantage)',
        '8 mastery properties (cleave, graze, nick, push, sap, slow, topple, vex)',
      ],
      navigateTo: 'properties',
      install: async () => { await seedSrdProperties(); },
    },
    {
      id: 'srd-items',
      name: 'SRD Items',
      version: '1.0',
      type: 'compendium',
      typeLabel: 'Compendium',
      icon: '📦',
      description:
        'All weapons, armour, shields, ammunition, adventuring gear, artisan tools, and the ' +
        'basic healing potion from the 5e SRD. Mastery properties are included on each weapon ' +
        'and will only display when the character is proficient.',
      includes: [
        '37 weapons (simple & martial, melee & ranged)',
        '13 armour & shields',
        '4 ammunition types',
        '24 adventuring gear items',
        '23 artisan tools & kits',
        '1 potion',
      ],
      navigateTo: 'items',
      requires: ['srd-properties'],
      install: async () => { await seedSrdItems(); },
    },
    {
      id: 'srd-conditions',
      name: 'SRD Conditions',
      version: '1.0',
      type: 'compendium',
      typeLabel: 'Compendium',
      icon: '🩹',
      description:
        'All 15 standard conditions from the 5e SRD, including Exhaustion as a fully levelled ' +
        'condition with all six severity tiers and their cumulative effects. Each condition ' +
        'includes its mechanical bullet points for tooltip display on the combat tab.',
      includes: [
        '14 standard conditions (Blinded, Charmed, Deafened…)',
        '1 levelled condition — Exhaustion (6 cumulative levels)',
      ],
      navigateTo: 'conditions',
      install: async () => { await seedSrdConditions(); },
    },
    {
      id: 'srd-species',
      name: 'SRD Species',
      version: '1.0',
      type: 'compendium',
      typeLabel: 'Compendium',
      icon: '🧬',
      description:
        'All nine species from the 5e SRD: Dwarf, Elf, Halfling, Human, Dragonborn, Gnome, ' +
        'Half-Elf, Half-Orc, and Tiefling. Each species includes its traits as Feature entries ' +
        'so they display correctly on the character sheet.',
      includes: [
        '9 species with full feature sets',
        'Darkvision, resistances, ability bonuses, and innate spells described per species',
      ],
      navigateTo: 'species',
      install: async () => { await seedSrdSpecies(); },
    },
    {
      id: 'srd-feats',
      name: 'SRD Feats',
      version: '1.0',
      type: 'compendium',
      typeLabel: 'Compendium',
      icon: '⭐',
      description:
        'All 41 feats available in the 5e SRD. Each feat\'s benefits are stored as Feature ' +
        'entries with action types, so they appear correctly in the Features tab. Includes ' +
        'prerequisites and repeatable flags where applicable.',
      includes: [
        '41 feats (Alert, Great Weapon Master, Sharpshooter, War Caster…)',
        'Prerequisites noted on each feat',
        'Action types set on reaction and bonus-action feats',
      ],
      navigateTo: 'feats',
      install: async () => { await seedSrdFeats(); },
    },
  ];

  function isInstalled(pack: ContentPack) {
    if (pack.id === 'srd-conditions') return installedConditionCount > 0;
    if (pack.id === 'srd-species')    return installedSpeciesCount > 0;
    if (pack.id === 'srd-feats')      return installedFeatCount > 0;
    if (!pack.rootId || !pack.rootType) return false;
    return pack.rootType === 'class'
      ? installedClassIds.includes(pack.rootId)
      : installedSubclassIds.includes(pack.rootId);
  }

  function depsMet(pack: ContentPack) {
    if (!pack.requires) return true;
    return pack.requires.every(reqId => {
      if (reqId === 'srd-properties') return installedPropertyCount > 0;
      if (reqId === 'srd-conditions') return installedConditionCount > 0;
      return installedClassIds.includes(reqId) || installedSubclassIds.includes(reqId);
    });
  }

  async function handleInstall(pack: ContentPack) {
    const installed = isInstalled(pack);
    const verb = installed ? 'Reinstall' : 'Install';
    if (!confirm(`${verb} "${pack.name}"? ${installed ? 'All existing data will be overwritten.' : ''}`)) return;
    setInstalling(pack.id);
    try {
      await pack.install();
      setJustInstalled(pack.id);
      setTimeout(() => setJustInstalled(null), 3000);
      // Navigate to the relevant section after install
      const dest = pack.navigateTo ?? (pack.rootType === 'class' ? 'classes' : 'subclasses');
      onNavigate(dest);
    } finally {
      setInstalling(null);
    }
  }

  const TYPE_COLORS: Record<ContentPack['type'], string> = {
    class:      'var(--accent)',
    subclass:   'var(--accent-4)',
    adventure:  '#e06c75',
    compendium: '#98c379',
  };

  return (
    <main style={{ flex: 1, overflow: 'auto', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Content Library</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Pre-built content packs ready to install into your database.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PACKS.map(pack => {
          const installed = isInstalled(pack);
          const ready = depsMet(pack);
          const isInstalling = installing === pack.id;
          const didInstall = justInstalled === pack.id;
          const accentColor = TYPE_COLORS[pack.type];

          return (
            <div key={pack.id} className="card" style={{
              borderLeft: `3px solid ${installed ? accentColor : 'var(--border)'}`,
              opacity: !ready && !installed ? 0.6 : 1,
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{pack.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{pack.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '2px 7px', borderRadius: 10,
                      background: `color-mix(in srgb, ${accentColor} 15%, var(--bg-3))`,
                      border: `1px solid color-mix(in srgb, ${accentColor} 35%, transparent)`,
                      color: accentColor,
                    }}>{pack.typeLabel}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-2)' }}>v{pack.version}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>
                    {pack.description}
                  </p>
                </div>
              </div>

              {/* Includes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {pack.includes.map(item => (
                  <span key={item} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    color: 'var(--text-2)',
                  }}>{item}</span>
                ))}
              </div>

              {/* Dependency warning */}
              {!ready && !installed && pack.requires && (
                <p style={{ fontSize: 12, color: 'var(--accent-2)', marginBottom: 10 }}>
                  ⚠️ Requires: {pack.requires.join(', ')}
                </p>
              )}

              {/* Footer row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                {installed ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: accentColor, fontWeight: 600 }}>
                    <span style={{ fontSize: 14 }}>✓</span> Installed
                    {didInstall && <span style={{ color: 'var(--text-2)', fontWeight: 400 }}> — done!</span>}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Not installed</span>
                )}

                <button
                  className={installed ? 'btn btn-ghost' : 'btn btn-primary'}
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  disabled={isInstalling || (!ready && !installed)}
                  onClick={() => handleInstall(pack)}
                >
                  {isInstalling ? 'Installing…' : installed ? 'Reinstall' : 'Install'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', marginTop: 24 }}>
        More content packs coming soon.
      </p>
    </main>
  );
}

// ── Confirm / cascade modal ────────────────────────────────────

function ConfirmModal({
  modal,
  isExecuting,
  onClose,
  onExecute,
}: {
  modal: DeleteModal;
  isExecuting: boolean;
  onClose: () => void;
  onExecute: (cascade: boolean) => Promise<void>;
}) {
  const isClearAll = modal.title.includes('Clear entire database');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-1)', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%',
        border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{modal.title}</h2>

        {/* Body — render newlines as paragraphs */}
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
          {modal.body.split('\n').map((line, i) => (
            <p key={i} style={{ marginBottom: 4 }}>{line}</p>
          ))}
        </div>

        {/* Cascade warning box */}
        {modal.cascadeWarning && (
          <div style={{
            background: 'color-mix(in srgb, var(--accent-2) 12%, var(--bg-2))',
            border: '1px solid color-mix(in srgb, var(--accent-2) 35%, transparent)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 12, color: 'var(--accent-2)', lineHeight: 1.5,
          }}>
            ⚠️ {modal.cascadeWarning}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Cascade / destructive button — shown first so it's prominent */}
          {modal.cascadeLabel && (
            <button
              className="btn"
              style={{
                background: 'var(--accent-2)', color: '#fff', padding: '10px 16px',
                borderRadius: 8, fontWeight: 600, fontSize: 13, opacity: isExecuting ? 0.6 : 1,
              }}
              disabled={isExecuting}
              onClick={() => onExecute(true)}
            >
              {isExecuting ? 'Working…' : modal.cascadeLabel}
            </button>
          )}

          {/* Single delete / cancel */}
          {!isClearAll && (
            <button
              className="btn btn-ghost"
              style={{ padding: '10px 16px', fontSize: 13, opacity: isExecuting ? 0.6 : 1 }}
              disabled={isExecuting}
              onClick={() => onExecute(false)}
            >
              {modal.singleLabel}
            </button>
          )}

          <button
            className="btn btn-ghost"
            style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-2)' }}
            disabled={isExecuting}
            onClick={onClose}
          >
            {isClearAll ? 'Cancel' : 'Keep entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Entry card ─────────────────────────────────────────────────

function EntryCard({
  entry, section, onEdit, onDelete,
}: {
  entry: { id: string; name: string; description?: string; [k: string]: unknown };
  section: Exclude<SectionKey, 'library'>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const subtitle = entrySubtitle(entry, section);
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onEdit}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 1 }}>{subtitle}</div>}
        {entry.description && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.description as string}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={onEdit}>Edit</button>
        <button onClick={onDelete} style={{ fontSize: 18, color: 'var(--accent-2)', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
    </div>
  );
}

function entrySubtitle(entry: Record<string, unknown>, section: Exclude<SectionKey, 'library'>): string {
  if (section === 'items') {
    const parts = [];
    if (entry.rarity) parts.push(String(entry.rarity).replace('_',' '));
    if (entry.category) parts.push(String(entry.category).replace('_',' '));
    return parts.join(' · ');
  }
  if (section === 'spells') {
    const level = entry.level === 0 ? 'Cantrip' : `Level ${entry.level}`;
    return `${level} · ${entry.school ?? ''}`;
  }
  if (section === 'classes') return `Hit Die: d${entry.hitDie}`;
  if (section === 'species') return `${entry.size ?? ''} · Speed ${entry.speed}ft`;
  if (section === 'backgrounds') {
    const skills = (entry.skillProficiencies as string[] ?? []).join(', ');
    return skills ? `Skills: ${skills}` : '';
  }
  if (section === 'features') {
    const actionType = entry.actionType ? String(entry.actionType).replace('_', ' ') : '';
    const cost = entry.cost ? String(entry.cost) : '';
    return [actionType, cost].filter(Boolean).join(' · ');
  }
  if (section === 'conditions') {
    const effects = entry.effects as string[] | undefined;
    return effects?.length ? `${effects.length} effect${effects.length !== 1 ? 's' : ''}` : (entry.description as string ?? '').slice(0, 60);
  }
  return '';
}

// ── Export / Import panel ─────────────────────────────────────

function ExportImportPanel({
  classes,
}: {
  classes: import('@/types/game').GameClass[];
}) {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Export helpers ────────────────────────────────────────

  async function handleExportClass(classId: string) {
    setBusy(true); setResult(null);
    try {
      const bundle = await exportClassBundle(classId);
      downloadBundle(bundle);
      setResult(`✓ Exported "${bundle.name}" (${Object.values(bundle.tables).flat().length} records)`);
    } catch (e) {
      setResult(`✗ ${e}`);
    } finally { setBusy(false); }
  }

  async function handleExportAll() {
    setBusy(true); setResult(null);
    try {
      const bundle = await exportAll();
      const total = Object.values(bundle.tables).reduce((n, t) => n + (t?.length ?? 0), 0);
      downloadBundle(bundle);
      setResult(`✓ Exported full database (${total} records)`);
    } catch (e) {
      setResult(`✗ ${e}`);
    } finally { setBusy(false); }
  }

  async function handleExportTable(table: keyof import('@/db/bundleIO').ExportBundle['tables']) {
    setBusy(true); setResult(null);
    try {
      const bundle = await exportSelection({ [table]: 'all' });
      downloadBundle(bundle, table);
      const count = (bundle.tables[table] as unknown[])?.length ?? 0;
      setResult(`✓ Exported ${count} ${table}`);
    } catch (e) {
      setResult(`✗ ${e}`);
    } finally { setBusy(false); }
  }

  // ── Import helpers ────────────────────────────────────────

  async function processFile(file: File) {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.ttrpg.json')) {
      setResult('✗ File must be a .ttrpg.json file');
      return;
    }
    setBusy(true); setResult(null); setImportResult(null);
    try {
      const bundle = await parseBundle(file);
      const res = await importBundle(bundle);
      setImportResult(res);
    } catch (e) {
      setResult(`✗ ${e}`);
    } finally { setBusy(false); }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  const TABLE_EXPORTS: { key: keyof import('@/db/bundleIO').ExportBundle['tables']; label: string; icon: string }[] = [
    { key: 'items',          label: 'Items',       icon: '⚔️'  },
    { key: 'spells',         label: 'Spells',      icon: '✨'  },
    { key: 'classes',        label: 'Classes',     icon: '📜'  },
    { key: 'subclasses',     label: 'Subclasses',  icon: '🌀'  },
    { key: 'feats',          label: 'Feats',       icon: '⭐'  },
    { key: 'species',        label: 'Species',     icon: '🧬'  },
    { key: 'backgrounds',    label: 'Backgrounds', icon: '📖'  },
    { key: 'features',       label: 'Features',    icon: '⚡'  },
    { key: 'itemProperties', label: 'Properties',  icon: '🏷️' },
    { key: 'conditions',     label: 'Conditions',  icon: '🩹'  },
  ];

  const tabBtn = (t: 'export' | 'import') => ({
    padding: '9px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400,
    color: tab === t ? 'var(--accent)' : 'var(--text-2)',
    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
    cursor: 'pointer',
  } as React.CSSProperties);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button style={tabBtn('export')} onClick={() => { setTab('export'); setResult(null); setImportResult(null); }}>
          📤 Export
        </button>
        <button style={tabBtn('import')} onClick={() => { setTab('import'); setResult(null); setImportResult(null); }}>
          📥 Import
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

            {/* Full DB export */}
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                Full Database
              </p>
              <button
                className="btn btn-primary"
                style={{ fontSize: 13 }}
                disabled={busy}
                onClick={handleExportAll}
              >
                {busy ? 'Exporting…' : '⬇ Export Everything'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>
                Exports all tables into a single .ttrpg.json file. Useful for backups or migrating to a new device.
              </p>
            </section>

            {/* Class bundles */}
            {classes.length > 0 && (
              <section>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                  Class Bundles
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>
                  Exports a class with all its subclasses and features — ideal for sharing homebrew classes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      className="btn btn-ghost"
                      style={{ justifyContent: 'flex-start', fontSize: 13 }}
                      disabled={busy}
                      onClick={() => handleExportClass(cls.id)}
                    >
                      📜 {cls.name}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-2)' }}>Export bundle</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Per-table exports */}
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                Individual Tables
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {TABLE_EXPORTS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    className="btn btn-ghost"
                    style={{ fontSize: 12, justifyContent: 'flex-start', gap: 6 }}
                    disabled={busy}
                    onClick={() => handleExportTable(key)}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </section>

            {result && (
              <p style={{
                fontSize: 12, padding: '8px 12px', borderRadius: 6,
                background: result.startsWith('✓') ? 'color-mix(in srgb, var(--accent-4) 15%, var(--bg-2))' : 'color-mix(in srgb, var(--accent-2) 15%, var(--bg-2))',
                color: result.startsWith('✓') ? 'var(--accent-4)' : 'var(--accent-2)',
                fontWeight: 600,
              }}>
                {result}
              </p>
            )}
          </div>
        )}

        {tab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Import a <code style={{ fontSize: 12, background: 'var(--bg-3)', padding: '1px 5px', borderRadius: 3 }}>.ttrpg.json</code> bundle.
              Records with matching IDs will be overwritten; new records are added.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '32px 20px',
                textAlign: 'center',
                background: dragOver ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-1))' : 'var(--bg-1)',
                transition: 'all 150ms',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('bundle-file-input')?.click()}
            >
              <p style={{ fontSize: 28, marginBottom: 8 }}>📥</p>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {busy ? 'Importing…' : 'Drop a .ttrpg.json file here'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>or click to browse</p>
              <input
                id="bundle-file-input"
                type="file"
                accept=".json,.ttrpg.json"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>

            {result && (
              <p style={{
                fontSize: 12, padding: '8px 12px', borderRadius: 6,
                background: 'color-mix(in srgb, var(--accent-2) 15%, var(--bg-2))',
                color: 'var(--accent-2)', fontWeight: 600,
              }}>
                {result}
              </p>
            )}

            {importResult && (
              <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                  ✓ Import complete
                </p>
                {Object.entries(importResult.counts).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Object.entries(importResult.counts).map(([table, count]) => (
                      <div key={table} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{table}</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-4)' }}>{count} records</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No records imported.</p>
                )}
                {importResult.errors.length > 0 && (
                  <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-2)', marginBottom: 6 }}>
                      Errors ({importResult.errors.length})
                    </p>
                    {importResult.errors.map((e, i) => (
                      <p key={i} style={{ fontSize: 11, color: 'var(--accent-2)', marginBottom: 2 }}>{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
