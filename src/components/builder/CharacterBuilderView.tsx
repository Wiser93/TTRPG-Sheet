import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useCharacter } from '@/hooks/useCharacter';
import { StatsSection } from './StatsSection';
import { OriginsSection } from './OriginsSection';
import { ClassSection } from './ClassSection';
import { ProficiencySection } from './ProficiencySection';
import { BioSection } from './BioSection';

type BuilderSection = 'stats' | 'origins' | 'classes' | 'profs' | 'bio';

const SECTIONS: { key: BuilderSection; label: string; icon: string; hint: string }[] = [
  { key: 'stats',   label: 'Ability Scores', icon: '🎲', hint: 'Set your six base stats' },
  { key: 'origins', label: 'Origins',        icon: '🌿', hint: 'Species & background' },
  { key: 'classes', label: 'Classes',        icon: '📜', hint: 'Levels, features & HP' },
  { key: 'profs',   label: 'Proficiencies',  icon: '🛡', hint: 'Skills, armor, weapons, tools' },
  { key: 'bio',     label: 'Bio',            icon: '📖', hint: 'Name, appearance & backstory' },
];

export function CharacterBuilderView() {
  const { activeCharacterId, openCharacter } = useUIStore();
  const { character, derived, isLoaded } = useCharacter(activeCharacterId);
  const [activeSection, setActiveSection] = useState<BuilderSection>('classes');

  if (!isLoaded || !character || !derived) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <p style={{ color: 'var(--text-2)' }}>Loading...</p>
      </div>
    );
  }

  const totalLevel = character.classes.reduce((sum: number, c) => sum + c.level, 0);
  const currentSection = SECTIONS.find(s => s.key === activeSection)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg-0)' }}>
      <header style={{
        background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => openCharacter(activeCharacterId!)} style={{ fontSize: 20, lineHeight: 1 }} title="Back to sheet">
          <span>&#8592;</span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 17, fontWeight: 700 }}>{character.meta.name}</h1>
          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {'Character Builder'}
            {totalLevel > 0 ? ` - Level ${totalLevel}` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.06em' }}>MAX HP</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-4)', lineHeight: 1.1 }}>
            {derived.maxHP}
          </div>
        </div>
      </header>

      <div style={{
        background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
        display: 'flex', flexShrink: 0,
      }}>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            style={{
              flex: 1, padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              fontSize: 11, whiteSpace: 'nowrap',
              color: activeSection === s.key ? 'var(--accent)' : 'var(--text-2)',
              borderBottom: activeSection === s.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{currentSection.label}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{currentSection.hint}</p>
        </div>
        {activeSection === 'stats'   && <StatsSection stats={character.stats.base} />}
        {activeSection === 'origins' && <OriginsSection character={character} />}
        {activeSection === 'classes' && <ClassSection character={character} derivedMaxHP={derived.maxHP} />}
        {activeSection === 'profs'   && <ProficiencySection character={character} />}
        {activeSection === 'bio'     && <BioSection />}
      </main>

      <div style={{
        background: 'var(--bg-1)', borderTop: '1px solid var(--border)',
        padding: '10px 16px', flexShrink: 0,
      }}>
        <SummaryBar
          totalLevel={totalLevel}
          maxHP={derived.maxHP}
          speciesId={character.speciesId}
          backgroundId={character.backgroundId}
        />
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 10, padding: '12px 0', fontSize: 15, fontWeight: 700 }}
          onClick={() => openCharacter(activeCharacterId!)}
        >
          Done - Return to Sheet
        </button>
      </div>
    </div>
  );
}

function SummaryBar({ totalLevel, maxHP, speciesId, backgroundId }: {
  totalLevel: number;
  maxHP: number;
  speciesId?: string;
  backgroundId?: string;
}) {
  const chips: { label: string; warn: boolean }[] = [
    { label: totalLevel > 0 ? `Level ${totalLevel}` : 'No class', warn: totalLevel === 0 },
    { label: speciesId    ? 'Species set'    : 'No species',     warn: !speciesId },
    { label: backgroundId ? 'Background set' : 'No background',  warn: !backgroundId },
    { label: `HP ${maxHP}`,                                       warn: maxHP === 0 },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {chips.map(({ label, warn }) => (
        <span
          key={label}
          style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 12,
            background: warn ? 'color-mix(in srgb, var(--accent-2) 15%, var(--bg-2))' : 'var(--bg-2)',
            border: `1px solid ${warn ? 'var(--accent-2)' : 'var(--border)'}`,
            color: warn ? 'var(--accent-2)' : 'var(--text-1)',
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
