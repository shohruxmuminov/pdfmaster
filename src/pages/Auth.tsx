import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Chrome, Apple, AlertCircle, ShieldCheck } from "lucide-react";
import { useGemini } from "../components/GeminiContext";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsGuest } = useGemini();

  const handleAuthError = (err: any, context: string) => {
    console.error(`${context} error:`, err);
    let errorMessage = err.message || "An unexpected error occurred.";
    setError(errorMessage);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        const isAdmin = user.email === "shohruxmuminov201@gmail.com";
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          premiumStatus: isAdmin ? "approved" : "none",
          role: isAdmin ? "admin" : "user",
          displayName: user.displayName || "User",
          createdAt: new Date().toISOString()
        });
      }
      navigate("/");
    } catch (err: any) {
      handleAuthError(err, "Google sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        const isAdmin = user.email === "shohruxmuminov201@gmail.com";
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "",
          premiumStatus: isAdmin ? "approved" : "none",
          role: isAdmin ? "admin" : "user",
          displayName: user.displayName || "User",
          createdAt: new Date().toISOString()
        });
      }
      navigate("/");
    } catch (err: any) {
      handleAuthError(err, "Apple sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      handleAuthError(err, "Admin sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="relative z-10">
              <div className="bg-white/20 w-16 h-16 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-xl">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Welcome</h1>
              <p className="text-blue-100 text-sm">Sign in to access your dashboard</p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <Button 
              onClick={loginAsGuest}
              className="w-full py-7 mb-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <User className="mr-2 h-5 w-5" />
              Continue as Student
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Admin & Teacher Sign In</span>
              </div>
            </div>

            <form onSubmit={handleAdminSignIn} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                variant="outline"
                className="w-full py-7 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                {loading ? "Processing..." : "Sign In with Email"}
              </Button>
            </form>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="py-7 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <Chrome className="h-5 w-5 text-red-500" />
              </Button>
              <Button 
                type="button"
                onClick={handleAppleSignIn}
                disabled={loading}
                variant="outline"
                className="py-7 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <Apple className="h-5 w-5 text-slate-900 dark:text-white" />
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
