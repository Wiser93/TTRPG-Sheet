import { useCharacterStore } from '@/store/characterStore';

function ReadField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

function AppearanceRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

export function BioTab() {
  const character = useCharacterStore(s => s.character)!;
  const { patchBiography } = useCharacterStore();

  const meta = character.meta;
  const app  = character.appearance;
  const bio  = character.biography;

  const hasAppearancePhysical = app.age || app.height || app.weight || app.eyes || app.hair || app.skin;
  const hasPersonality = bio.personality || bio.ideals || bio.bonds || bio.flaws;
  const hasBackstory = bio.backstory;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Identity card ────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>{meta.name || 'Unnamed Character'}</h2>
            {(meta.player || meta.campaign) && (
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                {[meta.player && `Player: ${meta.player}`, meta.campaign && `Campaign: ${meta.campaign}`].filter(Boolean).join(' · ')}
              </p>
            )}
            {bio.alignment && (
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Alignment:</span> {bio.alignment}
              </p>
            )}
          </div>
          {/* Class / Level summary */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {character.classes.map(cls => (
              <div key={cls.classId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                Level {cls.level}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Appearance ───────────────────────────────────────── */}
      {(hasAppearancePhysical || app.appearance) && (
        <Section title="Appearance">
          {hasAppearancePhysical && (
            <div>
              <AppearanceRow label="Age"    value={app.age} />
              <AppearanceRow label="Height" value={app.height} />
              <AppearanceRow label="Weight" value={app.weight} />
              <AppearanceRow label="Eyes"   value={app.eyes} />
              <AppearanceRow label="Hair"   value={app.hair} />
              <AppearanceRow label="Skin"   value={app.skin} />
            </div>
          )}
          <ReadField label="Description" value={app.appearance} />
        </Section>
      )}

      {/* ── Personality ──────────────────────────────────────── */}
      {hasPersonality && (
        <Section title="Personality">
          <ReadField label="Traits"  value={bio.personality} />
          <ReadField label="Ideals"  value={bio.ideals} />
          <ReadField label="Bonds"   value={bio.bonds} />
          <ReadField label="Flaws"   value={bio.flaws} />
        </Section>
      )}

      {/* ── Backstory ────────────────────────────────────────── */}
      {hasBackstory && (
        <Section title="Backstory">
          <ReadField label="History" value={bio.backstory} />
        </Section>
      )}

      {/* ── Notes — editable inline ──────────────────────────── */}
      <Section title="Notes">
        <textarea
          value={bio.notes ?? ''}
          rows={6}
          onChange={e => patchBiography({ notes: e.target.value || undefined })}
          placeholder="Session notes, reminders, house rules…"
          style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
        />
      </Section>

      {/* Empty state */}
      {!hasAppearancePhysical && !app.appearance && !hasPersonality && !hasBackstory && (
        <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '48px 0' }}>
          <p style={{ fontSize: 36, marginBottom: 8 }}>📖</p>
          <p style={{ fontWeight: 600 }}>No bio information yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Fill in your character's story in the <strong>Builder → Bio</strong> tab.
          </p>
        </div>
      )}

    </div>
  );
}
