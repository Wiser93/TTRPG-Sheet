import type { StatBlock } from '@/types/character';
import type { StatKey } from '@/types/game';
import { useCharacterStore } from '@/store/characterStore';

const STATS: { key: StatKey; abbr: string }[] = [
  { key: 'strength',     abbr: 'STR' },
  { key: 'dexterity',    abbr: 'DEX' },
  { key: 'constitution', abbr: 'CON' },
  { key: 'intelligence', abbr: 'INT' },
  { key: 'wisdom',       abbr: 'WIS' },
  { key: 'charisma',     abbr: 'CHA' },
];

function statMod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

interface Props { stats: StatBlock }

export function StatsSection({ stats }: Props) {
  const { setBaseStat } = useCharacterStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
        Set your six base ability scores. Racial bonuses and effects are applied automatically.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {STATS.map(({ key, abbr }) => {
          const score = stats[key];
          return (
            <div key={key} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-2)' }}>
                {abbr}
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={score}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBaseStat(key, Math.max(1, Math.min(30, Number(e.target.value))))}
                style={{
                  width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 700,
                  background: 'transparent', border: 'none', color: 'var(--text-0)', padding: '2px 0',
                }}
              />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: score >= 14 ? 'var(--accent-4)' : score <= 8 ? 'var(--accent-2)' : 'var(--text-2)',
              }}>
                {statMod(score)}
              </span>
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                <button
                  onClick={() => setBaseStat(key, Math.max(1, score - 1))}
                  style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1 }}
                >-</button>
                <button
                  onClick={() => setBaseStat(key, Math.min(30, score + 1))}
                  style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1 }}
                >+</button>
              </div>
            </div>
          );
        })}
      </div>

      <PointBuyIndicator stats={stats} />
    </div>
  );
}

function PointBuyIndicator({ stats }: { stats: StatBlock }) {
  const COSTS: Record<number, number> = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 };
  let total = 0;
  let valid = true;
  for (const score of Object.values(stats)) {
    if (score < 8 || score > 15) { valid = false; break; }
    total += COSTS[score] ?? 0;
  }
  if (!valid) return null;
  return (
    <div style={{
      fontSize: 12, textAlign: 'center',
      color: total === 27 ? 'var(--accent-4)' : total > 27 ? 'var(--accent-2)' : 'var(--text-2)',
      background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px',
    }}>
      Point buy: <strong>{total}/27</strong>
      {total > 27 ? ' - over budget' : total === 27 ? ' - perfect' : ''}
    </div>
  );
}
