import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import { createCharacter, deleteCharacter } from '@/db/characterDatabase';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';

export function HomeView() {
  const { openCharacter, setView } = useUIStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const characters = useLiveQuery(
    () => db.characters.filter(c => !c.deletedAt).sortBy('meta.updatedAt'),
    []
  );

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const c = await createCharacter(newName.trim());
      openCharacter(c.id);
    } finally {
      setCreating(false);
      setNewName('');
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Characters</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
          Your characters are stored locally on this device.
        </p>
      </header>

      {/* Create new */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="label" style={{ marginBottom: 8 }}>New Character</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Character name…"
          />
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Character list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {characters?.reverse().map(c => (
          <div
            key={c.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div
              onClick={() => openCharacter(c.id)}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-3)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0, cursor: 'pointer',
              }}
            >
              {c.meta.portrait ? (
                <img src={c.meta.portrait} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : '🧙'}
            </div>
            <div
              onClick={() => openCharacter(c.id)}
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>{c.meta.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                {c.classes.length > 0
                  ? c.classes.map(cl => `Lvl ${cl.level}`).join(' / ')
                  : 'No class yet'}
                {c.meta.campaign ? ` · ${c.meta.campaign}` : ''}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', flexShrink: 0 }}>
              {new Date(c.meta.updatedAt).toLocaleDateString()}
            </div>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm(`Delete "${c.meta.name}"? This cannot be undone.`)) return;
                await deleteCharacter(c.id);
              }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                color: 'var(--accent-2)', fontSize: 16, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'pointer',
              }}
              title="Delete character"
            >
              ×
            </button>
          </div>
        ))}

        {characters?.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '32px 0' }}>
            No characters yet. Create one above!
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ marginTop: 32, display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" onClick={() => setView('database')}>
          📚 Game Database
        </button>
      </div>
    </div>
  );
}
