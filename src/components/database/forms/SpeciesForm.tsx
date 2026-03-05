import { useState } from 'react';
import type { Species } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

interface SpeciesFormProps {
  initial?: Partial<Species>;
  onSave: (species: Omit<Species, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SpeciesForm({ initial, onSave, onCancel, isSaving }: SpeciesFormProps) {
  const [species, setSpecies] = useState<Partial<Species>>(() => ({
    name: '', description: '', size: 'medium', speed: 30, darkvision: 0, features: [], extraSpeeds: [],
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
      creationChoices: species.creationChoices ?? [],
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormSection title="Identity">
        <LabeledInput label="Name" value={species.name ?? ''} required placeholder="e.g. High Elf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })} />
        <LabeledTextarea label="Description" value={species.description ?? ''} rows={3} placeholder="Brief description of this species…"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })} />
      </FormSection>

      <FormSection title="Traits">
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

      <FormSection title="Racial Features">
        <FeatureEditor features={species.features ?? []}
          onChange={(features) => patch({ features })} />
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
