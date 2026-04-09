import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, HelpCircle, Chrome } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists
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
      console.error("Google Auth error:", err);
      setError("Google sign-in failed. Please try again or use email/password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Reset error:", err);
      setError("Failed to send reset email. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        const isAdmin = user.email === "shohruxmuminov201@gmail.com";
        // Create user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          premiumStatus: isAdmin ? "approved" : "none",
          role: isAdmin ? "admin" : "user",
          displayName: name,
          createdAt: new Date().toISOString()
        });
      }
      navigate("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = "An error occurred during authentication.";
      
      const errorCode = err.code || (err.message && err.message.match(/\((auth\/[^)]+)\)/)?.[1]);
      
      if (errorCode === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (errorCode === "auth/invalid-credential" || errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password") {
        errorMessage = "Invalid email or password. If you don't have an account, please create one first.";
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (errorCode === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
              <h1 className="text-3xl font-black tracking-tight mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-blue-100 text-sm">
                {isLogin 
                  ? "Sign in to access your IELTS dashboard" 
                  : "Join thousands of students aiding their IELTS journey"}
              </p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="h-3 w-3" />
                      Forgot?
                    </button>
                  )}
                </div>
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
                className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full py-7 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Chrome className="h-5 w-5 text-red-500" />
                Google
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setMessage("");
                }}
                className="mt-2 text-blue-600 font-bold hover:underline flex items-center gap-2 mx-auto"
              >
                <Sparkles className="h-4 w-4" />
                {isLogin ? "Create an account now" : "Sign in to your account"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
