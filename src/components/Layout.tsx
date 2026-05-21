import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { LogOut, PanelLeft } from "lucide-react";
import { useGemini } from "./GeminiContext";

export default function Layout() {
  const { user, logout } = useGemini();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 font-sans selection:bg-[#ff7b00]/30 selection:text-white">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950 sticky top-0 z-40">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <PanelLeft className="w-5 h-5 text-slate-500" />
            <span>O'quvchi paneli</span>
            <span className="text-slate-600">•</span>
            <span>{user?.email || "Guest"}</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
