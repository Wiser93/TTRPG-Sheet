import React, { useState } from 'react';
import { LabeledInput, LabeledSelect, LabeledTextarea } from '@/components/ui/FormField';
import type { Feature, ActionType, StatKey, PathTier, Choice } from '@/types/game';
import { useClasses, useFeatures } from '@/hooks/useGameDatabase';
import type { ResourceFormulaTerm } from '@/types/character';

const ACTION_TYPE_OPTIONS = [
  { value: '',             label: '— None (informational) —' },
  { value: 'action',       label: 'Action' },
  { value: 'bonus_action', label: 'Bonus Action' },
  { value: 'reaction',     label: 'Reaction' },
  { value: 'passive',      label: 'Passive' },
];

const RECHARGE_OPTIONS = [
  { value: 'short_rest', label: 'Short Rest' },
  { value: 'long_rest',  label: 'Long Rest' },
  { value: 'dawn',       label: 'Dawn' },
  { value: 'never',      label: 'Never (single use)' },
];

const SOURCE_TYPE_OPTIONS = [
  { value: '',           label: '— None —' },
  { value: 'class',      label: 'Class' },
  { value: 'subclass',   label: 'Subclass' },
  { value: 'background', label: 'Background' },
  { value: 'feat',       label: 'Feat' },
  { value: 'species',    label: 'Species' },
];

const TERM_TYPE_OPTIONS = [
  { value: 'flat',             label: 'Flat number' },
  { value: 'stat_mod',         label: 'Stat modifier' },
  { value: 'proficiency_bonus',label: 'Proficiency bonus' },
  { value: 'class_level',      label: 'Class level' },
  { value: 'half_class_level', label: 'Half class level (rounded down)' },
  { value: 'total_level',      label: 'Total character level' },
];

const STAT_OPTIONS: { value: StatKey; label: string }[] = [
  { value: 'strength',     label: 'Strength' },
  { value: 'dexterity',    label: 'Dexterity' },
  { value: 'constitution', label: 'Constitution' },
  { value: 'intelligence', label: 'Intelligence' },
  { value: 'wisdom',       label: 'Wisdom' },
  { value: 'charisma',     label: 'Charisma' },
];

type Recharge = 'short_rest' | 'long_rest' | 'dawn' | 'never';

interface Props {
  initial?: Partial<Feature>;
  onSave: (feature: Omit<Feature, 'id'>) => void;
  isSaving?: boolean;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formulaPreview(terms: ResourceFormulaTerm[]): string {
  if (!terms.length) return 'always 1';
  return terms.map(t => {
    switch (t.type) {
      case 'flat':             return String(t.value);
      case 'stat_mod':         return `${t.stat.slice(0,3).toUpperCase()} mod`;
      case 'proficiency_bonus':return 'Prof';
      case 'class_level':      return `${t.classId ?? '?'} level`;
      case 'half_class_level': return `½ ${t.classId ?? '?'} level`;
      case 'total_level':      return 'total level';
      default:                 return '?';
    }
  }).join(' + ');
}

export function FeatureForm({ initial, onSave, isSaving }: Props) {
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [requiresText, setRequiresText] = useState((initial?.requiresResourceIds ?? []).join(', '));

  const [f, setF] = useState<Omit<Feature, 'id'>>({
    name:               initial?.name               ?? '',
    description:        initial?.description        ?? '',
    actionType:         initial?.actionType,
    cost:               initial?.cost               ?? '',
    tags:               initial?.tags               ?? [],
    trigger:            initial?.trigger,
    effect:             initial?.effect,
    grantHeroicInspiration: initial?.grantHeroicInspiration,
    sourceType:         initial?.sourceType,
    sourceId:           initial?.sourceId           ?? '',
    uses:               initial?.uses,
    isResource:         initial?.isResource         ?? false,
    resourceId:         initial?.resourceId         ?? '',
    resourceName:       initial?.resourceName       ?? '',
    resourceFormula:    initial?.resourceFormula     ?? [],
    resourceRecharge:   initial?.resourceRecharge   ?? 'long_rest',
    resourceMin:        initial?.resourceMin        ?? 1,
    combatResource:     initial?.combatResource     ?? false,
    requiresResourceIds:initial?.requiresResourceIds ?? [],
    // Path fields
    isPath:             initial?.isPath              ?? false,
    pathTiers:          (initial?.pathTiers          ?? []) as PathTier[],
    // Card fields
    isCard:             initial?.isCard              ?? false,
    cardTab:            initial?.cardTab             ?? 'combat',
    cardSelectionLabel: initial?.cardSelectionLabel  ?? '',
    cardOptionSource:   initial?.cardOptionSource    ?? undefined,
    cardOptions:        (initial?.cardOptions        ?? []) as Array<{ id: string; label: string; description?: string; color?: string; icon?: string }>,
  });

  function patch(changes: Partial<Omit<Feature, 'id'>>) {
    setF(prev => ({ ...prev, ...changes }));
  }

  function handleSave() {
    if (!f.name.trim()) return alert('Feature name is required.');
    onSave({
      ...f,
      trigger:             f.trigger?.trim()      || undefined,
      effect:              f.effect?.trim()       || undefined,
      grantHeroicInspiration: (f as {grantHeroicInspiration?: string}).grantHeroicInspiration || undefined,
      cost:                f.cost?.trim()         || undefined,
      sourceId:            f.sourceId?.trim()     || undefined,
      sourceType:          f.sourceType           || undefined,
      actionType:          (f.actionType || undefined) as ActionType | undefined,
      resourceId:          f.isResource ? (f.resourceId?.trim() || slugify(f.name)) : undefined,
      resourceName:        f.isResource && f.resourceName?.trim() ? f.resourceName.trim() : undefined,
      resourceFormula:     f.isResource && f.resourceFormula?.length ? f.resourceFormula : undefined,
      resourceRecharge:    f.isResource ? f.resourceRecharge : undefined,
      resourceMin:         f.isResource ? (f.resourceMin ?? 1) : undefined,
      combatResource:      f.isResource ? f.combatResource : undefined,
      requiresResourceIds: f.requiresResourceIds?.length ? f.requiresResourceIds : undefined,
      // Path fields
      isPath:             f.isPath || undefined,
      pathTiers:          (f.isPath && f.pathTiers?.length) ? f.pathTiers : undefined,
      // Card fields
      isCard:             f.isCard || undefined,
      cardTab:            f.isCard ? (f.cardTab ?? 'combat') : undefined,
      cardSelectionLabel: f.isCard && f.cardSelectionLabel?.trim() ? f.cardSelectionLabel.trim() : undefined,
      cardOptionSource:   f.isCard ? f.cardOptionSource ?? undefined : undefined,
      cardOptions:        (f.isCard && !f.cardOptionSource && f.cardOptions?.length) ? f.cardOptions : undefined,
    });
  }

  const resolvedId = f.isResource ? (f.resourceId?.trim() || slugify(f.name || 'feature')) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <LabeledInput label="Name *" value={f.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })}
        placeholder="e.g. Elemental Charges" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LabeledSelect label="Action Type" value={f.actionType ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            patch({ actionType: (e.target.value || undefined) as ActionType | undefined })}
          options={ACTION_TYPE_OPTIONS} />
        <LabeledInput label="Cost" value={f.cost ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ cost: e.target.value })}
          placeholder="e.g. 1 EC, 1 use, free" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LabeledInput label="Trigger (optional)" value={f.trigger ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ trigger: e.target.value || undefined })}
          placeholder="e.g. Long Rest, When hit" />
        <LabeledInput label="Effect (optional)" value={f.effect ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ effect: e.target.value || undefined })}
          placeholder="e.g. Gain Heroic Inspiration" />
      </div>

      {/* Grant Heroic Inspiration automation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox"
            checked={!!(f as {grantHeroicInspiration?: string}).grantHeroicInspiration}
            onChange={e => (patch as (c: object) => void)({ grantHeroicInspiration: e.target.checked ? 'long_rest' : undefined })}
            style={{ accentColor: 'var(--accent)' }} />
          <span>Automatically grant Heroic Inspiration</span>
        </label>
        {!!(f as {grantHeroicInspiration?: string}).grantHeroicInspiration && (
          <select value={(f as {grantHeroicInspiration?: string}).grantHeroicInspiration}
            onChange={e => (patch as (c: object) => void)({ grantHeroicInspiration: e.target.value })}
            style={{ fontSize: 12, flex: 1 }}>
            <option value="long_rest">on Long Rest</option>
            <option value="short_rest">on Short Rest</option>
          </select>
        )}
      </div>

      <LabeledTextarea label="Description" value={f.description} rows={4}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })}
        placeholder="What this feature does — trigger, effect, range, duration..." />

      {/* ── Resource Section ─────────────────────────────── */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: f.isResource ? 14 : 0 }}>
          <input type="checkbox" checked={f.isResource ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isResource: e.target.checked })}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>This feature grants a tracked resource</span>
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            (e.g. Elemental Charges, Ki Points, Rage)
          </span>
        </label>

        {f.isResource && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Identity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Resource ID *
                </label>
                <input
                  value={f.resourceId ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ resourceId: e.target.value })}
                  placeholder={slugify(f.name || 'my-resource')}
                />
                <p style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
                  Stable key used for cross-feature prerequisites.{' '}
                  {resolvedId && <span>Will use: <strong>{resolvedId}</strong></span>}
                </p>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Display Name Override
                </label>
                <input
                  value={f.resourceName ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ resourceName: e.target.value })}
                  placeholder={f.name || 'Leave blank to use feature name'}
                />
              </div>
            </div>

            {/* Formula builder */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                    Max Formula
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
                    All terms are summed. Preview: <strong style={{ color: 'var(--accent)' }}>{formulaPreview(f.resourceFormula ?? [])}</strong>
                  </p>
                </div>
                <LabeledInput label="Minimum max" type="number" min={0}
                  value={f.resourceMin ?? 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ resourceMin: Math.max(0, Number(e.target.value)) })} />
              </div>

              <FormulaBuilder
                terms={f.resourceFormula ?? []}
                onChange={resourceFormula => patch({ resourceFormula })}
              />
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                Tip: for Elemental Charges use <em>WIS mod + ½ [class] level</em>.
              </p>
            </div>

            {/* Recharge + combat toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
              <LabeledSelect label="Recharges on" value={f.resourceRecharge ?? 'long_rest'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  patch({ resourceRecharge: e.target.value as Recharge })}
                options={RECHARGE_OPTIONS} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 18 }}>
                <input type="checkbox" checked={f.combatResource ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ combatResource: e.target.checked })}
                  style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Combat resource</span>
                  <p style={{ fontSize: 11, color: 'var(--text-2)' }}>Shows as a prominent counter in the Combat tab</p>
                </div>
              </label>
            </div>

          </div>
        )}
      </div>

      {/* ── Card Section ─────────────────────────────────── */}
      <PathSection f={f} patch={patch} />

      <CardSection f={f} patch={patch} />

      {/* ── Prerequisites / cross-feature links ─────────── */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
          Requires Resource IDs
        </p>
        <input
          value={requiresText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequiresText(e.target.value)}
          onBlur={() => patch({ requiresResourceIds: requiresText.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="e.g. elemental-charges, ki-points  (comma-separated)"
        />
        <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
          Resource IDs this feature consumes. Used for grouping/display — e.g. techniques that cost Elemental Charges.
          {f.requiresResourceIds?.length ? <> Current: <strong>{f.requiresResourceIds.join(', ')}</strong></> : null}
        </p>
      </div>

      {/* ── Limited Uses ─────────────────────────────────── */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Limited Uses (optional)
        </p>
        {f.uses ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Max uses" type="number" min={1}
                value={f.uses.max.type === 'flat' ? String(f.uses.max.value) : '1'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patch({ uses: { ...f.uses!, max: { type: 'flat', value: Math.max(1, Number(e.target.value)) } } })} />
              <LabeledSelect label="Recharge on" value={f.uses.rechargeOn}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  patch({ uses: { ...f.uses!, rechargeOn: e.target.value as Recharge } })}
                options={RECHARGE_OPTIONS} />
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }}
              onClick={() => patch({ uses: undefined })}>
              Remove uses limit
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost" style={{ fontSize: 12 }}
            onClick={() => patch({ uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' } })}>
            + Add uses limit
          </button>
        )}
      </div>

      {/* ── Source & tags ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LabeledSelect label="Source type" value={f.sourceType ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            patch({ sourceType: (e.target.value || undefined) as Feature['sourceType'] })}
          options={SOURCE_TYPE_OPTIONS} />
        <LabeledInput label="Source ID (optional)" value={f.sourceId ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ sourceId: e.target.value })}
          placeholder="e.g. elemental-shaper" />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
          Tags (comma-separated)
        </label>
        <input
          value={tagsText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagsText(e.target.value)}
          onBlur={() => patch({ tags: tagsText.split(',').map(t => t.trim()).filter(Boolean) })}
          placeholder="e.g. water, reaction, elemental, combat"
        />
        <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
          Press Tab or click away to apply.{f.tags?.length ? ` Current: ${f.tags.join(', ')}` : ''}
        </p>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ marginTop: 4 }}>
        {isSaving ? 'Saving…' : 'Save Feature'}
      </button>
    </div>
  );
}

// ── Formula builder ──────────────────────────────────────────

function FormulaBuilder({ terms, onChange }: {
  terms: ResourceFormulaTerm[];
  onChange: (terms: ResourceFormulaTerm[]) => void;
}) {
  const allClasses = useClasses() ?? [];
  function add() {
    onChange([...terms, { type: 'flat', value: 1 }]);
  }
  function remove(i: number) {
    onChange(terms.filter((_, idx) => idx !== i));
  }
  function update(i: number, patch: Partial<ResourceFormulaTerm>) {
    onChange(terms.map((t, idx) => idx === i ? { ...t, ...patch } as ResourceFormulaTerm : t));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {terms.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>
          No terms — resource max will always equal the minimum (1 by default).
        </p>
      )}
      {terms.map((term, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {/* Term type */}
          <div style={{ flex: 2 }}>
            {i === 0 && <label style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Term type</label>}
            <select value={term.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const type = e.target.value as ResourceFormulaTerm['type'];
                // Build a valid default for the new type
                const firstClassId = allClasses[0]?.id ?? '';
                const defaults: Record<string, ResourceFormulaTerm> = {
                  flat:              { type: 'flat', value: 1 },
                  stat_mod:          { type: 'stat_mod', stat: 'wisdom' },
                  proficiency_bonus: { type: 'proficiency_bonus' },
                  class_level:       { type: 'class_level', classId: firstClassId },
                  half_class_level:  { type: 'half_class_level', classId: firstClassId },
                  total_level:       { type: 'total_level' },
                };
                onChange(terms.map((t, idx) => idx === i ? defaults[type] : t));
              }}>
              {TERM_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Term detail */}
          {term.type === 'flat' && (
            <div style={{ flex: 1 }}>
              {i === 0 && <label style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</label>}
              <input type="number" value={term.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { value: Number(e.target.value) })} />
            </div>
          )}
          {term.type === 'stat_mod' && (
            <div style={{ flex: 1 }}>
              {i === 0 && <label style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stat</label>}
              <select value={term.stat}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update(i, { stat: e.target.value as StatKey })}>
                {STAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          {(term.type === 'class_level' || term.type === 'half_class_level') && (
            <div style={{ flex: 1 }}>
              {i === 0 && <label style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</label>}
              {allClasses.length > 0 ? (
                <select value={term.classId ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update(i, { classId: e.target.value })}>
                  <option value="">— Select class —</option>
                  {allClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              ) : (
                <input value={term.classId ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { classId: e.target.value })}
                  placeholder="No classes in DB yet — type ID" />
              )}
            </div>
          )}
          {(term.type === 'proficiency_bonus' || term.type === 'total_level') && (
            <div style={{ flex: 1 }} />
          )}

          <button type="button" onClick={() => remove(i)}
            style={{ color: 'var(--accent-2)', fontSize: 18, lineHeight: 1, paddingBottom: 4, flexShrink: 0 }}>×</button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }} onClick={add}>
        + Add term
      </button>
    </div>
  );
}

// ── Card Section ─────────────────────────────────────────────

type CardState = { id: string; label: string; description?: string; color?: string; icon?: string };

function CardSection({ f, patch }: {
  f: Partial<Feature> & { isCard?: boolean; cardTab?: string; cardSelectionLabel?: string; cardOptionSource?: { choiceId?: string; pathBased?: boolean }; cardOptions?: CardState[] };
  patch: (changes: Partial<Feature & { isCard: boolean; cardTab: string; cardSelectionLabel: string; cardOptionSource?: { choiceId?: string; pathBased?: boolean }; cardOptions: CardState[] }>) => void;
}) {
  const [newOptId, setNewOptId] = React.useState('');
  const [newOptLabel, setNewOptLabel] = React.useState('');
  const [newOptColor, setNewOptColor] = React.useState('#61afef');
  const [newOptIcon, setNewOptIcon] = React.useState('');

  const options: CardState[] = f.cardOptions ?? [];
  const sourceMode: 'none' | 'path' | 'choice' = !f.cardOptionSource ? 'none' : (f.cardOptionSource as {pathBased?: boolean}).pathBased ? 'path' : 'choice';

  function addOption() {
    if (!newOptId.trim() || !newOptLabel.trim()) return;
    const next: CardState[] = [...options, {
      id: newOptId.trim().toLowerCase().replace(/\s+/g, '-'),
      label: newOptLabel.trim(),
      description: undefined,
      color: newOptColor || undefined,
      icon: newOptIcon.trim() || undefined,
    }];
    (patch as (c: object) => void)({ cardOptions: next });
    setNewOptId(''); setNewOptLabel(''); setNewOptColor('#61afef'); setNewOptIcon('');
  }

  function removeOption(id: string) {
    (patch as (c: object) => void)({ cardOptions: options.filter(o => o.id !== id) });
  }

  function updateOption(id: string, changes: Partial<CardState>) {
    (patch as (c: object) => void)({ cardOptions: options.map(o => o.id === id ? { ...o, ...changes } : o) });
  }

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      {/* Toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: f.isCard ? 14 : 0 }}>
        <input type="checkbox" checked={f.isCard ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => (patch as (c: object) => void)({ isCard: e.target.checked })}
          style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>This feature renders as an interactive card</span>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>(e.g. Elemental Embodiment)</span>
      </label>

      {f.isCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Tab placement */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                Appears on tab
              </label>
              <select value={f.cardTab ?? 'combat'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (patch as (c: object) => void)({ cardTab: e.target.value })}>
                <option value="combat">Combat</option>
                <option value="overview">Overview</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                Selection label (optional)
              </label>
              <input value={f.cardSelectionLabel ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => (patch as (c: object) => void)({ cardSelectionLabel: e.target.value })}
                placeholder="e.g. Choose an element to embody at the start of a rest." />
            </div>
          </div>

          {/* Option source toggle */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
              Card States / Options
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" checked={sourceMode === 'none'}
                  onChange={() => (patch as (c: object) => void)({ cardOptionSource: undefined })}
                  style={{ accentColor: 'var(--accent)' }} />
                Define states manually
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" checked={sourceMode === 'path'}
                  onChange={() => (patch as (c: object) => void)({ cardOptionSource: { pathBased: true } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Populate from tiered feature progress
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" checked={sourceMode === 'choice'}
                  onChange={() => (patch as (c: object) => void)({ cardOptionSource: { choiceId: '' } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Populate from a class choice
              </label>
            </div>

            {/* Path-based: shows whatever tiered features the character has unlocked */}
            {sourceMode === 'path' && (
              <p style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg-2)', borderRadius: 5, padding: '6px 10px' }}>
                Options will be the tiered feature paths the character has advanced (e.g. Water, Earth, Fire, Air).
                Color and icon come from the path feature definitions.
              </p>
            )}

            {/* From choice ID */}
            {sourceMode === 'choice' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Choice ID
                </label>
                <input
                  value={(f.cardOptionSource as {choiceId?: string})?.choiceId ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (patch as (c: object) => void)({ cardOptionSource: { choiceId: e.target.value } })}
                  placeholder="e.g. elemental_path" />
                <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                  Options will be drawn from whatever values the player has chosen in any class choice with this ID.
                  Color and icon come from the option definitions on that choice.
                </p>
              </div>
            )}

            {/* Manual states */}
            {sourceMode === 'none' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Existing options */}
                {options.map(opt => (
                  <div key={opt.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, padding: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: opt.color ?? 'var(--accent)', flexShrink: 0, border: '1px solid var(--border)' }} />
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{opt.icon} {opt.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>id: {opt.id}</span>
                      <button onClick={() => removeOption(opt.id)} style={{ color: 'var(--accent-2)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 60px', gap: 6 }}>
                      <input value={opt.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(opt.id, { label: e.target.value })}
                        placeholder="Label" style={{ fontSize: 12 }} />
                      <input value={opt.description ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(opt.id, { description: e.target.value || undefined })}
                        placeholder="Description (optional)" style={{ fontSize: 12 }} />
                      <input type="color" value={opt.color ?? '#61afef'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(opt.id, { color: e.target.value })}
                        style={{ height: 32, padding: 2, cursor: 'pointer' }} />
                      <input value={opt.icon ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(opt.id, { icon: e.target.value || undefined })}
                        placeholder="Icon" style={{ fontSize: 18, textAlign: 'center' }} />
                    </div>
                  </div>
                ))}

                {/* Add new option */}
                <div style={{ background: 'var(--bg-1)', border: '1px dashed var(--border)', borderRadius: 6, padding: 8 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>Add state</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 60px', gap: 6, marginBottom: 6 }}>
                    <input value={newOptId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOptId(e.target.value)}
                      placeholder="ID (e.g. water)" style={{ fontSize: 12 }} />
                    <input value={newOptLabel}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOptLabel(e.target.value)}
                      placeholder="Label (e.g. Water)" style={{ fontSize: 12 }} />
                    <input type="color" value={newOptColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOptColor(e.target.value)}
                      style={{ height: 32, padding: 2, cursor: 'pointer' }} />
                    <input value={newOptIcon}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOptIcon(e.target.value)}
                      placeholder="Icon" style={{ fontSize: 18, textAlign: 'center' }} />
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}
                    onClick={addOption}
                    disabled={!newOptId.trim() || !newOptLabel.trim()}>
                    + Add state
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {(options.length > 0 || sourceMode !== 'none') && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>Preview</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sourceMode !== 'none' ? (
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>
                    Options will appear here at runtime based on the card source setting.
                  </span>
                ) : options.map(opt => (
                  <span key={opt.id} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: opt.color ?? 'var(--accent)', color: '#fff',
                  }}>
                    {opt.icon} {opt.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Path Section ─────────────────────────────────────────────

function blankTier(tier: number): PathTier {
  return { tier, name: '', features: [], choices: [] };
}

function blankTierChoice(): Choice {
  return { id: crypto.randomUUID().slice(0, 8), label: '', type: 'custom_feature', count: 1, options: [] };
}

/** Compact searchable picker for DB features — used on tiers and tier choices */
function TierFeatureRefPicker({
  selected, onChange,
}: {
  selected: string[];
  onChange: (refs: string[]) => void;
}) {
  const allFeatures = useFeatures() ?? [];
  const [search, setSearch] = React.useState('');
  const q = search.toLowerCase();
  const filtered = allFeatures.filter(f => !q || f.name.toLowerCase().includes(q) || f.id.includes(q));

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  }

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {selected.map(id => {
            const feat = allFeatures.find(f => f.id === id);
            return (
              <span key={id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--accent)', color: '#fff',
                padding: '2px 8px', borderRadius: 12, fontSize: 11,
              }}>
                {feat?.name ?? id}
                <button onClick={() => toggle(id)} style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>×</button>
              </span>
            );
          })}
        </div>
      )}
      <input
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="Search DB features to link…"
        style={{ marginBottom: 4, fontSize: 12 }}
      />
      {search.length > 0 && (
        <div style={{ maxHeight: 100, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 5 }}>
          {filtered.slice(0, 15).map(f => (
            <label key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
              cursor: 'pointer', padding: '3px 8px',
              background: selected.includes(f.id) ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-1))' : 'transparent',
            }}>
              <input type="checkbox" checked={selected.includes(f.id)}
                onChange={() => toggle(f.id)}
                style={{ accentColor: 'var(--accent)' }} />
              <span style={{ flex: 1 }}>{f.name}</span>
              <span style={{ color: 'var(--text-2)', fontSize: 10 }}>{f.actionType ?? 'passive'}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '6px 8px', color: 'var(--text-2)', fontSize: 12 }}>No features found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function PathSection({ f, patch }: {
  f: Partial<Feature> & { isPath?: boolean; pathTiers?: PathTier[] };
  patch: (changes: object) => void;
}) {
  const tiers: PathTier[] = f.pathTiers ?? [];
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  function patchTier(tier: number, changes: Partial<PathTier>) {
    patch({ pathTiers: tiers.map(t => t.tier === tier ? { ...t, ...changes } : t) });
  }

  function addTier() {
    const next = (tiers[tiers.length - 1]?.tier ?? 0) + 1;
    if (next > 4) return;
    patch({ pathTiers: [...tiers, blankTier(next)] });
    setExpandedTier(next);
  }

  function removeTier(tier: number) {
    patch({ pathTiers: tiers.filter(t => t.tier !== tier) });
  }

  // Tier choice helpers
  function addChoiceToTier(tier: number) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    patchTier(tier, { choices: [...(t.choices ?? []), blankTierChoice()] });
  }

  function patchTierChoice(tier: number, idx: number, changes: Partial<Choice>) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    patchTier(tier, { choices: (t.choices ?? []).map((c, i) => i === idx ? { ...c, ...changes } : c) });
  }

  function removeTierChoice(tier: number, idx: number) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    patchTier(tier, { choices: (t.choices ?? []).filter((_, i) => i !== idx) });
  }

  function addOption(tier: number, ci: number) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    const choices = (t.choices ?? []).map((c, i) =>
      i === ci ? { ...c, options: [...(c.options ?? []), { id: '', label: '', description: '' }] } : c
    );
    patchTier(tier, { choices });
  }

  function patchOption(tier: number, ci: number, oi: number, changes: object) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    const choices = (t.choices ?? []).map((c, i) =>
      i === ci ? { ...c, options: (c.options ?? []).map((o, j) => j === oi ? { ...o, ...changes } : o) } : c
    );
    patchTier(tier, { choices });
  }

  function removeOption(tier: number, ci: number, oi: number) {
    const t = tiers.find(t2 => t2.tier === tier);
    if (!t) return;
    const choices = (t.choices ?? []).map((c, i) =>
      i === ci ? { ...c, options: (c.options ?? []).filter((_, j) => j !== oi) } : c
    );
    patchTier(tier, { choices });
  }

  const sectionLabel = (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: f.isPath ? 14 : 0 }}>
      <input type="checkbox" checked={f.isPath ?? false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isPath: e.target.checked })}
        style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
      <span style={{ fontWeight: 700, fontSize: 13 }}>This feature is a tiered path</span>
      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>(up to 4 tiers, each granting features and choices)</span>
    </label>
  );

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      {sectionLabel}

      {f.isPath && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {tiers.map(tier => {
            const isExpanded = expandedTier === tier.tier;
            const featureCount = (tier.features?.length ?? 0) + (tier.featureRefs?.length ?? 0);
            const choiceCount = tier.choices?.length ?? 0;

            return (
              <div key={tier.tier} style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
                {/* Tier header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-1)' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
                    color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{tier.tier}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>
                    {tier.name || <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>Unnamed tier</span>}
                  </span>
                  {featureCount > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4 }}>
                      {featureCount} feature{featureCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {choiceCount > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4 }}>
                      {choiceCount} choice{choiceCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => setExpandedTier(isExpanded ? null : tier.tier)}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                  <button onClick={() => removeTier(tier.tier)}
                    style={{ color: 'var(--accent-2)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
                </div>

                {isExpanded && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Tier name + description */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>
                          Tier Name *
                        </label>
                        <input value={tier.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchTier(tier.tier, { name: e.target.value })}
                          placeholder="e.g. Stillness, Current, Tide, Ocean" />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>
                          Tier Description
                        </label>
                        <input value={tier.description ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchTier(tier.tier, { description: e.target.value || undefined })}
                          placeholder="Optional flavour text" />
                      </div>
                    </div>

                    {/* Boost */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>
                        Boost — upgrade to earlier abilities at this tier
                      </label>
                      <textarea
                        value={tier.boostDescription ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patchTier(tier.tier, { boostDescription: e.target.value || undefined })}
                        rows={2}
                        placeholder="Describe what improves at this tier…"
                      />
                    </div>

                    {/* DB Feature Refs */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                        Linked DB Features — granted when this tier is reached
                      </label>
                      <TierFeatureRefPicker
                        selected={tier.featureRefs ?? []}
                        onChange={refs => patchTier(tier.tier, { featureRefs: refs.length ? refs : undefined })}
                      />
                    </div>

                    {/* Inline features */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                        Inline Features — defined directly on this tier
                      </label>
                      {(tier.features ?? []).map((feat, fi) => (
                        <div key={fi} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, marginBottom: 6 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                            <input value={feat.id}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                patchTier(tier.tier, { features: (tier.features ?? []).map((x, i) => i === fi ? { ...x, id: e.target.value } : x) })}
                              placeholder="Feature ID" style={{ fontSize: 12, flex: 1 }} />
                            <button onClick={() =>
                              patchTier(tier.tier, { features: (tier.features ?? []).filter((_, i) => i !== fi) })}
                              style={{ color: 'var(--accent-2)', fontSize: 16, padding: '0 4px' }}>×</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 4 }}>
                            <input value={feat.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                patchTier(tier.tier, { features: (tier.features ?? []).map((x, i) => i === fi ? { ...x, name: e.target.value } : x) })}
                              placeholder="Name" style={{ fontSize: 12 }} />
                            <input value={feat.cost ?? ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                patchTier(tier.tier, { features: (tier.features ?? []).map((x, i) => i === fi ? { ...x, cost: e.target.value || undefined } : x) })}
                              placeholder="Cost (e.g. 1 EC)" style={{ fontSize: 12 }} />
                          </div>
                          <textarea value={feat.description ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              patchTier(tier.tier, { features: (tier.features ?? []).map((x, i) => i === fi ? { ...x, description: e.target.value } : x) })}
                            rows={2} placeholder="Description…" style={{ fontSize: 12 }} />
                        </div>
                      ))}
                      <button className="btn btn-ghost" style={{ fontSize: 12 }}
                        onClick={() => patchTier(tier.tier, {
                          features: [...(tier.features ?? []), { id: '', name: '', description: '', actionType: 'action' as const }],
                        })}>
                        + Add inline feature
                      </button>
                    </div>

                    {/* Tier Choices */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                        Tier Choices
                      </label>
                      {(tier.choices ?? []).map((choice, ci) => (
                        <div key={ci} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, marginBottom: 8 }}>
                          {/* Choice header */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 50px auto', gap: 6, marginBottom: 8 }}>
                            <input value={choice.id}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchTierChoice(tier.tier, ci, { id: e.target.value })}
                              placeholder="Choice ID" style={{ fontSize: 12 }} />
                            <input value={choice.label}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchTierChoice(tier.tier, ci, { label: e.target.value })}
                              placeholder="Label (e.g. Water Augment Tier 2)" style={{ fontSize: 12 }} />
                            <input value={String(choice.count)} type="number" min={1}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchTierChoice(tier.tier, ci, { count: Number(e.target.value) })}
                              style={{ fontSize: 12 }} />
                            <button onClick={() => removeTierChoice(tier.tier, ci)}
                              style={{ color: 'var(--accent-2)', fontSize: 16, padding: '0 4px' }}>×</button>
                          </div>

                          {/* Linked DB features for this choice */}
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                              Linked DB Features (grant on selection)
                            </div>
                            <TierFeatureRefPicker
                              selected={(choice as Choice & { featureIds?: string[] }).featureIds ?? []}
                              onChange={refs => patchTierChoice(tier.tier, ci, { featureIds: refs.length ? refs : undefined } as Partial<Choice>)}
                            />
                          </div>

                          {/* Manual options */}
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                            Static Options
                          </div>
                          {(choice.options ?? []).map((opt, oi) => (
                            <div key={oi} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr auto', gap: 4, marginBottom: 4 }}>
                              <input value={opt.id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchOption(tier.tier, ci, oi, { id: e.target.value })}
                                placeholder="ID" style={{ fontSize: 11 }} />
                              <input value={opt.label}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchOption(tier.tier, ci, oi, { label: e.target.value })}
                                placeholder="Label" style={{ fontSize: 11 }} />
                              <input value={opt.description ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchOption(tier.tier, ci, oi, { description: e.target.value || undefined })}
                                placeholder="Description" style={{ fontSize: 11 }} />
                              <button onClick={() => removeOption(tier.tier, ci, oi)}
                                style={{ color: 'var(--accent-2)', fontSize: 14, padding: '0 4px' }}>×</button>
                            </div>
                          ))}
                          <button className="btn btn-ghost" style={{ fontSize: 11 }}
                            onClick={() => addOption(tier.tier, ci)}>
                            + Add static option
                          </button>
                        </div>
                      ))}
                      <button className="btn btn-ghost" style={{ fontSize: 12 }}
                        onClick={() => addChoiceToTier(tier.tier)}>
                        + Add tier choice
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {tiers.length < 4 && (
            <button className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }}
              onClick={addTier}>
              + Add Tier {tiers.length + 1}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
