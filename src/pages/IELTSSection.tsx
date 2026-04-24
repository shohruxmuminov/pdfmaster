import React, { useState, useRef, useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useGemini } from "@/src/components/GeminiContext";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AITutorModal } from "@/src/components/AITutorModal";
import { MockTestRunner } from "@/src/components/MockTestRunner";
import { SpeakingControls } from "@/src/components/SpeakingControls";
import { SpeakingPracticeHub } from "@/src/components/SpeakingPracticeHub";
import { ReadingPractice } from "@/src/components/ReadingPractice";
import { 
  FileText, 
  Play, 
  CheckCircle2, 
  ArrowLeft, 
  Send, 
  Maximize2, 
  Minimize2, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  Search, 
  LayoutGrid,
  Clock,
  TrendingUp,
  Sparkles,
  Home as HomeIcon,
  Bot,
  Calendar,
  Download,
  Trophy,
  Ban,
  Lock,
  AlertTriangle,
  Star
} from "lucide-react";

import { BlobIframe } from "../components/BlobIframe";

export default function IELTSSection() {
  const { category } = useParams<{ category: string }>();
  const { isPremiumPlus, materials, submitResult, isMockTestEnabled, isBlocked, sendCheatAlert, user, role } = useGemini();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [activeMockTest, setActiveMockTest] = useState<any[] | null>(null);
  const [mockTestIndex, setMockTestIndex] = useState(0);
  const [resultForm, setResultForm] = useState({ 
    firstName: "", 
    lastName: "", 
    telegramUsername: "", 
    score: "",
    component: "Listening" as "Listening" | "Reading" | "Writing" | "Speaking",
    content: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Tests");
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Mock data for Reading practice
  const readingPassage = {
    id: "1",
    title: "The Impact of Climate Change on Marine Life",
    content: "Climate change is significantly altering marine ecosystems across the globe. Rising ocean temperatures, acidification, and deoxygenation are creating stressors that many marine species are unable to adapt to. Coral reefs, often referred to as the rainforests of the sea, are particularly vulnerable. As temperatures rise, corals experience bleaching, a process where they expel the symbiotic algae living in their tissues. If the stress persists, the corals die, leading to a collapse of the entire reef ecosystem. Furthermore, ocean acidification, caused by the absorption of excess carbon dioxide, hinders the ability of calcifying organisms like mollusks and crustaceans to build their shells, threatening the foundation of marine food webs.",
    questions: [
      {
        id: 1,
        text: "What is the primary cause of coral bleaching mentioned in the text?",
        options: ["Ocean acidification", "Rising ocean temperatures", "Deoxygenation", "Overfishing"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "How does ocean acidification affect calcifying organisms?",
        options: ["It helps them build shells faster", "It has no effect on their shell-building", "It hinders their ability to build shells", "It causes them to migrate to colder waters"],
        correctAnswer: 2
      }
    ]
  };

  const handleReadingSubmit = (answers: Record<number, number>) => {
    console.log("Answers submitted:", answers);
    setIsSubmitted(true);
  };

  // Blocked user check
  if (isBlocked && role !== "admin" && role !== "teacher") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center rounded-[3rem] border-none shadow-2xl">
          <Ban className="h-20 w-20 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Access Blocked</h1>
          <p className="text-slate-500 mb-8">Your access to mock tests has been restricted by a teacher or administrator.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Mock test access check
  if (category?.toLowerCase() === "mock-tests" && !isMockTestEnabled && role !== "admin" && role !== "teacher") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center rounded-[3rem] border-none shadow-2xl">
          <Lock className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Tests Locked</h1>
          <p className="text-slate-500 mb-8">Mock tests are currently locked. Please wait for a teacher to grant access.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    return ((3600 - timeLeft) / 3600) * 100;
  }, [timeLeft]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // Anti-cheat: Send alert if user exits fullscreen during a mock test
      if (!isNowFullscreen && selectedMaterial && category?.toLowerCase() === "mock-tests" && !isSubmitted) {
        sendCheatAlert((user as any)?.displayName || user?.email || "Anonymous");
        setShowCheatWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [category, selectedMaterial]);

  const sectionConfig = useMemo(() => {
    const cat = category?.toLowerCase();
    switch (cat) {
      case "listening":
        return {
          title: "IELTS Listening Tests",
          subtitle: "Authentic audio materials with native speakers to improve your listening comprehension",
          icon: <Headphones className="h-8 w-8" />,
          color: "bg-[#107c54]",
          textColor: "text-[#107c54]",
          borderColor: "border-[#107c54]",
          buttonColor: "bg-[#107c54] hover:bg-[#0d6343]",
          accentColor: "bg-[#107c54]/10",
          sidebarIcon: Headphones,
          type: "standard"
        };
      case "reading":
        return {
          title: "IELTS Reading Tests",
          subtitle: "Comprehensive reading practice with authentic IELTS materials and detailed feedback",
          icon: <BookOpen className="h-8 w-8" />,
          color: "bg-[#2563eb]",
          textColor: "text-[#2563eb]",
          borderColor: "border-[#2563eb]",
          buttonColor: "bg-[#2563eb] hover:bg-[#1d4ed8]",
          accentColor: "bg-[#2563eb]/10",
          sidebarIcon: BookOpen,
          type: "standard"
        };
      case "writing":
        return {
          title: "IELTS Writing Practice",
          subtitle: "Choose a question set to practice your academic or general writing tasks",
          icon: <PenTool className="h-8 w-8" />,
          color: "bg-[#ef4444]",
          textColor: "text-[#ef4444]",
          borderColor: "border-[#ef4444]",
          buttonColor: "bg-[#ef4444] hover:bg-[#dc2626]",
          accentColor: "bg-[#ef4444]/10",
          sidebarIcon: PenTool,
          type: "writing"
        };
      case "speaking":
        return {
          title: "IELTS Speaking Practice",
          subtitle: "Practice real speaking topics with AI feedback and native-like prompts",
          icon: <Mic2 className="h-8 w-8" />,
          color: "bg-[#8b5cf6]",
          textColor: "text-[#8b5cf6]",
          borderColor: "border-[#8b5cf6]",
          buttonColor: "bg-[#8b5cf6] hover:bg-[#7c3aed]",
          accentColor: "bg-[#8b5cf6]/10",
          sidebarIcon: Mic2,
          type: "standard"
        };
      case "books":
        return {
          title: "Premium IELTS Books",
          subtitle: "Exclusive collection of the best IELTS preparation books and study guides",
          icon: <BookOpen className="h-8 w-8" />,
          color: "bg-[#f59e0b]",
          textColor: "text-[#f59e0b]",
          borderColor: "border-[#f59e0b]",
          buttonColor: "bg-[#f59e0b] hover:bg-[#d97706]",
          accentColor: "bg-[#f59e0b]/10",
          sidebarIcon: BookOpen,
          type: "standard"
        };
      case "vocabulary":
        return {
          title: "Premium Vocabulary",
          subtitle: "Aid high-level vocabulary with our curated lists and practice materials",
          icon: <Sparkles className="h-8 w-8" />,
          color: "bg-[#ec4899]",
          textColor: "text-[#ec4899]",
          borderColor: "border-[#ec4899]",
          buttonColor: "bg-[#ec4899] hover:bg-[#db2777]",
          accentColor: "bg-[#ec4899]/10",
          sidebarIcon: Sparkles,
          type: "standard"
        };
      case "mock-tests":
        return {
          title: "Full Mock Tests",
          subtitle: "Complete IELTS exam simulations to test your readiness for the real exam",
          icon: <Trophy className="h-8 w-8" />,
          color: "bg-[#0f172a]",
          textColor: "text-[#0f172a]",
          borderColor: "border-[#0f172a]",
          buttonColor: "bg-[#0f172a] hover:bg-slate-800",
          accentColor: "bg-slate-900/10",
          sidebarIcon: Trophy,
          type: "standard"
        };
      default:
        return {
          title: "IELTS Practice",
          subtitle: "Aid your IELTS skills with our premium materials",
          icon: <Sparkles className="h-8 w-8" />,
          color: "bg-slate-900",
          textColor: "text-slate-900",
          borderColor: "border-slate-900",
          buttonColor: "bg-slate-900 hover:bg-slate-800",
          accentColor: "bg-slate-900/10",
          sidebarIcon: FileText,
          type: "standard"
        };
    }
  }, [category]);

  const sectionMaterials = materials.filter(m => {
    const cat = category?.toLowerCase();
    if (cat === "mock-tests") return m.category === "Mock Tests";
    return m.category.toLowerCase() === cat;
  });

  const freeMaterials = sectionMaterials.filter(m => !m.isPremium);
  const premiumMaterials = sectionMaterials.filter(m => m.isPremium);

  const [activeTab, setActiveTab] = useState<"free" | "premium">("free");

  const groupedMockTests = useMemo(() => {
    if (category?.toLowerCase() !== "mock-tests") return null;
    
    const groups: Record<string, any[]> = {};
    sectionMaterials.forEach(m => {
      const id = m.mockTestId || "Uncategorized";
      if (!groups[id]) groups[id] = [];
      groups[id].push(m);
    });
    
    const order = ["Listening", "Reading", "Writing", "Speaking"];
    return Object.entries(groups).map(([id, components]) => {
      const sorted = [...components].sort((a, b) => {
        const indexA = order.indexOf(a.subCategory || "");
        const indexB = order.indexOf(b.subCategory || "");
        return indexA - indexB;
      });
      return {
        id,
        name: id === "Uncategorized" ? "Individual Mock Components" : id,
        components: sorted,
        category: "Mock Tests",
        timestamp: Math.max(...sorted.map(s => s.timestamp || 0))
      };
    });
  }, [category, sectionMaterials]);
  
  const filteredMaterials = useMemo(() => {
    const baseList = category?.toLowerCase() === "mock-tests" ? (groupedMockTests || []) : (activeTab === "free" ? freeMaterials : premiumMaterials);
    return baseList
      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(m => {
        if (activeFilter === "All Materials" || activeFilter === "All Tests") return true;
        if (category?.toLowerCase() === "books" && (m as any).subCategory) {
          return (m as any).subCategory === activeFilter;
        }
        if (activeFilter === "General Practice") {
          return !m.name.includes(",");
        }
        return m.name.startsWith(activeFilter);
      });
  }, [freeMaterials, premiumMaterials, groupedMockTests, searchQuery, activeFilter, category, activeTab]);

  const sidebarFilters = useMemo(() => {
    const counts: Record<string, number> = { "All Materials": sectionMaterials.length };
    
    if (category?.toLowerCase() === "books") {
      sectionMaterials.forEach(m => {
        if ((m as any).subCategory) {
          counts[(m as any).subCategory] = (counts[(m as any).subCategory] || 0) + 1;
        }
      });
    } else {
      sectionMaterials.forEach(m => {
        const parts = m.name.split(",");
        if (parts.length > 1) {
          const prefix = parts[0].trim();
          counts[prefix] = (counts[prefix] || 0) + 1;
        } else {
          counts["General Practice"] = (counts["General Practice"] || 0) + 1;
        }
      });
    }

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [sectionMaterials, category]);

  if (category?.toLowerCase() === "speaking") {
    return <SpeakingPracticeHub />;
  }

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async (material: any) => {
    const isHtml = material.type.includes("html") || material.type.includes("text");
    let url = material.content;
    const isUrl = url.startsWith('http');
    
    if (isHtml && !isUrl) {
      const blob = new Blob([material.content], { type: 'text/html' });
      url = URL.createObjectURL(blob);
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = "_blank";
    link.download = material.name.includes('.') ? material.name : `${material.name}${isHtml ? '.html' : ''}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (isHtml && !isUrl) {
      URL.revokeObjectURL(url);
    }
  };

  const handleMaterialClick = (material: any) => {
    if (material.isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher") {
      alert("This is a premium test. Please upgrade to Premium to access it.");
      return;
    }
    
    setSelectedMaterial(material);
    setIsSubmitted(false);
    setResultForm({ 
      firstName: user?.displayName?.split(' ')[0] || "", 
      lastName: user?.displayName?.split(' ')[1] || "", 
      telegramUsername: "", 
      score: "",
      component: "Listening",
      content: ""
    });
    setTimeLeft(3600);
    setIsTimerActive(true);
    
    // Force fullscreen for all materials
    setTimeout(() => {
      if (viewerRef.current && !document.fullscreenElement) {
        viewerRef.current.requestFullscreen().catch((err) => {
          console.error("Fullscreen error:", err);
        });
      }
    }, 500);
  };

  const handleBack = () => {
    setSelectedMaterial(null);
    setActiveMockTest(null);
    setMockTestIndex(0);
    setIsTimerActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    submitResult({
      ...resultForm,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name
    });
    setIsSubmitted(true);
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (category?.toLowerCase() === "mock-tests" && !isMockTestEnabled && role !== "admin" && role !== "teacher") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center rounded-[3rem] border-none shadow-2xl">
          <Lock className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Tests Locked</h1>
          <p className="text-slate-500 mb-8">Mock tests are currently locked. Please wait for a teacher to grant access.</p>
          <Button asChild className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-950">
      <AITutorModal 
        isOpen={isAITutorOpen} 
        onClose={() => setIsAITutorOpen(false)} 
        initialContext={category}
      />

      <AnimatePresence mode="wait">
        {showCheatWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl border-2 border-red-500"
            >
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-6 animate-bounce" />
              <h2 className="text-2xl font-black mb-4 text-red-600 uppercase tracking-tighter">Security Warning</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
                You have exited fullscreen mode. This action has been logged and reported to your teacher. 
                Please return to fullscreen immediately to continue your test.
              </p>
              <Button 
                onClick={() => {
                  setShowCheatWarning(false);
                  if (viewerRef.current) {
                    viewerRef.current.requestFullscreen().catch(() => {});
                  }
                }}
                className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
              >
                Return to Fullscreen
              </Button>
            </motion.div>
          </div>
        )}

        {!selectedMaterial ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header Section */}
            <div className={`${sectionConfig.color} text-white py-12 md:py-16`}>
              <div className="container mx-auto px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                    {sectionConfig.icon}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">{sectionConfig.title}</h1>
                  <p className="text-white/80 max-w-2xl mx-auto text-lg">
                    {sectionConfig.subtitle}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Writing Specific Sub-header */}
            {sectionConfig.type === "writing" && (
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-10 px-4">
                      <Link to="/"><HomeIcon className="h-4 w-4 mr-2" /> Back Home</Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <LayoutGrid className="h-4 w-4 text-slate-400" />
                      Available Question Sets: <span className="text-red-600 font-bold">{sectionMaterials.length}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsAITutorOpen(true)}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg h-10"
                  >
                    <Bot className="h-4 w-4 mr-2" /> Gemini AI Essay Checker
                  </Button>
                </div>
              </div>
            )}

            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar (Only for standard sections) */}
                {sectionConfig.type === "standard" && (
                  <aside className="w-full lg:w-64 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Filter Tests</h3>
                      <div className="space-y-2">
                        {sidebarFilters.map((filter) => (
                          <button
                            key={filter.name}
                            onClick={() => setActiveFilter(filter.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-medium ${
                              activeFilter === filter.name
                                ? `${sectionConfig.color} text-white shadow-lg shadow-blue-500/20`
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {filter.name === "All Tests" ? <LayoutGrid className="h-4 w-4" /> : <sectionConfig.sidebarIcon className="h-4 w-4" />}
                              {filter.name}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              activeFilter === filter.name ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}>
                              {filter.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
                      <Sparkles className="h-8 w-8 mb-4 opacity-80" />
                      <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                      <p className="text-sm text-white/80 mb-4">Our Gemini AI can help you analyze your mistakes and improve your score.</p>
                      <Button 
                        onClick={() => setIsAITutorOpen(true)}
                        variant="secondary" 
                        className="w-full rounded-xl bg-white text-blue-600 hover:bg-white/90 border-none font-bold"
                      >
                        Ask Gemini AI
                      </Button>
                    </div>
                  </aside>
                )}

                {/* Main Content */}
                <main className="flex-1">
                  {sectionConfig.type === "standard" && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab("free")}
                          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === "free" 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          Free Tests
                        </button>
                        <button
                          onClick={() => setActiveTab("premium")}
                          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                            activeTab === "premium" 
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                              : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                          }`}
                        >
                          <Star className="h-4 w-4" /> Premium
                        </button>
                      </div>
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search materials..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{filteredMaterials.length} Materials Available</span>
                      </div>
                    </div>
                  )}

                  {filteredMaterials.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No materials found</h3>
                      <p className="text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-1 ${sectionConfig.type === "writing" ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"} gap-6`}>
                      {filteredMaterials.map((material, index) => (
                        <motion.div
                          key={material.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          {sectionConfig.type === "writing" ? (
                            <div className="flex flex-col h-full">
                              <div className="bg-red-600 p-4 text-white">
                                <div className="flex items-center justify-between text-xs font-bold mb-1">
                                  <span>{new Date(material.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs opacity-90">
                                  <FileText className="h-3 w-3" />
                                  {material.name}
                                </div>
                              </div>
                              <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-2">
                                  {material.name}
                                </h3>
                                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                                  <FileText className="h-12 w-12 text-slate-300" />
                                </div>
                                <div className="space-y-4 mb-8">
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Task 1:</p>
                                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold">
                                      <TrendingUp className="h-3 w-3 mr-1.5" />
                                      {material.name.includes("Graph") ? "Line Graph" : "Table"}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Task 2:</p>
                                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold uppercase leading-tight">
                                      <PenTool className="h-3 w-3 mr-1.5" />
                                      To what extent do you agree or disagree?
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleMaterialClick(material)}
                                  className={`w-full h-11 rounded-xl ${(material as any).isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher" ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-white" : "bg-red-600 hover:bg-red-700 text-white"} font-bold mt-auto`}
                                >
                                  {(material as any).isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher" ? (
                                    <Lock className="h-4 w-4 mr-2 fill-current" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2 fill-current" />
                                  )}
                                  Start Practice
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                {(material as any).isPremium ? (
                                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1`}>
                                    <Star className="h-3 w-3" />
                                    Premium
                                  </div>
                                ) : (
                                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1`}>
                                    <CheckCircle2 className="h-3 w-3" />
                                    Free
                                  </div>
                                )}
                                {index < 3 && (
                                  <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    New
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {material.name}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {category?.toLowerCase() === "mock-tests" ? `${(material as any).components.length} Sections` : (category?.toLowerCase() === "books" || category?.toLowerCase() === "vocabulary" ? "Study Material" : "60 mins")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {category?.toLowerCase() === "mock-tests" ? "Full Simulation" : ((material as any).subCategory || category)}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => {
                                    if ((material as any).isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher") {
                                      alert("This is a premium test. Please upgrade to Premium to access it.");
                                      return;
                                    }
                                    if (category?.toLowerCase() === "books") {
                                      handleDownload(material);
                                    } else if (category?.toLowerCase() === "mock-tests") {
                                      setActiveMockTest((material as any).components);
                                      setMockTestIndex(0);
                                      handleMaterialClick((material as any).components[0]);
                                    } else {
                                      handleMaterialClick(material);
                                    }
                                  }}
                                  className={`flex-1 h-11 rounded-xl ${(material as any).isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher" ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed" : sectionConfig.buttonColor} text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10`}
                                >
                                  {category?.toLowerCase() === "books" ? (
                                    <><Download className="h-4 w-4" /> Download Book</>
                                  ) : (
                                    <>
                                      {(material as any).isPremium && !isPremiumPlus && role !== "admin" && role !== "teacher" ? (
                                        <Lock className="h-4 w-4 fill-current" />
                                      ) : (
                                        <Play className="h-4 w-4 fill-current" />
                                      )} 
                                      {category?.toLowerCase() === "mock-tests" ? "Start Full Test" : "Start Test"}
                                    </>
                                  )}
                                </Button>
                                {(() => {
                                  if (category?.toLowerCase() === "books") return null;
                                  if (category?.toLowerCase() === "mock-tests") return null;
                                  
                                  const mat = material as any;
                                  const content = mat.content || "";
                                  const isHtml = (mat.type || "").includes("html") || 
                                    (mat.name || "").toLowerCase().endsWith(".html") || 
                                    content.trim().startsWith("<") || 
                                    content.startsWith("raw:") || 
                                    content.startsWith("data:text/html");
                                    
                                  if (!isHtml) {
                                    return (
                                      <Button 
                                        onClick={() => handleDownload(material)}
                                        variant="outline"
                                        className="h-11 w-11 rounded-xl shrink-0 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </main>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="viewer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="container mx-auto py-8 px-4"
          >
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Materials
            </Button>

            {category?.toLowerCase() === "speaking" && (
              <SpeakingControls />
            )}

            <div 
              ref={viewerRef}
              className={`relative bg-white dark:bg-slate-900 overflow-hidden shadow-2xl group/viewer flex flex-col ${isFullscreen ? "w-screen h-screen rounded-none" : "rounded-3xl border border-slate-200 dark:border-slate-800"}`}
            >
              {category?.toLowerCase() === "mock-tests" && selectedMaterial ? (
                <MockTestRunner 
                  testId={selectedMaterial.id} 
                  components={activeMockTest || []} 
                  onComplete={async (results) => { 
                    try {
                      const [firstName, ...lastNameParts] = (user?.displayName || "User").split(" ");
                      const lastName = lastNameParts.join(" ") || "Student";
                      
                      // Submit each section result
                      for (const [section, data] of Object.entries(results)) {
                        const sectionData = data as any;
                        await submitResult({
                          firstName,
                          lastName,
                          telegramUsername: user?.email || "unknown",
                          materialId: selectedMaterial.id,
                          materialName: selectedMaterial.name,
                          component: section as any,
                          score: sectionData.score.toString(),
                          bandScore: sectionData.bandScore,
                          content: sectionData.feedback,
                        });
                      }
                      handleBack();
                    } catch (error) {
                      console.error("Error submitting mock test results:", error);
                      handleBack();
                    }
                  }} 
                />
              ) : (category?.toLowerCase() === "reading" && !isSubmitted && 
                   !(selectedMaterial?.type || "").includes("html") && 
                   !selectedMaterial?.name?.toLowerCase().endsWith(".html") && 
                   !selectedMaterial?.content?.trim().startsWith("<") &&
                   !selectedMaterial?.content?.startsWith("raw:") &&
                   !selectedMaterial?.content?.startsWith("data:text/html")
                 ) ? (
                <ReadingPractice passage={readingPassage} onSubmit={handleReadingSubmit} />
              ) : (
                <>
                  {/* Header - Show a simplified version in fullscreen or normal mode if test is active */}
                  <div className={`p-4 ${sectionConfig.color} text-white flex items-center justify-between shrink-0 z-[60] relative shadow-lg`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        {sectionConfig.icon}
                      </div>
                      <div>
                        <h2 className="font-black text-sm md:text-base tracking-tight">
                          {activeMockTest ? `${activeMockTest[0].mockTestId}: ${selectedMaterial.subCategory}` : selectedMaterial.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            {activeMockTest ? `Part ${mockTestIndex + 1} of ${activeMockTest.length}` : `IELTS ${category} Practice`}
                          </span>
                          {isTimerActive && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/30 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                              <div className="w-1 h-1 bg-green-400 rounded-full" /> Live Test
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg md:text-xl backdrop-blur-md border ${timeLeft < 300 ? 'bg-red-500/30 text-white border-red-400 animate-pulse' : 'bg-white/10 text-white border-white/10'}`}>
                        <Clock className="h-5 w-5" />
                        {category?.toLowerCase() === "books" || category?.toLowerCase() === "vocabulary" || category?.toLowerCase() === "mock-tests" ? "Study Mode" : formatTime(timeLeft)}
                      </div>
                      
                      {!isFullscreen ? (
                        <div className="hidden md:flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setIsAITutorOpen(true)}
                            className="rounded-xl bg-white/10 hover:bg-white/20 border-none text-white font-black text-xs h-10 px-4"
                          >
                            <Bot className="h-4 w-4 mr-2" /> Gemini AI
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={toggleFullscreen}
                            className="rounded-xl bg-white/10 hover:bg-white/20 border-none text-white h-10 w-10"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={toggleFullscreen}
                          className="rounded-xl bg-red-500 hover:bg-red-600 border-none text-white font-black text-xs h-10 px-4"
                        >
                          Finish & Submit
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar - Always Persistent */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 shrink-0 relative z-[60] overflow-hidden">
                    <motion.div 
                      className={`h-full ${sectionConfig.color} shadow-[0_0_15px_rgba(0,0,0,0.2)] relative`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </motion.div>
                  </div>

                  <div className="relative flex-1 min-h-0 bg-white">
                    {(() => {
                      const mat = selectedMaterial as any;
                      const content = mat.content || "";
                      const isHtmlContent = (mat.type || "").includes("html") || 
                        (mat.name || "").toLowerCase().endsWith(".html") || 
                        content.trim().startsWith("<") || 
                        content.startsWith("raw:") || 
                        content.startsWith("data:text/html");
                        
                      if (isHtmlContent) {
                        return (
                          <BlobIframe 
                            content={content}
                            className="w-full h-full border-none bg-white"
                            title={selectedMaterial.name}
                          />
                        );
                      }
                      return (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                          <FileText className={`h-20 w-20 ${sectionConfig.textColor} mb-6`} />
                          <h3 className="text-2xl font-bold mb-4">File Material</h3>
                          <p className="text-slate-500 mb-8 max-w-md">This is a downloadable material. Click the button below to view or download it.</p>
                          <Button asChild size="lg" className={`${sectionConfig.buttonColor} text-white rounded-xl px-8`}>
                            <a href={selectedMaterial.content} download={selectedMaterial.name}>Download File</a>
                          </Button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Submission Form - Hide in fullscreen to maximize reading area */}
                  {!isFullscreen && selectedMaterial && (
                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 shrink-0">
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold mb-2">Submit Your Result</h3>
                          <p className="text-slate-500">Record your score to track your progress over time.</p>
                        </div>
                        {isSubmitted ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Result Submitted!</h3>
                            <p className="text-slate-500 mb-6">Your score has been recorded successfully.</p>
                            <div className="flex items-center justify-center gap-4">
                              <Button onClick={handleBack} variant="outline" className="rounded-xl">Back to Materials</Button>
                              {activeMockTest && mockTestIndex < activeMockTest.length - 1 && (
                                <Button 
                                  onClick={() => {
                                    const nextIndex = mockTestIndex + 1;
                                    setMockTestIndex(nextIndex);
                                    setSelectedMaterial(activeMockTest[nextIndex]);
                                    setIsSubmitted(false);
                                    setResultForm({ firstName: "", lastName: "", telegramUsername: "", score: "", component: "Listening", content: "" });
                                    setTimeLeft(3600);
                                  }} 
                                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                  Next Section: {activeMockTest[mockTestIndex + 1].subCategory}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                              <input 
                                required
                                type="text" 
                                value={resultForm.firstName}
                                onChange={(e) => setResultForm({...resultForm, firstName: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="John"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                              <input 
                                required
                                type="text" 
                                value={resultForm.lastName}
                                onChange={(e) => setResultForm({...resultForm, lastName: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telegram Username</label>
                              <input 
                                required
                                type="text" 
                                value={resultForm.telegramUsername}
                                onChange={(e) => setResultForm({...resultForm, telegramUsername: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="@username"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Test Component</label>
                              <select 
                                value={resultForm.component}
                                onChange={(e) => setResultForm({...resultForm, component: e.target.value as any})}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="Listening">Listening</option>
                                <option value="Reading">Reading</option>
                                <option value="Writing">Writing</option>
                                <option value="Speaking">Speaking</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Score</label>
                              <input 
                                required
                                type="text" 
                                value={resultForm.score}
                                onChange={(e) => setResultForm({...resultForm, score: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 7.5"
                              />
                            </div>
                            {resultForm.component === "Writing" && (
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Writing Essay</label>
                                <textarea 
                                  required
                                  value={resultForm.content}
                                  onChange={(e) => setResultForm({...resultForm, content: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none min-h-[300px]"
                                  placeholder="Paste your essay here..."
                                />
                              </div>
                            )}
                            <div className="md:col-span-2 pt-4 flex gap-4">
                              <Button type="submit" className={`flex-1 h-12 rounded-xl ${sectionConfig.buttonColor} text-white text-lg font-bold shadow-lg`}>
                                <Send className="h-5 w-5 mr-2" /> Submit Result
                              </Button>
                              {activeMockTest && (
                                <Button type="button" onClick={() => {
                                  // Logic to submit all mock test sections
                                  alert("Submit All functionality is being implemented.");
                                }} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold shadow-lg">
                                  <Send className="h-5 w-5 mr-2" /> Submit All
                                </Button>
                              )}
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
