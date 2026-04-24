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
  },
  {
    id: "mock-tests",
    name: "Full Mock Tests",
    description: "Complete IELTS exam simulations with all sections.",
    icon: Trophy,
    color: "bg-[#0f172a]",
    lightColor: "bg-[#0f172a]/10",
    textColor: "text-[#0f172a]",
    gradient: "from-slate-700/20 to-slate-900/20",
    hoverGradient: "group-hover:from-slate-700 group-hover:to-slate-900",
    path: "/mock-tests"
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
  const { isGeminiEnabled, toggleGemini, isPremium, expiryDate } = useGemini();
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
    if (!isPremium) {
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
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              x: [-20, 20, -20]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -10, 0],
              x: [20, -20, 20]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-violet-500/10 rounded-full blur-[120px]" 
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-black mb-12 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/10 uppercase tracking-[0.3em]">
                <Trophy className="h-4 w-4" />
                <span>Premium IELTS Experience</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-12 leading-[1.1] md:leading-[1]">
                Aid to your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-[length:200%_auto] animate-gradient">
                  IELTS score
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-slate-500 dark:text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight">
                The world's most advanced AI-powered preparation platform. <br className="hidden md:block" />
                Achieve Band 8.5+ with personalized feedback and real exam simulations.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-8">
                {isPremium && expiryDate && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                      <PremiumTimer expiryDate={expiryDate} />
                    </div>
                  </motion.div>
                )}
                
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setIsCalendarOpen(true)}
                    className="rounded-[2rem] h-20 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Schedule Practice</span>
                  </Button>

                  <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-4 px-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGeminiEnabled ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Assistant</p>
                        <p className="text-sm font-black">{isGeminiEnabled ? "ACTIVE" : "DISABLED"}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggle}
                      className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all focus:outline-none ${
                        isGeminiEnabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-xl transition-transform ${
                          isGeminiEnabled ? "translate-x-13" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advertisement Video Section */}
      <section className="pb-12">
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

            <div className="aspect-video w-full bg-slate-900 relative group">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                autoPlay 
                muted 
                loop 
                playsInline
                poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
              >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-a-university-campus-4284-large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent pointer-events-none" />
              
              {/* Video Content */}
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Accelerate Your <span className="text-blue-500">IELTS Success</span> with AI
                </h3>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8">
                  Join thousands of students who achieved their target band score using our premium platform. Get personalized feedback instantly.
                </p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-14 text-lg font-bold shadow-lg shadow-blue-600/20"
                >
                  Get Premium Access
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Practice Sections */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
                Practice Sections
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400">Choose a section to start practicing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ieltsSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={section.path}
                  className="group block h-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 ${section.hoverGradient} transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${section.lightColor} ${section.textColor} group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon className="h-8 w-8" />
                    </div>
                    
                    <h3 className={`text-2xl font-black mb-4 group-hover:${section.textColor} transition-colors`}>{section.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{section.description}</p>
                    
                    <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:translate-x-2 transition-transform">
                      Start Practice <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
              Why Choose <span className="text-blue-600">IELTS.net?</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400">
              We provide the most accurate and up-to-date materials to ensure your success in the IELTS exam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Instant AI Feedback",
                desc: "Get detailed band scores and actionable tips for Writing and Speaking within seconds.",
                color: "text-amber-500",
                bg: "bg-amber-50 dark:bg-amber-500/10"
              },
              {
                icon: CheckCircle2,
                title: "Official Criteria",
                desc: "Our materials strictly follow the official IELTS assessment criteria used by IDP and British Council.",
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-500/10"
              },
              {
                icon: Globe,
                title: "Real Exam Experience",
                desc: "Practice with a computer-delivered IELTS interface that perfectly mimics the real test.",
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Ready to get your Band 8.5+?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join IELTS.net today and get access to premium materials, AI tools, and a community of high achievers.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-slate-50 rounded-full h-16 px-12 text-xl font-black shadow-2xl hover:scale-105 transition-transform"
          >
            Start Your Journey Now
          </Button>
        </div>
      </section>
    </div>
  );
}
