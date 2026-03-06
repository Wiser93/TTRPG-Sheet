import { useState } from 'react';
import type { Character, DerivedStats } from '@/types/character';
import type { Feature, ActionType } from '@/types/game';

interface Props { character: Character; derived: DerivedStats }

const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  action:       '#e06c75',
  bonus_action: '#d19a66',
  reaction:     '#61afef',
  passive:      '#98c379',
};

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  action:       'Action',
  bonus_action: 'Bonus Action',
  reaction:     'Reaction',
  passive:      'Passive',
};

type GroupKey = 'action' | 'bonus_action' | 'reaction' | 'passive' | 'informational';

const GROUPS: { key: GroupKey; label: string; color: string }[] = [
  { key: 'action',        label: 'Actions',        color: '#e06c75' },
  { key: 'bonus_action',  label: 'Bonus Actions',  color: '#d19a66' },
  { key: 'reaction',      label: 'Reactions',       color: '#61afef' },
  { key: 'passive',       label: 'Passive',         color: '#98c379' },
  { key: 'informational', label: 'Traits & Lore',   color: 'var(--text-2)' },
];

function groupKey(f: Feature): GroupKey {
  if (f.actionType) return f.actionType as GroupKey;
  return 'informational';
}

function sourceLabel(f: Feature): string {
  if (!f.sourceType) return '';
  return `${f.sourceType.charAt(0).toUpperCase()}${f.sourceType.slice(1)}`;
}

export function FeaturesTab({ derived }: Props) {
  const all = derived.allFeatures;

  const grouped: Record<GroupKey, Feature[]> = {
    action: [], bonus_action: [], reaction: [], passive: [], informational: [],
  };
  for (const f of all) grouped[groupKey(f)].push(f);

  const totalCount = all.length;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {totalCount === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>No features yet.</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
            Add features via your class levels, species, or background in the Character Builder.
          </p>
        </div>
      ) : (
        GROUPS.map(group => {
          const features = grouped[group.key];
          if (features.length === 0) return null;
          return (
            <FeatureGroup key={group.key} label={group.label} color={group.color} features={features} />
          );
        })
      )}
    </div>
  );
}

// ── Feature group card ─────────────────────────────────────────

function FeatureGroup({ label, color, features }: { label: string; color: string; features: Feature[] }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <p className="label">{label}</p>
        <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 'auto' }}>
          {features.length} feature{features.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map(f => <FeatureCard key={f.id} feature={f} accentColor={color} />)}
      </div>
    </div>
  );
}

// ── Individual feature card ────────────────────────────────────

function FeatureCard({ feature: f, accentColor }: { feature: Feature; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!(f.description || f.trigger || f.effect || f.uses);

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 6,
      background: 'var(--bg-2)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => hasDetail && setExpanded(!expanded)}
        style={{
          width: '100%', textAlign: 'left', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: hasDetail ? 'pointer' : 'default',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>

            {f.actionType && (
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 3,
                padding: '1px 6px',
                background: `color-mix(in srgb, ${ACTION_TYPE_COLORS[f.actionType]} 15%, var(--bg-1))`,
                color: ACTION_TYPE_COLORS[f.actionType],
              }}>
                {ACTION_TYPE_LABELS[f.actionType]}
              </span>
            )}

            {f.cost && (
              <span style={{
                fontSize: 10, borderRadius: 3, padding: '1px 6px',
                background: 'var(--bg-3)', color: 'var(--text-2)',
              }}>
                {f.cost}
              </span>
            )}

            {f.trigger && (
              <span style={{
                fontSize: 10, borderRadius: 3, padding: '1px 6px',
                background: 'color-mix(in srgb, var(--accent-4) 15%, var(--bg-1))',
                color: 'var(--accent-4)',
              }}>
                ⟳ {f.trigger}
              </span>
            )}
          </div>

          {/* Inline effect preview when collapsed */}
          {!expanded && f.effect && (
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{f.effect}</p>
          )}

          {/* Source label */}
          {f.sourceType && (
            <p style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 1 }}>{sourceLabel(f)}</p>
          )}
        </div>

        {/* Uses counter */}
        {f.uses && !expanded && (
          <div style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'right', flexShrink: 0 }}>
            {f.uses.max.type === 'flat' ? f.uses.max.value : '?'} / {f.uses.rechargeOn.replace('_', ' ')}
          </div>
        )}

        {hasDetail && (
          <span style={{ fontSize: 11, color: 'var(--text-2)', flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--border)' }}>
          {f.trigger && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-4)', minWidth: 52, flexShrink: 0, marginTop: 1 }}>Trigger</span>
              <span style={{ fontSize: 13 }}>{f.trigger}</span>
            </div>
          )}
          {f.effect && (
            <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', minWidth: 52, flexShrink: 0, marginTop: 1 }}>Effect</span>
              <span style={{ fontSize: 13 }}>{f.effect}</span>
            </div>
          )}
          {f.description && (
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {f.description}
            </p>
          )}
          {f.uses && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-2)' }}>
              Uses: {f.uses.max.type === 'flat' ? f.uses.max.value : '?'} per {f.uses.rechargeOn.replace('_', ' ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
