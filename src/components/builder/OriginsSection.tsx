import { useCharacterStore } from '@/store/characterStore';
import { useAllSpecies, useBackgrounds } from '@/hooks/useGameDatabase';
import { ChoicePicker } from '@/components/sheet/ChoicePicker';
import type { Character } from '@/types/character';

interface Props { character: Character }

export function OriginsSection({ character }: Props) {
  const { setSpecies, setBackground, resolveBuilderChoice } = useCharacterStore();
  const allSpecies  = useAllSpecies()   ?? [];
  const allBackgrounds = useBackgrounds() ?? [];

  const activeSpecies     = allSpecies.find(s => s.id === character.speciesId);
  const activeBackground  = allBackgrounds.find(b => b.id === character.backgroundId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Species */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
          Your character's species determines base speed, size, and species features.
        </p>
        {allSpecies.length === 0 ? (
          <DbEmptyState label="species" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allSpecies.map(s => (
              <OriginCard
                key={s.id}
                name={s.name}
                description={s.description}
                subtitle={`${s.size} - Speed ${s.speed}ft${s.darkvision ? ` - Darkvision ${s.darkvision}ft` : ''}`}
                isSelected={character.speciesId === s.id}
                onSelect={() => setSpecies(character.speciesId === s.id ? undefined : s.id)}
              />
            ))}
          </div>
        )}

        {activeSpecies && (activeSpecies.creationChoices ?? []).length > 0 && (
          <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid var(--accent)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              {activeSpecies.name} Choices
            </p>
            {activeSpecies.creationChoices!.map(choice => (
              <ChoicePicker
                key={choice.id}
                choice={choice}
                resolved={character.speciesChoices.find(r => r.choiceId === choice.id)}
                context={{ sourceType: 'species', sourceId: activeSpecies.id }}
                onChange={r => resolveBuilderChoice(r, 'species')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
          Your background provides skill and tool proficiencies and a defining feature.
        </p>
        {allBackgrounds.length === 0 ? (
          <DbEmptyState label="backgrounds" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allBackgrounds.map(b => (
              <OriginCard
                key={b.id}
                name={b.name}
                description={b.description}
                subtitle={`Skills: ${(b.skillProficiencies ?? []).join(', ') || 'none'}${b.languages ? ` - +${b.languages} language${b.languages !== 1 ? 's' : ''}` : ''}`}
                isSelected={character.backgroundId === b.id}
                onSelect={() => setBackground(character.backgroundId === b.id ? undefined : b.id)}
              />
            ))}
          </div>
        )}

        {activeBackground && (activeBackground.creationChoices ?? []).length > 0 && (
          <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid var(--accent)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              {activeBackground.name} Choices
            </p>
            {activeBackground.creationChoices!.map(choice => (
              <ChoicePicker
                key={choice.id}
                choice={choice}
                resolved={character.backgroundChoices.find(r => r.choiceId === choice.id)}
                context={{ sourceType: 'background', sourceId: activeBackground.id }}
                onChange={r => resolveBuilderChoice(r, 'background')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OriginCard({ name, description, subtitle, isSelected, onSelect }: {
  name: string;
  description: string;
  subtitle: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
        background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, var(--bg-1))' : 'var(--bg-2)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8, textAlign: 'left', cursor: 'pointer', transition: 'all 120ms ease',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: isSelected ? 'var(--accent)' : 'transparent',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 3 }}>{subtitle}</div>
        {description && (
          <div style={{
            fontSize: 12, color: 'var(--text-2)',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

function DbEmptyState({ label }: { label: string }) {
  return (
    <div style={{
      padding: '20px 16px', background: 'var(--bg-2)',
      borderRadius: 8, border: '1px dashed var(--border)', textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No {label} in the database yet.</p>
      <p style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 4 }}>Go to Game Database to add some.</p>
    </div>
  );
}
