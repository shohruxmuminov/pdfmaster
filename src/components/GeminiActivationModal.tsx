import { useState } from "react";
import { useGemini } from "./GeminiContext";
import { Button } from "./ui/button";
import { Sparkles, Send, Lock, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GeminiActivationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sendPremiumRequest, premiumStatus } = useGemini();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendRequest = () => {
    if (!username) {
      setError("Please enter your Telegram username.");
      return;
    }
    
    setIsSending(true);
    setTimeout(() => {
      sendPremiumRequest(username);
      setIsSending(false);
      setError("");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activate Premium+</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Unlock full access to IELTS materials and Gemini AI features. Send a request to the admin to get started.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {premiumStatus === "pending" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Sent!</h3>
                  <p className="text-slate-600 dark:text-slate-400">Your request is being reviewed by the admin. Please wait for approval.</p>
                  <Button variant="outline" onClick={onClose} className="mt-4 rounded-xl">Close</Button>
                </motion.div>
              ) : premiumStatus === "approved" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Premium+ Active!</h3>
                  <p className="text-slate-600 dark:text-slate-400">Welcome to the future of PDF management.</p>
                  <Button onClick={onClose} className="mt-4 rounded-xl bg-blue-600 text-white">Get Started</Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telegram Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Send className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="@username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <Button 
                    onClick={handleSendRequest}
                    disabled={isSending}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Send Request to Admin
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
              By requesting, you agree to our Premium+ terms of service.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
