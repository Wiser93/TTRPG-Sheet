import { useCharacterStore } from '@/store/characterStore';

function Field({
  label, value, onChange, placeholder, multiline = false, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--text-2)',
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function BioSection() {
  const character = useCharacterStore(s => s.character)!;
  const { patchMeta, patchAppearance, patchBiography } = useCharacterStore();

  const meta = character.meta;
  const app  = character.appearance;
  const bio  = character.biography;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Identity ──────────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Identity
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Character Name"
            value={meta.name}
            onChange={v => patchMeta({ name: v })}
            placeholder="Enter a name…" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Player Name"
              value={meta.player ?? ''}
              onChange={v => patchMeta({ player: v || undefined })}
              placeholder="Your name" />
            <Field label="Campaign"
              value={meta.campaign ?? ''}
              onChange={v => patchMeta({ campaign: v || undefined })}
              placeholder="Campaign name" />
          </div>
          <Field label="Alignment"
            value={bio.alignment ?? ''}
            onChange={v => patchBiography({ alignment: v || undefined })}
            placeholder="e.g. Chaotic Good" />
        </div>
      </section>

      {/* ── Appearance ────────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Appearance
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Age"    value={app.age    ?? ''} onChange={v => patchAppearance({ age:    v || undefined })} placeholder="e.g. 27" />
            <Field label="Height" value={app.height ?? ''} onChange={v => patchAppearance({ height: v || undefined })} placeholder="e.g. 5ft 10in" />
            <Field label="Weight" value={app.weight ?? ''} onChange={v => patchAppearance({ weight: v || undefined })} placeholder="e.g. 160 lbs" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Eyes" value={app.eyes ?? ''} onChange={v => patchAppearance({ eyes: v || undefined })} placeholder="e.g. Green" />
            <Field label="Hair" value={app.hair ?? ''} onChange={v => patchAppearance({ hair: v || undefined })} placeholder="e.g. Black" />
            <Field label="Skin" value={app.skin ?? ''} onChange={v => patchAppearance({ skin: v || undefined })} placeholder="e.g. Tan" />
          </div>
          <Field label="Appearance & Physical Description"
            value={app.appearance ?? ''}
            onChange={v => patchAppearance({ appearance: v || undefined })}
            placeholder="Notable features, scars, tattoos, clothing style…"
            multiline rows={3} />
        </div>
      </section>

      {/* ── Personality ───────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Personality
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Personality Traits"
            value={bio.personality ?? ''}
            onChange={v => patchBiography({ personality: v || undefined })}
            placeholder="How your character acts, speaks, and interacts…"
            multiline rows={3} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Ideals"
              value={bio.ideals ?? ''}
              onChange={v => patchBiography({ ideals: v || undefined })}
              placeholder="What principles drive them?"
              multiline rows={3} />
            <Field label="Bonds"
              value={bio.bonds ?? ''}
              onChange={v => patchBiography({ bonds: v || undefined })}
              placeholder="Who or what do they care most about?"
              multiline rows={3} />
          </div>
          <Field label="Flaws"
            value={bio.flaws ?? ''}
            onChange={v => patchBiography({ flaws: v || undefined })}
            placeholder="Weaknesses, vices, fears, or compulsions…"
            multiline rows={2} />
        </div>
      </section>

      {/* ── Backstory ─────────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Backstory
        </p>
        <Field label="History"
          value={bio.backstory ?? ''}
          onChange={v => patchBiography({ backstory: v || undefined })}
          placeholder="Where did your character come from? What shaped them?"
          multiline rows={6} />
      </section>

      {/* ── Notes ─────────────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Notes
        </p>
        <Field label="Miscellaneous Notes"
          value={bio.notes ?? ''}
          onChange={v => patchBiography({ notes: v || undefined })}
          placeholder="House rules, reminders, session notes…"
          multiline rows={4} />
      </section>

    </div>
  );
}
