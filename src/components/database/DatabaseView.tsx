import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useItems, useSpells, useClasses, useFeats, useAllSpecies, useBackgrounds } from '@/hooks/useGameDatabase';
import { upsertItem, deleteItem, upsertSpell, deleteSpell, upsertClass, deleteClass, upsertFeat, deleteFeat, upsertSpecies, upsertBackground } from '@/db/gameDatabase';
import { elementalShaperClass } from '@/data/elementalShaper';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { ItemForm } from './forms/ItemForm';
import { SpellForm } from './forms/SpellForm';
import { ClassForm } from './forms/ClassForm';
import { FeatForm } from './forms/FeatForm';
import { SpeciesForm } from './forms/SpeciesForm';
import { BackgroundForm } from './forms/BackgroundForm';
import type { Item, Spell, GameClass, Feat, Species, Background } from '@/types/game';

type SectionKey = 'items' | 'spells' | 'classes' | 'feats' | 'species' | 'backgrounds' | 'features';

type EditTarget =
  | { type: 'items'; record?: Item }
  | { type: 'spells'; record?: Spell }
  | { type: 'classes'; record?: GameClass }
  | { type: 'feats'; record?: Feat }
  | { type: 'species'; record?: Species }
  | { type: 'backgrounds'; record?: Background };

export function DatabaseView() {
  const { databaseSection, setDatabaseSection, setView } = useUIStore();
  const items = useItems();
  const spells = useSpells();
  const classes = useClasses();
  const feats = useFeats();
  const species = useAllSpecies();
  const backgrounds = useBackgrounds();
  const features = useFeatures();

  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);

  async function seedElementalShaper() {
    if (!confirm('Add the Elemental Shaper class to the database?')) return;
    setSeeding(true);
    try {
      await upsertClass(elementalShaperClass);
      setDatabaseSection('classes');
    } finally {
      setSeeding(false);
    }
  }

  const sections = [
    { key: 'items' as const,       label: 'Items',       icon: '⚔️',  data: items },
    { key: 'spells' as const,      label: 'Spells',      icon: '✨',  data: spells },
    { key: 'classes' as const,     label: 'Classes',     icon: '📜',  data: classes },
    { key: 'feats' as const,       label: 'Feats',       icon: '⭐',  data: feats },
    { key: 'species' as const,     label: 'Species',     icon: '🧬',  data: species },
    { key: 'backgrounds' as const, label: 'Backgrounds', icon: '📖',  data: backgrounds },
    { key: 'features' as const,    label: 'Features',    icon: '⚡',  data: features },
  ];

  const active = sections.find(s => s.key === databaseSection)!;
  const q = search.toLowerCase();
  const filtered = (active.data ?? []).filter((e: { name: string }) => !q || e.name.toLowerCase().includes(q));

  // ── Save handlers ───────────────────────────────────────────

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
      else if (editing?.type === 'features') await upsertFeature({ ...(data as Omit<Feature,'id'>), id });
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(type: SectionKey, id: string) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    if (type === 'items')        await deleteItem(id);
    else if (type === 'spells')  await deleteSpell(id);
    else if (type === 'classes') await deleteClass(id);
    else if (type === 'feats')   await deleteFeat(id);
    else if (type === 'features') await deleteFeature(id);
  }

  // ── Panel title ─────────────────────────────────────────────

  function panelTitle() {
    const isEdit = !!editing?.record;
    const labels: Record<SectionKey, string> = { items:'Item', spells:'Spell', classes:'Class', feats:'Feat', species:'Species', backgrounds:'Background', features:'Feature' };
    return `${isEdit ? 'Edit' : 'New'} ${labels[editing?.type ?? 'items']}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => setView('home')} style={{ fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>Game Database</h1>
        {databaseSection === 'classes' && classes?.length === 0 && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12 }}
            onClick={seedElementalShaper}
            disabled={seeding}
            title="Add the Elemental Shaper as a starter class"
          >
            {seeding ? '…' : '🔥 Add Elemental Shaper'}
          </button>
        )}
        <button
          className="btn btn-primary"
          style={{ fontSize: 13 }}
          onClick={() => setEditing({ type: databaseSection })}
        >
          + New {active.label.slice(0, -1)}
        </button>
      </header>

      {/* Section tabs */}
      <nav style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', padding: '0 8px', flexShrink: 0 }}>
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => { setDatabaseSection(s.key); setSearch(''); }}
            style={{
              padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap',
              color: databaseSection === s.key ? 'var(--accent)' : 'var(--text-2)',
              borderBottom: databaseSection === s.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {s.icon} {s.label} ({s.data?.length ?? 0})
          </button>
        ))}
      </nav>

      {/* Search */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', flexShrink: 0 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${active.label.toLowerCase()}…`}
          style={{ margin: 0 }}
        />
      </div>

      {/* List */}
      <main style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '48px 0' }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>{active.icon}</p>
            {search ? (
              <p>No results for "{search}"</p>
            ) : (
              <>
                <p style={{ fontWeight: 600 }}>No {active.label.toLowerCase()} yet</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Click <strong>+ New {active.label.slice(0,-1)}</strong> to create one.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(filtered as unknown as Array<{ id: string; name: string; description?: string; [k: string]: unknown }>).map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                section={databaseSection}
                onEdit={() => setEditing({ type: databaseSection, record: entry as never })}
                onDelete={() => handleDelete(databaseSection, entry.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Slide panel with the right form */}
      <SlidePanel
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={panelTitle()}
      >
        {editing?.type === 'items' && (
          <ItemForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'spells' && (
          <SpellForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'classes' && (
          <ClassForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'feats' && (
          <FeatForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'species' && (
          <SpeciesForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'backgrounds' && (
          <BackgroundForm initial={editing.record} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />
        )}
        {editing?.type === 'features' && (
          <FeatureForm initial={editing.record as Partial<Feature>} onSave={handleSave} isSaving={isSaving} />
        )}
      </SlidePanel>
    </div>
  );
}

// ── Entry card ─────────────────────────────────────────────────

function EntryCard({
  entry,
  section,
  onEdit,
  onDelete,
}: {
  entry: { id: string; name: string; description?: string; [k: string]: unknown };
  section: SectionKey;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canDelete = ['items','spells','classes','feats'].includes(section);
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
        {canDelete && (
          <button onClick={onDelete} style={{ fontSize: 18, color: 'var(--accent-2)', lineHeight: 1, padding: '0 4px' }}>×</button>
        )}
      </div>
    </div>
  );
}

function entrySubtitle(entry: Record<string, unknown>, section: SectionKey): string {
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
  return '';
}
