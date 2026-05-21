import { useGemini } from "@/src/components/GeminiContext";
import { Send, Phone, Video, Mic2, Star, Calendar, Trash2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { Card } from "@/src/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const { materials, speakingMocks, deleteSpeakingMockResult } = useGemini();
  const videoRef = useRef<HTMLVideoElement>(null);

  const dashboardVideo = materials?.find(m => m.category === "Dashboard Video");
  const heroVideoSrc = dashboardVideo?.content || "https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-a-university-campus-4284-large.mp4";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed, waiting for interaction:", error);
      });
    }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Developer Card */}
      <div className="bg-slate-900 border border-[#ff7b00]/20 rounded-2xl overflow-hidden shadow-lg relative">
        <div className="absolute top-4 left-6 text-xs font-bold text-slate-500 tracking-wider">
          DEVELOPER
        </div>
        
        {/* Background gradient hint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff7b00]/10 to-transparent pointer-events-none" />
        
        <div className="p-8 pt-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar */}
          <div className="w-40 h-40 shrink-0 rounded-full border-4 border-[#ff7b00] p-1 bg-white shadow-[0_0_30px_rgba(255,123,0,0.2)] overflow-hidden">
            <img 
              src="/shohrukh_avatar.png" 
              alt="Muminov Shohrukh" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h3 className="text-[#ff7b00] font-black text-sm tracking-[0.2em] uppercase mb-2">Owner & CEO</h3>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Muminov Shohrukh</h1>
            <p className="text-slate-400 text-lg mb-8">
              IELTS Pro asoschisi va platforma yaratuvchisi.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a 
                href="https://t.me/IELTS_Pro" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#2AABEE] hover:bg-[#2298d6] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Send className="w-5 h-5" />
                Telegram kanali
              </a>
              <a 
                href="tel:+998777145526"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg border border-slate-700 font-medium transition-colors"
              >
                <Phone className="w-5 h-5" />
                +998 77 714 55 26
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Speaking Results */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic2 className="w-6 h-6 text-[#ff7b00]" />
            <h2 className="text-2xl font-black text-white">Sizning Speaking Mock natijalaringiz</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            {speakingMocks.length} ta test
          </span>
        </div>

        <div className="grid gap-6">
          {speakingMocks.length === 0 ? (
            <Card className="p-12 border-dashed border-2 border-slate-800 bg-slate-900/50 flex flex-col items-center text-center">
              <Mic2 className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">Hali test topshirmagansiz</h3>
              <p className="text-slate-500 max-w-sm mb-6">Multilevel Speaking Mock testini topshirib, o'z natijangizni tekshirib ko'ring.</p>
            </Card>
          ) : (
            speakingMocks.map((mock) => (
              <motion.div
                key={mock.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-900 border border-slate-800 overflow-hidden hover:border-[#ff7b00]/30 transition-all">
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#ff7b00]/10 flex items-center justify-center text-[#ff7b00]">
                          <Star className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {mock.status === "Graded" ? `Natija: ${mock.score}/75` : "Baholash kutilmoqda"}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(mock.timestamp).toLocaleDateString()}</span>
                            <span>{mock.mockId}</span>
                          </div>
                        </div>
                      </div>

                      {mock.feedback && (
                        <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Teacher Feedback</p>
                          <p className="text-slate-300 leading-relaxed italic">"{mock.feedback}"</p>
                        </div>
                      )}
                    </div>

                    <div className="md:w-64 space-y-3 flex flex-col justify-end">
                      <div className={`px-4 py-2 rounded-xl text-center font-bold text-sm ${
                        mock.status === "Graded" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {mock.status === "Graded" ? "Tekshirildi" : "Kutilmoqda"}
                      </div>
                      {mock.status === "Graded" && (
                         <button 
                           onClick={() => { if(window.confirm("O'chirishni istaysizmi?")) deleteSpeakingMockResult(mock.id) }} 
                           className="flex items-center justify-center gap-2 text-xs font-bold text-red-500/50 hover:text-red-500 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" /> Natijani o'chirish
                         </button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Admin Video Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <Video className="w-5 h-5 text-[#ff7b00]" />
          <h2 className="text-sm font-semibold text-slate-300">Admin tomonidan tanlangan video</h2>
        </div>
        <div className="aspect-video w-full bg-black relative">
          <video 
            key={heroVideoSrc}
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src={heroVideoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
