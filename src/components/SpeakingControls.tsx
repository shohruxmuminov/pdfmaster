import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Timer, Volume2, RotateCcw, Sparkles, Loader2, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from './GeminiContext';
import ReactMarkdown from 'react-markdown';
import { ScheduleCalendar } from './ScheduleCalendar';

export function SpeakingControls() {
  const { analyzeSpeaking, isGeminiEnabled } = useGemini();
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [targetTime, setTargetTime] = useState(120); // Default 2 mins
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
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
      const feedback = await analyzeSpeaking(recordedAudio, 'audio/webm');
      setAiFeedback(feedback);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze recording. Please ensure you have an active Premium Plus subscription.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetTimer = () => {
    setTime(0);
    setRecordedAudio(null);
    setAiFeedback(null);
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
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full md:w-48 h-12 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-lg shadow-purple-500/20"
            >
              {isAnalyzing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> AI Analysis</>
              )}
            </Button>
          )}
        </div>
      </motion.div>

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
            
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-strong:text-purple-600 dark:prose-strong:text-purple-400">
              <ReactMarkdown>{aiFeedback}</ReactMarkdown>
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
