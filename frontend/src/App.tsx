import React from 'react';
import MonacoEditor from './components/Editor';
import './index.css';

function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-[#1E1E1E]">
      <div className="flex h-10 items-center border-b border-[#333] px-4 bg-[#1E1E1E] text-[#D4D4D4]">
        <span className="font-bold text-[#DC143C]">MeaCore</span> <span className="ml-2 text-xs opacity-50">Hyper IDE</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-[#333] bg-[#151515] p-2 hidden md:block">
          <div className="text-xs font-mono text-[#666]">EXPLORER</div>
          {/* Folder tree stub */}
        </aside>
        <main className="flex-1 min-w-0">
          <MonacoEditor />
        </main>
      </div>
    </div>
  );
}

export default App;
