import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import { createCharacter, deleteCharacter } from '@/db/characterDatabase';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { syncAll, getSyncStatus, onSyncStatusChange } from '@/sync/supabase';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { CampaignPanel } from '@/components/campaign/CampaignPanel';

function useSyncStatus() {
  return useSyncExternalStore(onSyncStatusChange, getSyncStatus);
}

export function HomeView() {
  const { openCharacter, setView } = useUIStore();
  const { user, signOut } = useAuthStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const syncStatus = useSyncStatus();

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

  async function handleSync() {
    if (!user || syncing) return;
    setSyncing(true); setSyncMsg(null);
    try {
      const result = await syncAll();
      const parts = [];
      if (result.pushed) parts.push(`↑ ${result.pushed} pushed`);
      if (result.pulled) parts.push(`↓ ${result.pulled} pulled`);
      if (!parts.length) parts.push('Up to date');
      setSyncMsg(parts.join(' · '));
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setSyncing(false);
    }
  }

  // Auto-sync on mount when signed in
  useEffect(() => {
    if (user) handleSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const syncColor =
    syncStatus === 'error'   ? 'var(--accent-2)' :
    syncStatus === 'syncing' ? 'var(--accent-4)' :
    'var(--text-2)';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Characters</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
            {user
              ? `Signed in as ${user.email}`
              : 'Stored locally — sign in to sync across devices.'}
          </p>
        </div>

        {/* Sync indicator */}
        {user && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                fontSize: 12, color: syncColor, padding: '4px 8px',
                border: `1px solid ${syncColor}`, borderRadius: 6,
                opacity: syncing ? 0.7 : 1,
              }}
            >
              {syncing ? '↻ Syncing…' : '↻ Sync'}
            </button>
            {lastSync && (
              <p style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 3 }}>
                {syncMsg ?? `Last: ${lastSync}`}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Create new */}
      <div className="card" style={{ marginBottom: 20 }}>
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
        {characters?.reverse().map(c => {
          const meta = (c as unknown as { meta: { name: string; portrait?: string; campaign?: string; campaignId?: string; updatedAt: string } }).meta;
          const classes = (c as unknown as { classes: { level: number }[] }).classes;
          const inCampaign = !!meta.campaignId;
          return (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                onClick={() => openCharacter(c.id)}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--bg-3)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0, cursor: 'pointer',
                }}
              >
                {meta.portrait
                  ? <img src={meta.portrait} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : '🧙'}
              </div>
              <div onClick={() => openCharacter(c.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{meta.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>
                    {classes?.length > 0 ? classes.map(cl => `Lvl ${cl.level}`).join(' / ') : 'No class yet'}
                  </span>
                  {meta.campaign && <span>· {meta.campaign}</span>}
                  {inCampaign && (
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 700,
                      background: 'color-mix(in srgb, var(--accent) 20%, var(--bg-3))',
                      color: 'var(--accent)', border: '1px solid var(--accent)',
                    }}>
                      ⚔️ Campaign
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', flexShrink: 0 }}>
                {new Date(meta.updatedAt).toLocaleDateString()}
              </div>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`Delete "${meta.name}"? This cannot be undone.`)) return;
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
              >×</button>
            </div>
          );
        })}

        {characters?.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '32px 0' }}>
            No characters yet. Create one above!
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ marginTop: 28, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => setView('database')}>
          📚 Game Database
        </button>
        {user ? (
          <>
            <button className="btn btn-ghost" onClick={() => setShowCampaign(true)}>
              ⚔️ Campaigns
            </button>
            <button className="btn btn-ghost" onClick={signOut}
              style={{ marginLeft: 'auto', color: 'var(--text-2)' }}>
              Sign Out
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={() => setView('auth')}
            style={{ marginLeft: 'auto' }}>
            Sign In / Sync
          </button>
        )}
      </div>

      {showCampaign && <CampaignPanel onClose={() => setShowCampaign(false)} />}
    </div>
  );
}
