import { useUIStore } from '@/store/uiStore';
import { HomeView } from '@/components/sheet/HomeView';
import { CharacterSheetView } from '@/components/sheet/CharacterSheetView';
import { DatabaseView } from '@/components/database/DatabaseView';

export default function App() {
  const { view } = useUIStore();

  return (
    <div className="app">
      {view === 'home'     && <HomeView />}
      {view === 'sheet'    && <CharacterSheetView />}
      {view === 'database' && <DatabaseView />}
      {/* builder and settings views — add as you build them */}
    </div>
  );
}
