import { useUIStore, type SheetTab } from '@/store/uiStore';
import { useCharacter } from '@/hooks/useCharacter';
import { OverviewTab } from './tabs/OverviewTab';
import { CombatTab } from './tabs/CombatTab';
import { SpellsTab } from './tabs/SpellsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { BioTab } from './tabs/BioTab';

const ALL_TABS: { key: SheetTab; label: string; icon: string }[] = [
  { key: 'overview',  label: 'Overview',  icon: '⚔️' },
  { key: 'combat',    label: 'Combat',    icon: '🛡️' },
  { key: 'spells',    label: 'Spells',    icon: '✨' },
  { key: 'inventory', label: 'Inventory', icon: '🎒' },
  { key: 'features',  label: 'Features',  icon: '📜' },
  { key: 'biography', label: 'Bio',       icon: '📖' },
];

export function CharacterSheetView() {
  const { activeCharacterId, sheetTab, setSheetTab, closeCharacter, openBuilder } = useUIStore();
  const { character, derived, isLoaded } = useCharacter(activeCharacterId);

  const TABS = ALL_TABS.filter(t => {
    if (t.key === 'spells' && character?.sheetConfig?.hideSpellsTab) return false;
    return true;
  });

  if (!isLoaded || !character || !derived) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <p style={{ color: 'var(--text-2)' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <header style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={closeCharacter} style={{ fontSize: 20, lineHeight: 1 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {character.meta.name}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {character.classes.length > 0
              ? character.classes.map(c => `Lvl ${c.level}`).join(' / ')
              : 'Unlevelled'} · HP {character.health.current}/{derived.maxHP}
          </p>
        </div>
        <button
          onClick={() => openBuilder(activeCharacterId!)}
          title="Character Builder"
          style={{
            fontSize: 20, lineHeight: 1,
            padding: '4px 8px',
            borderRadius: 6,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
          }}
        >✏️</button>
      </header>

      {/* Tab content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {sheetTab === 'overview'  && <OverviewTab character={character} derived={derived} />}
        {sheetTab === 'combat'    && <CombatTab character={character} derived={derived} />}
        {sheetTab === 'spells'    && <SpellsTab character={character} derived={derived} />}
        {sheetTab === 'inventory' && <InventoryTab character={character} derived={derived} />}
        {sheetTab === 'features'  && <FeaturesTab character={character} derived={derived} />}
        {sheetTab === 'biography' && <BioTab />}
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSheetTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              fontSize: 10,
              color: sheetTab === tab.key ? 'var(--accent)' : 'var(--text-2)',
              borderTop: sheetTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color var(--transition)',
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
