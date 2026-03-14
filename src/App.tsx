import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { HomeView } from '@/components/sheet/HomeView';
import { CharacterSheetView } from '@/components/sheet/CharacterSheetView';
import { CharacterBuilderView } from '@/components/builder/CharacterBuilderView';
import { DatabaseView } from '@/components/database/DatabaseView';
import { AuthView } from '@/components/auth/AuthView';

export default function App() {
  const { view, setView, closeCharacter } = useUIStore();
  const { user, loading, init } = useAuthStore();
  const prevView = useRef(view);

  // Initialise auth once on mount (restores session from storage)
  useEffect(() => { init(); }, [init]);

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
      window.history.replaceState({ appView: target }, '');
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setView, closeCharacter]);

  // When user signs in, go back home
  useEffect(() => {
    if (user && view === 'auth') setView('home');
  }, [user, view, setView]);

  // Show a minimal loading screen while auth state is being restored
  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>…</p>
      </div>
    );
  }

  return (
    <div className="app">
      {view === 'home'     && <HomeView />}
      {view === 'sheet'    && <CharacterSheetView />}
      {view === 'builder'  && <CharacterBuilderView />}
      {view === 'database' && <DatabaseView />}
      {view === 'auth'     && <AuthView onSkip={() => setView('home')} />}
    </div>
  );
}
