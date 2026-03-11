import { useCharacterStore } from '@/store/characterStore';

function Toggle({
  label, hint, checked, onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
      padding: '12px 14px',
      background: 'var(--bg-2)',
      borderRadius: 8,
      border: `1px solid ${checked ? 'color-mix(in srgb,var(--accent) 40%,var(--border))' : 'var(--border)'}`,
    }}>
      {/* Custom toggle pill */}
      <div style={{
        width: 42, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 1,
        background: checked ? 'var(--accent)' : 'var(--bg-3)',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        position: 'relative', transition: 'background 150ms',
      }}
        onClick={() => onChange(!checked)}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          transition: 'left 150ms',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{hint}</div>}
      </div>
    </label>
  );
}

export function ConfigSection() {
  const character = useCharacterStore(s => s.character)!;
  const { patchSheetConfig } = useCharacterStore();

  const config = character.sheetConfig ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Sheet Tabs ─────────────────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Sheet Tabs
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Toggle
            label="Hide Spells Tab"
            hint="Removes the Spells tab from the character sheet. Useful for non-spellcasting characters."
            checked={config.hideSpellsTab ?? false}
            onChange={v => patchSheetConfig({ hideSpellsTab: v || undefined })}
          />
        </div>
      </section>

      {/* ── Ability Scores Display ─────────────────────────── */}
      <section>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 10,
        }}>
          Ability Scores Display
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Toggle
            label="Show Modifiers as Primary"
            hint="Displays the modifier (e.g. +3) as the large number on each ability score, with the raw score shown smaller below."
            checked={config.showModsAsPrimary ?? false}
            onChange={v => patchSheetConfig({ showModsAsPrimary: v || undefined })}
          />
        </div>

        {/* Live preview */}
        <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 260 }}>
            {[
              { label: 'STR', score: 16, mod: '+3' },
              { label: 'DEX', score: 14, mod: '+2' },
              { label: 'CON', score: 15, mod: '+2' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-1)', borderRadius: 6, padding: '8px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
                  {config.showModsAsPrimary ? s.mod : s.score}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {config.showModsAsPrimary ? s.score : s.mod}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
