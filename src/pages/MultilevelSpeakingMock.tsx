import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useGemini } from "@/src/components/GeminiContext";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, Square, Play, Pause, AlertTriangle, ArrowLeft, Check, FastForward, Loader2 } from "lucide-react";
import mockData from "@/src/lib/multilevelSpeakingData.json";

export default function MultilevelSpeakingMock() {
  const { user, isGeminiEnabled, generateAIResponse, initSpeakingMockResult, uploadSpeakingMockAudio, finishSpeakingMock } = useGemini();
  const navigate = useNavigate();

  const [studentFirstName, setStudentFirstName] = useState(user?.displayName?.split(" ")[0] || "");
  const [studentLastName, setStudentLastName] = useState(user?.displayName?.split(" ")[1] || "");
  const [teacherName, setTeacherName] = useState("");
  
  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [dbDocId, setDbDocId] = useState<string | null>(null);

  const [currentPartIndex, setCurrentPartIndex] = useState(0); // 0: 1.1, 1: 1.2, 2: 2, 3: 3
  
  const parts = ["Part 1.1", "Part 1.2", "Part 2", "Part 3"];
  const [mockSessionId, setMockSessionId] = useState("");

  const [currentQuestions, setCurrentQuestions] = useState<any>(null);

  // Load random questions
  useEffect(() => {
    const p1_1 = mockData.part1_1[Math.floor(Math.random() * mockData.part1_1.length)];
    const p1_2 = mockData.part1_2[Math.floor(Math.random() * mockData.part1_2.length)];
    const p2 = mockData.part2[Math.floor(Math.random() * mockData.part2.length)];
    const p3 = mockData.part3[Math.floor(Math.random() * mockData.part3.length)];
    setCurrentQuestions({ part1_1: p1_1, part1_2: p1_2, part2: p2, part3: p3 });
    setMockSessionId(`Mock_${Math.floor(Math.random() * 10000)}`);
  }, []);

  const [recordings, setRecordings] = useState<Record<string, Blob>>({});
  
  const [partState, setPartState] = useState<"idle" | "reading" | "prep" | "speaking" | "uploading" | "done">("idle");
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getPrepTime = () => {
     if (currentPartIndex === 0) return 10;
     if (currentPartIndex === 1) return 45;
     if (currentPartIndex === 2) return 90;
     if (currentPartIndex === 3) return 45; 
     return 10;
  };
  const getSpeakTime = () => {
     if (currentPartIndex === 0) return 30;
     if (currentPartIndex === 1) return 45; 
     if (currentPartIndex === 2) return 120;
     if (currentPartIndex === 3) return 120; // Part 3 is 2 minutes
     return 30;
  };
  const getQuestionCount = () => {
     if (!currentQuestions) return 0;
     if (currentPartIndex === 0) return currentQuestions.part1_1.questions.slice(0, 3).length; // 3 questions
     if (currentPartIndex === 1) return currentQuestions.part1_2.questions.length;
     if (currentPartIndex === 2) return 1;
     if (currentPartIndex === 3) return 1;
     return 0;
  };
  const getQuestionText = (idx: number) => {
     if (!currentQuestions) return "";
     if (currentPartIndex === 0) return currentQuestions.part1_1.questions[idx];
     if (currentPartIndex === 1) return currentQuestions.part1_2.questions[idx];
     if (currentPartIndex === 2) return "Please speak about the topic on the cue card.";
     if (currentPartIndex === 3) return currentQuestions.part3.question;
     return "";
  };

  const getImageUrl = (prompt: string, seed: number) => {
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
  };

  const playQuestionWait = (text: string): Promise<void> => {
     return new Promise(resolve => {
         if (!window.speechSynthesis) return resolve();
         window.speechSynthesis.cancel();
         const utterance = new SpeechSynthesisUtterance(text);
         let resolved = false;
         const handleResolve = () => {
             if (!resolved) {
                 resolved = true;
                 resolve();
             }
         };
         utterance.onend = handleResolve;
         utterance.onerror = handleResolve;
         window.speechSynthesis.speak(utterance);
         
         // Fallback just in case synthesis hangs
         setTimeout(handleResolve, 15000);
     });
  };

  const runPartQuestion = async (idx: number) => {
      setQIdx(idx);
      setPartState("reading");
      const qText = getQuestionText(idx);
      await playQuestionWait(qText);

      setPartState("prep");
      setTimeLeft(getPrepTime());
  };

  const finishPart = async () => {
      setPartState("uploading");
      if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = async () => {
              const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              setRecordings(prev => ({ ...prev, [parts[currentPartIndex]]: blob }));
              
              if (dbDocId) {
                  const partKey = currentPartIndex === 0 ? "part1_1" : currentPartIndex === 1 ? "part1_2" : currentPartIndex === 2 ? "part2" : "part3";
                  await uploadSpeakingMockAudio(dbDocId, partKey, blob);
              }
              
              setPartState("done");
              mediaRecorderRef.current = null;
          };
          mediaRecorderRef.current.stop();
      } else {
          setPartState("done");
      }
  };

  const handleTimerEnd = async () => {
      if (partState === "prep") {
          setPartState("speaking");
          setTimeLeft(getSpeakTime());
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
              mediaRecorderRef.current.resume();
          } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
              mediaRecorderRef.current.start();
          }
      } else if (partState === "speaking") {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.pause();
          }
          const nextIdx = qIdx + 1;
          if (nextIdx < getQuestionCount()) {
              runPartQuestion(nextIdx);
          } else {
              finishPart();
          }
      }
  };

  // The main robust timer driven by React effects
  useEffect(() => {
      if ((partState === "prep" || partState === "speaking") && timeLeft > 0) {
          const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
          return () => clearTimeout(t);
      } else if (timeLeft === 0 && (partState === "prep" || partState === "speaking")) {
          // Time hit 0, move to next phase
          handleTimerEnd();
      }
  }, [timeLeft, partState]);

  const skipCurrentTimer = () => {
      // setting time left to 0 will immediately trigger the effect and transition cleanly
      setTimeLeft(0);
  };

  const startPart = async () => {
     try {
        if (!mediaRecorderRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) };
            mediaRecorderRef.current = mr;
            mr.start();
            mr.pause();
        }
        setQIdx(0);
        runPartQuestion(0);
     } catch (e) {
        console.error(e);
        alert("Microphone access is required.");
     }
  };

  const submitMock = async () => {
    if (dbDocId) {
        await finishSpeakingMock(dbDocId);
    }
    alert("Mock submitted! Responses are available in the teacher panel.");
    navigate("/");
  };


  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 rounded-[2.5rem] shadow-xl border border-emerald-100 dark:border-slate-800">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Start Speaking Mock</h1>
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">First Name</label>
              <input 
                type="text" 
                value={studentFirstName} 
                onChange={(e) => setStudentFirstName(e.target.value)} 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Last Name</label>
              <input 
                type="text" 
                value={studentLastName} 
                onChange={(e) => setStudentLastName(e.target.value)} 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Teacher Name</label>
              <input 
                type="text" 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)} 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <Button 
            disabled={isInitializing}
            onClick={async () => {
              if (studentFirstName && studentLastName && teacherName) {
                 setIsInitializing(true);
                 const docId = await initSpeakingMockResult({
                    studentFirstName,
                    studentLastName,
                    teacherName,
                    mockId: mockSessionId,
                    questionsData: currentQuestions,
                 });
                 if (docId) {
                     setDbDocId(docId);
                     setIsStarted(true);
                 }
                 setIsInitializing(false);
              } else alert("Please fill all fields");
            }}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2"
          >
            {isInitializing ? <><Loader2 className="h-6 w-6 animate-spin" /> Preparing...</> : "Start Mock Test"}
          </Button>
        </Card>
      </div>
    );
  }

  const renderPartContent = () => {
    if (!currentQuestions) return <div>Loading...</div>;

    const part = parts[currentPartIndex];
    if (partState === "idle") {
        let desc = "";
        if (part === "Part 1.1") desc = `You will be asked ${currentQuestions.part1_1.questions.length} questions. For each, you have ${getPrepTime()}s to prepare and ${getSpeakTime()}s to speak.`;
        if (part === "Part 1.2") desc = `You will be asked ${currentQuestions.part1_2.questions.length} questions based on two pictures. For each, you have ${getPrepTime()}s to prepare and ${getSpeakTime()}s to speak.`;
        if (part === "Part 2") desc = `You will be given a cue card. You have ${getPrepTime()}s to prepare and ${getSpeakTime()}s to speak.`;
        if (part === "Part 3") desc = `You will discuss a topic. You have ${getPrepTime()}s to prepare and ${getSpeakTime()}s to speak.`;

        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-3xl font-black">{part}</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">{desc}</p>
                <div className="pt-8">
                    <Button onClick={startPart} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 rounded-full px-12 py-8 text-2xl font-bold">
                        Start {part}
                    </Button>
                </div>
            </div>
        );
    }

    if (partState === "uploading") {
        return (
            <div className="text-center p-8 space-y-4 pt-16 flex flex-col items-center justify-center min-h-[40vh]">
               <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mb-4" />
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Saving & Uploading Your Answers...</h2>
               <p className="text-slate-500 font-medium">Please wait, do not close the window.</p>
            </div>
        );
    }

    if (partState === "done") {
        return (
            <div className="text-center p-8 space-y-4 pt-16">
               <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-6">{part} Completed</h2>
               <p className="text-xl text-slate-500 font-medium mb-10">Your recording has been saved for this part and sent to the teacher.</p>
               {currentPartIndex < 3 ? (
                 <Button onClick={() => { setCurrentPartIndex(c => c+1); setPartState("idle"); }} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-10 py-8 text-2xl font-bold shadow-xl shadow-blue-500/30">
                    Go to Next Part
                 </Button>
               ) : (
                 <Button onClick={submitMock} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-8 text-2xl font-bold shadow-xl shadow-blue-600/30">
                    Submit Mock Test
                 </Button>
               )}
            </div>
        );
    }

    if (part === "Part 1.1") {
      const p = currentQuestions.part1_1;
      return (
        <div className="space-y-4 flex flex-col justify-center min-h-[40vh]">
            <h3 className="text-xl font-bold text-slate-400 mb-2 text-center uppercase tracking-widest text-xs">Topic: {p.topic}</h3>
            <div className={`py-12 px-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border transition-colors ${partState === 'reading' ? 'border-amber-400 border-2' : 'border-slate-100 dark:border-slate-800'} text-center`}>
                <p className="text-3xl font-medium text-slate-800 dark:text-slate-100 leading-snug">{p.questions[qIdx]}</p>
            </div>
            <p className="text-center font-bold text-slate-400">Question {qIdx + 1} of {p.questions.length}</p>
        </div>
      );
    }

    if (part === "Part 1.2") {
      const p = currentQuestions.part1_2;
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-400 mb-2 text-center uppercase tracking-widest text-xs">Topic: {p.topic}</h3>
          <div className="flex justify-center gap-4 mb-6">
            {p.imagePrompts ? (
              p.imagePrompts.map((prompt: string, i: number) => (
                <div key={i} className="w-1/2 max-w-[350px] aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative">
                  <img 
                    src={getImageUrl(prompt, 42 + i)} 
                    alt={prompt} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              ))
            ) : (
              p.images.map((img: string, i: number) => (
                <img key={i} src={img} alt={`Pic ${i+1}`} className="w-1/2 max-w-[300px] h-48 object-cover rounded-[2rem] shadow-md" />
              ))
            )}
          </div>
          <div className={`py-8 px-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border transition-colors ${partState === 'reading' ? 'border-[#ff7b00] border-2 shadow-[#ff7b00]/10' : 'border-slate-100 dark:border-slate-800'} text-center`}>
             <p className="text-2xl font-medium text-slate-800 dark:text-slate-100">{p.questions[qIdx]}</p>
          </div>
          <p className="text-center font-bold text-slate-400">Question {qIdx + 1} of {p.questions.length}</p>
        </div>
      );
    }

    if (part === "Part 2") {
      const p = currentQuestions.part2;
      return (
        <div className="space-y-4">
           <h3 className="text-xl font-bold text-slate-400 mb-2 text-center uppercase tracking-widest text-xs">Cue Card</h3>
           <Card className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-md">
             <h3 className="text-2xl font-bold mb-6 text-center">{p.topic}</h3>
             <pre className="whitespace-pre-wrap font-sans text-xl text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl mx-auto">
               {p.cueCard}
             </pre>
           </Card>
        </div>
      );
    }

    if (part === "Part 3") {
      const p = currentQuestions.part3;
      return (
        <div className="space-y-8">
           <div className={`text-center py-10 px-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border transition-colors ${partState === 'reading' ? 'border-[#ff7b00] border-2 shadow-[#ff7b00]/10' : 'border-slate-100 dark:border-slate-800'}`}>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">{p.question}</h2>
           </div>
           
           <div className="space-y-6">
             <div className="bg-[#ff7b00]/5 border border-[#ff7b00]/10 rounded-3xl p-6 md:p-8">
               <h3 className="text-[#ff7b00] font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4" /> Recommended Structure
               </h3>
               <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Argument</p>
                   <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic">
                     "{p.argument}"
                   </p>
                 </div>
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Development</p>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                     {p.development}
                   </p>
                 </div>
               </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50 rounded-[2rem]">
                  <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2"><Check className="h-5 w-5" /> For</h3>
                  <ul className="space-y-3 list-disc list-inside text-lg">
                    {p.argumentsFor.map((arg: string, i: number) => (
                      <li key={i} className="text-slate-700 dark:text-slate-200">{arg}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-8 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50 rounded-[2rem]">
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2"><Square className="h-5 w-5" /> Against</h3>
                  <ul className="space-y-3 list-disc list-inside text-lg">
                    {p.argumentsAgainst.map((arg: string, i: number) => (
                      <li key={i} className="text-slate-700 dark:text-slate-200">{arg}</li>
                    ))}
                  </ul>
                </Card>
             </div>
           </div>
        </div>
      );
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between mb-6 shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <Button variant="ghost" className="rounded-full" onClick={async () => {
                if (window.confirm("Are you sure you want to exit the mock test?")) navigate("/");
             }}>
                <ArrowLeft className="h-5 w-5 mr-2" /> Exit
             </Button>
             <div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Speaking Mode</span>
               </div>
               <h1 className="text-xl font-black">Multilevel Speaking {mockSessionId}</h1>
             </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             {currentPartIndex === 3 && partState === "done" ? (
               <Button onClick={submitMock} className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 px-8 text-white font-bold shadow-md shadow-blue-600/30">
                 Submit Mock Test
               </Button>
             ) : (
               <Button disabled className="opacity-50 rounded-full h-12 px-8">
                 In Progress
               </Button>
             )}
          </div>
        </header>

        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2.5rem] mb-6 flex justify-between items-center relative">
           <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
           {parts.map((p, idx) => (
             <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                  currentPartIndex === idx 
                    ? "bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" 
                    : currentPartIndex > idx ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700"
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${currentPartIndex === idx ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                  Part {idx === 0 ? "1.1" : idx === 1 ? "1.2" : idx === 2 ? "2" : "3"}
                </span>
             </div>
           ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-white dark:border-slate-800 min-h-[500px]">
             <div className="mb-6 flex justify-between items-center">
                <div className="px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  {partState === "idle" ? "Ready" : partState === "done" ? "Finished" : "In Progress"}
                </div>
             </div>
             {renderPartContent()}
          </div>

          <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-md">
             <div className={`mb-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                 partState === 'reading' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                 partState === 'prep' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                 partState === 'speaking' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                 partState === 'done' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                 partState === 'uploading' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800' :
                 'bg-slate-100 text-slate-500 dark:bg-slate-800'
             }`}>
               {partState === "reading" ? "Examiner Speaking" : partState === "prep" ? "Preparation Time" : partState === "speaking" ? "Recording Answer" : partState === "done" ? "Finished" : partState === "uploading" ? "Uploading" : "Ready"}
             </div>
             
             <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 88} 
                    strokeDashoffset={(partState === 'prep' || partState === 'speaking') ? ((2 * Math.PI * 88) * (1 - (timeLeft / (partState === 'prep' ? getPrepTime() : getSpeakTime() || 1)))) : 0} 
                    className={`transition-all duration-1000 ease-linear ${partState === 'prep' ? 'text-amber-500' : partState === 'speaking' ? 'text-red-500' : 'text-slate-200 dark:text-slate-700'}`} 
                  />
                </svg>
                <div className="absolute font-black text-5xl tabular-nums">
                  {(partState === "prep" || partState === "speaking") ? formatTime(timeLeft) : "00:00"}
                </div>
             </div>
             
             <p className="text-slate-500 font-bold mb-8 text-center h-6">
               {partState === "reading" ? "Listen to the question..." : partState === "prep" ? "Think about your answer..." : partState === "speaking" ? "Speak now..." : ""}
             </p>

             <div className="flex flex-col gap-4 w-full">
                {(partState === "prep" || partState === "speaking") && (
                   <Button onClick={skipCurrentTimer} variant="ghost" className="w-full h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2">
                       <FastForward className="h-5 w-5" /> {partState === "prep" ? "Skip to Speaking" : "Finish Answer"}
                   </Button>
                )}
             </div>

             {recordings[parts[currentPartIndex]] && partState === "done" && (
                <div className="mt-8 flex flex-col w-full gap-3">
                   <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 text-center">Part Result Saved</h4>
                   <p className="text-xs text-center text-emerald-500 font-medium">Teacher received your audio</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
