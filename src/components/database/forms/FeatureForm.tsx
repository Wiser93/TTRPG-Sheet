import { useState } from 'react';
import { LabeledInput, LabeledSelect, LabeledTextarea } from '@/components/ui/FormField';
import type { Feature, ActionType, StatKey } from '@/types/game';
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
                const defaults: Record<string, ResourceFormulaTerm> = {
                  flat:              { type: 'flat', value: 1 },
                  stat_mod:          { type: 'stat_mod', stat: 'wisdom' },
                  proficiency_bonus: { type: 'proficiency_bonus' },
                  class_level:       { type: 'class_level', classId: '' },
                  half_class_level:  { type: 'half_class_level', classId: '' },
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
              {i === 0 && <label style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class ID</label>}
              <input value={term.classId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { classId: e.target.value })}
                placeholder="e.g. elemental-shaper" />
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
