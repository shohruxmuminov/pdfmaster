import React, { useState, useEffect } from 'react';
import { Button } from "@/src/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  questions: Question[];
}

interface ReadingPracticeProps {
  passage: ReadingPassage;
  onSubmit: (answers: Record<number, number>) => void;
}

export const ReadingPractice: React.FC<ReadingPracticeProps> = ({ passage, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (Object.keys(answers).length / passage.questions.length) * 100;

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (!isSubmitted) {
      setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    passage.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true);
    onSubmit(answers);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Passage */}
      <div className="h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{passage.title}</h2>
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
          {passage.content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="h-[70vh] overflow-y-auto pl-4 border-l border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Questions</h3>
          <div className="font-mono font-bold text-lg text-blue-600">{formatTime(timeLeft)}</div>
        </div>
        
        {/* Progress Indicator */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-8">
          {passage.questions.map((q, qIdx) => (
            <div key={q.id} className={`p-6 rounded-2xl border ${
              isSubmitted 
                ? (answers[q.id] === q.correctAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
            }`}>
              <p className="font-medium text-slate-900 dark:text-white mb-4">
                {qIdx + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map((option, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswer(q.id, oIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      answers[q.id] === oIdx
                        ? (isSubmitted 
                            ? (oIdx === q.correctAnswer ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600")
                            : "bg-blue-600 text-white border-blue-600")
                        : (isSubmitted && oIdx === q.correctAnswer 
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300")
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit}
            className="w-full mt-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Submit Answers
          </Button>
        ) : (
          <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white text-center">
            <h4 className="text-lg font-bold mb-2">Test Completed!</h4>
            <p className="text-3xl font-black mb-4">Score: {score} / {passage.questions.length}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full rounded-xl">Try Again</Button>
          </div>
        )}
      </div>
    </div>
  );
};
