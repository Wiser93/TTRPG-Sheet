# TTRPG Character Sheet

Offline-first PWA for managing fully custom TTRPG characters. Runs in any browser, installs on mobile, and is designed to sync with Supabase in the future.

## Stack

| Layer | Tool |
|---|---|
| UI | React 18 + TypeScript |
| Bundler | Vite + PWA plugin |
| Local DB | Dexie.js (IndexedDB) |
| Session state | Zustand + Immer |
| Future sync | Supabase (stub ready) |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. On mobile, use "Add to Home Screen" in your browser menu to install the PWA.

## Project Structure

```
src/
├── types/
│   ├── game.ts          # All game content types (Item, Spell, Class, etc.)
│   └── character.ts     # Character state, derived stats
│
├── db/
│   ├── schema.ts        # Dexie database definition + migrations
│   ├── characterDatabase.ts  # Character CRUD
│   └── gameDatabase.ts       # Game content CRUD
│
├── lib/
│   ├── characterDefaults.ts  # Default character factory
│   └── deriveStats.ts        # Pure stat calculation (no side effects)
│
├── store/
│   ├── characterStore.ts  # Active character session (Zustand)
│   └── uiStore.ts         # App navigation state
│
├── hooks/
│   ├── useCharacter.ts     # Load character + get derived stats
│   └── useGameDatabase.ts  # Live queries for game content
│
├── sync/
│   └── supabase.ts         # Sync stub (configure when ready)
│
└── components/
    ├── sheet/              # Character sheet views + tabs
    ├── database/           # Browse/edit game database
    ├── builder/            # Character creation (to build)
    └── ui/                 # Shared components (to build)
```

## Key Design Decisions

### Custom Classes
Classes are stored as JSON with a `levelEntries` array. Each level entry contains:
- `features[]` — granted features, each with optional `choices[]`
- `resources` — arbitrary named counters (ki, rage, etc.)
- `choices[]` — things the player picks at that level

Player selections are stored as `ResolvedChoice` records, keeping the class definition clean and reusable.

### Derived Stats
`deriveStats()` in `src/lib/deriveStats.ts` is a **pure function** — it takes a Character + game data and returns `DerivedStats`. It is never stored; it's recalculated reactively whenever the character or game data changes. This makes it easy to test and debug.

### Autosave
The Zustand store debounces writes to Dexie by 1.5 seconds after every mutation. The `isDirty` flag on each record tracks what needs to be synced.

### PWA / Offline
The Vite PWA plugin generates a service worker that caches all app assets. IndexedDB (via Dexie) stores all data locally. The app works with zero network connectivity after the first load.

## Roadmap

- [ ] Character builder (class/species/background picker, level-up flow)
- [ ] Equipped items → AC calculation hookup
- [ ] Spell detail modal
- [ ] Item editor (create custom items)
- [ ] Class/subclass editor (create custom classes)
- [ ] Import/export JSON content packs
- [ ] Supabase sync (character data)
- [ ] Supabase sync (shared game database)
- [ ] Dice roller
- [ ] Combat tracker (initiative order)

## Enabling Supabase Sync

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL below to create the character table
3. Add to `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Replace `src/sync/supabase.ts` with the real implementation (see comments in that file)

```sql
-- Characters table (mirrors the local DBCharacter type)
create table characters (
  id          uuid primary key,
  owner_id    uuid references auth.users not null default auth.uid(),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table characters enable row level security;
create policy "Users own their characters"
  on characters for all using (auth.uid() = owner_id);
```
