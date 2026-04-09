import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { useGemini } from "./GeminiContext";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export function AITutorModal({ isOpen, onClose, initialContext }: AITutorModalProps) {
  const { generateAIResponseStream } = useGemini();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = initialContext 
        ? `Hello! I'm your AI IELTS Tutor. I see you're practicing ${initialContext}. How can I help you today?`
        : "Hello! I'm your AI IELTS Tutor. How can I help you with your IELTS preparation today?";
      
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, [isOpen, initialContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add a placeholder for the assistant's message
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const systemInstruction = `You are a professional IELTS tutor on the IELTS.net platform. 
      Your goal is to help students achieve Band 8+ scores. 
      Be encouraging, precise, and provide actionable feedback. 
      If the user is practicing a specific section (${initialContext || "IELTS"}), focus your advice on that.
      Keep responses concise but comprehensive. Use Markdown for formatting (bolding, lists, etc.) to make advice clear.`;

      // Construct a more structured history for the prompt
      const history = newMessages.map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`).join("\n");
      const prompt = `${history}\nTutor:`;
      
      const stream = await generateAIResponseStream(prompt, systemInstruction);
      
      let fullResponse = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        fullResponse += chunkText;
        
        // Update the last message (the assistant's placeholder) with the accumulated text
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: "assistant", 
          content: "I'm sorry, I encountered an error. Please make sure your Premium Plus is active and your API key is correctly configured in the settings." 
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[600px] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-violet-600 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI IELTS Tutor</h3>
                  <p className="text-xs text-white/80">Powered by Gemini AI</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600"
                    }`}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm"
                    }`}>
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:p-2 prose-pre:rounded-lg">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500">Tutor is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask your tutor anything..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-center flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
