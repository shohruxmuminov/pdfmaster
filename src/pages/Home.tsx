import { Link } from "react-router-dom";
import { useGemini } from "@/src/components/GeminiContext";
import { Button } from "@/src/components/ui/button";
import { GeminiActivationModal } from "@/src/components/GeminiActivationModal";
import { ScheduleCalendar } from "@/src/components/ScheduleCalendar";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Trophy,
  Users,
  Zap,
  Globe,
  Lock,
  Calendar,
  Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ieltsSections = [
  {
    id: "listening",
    name: "Listening",
    description: "Aid accents and speed with real exam recordings.",
    icon: Headphones,
    color: "bg-[#107c54]",
    lightColor: "bg-[#107c54]/10",
    textColor: "text-[#107c54]",
    gradient: "from-emerald-500/20 to-teal-500/20",
    hoverGradient: "group-hover:from-emerald-500 group-hover:to-teal-500",
    path: "/listening"
  },
  {
    id: "reading",
    name: "Reading",
    description: "Improve your skimming and scanning techniques.",
    icon: BookOpen,
    color: "bg-[#2563eb]",
    lightColor: "bg-[#2563eb]/10",
    textColor: "text-[#2563eb]",
    gradient: "from-blue-500/20 to-indigo-500/20",
    hoverGradient: "group-hover:from-blue-500 group-hover:to-indigo-500",
    path: "/reading"
  },
  {
    id: "writing",
    name: "Writing",
    description: "Learn to structure Task 1 and Task 2 perfectly.",
    icon: PenTool,
    color: "bg-[#ef4444]",
    lightColor: "bg-[#ef4444]/10",
    textColor: "text-[#ef4444]",
    gradient: "from-rose-500/20 to-orange-500/20",
    hoverGradient: "group-hover:from-rose-500 group-hover:to-orange-500",
    path: "/writing"
  },
  {
    id: "speaking",
    name: "Speaking",
    description: "Practice fluency and coherence with AI feedback.",
    icon: Mic2,
    color: "bg-[#8b5cf6]",
    lightColor: "bg-[#8b5cf6]/10",
    textColor: "text-[#8b5cf6]",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    hoverGradient: "group-hover:from-violet-500 group-hover:to-fuchsia-500",
    path: "/speaking"
  },
  {
    id: "books",
    name: "My Premium Books",
    description: "Exclusive IELTS preparation books and guides.",
    icon: Library,
    color: "bg-[#f59e0b]",
    lightColor: "bg-[#f59e0b]/10",
    textColor: "text-[#f59e0b]",
    gradient: "from-amber-500/20 to-orange-500/20",
    hoverGradient: "group-hover:from-amber-500 group-hover:to-orange-500",
    path: "/books"
  },
  {
    id: "vocabulary",
    name: "Premium Vocabulary",
    description: "High-level vocabulary lists and practice sets.",
    icon: Sparkles,
    color: "bg-[#ec4899]",
    lightColor: "bg-[#ec4899]/10",
    textColor: "text-[#ec4899]",
    gradient: "from-pink-500/20 to-rose-500/20",
    hoverGradient: "group-hover:from-pink-500 group-hover:to-rose-500",
    path: "/vocabulary"
  }
];

function PremiumTimer({ expiryDate }: { expiryDate: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiryDate - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return (
    <div className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/20 animate-pulse">
      <Clock className="h-5 w-5" />
      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Premium Access Ends In</span>
        <span className="font-mono font-bold text-lg leading-none">{timeLeft}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { isGeminiEnabled, toggleGemini, isPremiumPlus, expiryDate } = useGemini();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed, waiting for interaction:", error);
      });
    }
  }, []);

  const handleToggle = () => {
    if (!isPremiumPlus) {
      setIsModalOpen(true);
    } else {
      toggleGemini(!isGeminiEnabled);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <GeminiActivationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ScheduleCalendar 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentCategory="General"
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              x: [-20, 20, -20]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -10, 0],
              x: [20, -20, 20]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" 
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-sm font-black mb-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5 uppercase tracking-widest">
                <Trophy className="h-4 w-4" />
                <span>#1 IELTS Preparation Platform</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-10 leading-[0.85]">
                Aid Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-[length:200%_auto] animate-gradient">
                  IELTS
                </span> Journey.
              </h1>
              
              <p className="text-2xl text-slate-600 dark:text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                Unlock your potential with IELTS.net. Comprehensive materials, AI-powered speaking practice, and real-time feedback to help you achieve Band 8+.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {isPremiumPlus && expiryDate && <PremiumTimer expiryDate={expiryDate} />}
                
                <Button 
                  onClick={() => {
                    // This will trigger the global calendar in Layout.tsx
                    // We can use a custom event or just let the user use the floating button.
                    // Actually, I'll just add the ScheduleCalendar to Home.tsx as well for direct access.
                    setIsCalendarOpen(true);
                  }}
                  variant="outline"
                  className="rounded-2xl h-14 px-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold shadow-xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Schedule Practice</span>
                </Button>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center gap-3 px-4">
                    <Sparkles className={`h-5 w-5 ${isGeminiEnabled ? "text-blue-600" : "text-slate-400"}`} />
                    <span className="text-sm font-bold whitespace-nowrap">AI Assistant</span>
                  </div>
                  <button
                    onClick={handleToggle}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${
                      isGeminiEnabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                        isGeminiEnabled ? "translate-x-11" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advertisement Video Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900"
          >
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                Live Ad
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md text-white/80 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                IELTS.net Premium
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Sponsored
              </div>
            </div>

            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline
              onCanPlay={() => videoRef.current?.play()}
              className="w-full h-full object-cover aspect-video"
            >
              <source src="https://storage.googleapis.com/aistudio-build-assets/vqgvp26hwl7iguncnzkvlo/video_1775554935401.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-auto">
              <div className="text-left max-w-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-blue-600 rounded-full" />
                  <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Official Partner</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Accelerate Your <span className="text-blue-500">IELTS Success</span> with AI
                </h3>
                <p className="text-white/70 text-base font-medium leading-relaxed">
                  Join 50,000+ students using our proprietary AI engine to get Band 8+ in record time. 
                  Get personalized feedback on every speaking and writing task.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button asChild className="rounded-2xl h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95">
                  <Link to="/speaking">Start Free Trial</Link>
                </Button>
                <p className="text-[10px] text-white/40 text-center font-bold uppercase tracking-tighter">
                  No credit card required • Instant Access
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Sections */}
      <section className="pb-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {ieltsSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <Link 
                  to={isGeminiEnabled ? section.path : "#"} 
                  onClick={(e) => !isGeminiEnabled && e.preventDefault()}
                  className="block h-full"
                >
                  <div className={`
                    h-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 
                    transition-all duration-500 relative overflow-hidden flex flex-col
                    ${!isGeminiEnabled ? "opacity-75 cursor-not-allowed" : "hover:border-transparent hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-2"}
                  `}>
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    {/* Icon Container */}
                    <div className="relative z-10 mb-10">
                      <div className={`
                        w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700
                        ${section.lightColor} group-hover:scale-110 group-hover:rotate-6
                        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] group-hover:shadow-2xl
                      `}>
                        <section.icon className={`h-10 w-10 ${section.textColor} transition-transform duration-500 group-hover:scale-110`} />
                        
                        {/* Glow effect on hover */}
                        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${section.hoverGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {section.name}
                      </h3>
                      
                      <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium text-lg">
                        {section.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:gap-5 transition-all">
                          <span>{isGeminiEnabled ? "Start Practice" : "Locked"}</span>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500`}>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Locked Overlay */}
                    {!isGeminiEnabled && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-8 text-center z-20">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-4 border border-white/20 shadow-2xl"
                        >
                          <Lock className="h-8 w-8 text-white" />
                        </motion.div>
                        <p className="text-white font-black text-lg uppercase tracking-widest leading-none mb-2">Access Locked</p>
                        <p className="text-white/60 text-sm font-medium">Enable AI Assistant to unlock this section</p>
                      </div>
                    )}

                    {/* Decorative Background Shapes */}
                    <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${section.gradient} opacity-[0.05] group-hover:opacity-[0.15] blur-3xl transition-all duration-1000 group-hover:scale-150`} />
                    <div className={`absolute -top-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-br ${section.gradient} opacity-[0.02] group-hover:opacity-[0.1] blur-3xl transition-all duration-1000 group-hover:scale-150`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Students", value: "50k+" },
              { label: "Avg. Band Score", value: "8.5" },
              { label: "Material Accuracy", value: "100%" },
              { label: "AI Support", value: "24/7" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                  {stat.value}
                </div>
                <div className="text-blue-400 font-black uppercase text-[10px] tracking-[0.2em]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Why Choose <span className="text-blue-600">IELTS.net?</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xl font-medium">
                We provide the most accurate and up-to-date materials to ensure your success in the IELTS exam.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Real-time Feedback",
                desc: "Get instant analysis of your writing and speaking tasks with our advanced Gemini AI engine.",
                icon: Zap,
                color: "bg-blue-600",
                shadow: "shadow-blue-600/20"
              },
              {
                title: "Global Standards",
                desc: "Our materials strictly follow the official IELTS assessment criteria used by IDP and British Council.",
                icon: Globe,
                color: "bg-emerald-600",
                shadow: "shadow-emerald-600/20"
              },
              {
                title: "Expert Community",
                desc: "Join thousands of students who have successfully achieved their target scores using our platform.",
                icon: Users,
                color: "bg-purple-600",
                shadow: "shadow-purple-600/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadow} mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-none">
              Ready to Achieve Your <br /> Target Band Score?
            </h2>
            <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Join IELTS.net today and get access to premium materials, AI tools, and a community of high achievers.
            </p>
            <Button asChild size="lg" className="rounded-2xl h-16 px-12 bg-white text-blue-600 hover:bg-blue-50 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95">
              <Link to="/listening">Get Started Now <ArrowRight className="ml-2 h-6 w-6" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

