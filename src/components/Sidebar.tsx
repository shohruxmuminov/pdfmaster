import { Link, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic2, 
  Library, 
  FileText,
  Film,
  BarChart,
  LogOut,
  Crown,
  ArrowRight,
  Shield
} from "lucide-react";
import { useGemini } from "./GeminiContext";

export function Sidebar() {
  const location = useLocation();
  const { logout, role } = useGemini();

  const sidebarItems = [
    { id: "dashboard", icon: LayoutGrid, path: "/", label: "Dashboard" },
    { id: "reading", icon: BookOpen, path: "/reading", label: "Reading" },
    { id: "listening", icon: Headphones, path: "/listening", label: "Listening" },
    { id: "writing", icon: PenTool, path: "/writing", label: "Writing" },
    { id: "speaking", icon: Mic2, path: "/speaking", label: "Speaking" },
    { id: "vocabulary", icon: Library, path: "/vocabulary", label: "Lug'at" },
    { id: "mock-tests", icon: FileText, path: "/mock-tests", label: "Sinov Testlar" },
    { id: "multilevel-mock-test", icon: FileText, path: "/multilevel-mock-test", label: "Multilevel Mock" },
    { id: "multilevel-mock", icon: Mic2, path: "/multilevel-mock", label: "Multilevel Speaking" },
    { id: "english-movies", icon: Film, path: "/english-movies", label: "English Films" },
    { id: "results", icon: BarChart, path: "/results", label: "Natijalar" },
    { id: "teacher-panel", icon: Shield, path: "/teacher", label: "Teacher Panel" },
    { id: "admin-panel", icon: Shield, path: "/admin", label: "Admin Panel" },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 mb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-[#ff7b00] text-white p-1.5 rounded-lg font-black text-sm flex items-center justify-center w-8 h-8">
            IP
          </div>
          <span className="font-black text-xl text-white tracking-tight">
            IELTS Pro
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sidebar-scrollbar flex flex-col h-full">
        <nav className="flex flex-col gap-1 mb-8">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link 
                key={item.id} 
                to={item.path} 
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? "bg-[#ff7b00]/10 text-[#ff7b00]" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#ff7b00]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pb-4">
          <h3 className="text-xs font-bold text-slate-500 mb-3 px-3">Hisob</h3>
          
          <div className="flex flex-col gap-2 mb-4">
            <button className="bg-gradient-to-r from-[#ff8c00] to-[#ff6b00] rounded-xl p-3 flex items-center justify-between group shadow-lg shadow-[#ff7b00]/20 hover:shadow-[#ff7b00]/40 transition-all">
              <div className="flex items-center gap-3 text-white">
                <Crown className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-bold leading-tight">Premium kod</div>
                  <div className="text-[10px] font-medium opacity-80">Cheksiz faol</div>
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/50 group-hover:bg-white transition-colors" />
            </button>

            <button className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-[#ff7b00] flex items-center justify-center text-white flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white leading-tight">Pro'ga o'ting</div>
                  <div className="text-[10px] font-medium text-slate-500">Cheksiz testlar va modullar</div>
                </div>
              </div>
            </button>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </div>
    </aside>
  );
}
