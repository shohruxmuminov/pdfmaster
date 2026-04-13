import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Square, Timer, Volume2, RotateCcw, Sparkles, Loader2, CheckCircle2, Calendar, FileText, ChevronDown, ChevronUp, Info, Target, Zap, BookOpen, PenTool } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from './GeminiContext';
import ReactMarkdown from 'react-markdown';
import { ScheduleCalendar } from './ScheduleCalendar';

interface FeedbackSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

function FeedbackAccordion({ feedback }: { feedback: string }) {
  const [openSection, setOpenSection] = useState<string | null>('Estimated Band Score');

  const sections: FeedbackSection[] = useMemo(() => {
    const parts = feedback.split(/^##\s+/m).filter(Boolean);
    const iconMap: Record<string, React.ReactNode> = {
      'Fluency and Coherence': <Zap className="h-5 w-5 text-blue-500" />,
      'Lexical Resource': <BookOpen className="h-5 w-5 text-emerald-500" />,
      'Grammatical Range and Accuracy': <PenTool className="h-5 w-5 text-orange-500" />,
      'Pronunciation': <Volume2 className="h-5 w-5 text-purple-500" />,
      'Estimated Band Score': <Target className="h-5 w-5 text-red-500" />,
      'Actionable Tips': <Sparkles className="h-5 w-5 text-yellow-500" />
    };

    return parts.map(part => {
      const lines = part.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      return {
        title,
        content,
        icon: iconMap[title] || <Info className="h-5 w-5 text-slate-500" />
      };
    });
  }, [feedback]);

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div 
          key={section.title}
          className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
            openSection === section.title 
              ? 'border-purple-500/30 bg-purple-50/30 dark:bg-purple-900/10' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <button
            onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${
                openSection === section.title ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {section.icon}
              </div>
              <h4 className="font-black text-slate-900 dark:text-white tracking-tight">
                {section.title}
              </h4>
            </div>
            {openSection === section.title ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          
          <AnimatePresence>
            {openSection === section.title && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-5 pb-6 pt-0">
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function SpeakingControls() {
  const { analyzeSpeaking, transcribeAudio, submitTranscription, user, isGeminiEnabled } = useGemini();
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [targetTime, setTargetTime] = useState(120); // Default 2 mins
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup Visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalized = Math.min(100, average * 1.5);
        setMicLevel(normalized);
        setPeakLevel(prev => Math.max(prev, normalized));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();

      // Setup Recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove the data:audio/webm;base64, prefix
          setRecordedAudio(base64data.split(',')[1]);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAiFeedback(null);
      setRecordedAudio(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to practice speaking.");
    }
  };

  const stopMic = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setMicLevel(0);
  };

  const handleAnalyze = async () => {
    if (!recordedAudio) return;
    setIsAnalyzing(true);
    try {
      // Start transcription in background
      handleTranscribe();
      
      const feedback = await analyzeSpeaking(recordedAudio, 'audio/webm');
      setAiFeedback(feedback);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze recording. Please ensure you have an active Premium Plus subscription.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranscribe = async () => {
    if (!recordedAudio) return;
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(recordedAudio, 'audio/webm');
      setTranscription(text);
      
      // Send to admin
      await submitTranscription({
        userName: user?.displayName || user?.email || "Anonymous",
        text: text
      });
      
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe recording. Please ensure you have an active Premium Plus subscription.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const resetTimer = () => {
    setTime(0);
    setRecordedAudio(null);
    setAiFeedback(null);
    setTranscription(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-8">
      <ScheduleCalendar 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        currentCategory="Speaking"
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center gap-8"
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Mic className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{isRecording ? 'Recording...' : 'Microphone Ready'}</p>
          </div>
        </div>

        <div className="hidden md:block h-12 w-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
            <Timer className="h-7 w-7" />
            {isRecording && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={150.8}
                  strokeDashoffset={150.8 * (1 - Math.min(1, time / targetTime))}
                  className="transition-all duration-1000"
                />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Elapsed</p>
              {!isRecording && (
                <select 
                  value={targetTime}
                  onChange={(e) => setTargetTime(Number(e.target.value))}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 rounded px-1 border-none outline-none font-bold text-blue-600"
                >
                  <option value={60}>1m</option>
                  <option value={120}>2m</option>
                  <option value={180}>3m</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className={`text-2xl font-mono font-black tabular-nums transition-colors ${
                isRecording && time >= targetTime ? 'text-red-500' : 'text-slate-900 dark:text-white'
              }`}>
                {formatTime(time)}
              </p>
              {!isRecording && time > 0 && (
                <button 
                  onClick={resetTimer}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block h-12 w-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Volume2 className="h-3 w-3" /> Voice Input Level
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">Peak: {Math.round(peakLevel)}%</span>
              <span className={`text-[10px] font-bold ${micLevel > 80 ? 'text-red-500' : 'text-slate-400'}`}>
                {Math.round(micLevel)}%
              </span>
            </div>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i}
                className={`flex-1 rounded-sm transition-all duration-100 ${
                  micLevel > (i * 4.16) 
                    ? (i > 18 ? 'bg-red-500' : i > 12 ? 'bg-yellow-500' : 'bg-green-500')
                    : 'bg-slate-200 dark:bg-slate-700/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-2">
          <Button 
            onClick={isRecording ? stopMic : startMic}
            className={`w-full md:w-48 h-14 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
              isRecording 
                ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            {isRecording ? (
              <><Square className="h-5 w-5 mr-3 fill-current" /> Stop</>
            ) : (
              <><Mic className="h-5 w-5 mr-3" /> Start Practice</>
            )}
          </Button>
          
          {!isRecording && (
            <Button 
              onClick={() => setIsCalendarOpen(true)}
              variant="outline"
              className="w-full md:w-48 h-10 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400"
            >
              <Calendar className="h-4 w-4 mr-2" /> Schedule Next
            </Button>
          )}
          
          {!isRecording && recordedAudio && !aiFeedback && (
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || isTranscribing}
                className="w-full md:w-48 h-12 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-lg shadow-purple-500/20"
              >
                {isAnalyzing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> AI Analysis</>
                )}
              </Button>
              <Button 
                onClick={handleTranscribe}
                disabled={isAnalyzing || isTranscribing}
                variant="outline"
                className="w-full md:w-48 h-12 rounded-xl border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
              >
                {isTranscribing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Transcribing...</>
                ) : (
                  <><FileText className="h-4 w-4 mr-2" /> Transcribe & Send</>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {transcription && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl mb-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Transcription</h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Sent to admin for review
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-700 dark:text-slate-300 leading-relaxed">
              "{transcription}"
            </div>

            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => setTranscription(null)}
                variant="ghost"
                className="rounded-xl px-8"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl text-purple-600">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">AI Examiner Feedback</h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Analysis based on official IELTS criteria
                </p>
              </div>
            </div>
            
            <div className="max-w-none">
              <FeedbackAccordion feedback={aiFeedback} />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Button 
                onClick={() => setAiFeedback(null)}
                variant="outline"
                className="rounded-xl px-8"
              >
                Close Feedback
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
