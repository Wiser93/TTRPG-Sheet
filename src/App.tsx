import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';
import { HomeView } from '@/components/sheet/HomeView';
import { CharacterSheetView } from '@/components/sheet/CharacterSheetView';
import { CharacterBuilderView } from '@/components/builder/CharacterBuilderView';
import { DatabaseView } from '@/components/database/DatabaseView';

// ── Android / browser back button support ────────────────────
//
// Strategy: every time the app navigates away from 'home' we push a synthetic
// history entry. When the user presses the hardware back button (or swipes),
// the browser fires a 'popstate' event which we intercept to navigate within
// the app rather than leaving the page.

export default function App() {
  const { view, setView, closeCharacter } = useUIStore();
  const prevView = useRef(view);

  // Seed the initial history entry once on mount
  useEffect(() => {
    window.history.replaceState({ appView: 'home' }, '');
  }, []);

  // Push a history entry whenever we navigate away from home
  useEffect(() => {
    if (prevView.current === view) return;
    if (view === 'home') {
      window.history.replaceState({ appView: 'home' }, '');
    } else {
      window.history.pushState({ appView: view }, '');
    }
    prevView.current = view;
  }, [view]);

  // Intercept browser/hardware back button
  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const target = (e.state as { appView?: string } | null)?.appView ?? 'home';
      if (target === 'home') {
        closeCharacter();
      } else {
        setView(target as Parameters<typeof setView>[0]);
      }
      // Keep a replacement entry so repeated back presses keep working
      window.history.replaceState({ appView: target }, '');
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setView, closeCharacter]);

  return (
    <div className="app">
      {view === 'home'     && <HomeView />}
      {view === 'sheet'    && <CharacterSheetView />}
      {view === 'builder'  && <CharacterBuilderView />}
      {view === 'database' && <DatabaseView />}
    </div>
  );
}
