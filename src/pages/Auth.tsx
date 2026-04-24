import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, HelpCircle, Chrome, Phone, Apple, ChevronLeft, AlertCircle } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showSetupHelper, setShowSetupHelper] = useState(false);
  const navigate = useNavigate();

  const currentDomain = window.location.hostname;

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setMessage("");
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
      console.error("Apple Auth error:", err);
      const errorCode = err.code || (err.message && err.message.match(/\((auth\/[^)]+)\)/)?.[1]);
      
      if (errorCode === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase. Please add it to 'Authorized domains' in the Firebase Console.");
        setShowTroubleshooting(true);
      } else {
        setError("Apple sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setLoading(true);
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setMessage("Verification code sent to your phone!");
    } catch (err: any) {
      console.error("Phone Auth error:", err);
      const errorCode = err.code || (err.message && err.message.match(/\((auth\/[^)]+)\)/)?.[1]);
      
      if (errorCode === "auth/operation-not-allowed") {
        setError("Phone Authentication is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method. Also, check the 'SMS Region Policy' to ensure your country is allowed.");
        setShowTroubleshooting(true);
      } else {
        setError("Failed to send verification code. Make sure the phone number is in international format (e.g., +1234567890).");
      }
      
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;
    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "",
          premiumStatus: "none",
          role: "user",
          displayName: user.phoneNumber || "User",
          createdAt: new Date().toISOString()
        });
      }
      navigate("/");
    } catch (err: any) {
      console.error("Verification error:", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      const errorCode = err.code || (err.message && err.message.match(/\((auth\/[^)]+)\)/)?.[1]);
      
      if (errorCode === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase. Please add it to 'Authorized domains' in the Firebase Console.");
        setShowTroubleshooting(true);
      } else if (errorCode === "auth/invalid-credential") {
        setError("Invalid credentials or unauthorized domain. If you are the developer, please ensure this domain is allowlisted in Firebase Console.");
        setShowTroubleshooting(true);
      } else if (errorCode === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completion. Please try again.");
      } else if (errorCode === "auth/cancelled-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError("Google sign-in failed. Please try again or use email/password.");
      }
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
        errorMessage = "Invalid email or password. If you haven't created an account yet, please switch to 'Create Account'. If you signed up with Google/Apple, use those buttons below.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
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
            <div id="recaptcha-container"></div>
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

            {showTroubleshooting && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs space-y-2"
              >
                <p className="font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Critical Setup Required:
                </p>
                <p>Firebase is blocking this request. You MUST perform these steps in your Firebase Console:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <b>Authentication</b> &gt; <b>Settings</b> &gt; <b>Authorized domains</b></li>
                  <li>Click <b>Add domain</b> and paste: <code className="bg-white/50 px-1 rounded font-mono select-all">{currentDomain}</code></li>
                  <li>Go to <b>Sign-in method</b> and ensure <b>Phone</b>, <b>Google</b>, and <b>Apple</b> are enabled.</li>
                  <li>For Phone: Check <b>SMS Region Policy</b> and allow your country.</li>
                </ol>
                <div className="flex gap-2 mt-2">
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition-colors">Open Console</a>
                  <button 
                    onClick={() => setShowTroubleshooting(false)}
                    className="text-slate-500 font-bold hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {showPhoneAuth ? (
                <motion.div
                  key="phone-auth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <button 
                    onClick={() => {
                      setShowPhoneAuth(false);
                      setOtpSent(false);
                      setError("");
                      setMessage("");
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Email
                  </button>

                  {!otpSent ? (
                    <form onSubmit={handlePhoneSignIn} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            required
                            type="tel" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="+1234567890"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                      >
                        {loading ? "Sending..." : "Send Code"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="123456"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-7 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </Button>
                      <button 
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full text-center text-xs text-blue-600 font-bold hover:underline"
                      >
                        Change Phone Number
                      </button>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="email-auth"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
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

                    <div className="grid grid-cols-3 gap-3">
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
                      <Button 
                        type="button"
                        onClick={() => setShowPhoneAuth(true)}
                        disabled={loading}
                        variant="outline"
                        className="py-7 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center"
                      >
                        <Phone className="h-5 w-5 text-green-600" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setShowSetupHelper(!showSetupHelper)}
                className="w-full flex items-center justify-between text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <span>Firebase Setup Status</span>
                <HelpCircle className={`h-4 w-4 transition-transform ${showSetupHelper ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showSetupHelper && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-tighter">Authorized Domain</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate select-all">{currentDomain}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(currentDomain);
                            setMessage("Domain copied to clipboard!");
                          }}
                          className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 italic">
                        * Add this domain to <b>Authentication &gt; Settings &gt; Authorized domains</b> in Firebase.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Project ID</p>
                        <p className="text-[10px] font-mono truncate">flutter-ai-playground-e59c0</p>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Auth Status</p>
                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          SDK Ready
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href="https://console.firebase.google.com/project/flutter-ai-playground-e59c0/authentication/providers" 
                      target="_blank" 
                      rel="noreferrer"
                      className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Open Firebase Auth Settings
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-slate-500 text-sm mt-8 text-center">
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
