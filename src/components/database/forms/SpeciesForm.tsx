import { useState } from 'react';
import type { Species, SkillKey } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { FeatureEditor } from '@/components/ui/FeatureEditor';
import { ChoiceEditor } from '@/components/ui/ChoiceEditor';

interface SpeciesFormProps {
  initial?: Partial<Species>;
  onSave: (species: Omit<Species, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SpeciesForm({ initial, onSave, onCancel, isSaving }: SpeciesFormProps) {
  const [species, setSpecies] = useState<Partial<Species>>(() => ({
    name: '', description: '', size: 'medium', speed: 30, darkvision: 0,
    features: [], extraSpeeds: [], creationChoices: [],
    skillProficiencies: [], armorProficiencies: [], weaponProficiencies: [], toolProficiencies: [],
    ...initial,
  }));

  const patch = (changes: Partial<Species>) => setSpecies(prev => ({ ...prev, ...changes }));

  function addExtraSpeed() {
    patch({ extraSpeeds: [...(species.extraSpeeds ?? []), { type: 'fly', value: 30 }] });
  }
  function removeExtraSpeed(idx: number) {
    patch({ extraSpeeds: (species.extraSpeeds ?? []).filter((_, i) => i !== idx) });
  }
  function updateExtraSpeed(idx: number, changes: Partial<{ type: string; value: number }>) {
    const updated = [...(species.extraSpeeds ?? [])];
    updated[idx] = { ...updated[idx], ...changes };
    patch({ extraSpeeds: updated });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!species.name?.trim()) return;
    onSave({
      name: species.name!.trim(),
      description: species.description ?? '',
      size: species.size ?? 'medium',
      speed: species.speed ?? 30,
      darkvision: species.darkvision ?? 0,
      extraSpeeds: species.extraSpeeds?.length ? species.extraSpeeds : undefined,
      features: species.features ?? [],
      creationChoices: species.creationChoices?.length ? species.creationChoices : undefined,
      skillProficiencies: species.skillProficiencies?.length ? species.skillProficiencies as SkillKey[] : undefined,
      armorProficiencies: species.armorProficiencies?.length ? species.armorProficiencies : undefined,
      weaponProficiencies: species.weaponProficiencies?.length ? species.weaponProficiencies : undefined,
      toolProficiencies: species.toolProficiencies?.length ? species.toolProficiencies : undefined,
      languages: species.languages ?? undefined,
      featIds: species.featIds?.length ? species.featIds : undefined,
      innateSpellIds: species.innateSpellIds?.length ? species.innateSpellIds : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormSection title="Identity">
        <LabeledInput label="Name" value={species.name ?? ''} required placeholder="e.g. Human"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })} />
        <LabeledTextarea label="Description" value={species.description ?? ''} rows={3} placeholder="Brief description…"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })} />
      </FormSection>

      <FormSection title="Physical Traits">
        <FormRow cols={3}>
          <LabeledSelect label="Size" value={species.size ?? 'medium'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ size: e.target.value as Species['size'] })}
            options={['tiny','small','medium','large','huge','gargantuan'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
          <LabeledInput label="Walking Speed (ft)" type="number" min={0} step={5} value={species.speed ?? 30}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ speed: Number(e.target.value) })} />
          <LabeledInput label="Darkvision (ft, 0=none)" type="number" min={0} step={30} value={species.darkvision ?? 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ darkvision: Number(e.target.value) })} />
        </FormRow>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 6 }}>Extra Speeds</p>
          {(species.extraSpeeds ?? []).map((es, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <input value={es.type}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExtraSpeed(idx, { type: e.target.value })}
                  placeholder="Type (e.g. fly, swim, climb)" />
              </div>
              <div style={{ width: 80 }}>
                <input type="number" value={es.value} min={0} step={5}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExtraSpeed(idx, { value: Number(e.target.value) })} />
              </div>
              <button type="button" onClick={() => removeExtraSpeed(idx)}
                style={{ color: 'var(--accent-2)', fontSize: 18, lineHeight: 1, paddingBottom: 4 }}>×</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={addExtraSpeed}>
            + Add Speed Type
          </button>
        </div>
      </FormSection>

      <FormSection title="Fixed Proficiencies">
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
          These are granted automatically to every character of this species.
          For player choice (e.g. "one skill of your choice"), use Creation Choices below.
        </p>
        <ProfListInput label="Skill Proficiencies (comma-separated)"
          initialValue={(species.skillProficiencies ?? []).join(', ')}
          onChange={v => patch({ skillProficiencies: v.split(',').map(s => s.trim()).filter(Boolean) as SkillKey[] })} />
        <ProfListInput label="Armor Proficiencies"
          initialValue={(species.armorProficiencies ?? []).join(', ')}
          onChange={v => patch({ armorProficiencies: v.split(',').map(s => s.trim()).filter(Boolean) })} />
        <ProfListInput label="Weapon Proficiencies"
          initialValue={(species.weaponProficiencies ?? []).join(', ')}
          onChange={v => patch({ weaponProficiencies: v.split(',').map(s => s.trim()).filter(Boolean) })} />
        <ProfListInput label="Tool Proficiencies"
          initialValue={(species.toolProficiencies ?? []).join(', ')}
          onChange={v => patch({ toolProficiencies: v.split(',').map(s => s.trim()).filter(Boolean) })} />
        <LabeledInput label="Bonus Languages (number of free picks)"
          type="number" min={0}
          value={typeof species.languages === 'number' ? species.languages : 0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ languages: Number(e.target.value) || undefined })} />
      </FormSection>

      <FormSection title="Racial Features">
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
          Inline features defined directly on this species. You can also link DB features via Creation Choices below.
        </p>
        <FeatureEditor features={species.features ?? []}
          onChange={(features) => patch({ features })} />
      </FormSection>

      <FormSection title="Creation Choices">
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
          Choices the player makes when selecting this species — e.g. "choose one skill" or "choose an origin feat".
          Use <strong>Populate from database</strong> → <strong>Features</strong> or <strong>Feats</strong> with a tag filter for broad picks.
          Use <strong>Skill Proficiency</strong> type for open skill selection.
        </p>
        <ChoiceEditor
          choices={species.creationChoices ?? []}
          onChange={choices => patch({ creationChoices: choices })}
        />
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !species.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Species'}
        </button>
      </div>
    </form>
  );
}

// ── Proficiency list input (local string state so commas work) ─

function ProfListInput({ label, initialValue, onChange }: {
  label: string;
  initialValue: string;
  onChange: (v: string) => void;
}) {
  const [val, setVal] = useState(initialValue);
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <input
        value={val}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
        onBlur={() => onChange(val)}
        placeholder="e.g. perception, stealth"
      />
    </div>
  );
}
