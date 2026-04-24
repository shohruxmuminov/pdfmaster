import React, { useState, useEffect } from 'react';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { BlobIframe } from "./BlobIframe";

interface MockTestRunnerProps {
  testId: string;
  components: any[];
  onComplete: (results: any) => void;
}

export const MockTestRunner: React.FC<MockTestRunnerProps> = ({ testId, components, onComplete }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [results, setResults] = useState<Record<string, any>>({});
  const [isSectionComplete, setIsSectionComplete] = useState(false);
  const [manualScore, setManualScore] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour for sections

  const currentSection = components[currentSectionIndex];

  useEffect(() => {
    // Reset timer when section changes
    setTimeLeft(3600);
  }, [currentSectionIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Handle timeout - maybe auto-submit?
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionSubmit = (score: number, bandScore?: string, feedback?: string) => {
    setResults(prev => ({ 
      ...prev, 
      [currentSection.subCategory]: { 
        score: manualScore ? parseInt(manualScore) : score, 
        bandScore, 
        feedback,
        timestamp: Date.now()
      } 
    }));
    setIsSectionComplete(true);
    setManualScore("");
  };

  const nextSection = () => {
    if (currentSectionIndex < components.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setIsSectionComplete(false);
    } else {
      onComplete(results);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">{testId}</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase">
            {currentSection.subCategory}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold transition-colors ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-slate-600">
            Section {currentSectionIndex + 1} of {components.length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {!isSectionComplete ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-white dark:bg-slate-900">
              {currentSection.content.startsWith('http') || currentSection.content.startsWith('data:') || currentSection.content.trim().startsWith('<') || currentSection.content.startsWith('raw:') ? (
                <BlobIframe 
                  content={currentSection.content} 
                  className="w-full h-full border-none"
                  title={`${testId} - ${currentSection.subCategory}`}
                />
              ) : (
                <div className="p-8 prose dark:prose-invert max-w-none h-full overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
                </div>
              )}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Manual Score (optional):</span>
                <input 
                  type="number" 
                  min="0" 
                  max="40" 
                  value={manualScore}
                  onChange={(e) => setManualScore(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
                  placeholder="0-40"
                />
              </div>
              <Button 
                onClick={() => handleSectionSubmit(Math.floor(Math.random() * 40))} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold"
              >
                Submit {currentSection.subCategory} Section
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Section Completed!</h3>
              <p className="text-slate-500 mb-8">Your {currentSection.subCategory} responses have been recorded.</p>
              <Button onClick={nextSection} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl">
                {currentSectionIndex < components.length - 1 ? "Start Next Section" : "Finish Mock Test"}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
