import { useState } from 'react';
import type { Background, SkillKey } from '@/types/game';
import { LabeledInput, LabeledTextarea, FormSection, FormRow } from '@/components/ui/FormField';
import { CheckboxGroup, TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

const ALL_SKILLS: SkillKey[] = ['acrobatics','animalHandling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleightOfHand','stealth','survival'];
const SKILL_LABELS: Record<SkillKey, string> = { acrobatics:'Acrobatics', animalHandling:'Animal Handling', arcana:'Arcana', athletics:'Athletics', deception:'Deception', history:'History', insight:'Insight', intimidation:'Intimidation', investigation:'Investigation', medicine:'Medicine', nature:'Nature', perception:'Perception', performance:'Performance', persuasion:'Persuasion', religion:'Religion', sleightOfHand:'Sleight of Hand', stealth:'Stealth', survival:'Survival' };
// Map display label → SkillKey
const LABEL_TO_SKILL = Object.fromEntries(ALL_SKILLS.map(s => [SKILL_LABELS[s], s])) as Record<string, SkillKey>;

const TOOL_SUGGESTIONS = ["Thieves' tools","Herbalism kit","Alchemist's supplies","Cartographer's tools","Disguise kit","Forgery kit","Gaming set","Musical instrument","Navigator's tools","Poisoner's kit","Smith's tools","Tinker's tools","Weaver's tools","Woodcarver's tools"];

interface BackgroundFormProps {
  initial?: Partial<Background>;
  onSave: (bg: Omit<Background, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function BackgroundForm({ initial, onSave, onCancel, isSaving }: BackgroundFormProps) {
  const [bg, setBg] = useState<Partial<Background>>(() => ({
    name: '', description: '', skillProficiencies: [], toolProficiencies: [], languages: 0, features: [],
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
        <LabeledInput label="Name" value={bg.name ?? ''} required placeholder="e.g. Acolyte"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })} />
        <LabeledTextarea label="Description" value={bg.description ?? ''} rows={3} placeholder="Brief description of this background…"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })} />
      </FormSection>

      <FormSection title="Proficiencies">
        <CheckboxGroup
          label="Skill Proficiencies (choose 2)"
          values={(bg.skillProficiencies ?? []).map(s => SKILL_LABELS[s])}
          onChange={(vals: string[]) => patch({ skillProficiencies: vals.map(v => LABEL_TO_SKILL[v]).filter(Boolean) })}
          options={ALL_SKILLS.map(s => SKILL_LABELS[s])}
          columns={2}
        />
        <TagInput
          label="Tool Proficiencies"
          values={bg.toolProficiencies ?? []}
          suggestions={TOOL_SUGGESTIONS}
          placeholder="e.g. Thieves' tools, Herbalism kit"
          onChange={(tools: string[]) => patch({ toolProficiencies: tools })}
        />
        <FormRow>
          <LabeledInput label="Bonus Languages" type="number" min={0} max={10}
            value={bg.languages ?? 0}
            hint="Number of extra languages the character learns"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ languages: Number(e.target.value) })} />
        </FormRow>
      </FormSection>

      <FormSection title="Features">
        <FeatureEditor features={bg.features ?? []}
          onChange={(features) => patch({ features })} />
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
