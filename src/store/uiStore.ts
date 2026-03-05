import { create } from 'zustand';

export type SheetTab =
  | 'overview'
  | 'combat'
  | 'spells'
  | 'inventory'
  | 'features'
  | 'biography';

export type AppView =
  | 'home'          // character list
  | 'sheet'         // active character sheet
  | 'builder'       // character creation / level up
  | 'database'      // browse/edit game content
  | 'settings';

interface UIStore {
  view: AppView;
  activeCharacterId: string | null;
  sheetTab: SheetTab;
  databaseSection: 'items' | 'spells' | 'classes' | 'feats' | 'species' | 'backgrounds';
  modalStack: string[];

  setView: (view: AppView) => void;
  openCharacter: (id: string) => void;
  closeCharacter: () => void;
  setSheetTab: (tab: SheetTab) => void;
  setDatabaseSection: (section: UIStore['databaseSection']) => void;
  pushModal: (id: string) => void;
  popModal: () => void;
  clearModals: () => void;
}

export const useUIStore = create<UIStore>()(set => ({
  view: 'home',
  activeCharacterId: null,
  sheetTab: 'overview',
  databaseSection: 'items',
  modalStack: [],

  setView: (view) => set({ view }),
  openCharacter: (id) => set({ activeCharacterId: id, view: 'sheet', sheetTab: 'overview' }),
  closeCharacter: () => set({ activeCharacterId: null, view: 'home' }),
  setSheetTab: (tab) => set({ sheetTab: tab }),
  setDatabaseSection: (section) => set({ databaseSection: section }),
  pushModal: (id) => set(s => ({ modalStack: [...s.modalStack, id] })),
  popModal: () => set(s => ({ modalStack: s.modalStack.slice(0, -1) })),
  clearModals: () => set({ modalStack: [] }),
}));
