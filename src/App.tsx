import { useUIStore } from '@/store/uiStore';
import { HomeView } from '@/components/sheet/HomeView';
import { CharacterSheetView } from '@/components/sheet/CharacterSheetView';
import { CharacterBuilderView } from '@/components/builder/CharacterBuilderView';
import { DatabaseView } from '@/components/database/DatabaseView';

export default function App() {
  const { view } = useUIStore();
  return (
    <div className="app">
      {view === 'home'     && <HomeView />}
      {view === 'sheet'    && <CharacterSheetView />}
      {view === 'builder'  && <CharacterBuilderView />}
      {view === 'database' && <DatabaseView />}
    </div>
  );
}
