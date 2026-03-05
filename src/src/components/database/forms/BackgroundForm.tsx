import { useState } from 'react';
import type { Background, SkillKey } from '@/types/game';
import { LabeledInput, LabeledTextarea, FormSection, FormRow } from '@/components/ui/FormField';
import { CheckboxGroup, TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

const ALL_SKILLS: SkillKey[] = [
  'acrobatics','animalHandling','arcana','athletics','deception','history',
  'insight','intimidation','investigation','medicine','nature','perception',
  'performance','persuasion','religion','sleightOfHand','stealth','survival',
];

const SKILL_LABELS: Record<SkillKey, string> = {
  acrobatics:'Acrobatics', animalHandling:'Animal Handling', arcana:'Arcana',
  athletics:'Athletics', deception:'Deception', history:'History', insight:'Insight',
  intimidation:'Intimidation', investigation:'Investigation', medicine:'Medicine',
  nature:'Nature', perception:'Perception', performance:'Performance', persuasion:'Persuasion',
  religion:'Religion', sleightOfHand:'Sleight of Hand', stealth:'Stealth', survival:'Survival',
};

interface BackgroundFormProps {
  initial?: Partial<Background>;
  onSave: (bg: Omit<Background, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function BackgroundForm({ initial, onSave, onCancel, isSaving }: BackgroundFormProps) {
  const [bg, setBg] = useState<Partial<Background>>(() => ({
    name: '',
    description: '',
    skillProficiencies: [],
    toolProficiencies: [],
    languages: 0,
    features: [],
    ...initial,
  }));

  const patch = (changes: Partial<Background>) => setBg(prev => ({ ...prev, ...changes }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bg.name?.trim()) return;
    onSave({
      name: bg.name!.trim(),
      description: bg.description ?? '',
      skillProficiencies: bg.skillProficiencies ?? [],
      toolProficiencies: bg.toolProficiencies?.length ? bg.toolProficiencies : undefined,
      languages: bg.languages ?? 0,
      features: bg.features ?? [],
      creationChoices: [],
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormSection title="Identity">
        <LabeledInput label="Name" value={bg.name ?? ''} onChange={e => patch({ name: e.target.value })} required placeholder="e.g. Acolyte" />
        <LabeledTextarea label="Description" value={bg.description ?? ''} rows={3}
          onChange={e => patch({ description: e.target.value })} placeholder="Brief description of this background…" />
      </FormSection>

      <FormSection title="Proficiencies">
        <CheckboxGroup
          label="Skill Proficiencies (choose 2)"
          values={bg.skillProficiencies ?? []}
          onChange={skills => patch({ skillProficiencies: skills as SkillKey[] })}
          options={ALL_SKILLS.map(s => SKILL_LABELS[s])}
          columns={2}
        />
        {/* Map display labels back to keys */}
        <TagInput
          label="Tool Proficiencies"
          values={bg.toolProficiencies ?? []}
          onChange={tools => patch({ toolProficiencies: tools })}
          placeholder="e.g. Thieves' tools, Herbalism kit"
          suggestions={["Thieves' tools","Herbalism kit","Alchemist's supplies","Cartographer's tools","Disguise kit","Forgery kit","Gaming set","Musical instrument","Navigator's tools","Poisoner's kit","Smith's tools","Tinker's tools","Weaver's tools","Woodcarver's tools"]}
        />
        <FormRow>
          <LabeledInput label="Bonus Languages" type="number" min={0} max={10}
            value={bg.languages ?? 0} onChange={e => patch({ languages: Number(e.target.value) })}
            hint="Number of extra languages the character learns" />
        </FormRow>
      </FormSection>

      <FormSection title="Features">
        <FeatureEditor features={bg.features ?? []} onChange={features => patch({ features })} />
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !bg.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Background'}
        </button>
      </div>
    </form>
  );
}
