import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { usePlayLoop } from './hooks/usePlayLoop';
import { useKeyboard } from './hooks/useKeyboard';
import { TopBar } from './components/layout/TopBar';
import { InputPanel } from './components/layout/InputPanel';
import { Stage } from './components/layout/Stage';
import { ExplanationPanel } from './components/layout/ExplanationPanel';
import { Timeline } from './components/layout/Timeline';
import { ShortcutHelp } from './components/overlays/ShortcutHelp';

export const App: React.FC = () => {
  const theme = useAppStore((state) => state.theme);

  // Initialize playback loop and global keyboard listener
  usePlayLoop();
  useKeyboard();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-ink overflow-hidden select-none font-sans">
      {/* 1. Top Bar */}
      <TopBar />

      {/* 2. Main 3-Column Studio Area */}
      <div className="flex flex-1 overflow-hidden">
        <InputPanel />
        <Stage />
        <ExplanationPanel />
      </div>

      {/* 3. Bottom Timeline */}
      <Timeline />

      {/* 4. Global Overlays */}
      <ShortcutHelp />
    </div>
  );
};

export default App;
