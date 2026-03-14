import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  createCampaign, joinCampaign, leaveCampaign,
  getMyCampaigns, pullCampaignCharacters,
} from '@/sync/supabase';
import type { Character } from '@/types/character';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';

// ─────────────────────────────────────────────────────────────
// DM Campaign View
// ─────────────────────────────────────────────────────────────

function CampaignDMView({ campaign }: { campaign: { id: string; name: string; join_code: string } }) {
  const [chars, setChars] = useState<(Character & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await pullCampaignCharacters(campaign.id);
    setChars(data);
    setLoading(false);
  }, [campaign.id]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{campaign.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Join code: <span style={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
              background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 4,
              letterSpacing: '0.1em', color: 'var(--accent)',
            }}>{campaign.join_code}</span>
          </p>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={refresh}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-2)', padding: '12px 0' }}>Loading characters…</p>
      ) : chars.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-2)', padding: '12px 0' }}>
          No characters yet. Share the join code with your players.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chars.map(c => {
            const isOpen = expanded === c.id;
            const hp = c.health;
            const hpPct = hp?.max ? Math.max(0, Math.min(1, hp.current / hp.max)) : 0;
            const hpColor = hpPct > 0.5 ? '#98c379' : hpPct > 0.25 ? '#e5c07b' : '#e06c75';
            return (
              <div key={c.id} style={{
                background: 'var(--bg-2)', borderRadius: 8,
                border: '1px solid var(--border)', overflow: 'hidden',
              }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--bg-3)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {c.meta?.portrait
                      ? <img src={c.meta.portrait} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : '🧙'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.meta?.name ?? 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                      {c.classes?.map(cl => `Lvl ${cl.level}`).join(' / ') ?? '—'}
                      {c.meta?.player ? ` · ${c.meta.player}` : ''}
                    </div>
                  </div>
                  {/* HP bar */}
                  {hp && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: hpColor }}>
                        {hp.current} / {hp.max} HP
                      </div>
                      <div style={{ width: 80, height: 4, background: 'var(--bg-3)', borderRadius: 2, marginTop: 3 }}>
                        <div style={{
                          width: `${hpPct * 100}%`, height: '100%',
                          background: hpColor, borderRadius: 2, transition: 'width 300ms',
                        }} />
                      </div>
                    </div>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flexShrink: 0 }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {(['strength','dexterity','constitution','intelligence','wisdom','charisma'] as const).map(stat => {
                      const val = c.stats?.base?.[stat] ?? 10;
                      const mod = Math.floor((val - 10) / 2);
                      return (
                        <div key={stat} style={{ textAlign: 'center', background: 'var(--bg-1)', borderRadius: 6, padding: '6px 4px' }}>
                          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-2)', marginBottom: 2 }}>
                            {stat.slice(0, 3)}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{val}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{mod >= 0 ? `+${mod}` : mod}</div>
                        </div>
                      );
                    })}
                    {/* Conditions */}
                    {c.conditions?.length > 0 && (
                      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {c.conditions.map(cond => (
                          <span key={cond.id} style={{
                            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: 'var(--accent-2)', color: '#fff',
                          }}>{cond.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────

export function CampaignPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const [tab, setTab]           = useState<'player' | 'dm'>('player');
  const [joinCode, setJoinCode] = useState('');
  const [newName, setNewName]   = useState('');
  const [busy, setBusy]         = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string; join_code: string; dm_user_id: string }[]>([]);

  // Local characters for the player tab
  const localChars = useLiveQuery(
    () => db.characters.filter(c => !c.deletedAt).toArray(), []
  ) ?? [];

  const [selectedCharId, setSelectedCharId] = useState<string>('');

  useEffect(() => {
    if (localChars.length && !selectedCharId) setSelectedCharId(localChars[0].id);
  }, [localChars, selectedCharId]);

  useEffect(() => {
    getMyCampaigns().then(setCampaigns);
  }, []);

  async function handleJoin() {
    if (!joinCode.trim() || !selectedCharId) return;
    setBusy(true); setMsg(null);
    const result = await joinCampaign(joinCode, selectedCharId);
    if (result) {
      setMsg({ text: `Joined "${result.name}"! Your character is now synced.`, ok: true });
      setJoinCode('');
    } else {
      setMsg({ text: 'Invalid join code — check with your DM.', ok: false });
    }
    setBusy(false);
  }

  async function handleLeave(charId: string) {
    if (!confirm('Leave campaign? Your character will no longer be visible to the DM.')) return;
    setBusy(true);
    await leaveCampaign(charId);
    setMsg({ text: 'Left campaign.', ok: true });
    setBusy(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setBusy(true); setMsg(null);
    const result = await createCampaign(newName.trim());
    if (result) {
      setMsg({ text: `Campaign created! Join code: ${result.join_code}`, ok: true });
      setNewName('');
      const updated = await getMyCampaigns();
      setCampaigns(updated);
    } else {
      setMsg({ text: 'Failed to create campaign.', ok: false });
    }
    setBusy(false);
  }

  const tabBtn = (t: 'player' | 'dm'): React.CSSProperties => ({
    flex: 1, padding: '9px 0', fontSize: 13, fontWeight: tab === t ? 700 : 400,
    color: tab === t ? 'var(--accent)' : 'var(--text-2)',
    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
    cursor: 'pointer',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-1)', borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: 560, maxHeight: '85dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.4)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>⚔️ Campaigns</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>
            Signed in as {user?.email}
          </p>
          <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--text-2)', lineHeight: 1 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button style={tabBtn('player')} onClick={() => { setTab('player'); setMsg(null); }}>
            🧙 Player
          </button>
          <button style={tabBtn('dm')} onClick={() => { setTab('dm'); setMsg(null); }}>
            📖 DM
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* ── Player tab ── */}
          {tab === 'player' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Characters already in a campaign */}
              {localChars.filter(c => (c as unknown as { meta: { campaignId?: string } }).meta.campaignId).map(c => (
                <div key={c.id} style={{
                  background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px',
                  border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>🧙</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{(c as unknown as { meta: { name: string } }).meta.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--accent)' }}>In a campaign — syncing automatically</p>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 11, color: 'var(--accent-2)' }}
                    onClick={() => handleLeave(c.id)}>
                    Leave
                  </button>
                </div>
              ))}

              {/* Join form */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Join a Campaign</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                      Character
                    </label>
                    <select value={selectedCharId} onChange={e => setSelectedCharId(e.target.value)} style={{ width: '100%', fontSize: 13 }}>
                      {localChars.map(c => (
                        <option key={c.id} value={c.id}>
                          {(c as unknown as { meta: { name: string } }).meta.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                      Join Code
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleJoin()}
                        placeholder="ABC123"
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        maxLength={6}
                      />
                      <button className="btn btn-primary" onClick={handleJoin}
                        disabled={busy || !joinCode.trim() || joinCode.length < 4 || !selectedCharId}>
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {msg && (
                <p style={{
                  fontSize: 12, padding: '8px 12px', borderRadius: 6, fontWeight: 600,
                  background: msg.ok ? 'color-mix(in srgb, var(--accent-4) 12%, var(--bg-2))' : 'color-mix(in srgb, var(--accent-2) 12%, var(--bg-2))',
                  color: msg.ok ? 'var(--accent-4)' : 'var(--accent-2)',
                }}>{msg.text}</p>
              )}
            </div>
          )}

          {/* ── DM tab ── */}
          {tab === 'dm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Existing campaigns */}
              {campaigns.map(c => (
                <CampaignDMView key={c.id} campaign={c} />
              ))}

              {/* Create new */}
              <div style={{ borderTop: campaigns.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: campaigns.length > 0 ? 16 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                  {campaigns.length > 0 ? 'Create Another Campaign' : 'Create a Campaign'}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="Campaign name…"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={handleCreate}
                    disabled={busy || !newName.trim()}>
                    Create
                  </button>
                </div>
                {msg && tab === 'dm' && (
                  <p style={{
                    fontSize: 12, padding: '8px 12px', borderRadius: 6, fontWeight: 600, marginTop: 10,
                    background: msg.ok ? 'color-mix(in srgb, var(--accent-4) 12%, var(--bg-2))' : 'color-mix(in srgb, var(--accent-2) 12%, var(--bg-2))',
                    color: msg.ok ? 'var(--accent-4)' : 'var(--accent-2)',
                  }}>{msg.text}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
