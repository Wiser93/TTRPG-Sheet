import { useState, useEffect } from 'react';
import { useClasses, useFeatures } from '@/hooks/useGameDatabase';
import type { Subclass, ClassLevelEntry, Feature, Choice, ClassOverride } from '@/types/game';
import { LabeledInput, LabeledTextarea, FormSection } from '@/components/ui/FormField';
import { FeatureEditor } from '@/components/ui/FeatureEditor';
import { ChoiceEditor } from '@/components/ui/ChoiceEditor';

function blankLevel(level: number): ClassLevelEntry {
  return { level, features: [], resources: {} };
}

function blankSubclass(): Partial<Subclass> {
  return {
    name: '',
    description: '',
    parentClassId: '',
    chosenAtLevel: 3,
    levelEntries: Array.from({ length: 20 }, (_, i) => blankLevel(i + 1)),
    classOverrides: [],
  };
}

interface Props {
  initial?: Partial<Subclass>;
  onSave: (sc: Omit<Subclass, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SubclassForm({ initial, onSave, onCancel, isSaving }: Props) {
  const allClasses = useClasses() ?? [];
  const allFeatures = useFeatures() ?? [];

  const [sc, setSc] = useState<Partial<Subclass>>(() => {
    const base = blankSubclass();
    if (!initial) return base;
    const existing = initial.levelEntries ?? [];
    const levelEntries = Array.from({ length: 20 }, (_, i) =>
      existing.find(e => e.level === i + 1) ?? blankLevel(i + 1)
    );
    return { ...base, ...initial, levelEntries };
  });

  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  // Re-sync if initial changes (e.g. panel re-opened with a different record)
  useEffect(() => {
    if (!initial) return;
    const existing = initial.levelEntries ?? [];
    const levelEntries = Array.from({ length: 20 }, (_, i) =>
      existing.find(e => e.level === i + 1) ?? blankLevel(i + 1)
    );
    setSc({ ...blankSubclass(), ...initial, levelEntries });
  }, [initial?.id]);

  const patch = (changes: Partial<Subclass>) => setSc(prev => ({ ...prev, ...changes }));

  // ── Derive info from parent class ──────────────────────────
  const isCustom = sc.parentClassId === 'custom' || !sc.parentClassId;
  const parentClass = allClasses.find(c => c.id === sc.parentClassId);

  // Levels the parent class explicitly grants subclass feature slots
  const classSubclassLevels: number[] = (() => {
    if (!parentClass) return [3, 6, 7, 10, 11, 14, 15, 18]; // D&D defaults
    const levels: number[] = [];
    for (const le of parentClass.levelEntries ?? []) {
      const hasSubclassChoice = (le.choices ?? []).some(ch => ch.type === 'subclass');
      // Also include levels that are empty in the class — the subclass fills them
      const isSubclassSlot =
        hasSubclassChoice ||
        (le.features.length === 0 &&
          (le.featureRefs?.length ?? 0) === 0 &&
          (le.choices?.length ?? 0) === 0);
      if (isSubclassSlot) levels.push(le.level);
    }
    // Always include the first subclass choice level
    return levels.length > 0 ? levels : [3, 6, 7, 10, 11, 14, 15, 18];
  })();

  // Auto-derive chosenAtLevel from the first subclass choice in the parent class
  const derivedChosenAt = (() => {
    if (!parentClass) return sc.chosenAtLevel ?? 3;
    for (const le of parentClass.levelEntries ?? []) {
      if ((le.choices ?? []).some(ch => ch.type === 'subclass')) return le.level;
    }
    return 3;
  })();

  function updateLevel(level: number, features: Feature[]) {
    const updated = (sc.levelEntries ?? []).map(e => e.level === level ? { ...e, features } : e);
    patch({ levelEntries: updated });
  }

  function updateLevelFeatureRefs(level: number, refs: string[]) {
    const updated = (sc.levelEntries ?? []).map(e =>
      e.level === level ? { ...e, featureRefs: refs } : e
    );
    patch({ levelEntries: updated });
  }

  function updateLevelChoices(level: number, choices: Choice[]) {
    const updated = (sc.levelEntries ?? []).map(e => e.level === level ? { ...e, choices } : e);
    patch({ levelEntries: updated });
  }

  function updateOverride(index: number, patch_: Partial<ClassOverride>) {
    const overrides = [...(sc.classOverrides ?? [])];
    overrides[index] = { ...overrides[index], ...patch_ };
    patch({ classOverrides: overrides });
  }

  function removeOverride(index: number) {
    const overrides = (sc.classOverrides ?? []).filter((_, i) => i !== index);
    patch({ classOverrides: overrides });
  }

  function addOverride() {
    patch({ classOverrides: [...(sc.classOverrides ?? []), { type: 'path_max_tier', value: 1 }] });
  }

  function handleSubmit() {
    if (!sc.name?.trim()) return alert('Subclass name is required.');
    if (!sc.parentClassId) return alert('Parent class is required.');
    const levelEntries = (sc.levelEntries ?? []).map(e => ({
      ...e,
      features: e.features ?? [],
      featureRefs: e.featureRefs?.length ? e.featureRefs : undefined,
      choices: e.choices?.length ? e.choices : undefined,
    }));
    onSave({
      name: sc.name!.trim(),
      description: sc.description ?? '',
      parentClassId: sc.parentClassId!,
      chosenAtLevel: isCustom ? (sc.chosenAtLevel ?? 3) : derivedChosenAt,
      classOverrides: sc.classOverrides?.length ? sc.classOverrides : undefined,
      levelEntries,
    });
  }

  const levelsWithContent = new Set(
    (sc.levelEntries ?? [])
      .filter(e => e.features?.length || e.featureRefs?.length || e.choices?.length)
      .map(e => e.level)
  );

  const subclassLevelSet = new Set(classSubclassLevels);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Basic info */}
      <LabeledInput label="Subclass Name *" value={sc.name ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })}
        placeholder="e.g. Balance in All Things" />

      <LabeledTextarea label="Description" value={sc.description ?? ''} rows={3}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })}
        placeholder="Brief summary of the subclass fantasy and playstyle." />

      {/* Parent class + chosen at level */}
      <div style={{ display: 'grid', gridTemplateColumns: isCustom ? '1fr 1fr' : '1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
            Parent Class *
          </label>
          <select value={sc.parentClassId ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ parentClassId: e.target.value })}>
            <option value="">— Select class —</option>
            {allClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
            <option value="custom">Custom (manual)</option>
          </select>
        </div>
        {isCustom ? (
          <LabeledInput label="Chosen at Level" type="number" min={1} max={20}
            value={String(sc.chosenAtLevel ?? 3)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ chosenAtLevel: Number(e.target.value) })} />
        ) : (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 4 }}>
              Chosen at Level
            </p>
            <div style={{
              padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-2)', fontSize: 13, color: 'var(--text-1)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{derivedChosenAt}</span>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>— derived from {parentClass?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Class Overrides */}
      {sc.parentClassId && !isCustom && (
        <FormSection title="Class Overrides">
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
            Modifications this subclass applies to its parent class's mechanics — e.g. capping
            tiered feature advancement until a higher-level subclass feature lifts the restriction.
          </p>

          {(sc.classOverrides ?? []).length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>No overrides.</p>
          ) : (sc.classOverrides ?? []).map((ov, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px',
              background: 'var(--bg-2)', marginBottom: 6,
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <select value={ov.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateOverride(i, { type: e.target.value as ClassOverride['type'] })}>
                  <option value="path_max_tier">Tiered Feature — Max Tier Cap</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>cap at tier</label>
                  <input type="number" min={1} max={10} value={ov.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateOverride(i, { value: Number(e.target.value) })}
                    style={{ width: 60, margin: 0 }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={!ov.choiceIds}
                    onChange={e => updateOverride(i, { choiceIds: e.target.checked ? undefined : [] })}
                    style={{ accentColor: 'var(--accent)' }} />
                  All choices
                </label>
                <button onClick={() => removeOverride(i)}
                  style={{ color: 'var(--accent-2)', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ))}

          <button className="btn btn-ghost" style={{ fontSize: 12, marginTop: 4 }} onClick={addOverride}>
            + Add Override
          </button>
        </FormSection>
      )}

      {/* Level entries */}
      <FormSection title="Level Features">
        {parentClass ? (
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
            Highlighted levels ({classSubclassLevels.join(', ')}) are subclass feature slots
            for {parentClass.name}. You can add content to any level.
          </p>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
            Select a parent class above to see which levels are subclass feature slots.
          </p>
        )}

        {/* Level pill grid */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => {
            const hasContent = levelsWithContent.has(lvl);
            const isSubclassSlot = subclassLevelSet.has(lvl);
            const isExpanded = expandedLevel === lvl;
            return (
              <button key={lvl}
                onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 12, minWidth: 32,
                  background: hasContent
                    ? 'var(--accent)'
                    : isSubclassSlot ? 'color-mix(in srgb,var(--accent) 15%,var(--bg-2))' : 'var(--bg-1)',
                  color: hasContent ? '#fff' : isSubclassSlot ? 'var(--accent)' : 'var(--text-3)',
                  border: `1px solid ${isExpanded ? 'var(--accent)' : isSubclassSlot ? 'color-mix(in srgb,var(--accent) 40%,var(--border))' : 'var(--border)'}`,
                  fontWeight: hasContent || isSubclassSlot ? 600 : 400,
                }}>
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Expanded level editors — only show levels with content or currently expanded */}
        {(sc.levelEntries ?? [])
          .filter(e => levelsWithContent.has(e.level) || expandedLevel === e.level)
          .map(entry => {
            const isExpanded = expandedLevel === entry.level;
            const hasContent = levelsWithContent.has(entry.level);
            const isSubclassSlot = subclassLevelSet.has(entry.level);
            return (
              <div key={entry.level} style={{
                border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8,
                borderLeft: hasContent ? '3px solid var(--accent)'
                  : isSubclassSlot ? '3px solid color-mix(in srgb,var(--accent) 40%,var(--border))' : undefined,
              }}>
                <button
                  onClick={() => setExpandedLevel(isExpanded ? null : entry.level)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, minWidth: 60, color: isSubclassSlot ? 'var(--accent)' : 'var(--text-1)' }}>
                    Level {entry.level}
                    {isSubclassSlot && !hasContent && (
                      <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: 'var(--accent)', opacity: 0.7 }}>slot</span>
                    )}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>
                    {[
                      entry.features?.map(f => f.name).join(', '),
                      entry.featureRefs?.length ? `+${entry.featureRefs.length} ref(s)` : '',
                      entry.choices?.length ? `${entry.choices.length} choice(s)` : '',
                    ].filter(Boolean).join(' · ') || (isSubclassSlot ? 'Subclass feature slot — no content yet' : 'Empty')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Linked DB Features
                      </p>
                      <FeatureRefPicker
                        selected={entry.featureRefs ?? []}
                        allFeatures={allFeatures}
                        onChange={refs => updateLevelFeatureRefs(entry.level, refs)}
                      />
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Choices
                      </p>
                      <ChoiceEditor
                        choices={entry.choices ?? []}
                        onChange={choices => updateLevelChoices(entry.level, choices)}
                      />
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Inline Features
                      </p>
                      <FeatureEditor
                        features={entry.features ?? []}
                        onChange={features => updateLevel(entry.level, features)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </FormSection>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving} style={{ flex: 1 }}>
          {isSaving ? 'Saving…' : 'Save Subclass'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Feature ref picker ─────────────────────────────────────────

function FeatureRefPicker({
  selected, allFeatures, onChange,
}: {
  selected: string[];
  allFeatures: Feature[];
  onChange: (refs: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();
  const filtered = allFeatures.filter(f => !q || f.name.toLowerCase().includes(q));

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
                padding: '2px 8px', borderRadius: 12, fontSize: 12,
              }}>
                {feat?.name ?? id}
                <button onClick={() => toggle(id)} style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            );
          })}
        </div>
      )}
      <input value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="Search DB features to link…"
        style={{ marginBottom: 6, fontSize: 12 }} />
      <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.slice(0, 20).map(f => (
          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', padding: '2px 0' }}>
            <input type="checkbox" checked={selected.includes(f.id)}
              onChange={() => toggle(f.id)}
              style={{ accentColor: 'var(--accent)' }} />
            <span style={{ fontWeight: selected.includes(f.id) ? 600 : 400 }}>{f.name}</span>
            {f.tags?.length ? <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{f.tags.slice(0, 3).join(', ')}</span> : null}
          </label>
        ))}
      </div>
    </div>
  );
}
