import { useUIStore } from '@/store/uiStore';
import { useItems, useSpells, useClasses, useFeats, useAllSpecies, useBackgrounds } from '@/hooks/useGameDatabase';

export function DatabaseView() {
  const { databaseSection, setDatabaseSection, setView } = useUIStore();
  const items = useItems();
  const spells = useSpells();
  const classes = useClasses();
  const feats = useFeats();
  const species = useAllSpecies();
  const backgrounds = useBackgrounds();

  const sections = [
    { key: 'items' as const,       label: 'Items',       icon: '⚔️',  data: items },
    { key: 'spells' as const,      label: 'Spells',      icon: '✨',  data: spells },
    { key: 'classes' as const,     label: 'Classes',     icon: '📜',  data: classes },
    { key: 'feats' as const,       label: 'Feats',       icon: '⭐',  data: feats },
    { key: 'species' as const,     label: 'Species',     icon: '🧬',  data: species },
    { key: 'backgrounds' as const, label: 'Backgrounds', icon: '📖',  data: backgrounds },
  ];

  const active = sections.find(s => s.key === databaseSection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <header style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button onClick={() => setView('home')} style={{ fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Game Database</h1>
      </header>

      {/* Section tabs */}
      <nav style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        overflowX: 'auto',
        padding: '0 8px',
      }}>
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setDatabaseSection(s.key)}
            style={{
              padding: '10px 12px',
              fontSize: 12,
              whiteSpace: 'nowrap',
              color: databaseSection === s.key ? 'var(--accent)' : 'var(--text-2)',
              borderBottom: databaseSection === s.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {s.icon} {s.label} ({s.data?.length ?? 0})
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {active && (
          <>
            {active.data?.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '48px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>{active.icon}</p>
                <p>No {active.label.toLowerCase()} in the database yet.</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>
                  Import a content pack or create entries manually.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {active.data?.map((entry: { id: string; name: string; description?: string }) => (
                  <div key={entry.id} className="card">
                    <div style={{ fontWeight: 600 }}>{entry.name}</div>
                    {entry.description && (
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                        {entry.description.slice(0, 120)}{entry.description.length > 120 ? '…' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
