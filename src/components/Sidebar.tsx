import { Link, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  LayoutGrid, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic2, 
  Library, 
  FileText,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { useState } from "react";
import { AITutorModal } from "./AITutorModal";

const sidebarItems = [
  { id: "ai", icon: Sparkles, path: "#", label: "DeepSeek AI", color: "bg-[#8b5cf6]", isAction: true },
  { id: "dashboard", icon: LayoutGrid, path: "/", label: "Dashboard", color: "bg-[#ff6b00]" },
  { id: "reading", icon: BookOpen, path: "/reading", label: "Reading", color: "bg-[#2563eb]" },
  { id: "listening", icon: Headphones, path: "/listening", label: "Listening", color: "bg-[#107c54]" },
  { id: "writing", icon: PenTool, path: "/writing", label: "Writing", color: "bg-[#ef4444]" },
  { id: "speaking", icon: Mic2, path: "/speaking", label: "Speaking", color: "bg-[#8b5cf6]" },
  { id: "books", icon: Library, path: "/books", label: "Books", color: "bg-[#f59e0b]" },
  { id: "vocabulary", icon: FileText, path: "/vocabulary", label: "Vocabulary", color: "bg-[#ec4899]" },
];

export function Sidebar() {
  const location = useLocation();
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center py-6 px-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[40px] shadow-2xl shadow-slate-200/20 dark:shadow-none">
        <TooltipProvider delay={0}>
          <div className="flex flex-col gap-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              const content = (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? `${item.color} text-white shadow-lg` 
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                    ${item.id === 'ai' ? 'mb-2 !text-white !bg-[#8b5cf6] shadow-lg shadow-violet-500/30' : ''}
                  `}
                  style={isActive ? { boxShadow: `0 10px 15px -3px ${item.color.replace('bg-[', '').replace(']', '')}4D` } : {}}
                  onClick={() => item.isAction && setIsAITutorOpen(true)}
                >
                  <Icon className={`h-5 w-5 ${isActive || item.id === 'ai' ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
                  
                  {isActive && item.id !== 'ai' && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute -left-3 w-1 h-6 bg-blue-600 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              );

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger>
                    {item.isAction ? (
                      <div className="relative group">{content}</div>
                    ) : (
                      <Link to={item.path} className="relative group">
                        {content}
                      </Link>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-900 text-white border-none font-bold text-xs px-3 py-1.5 rounded-lg">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </aside>

      <AITutorModal 
        isOpen={isAITutorOpen} 
        onClose={() => setIsAITutorOpen(false)} 
      />
    </>
  );
}
