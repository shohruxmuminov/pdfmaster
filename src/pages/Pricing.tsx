import React, { useState } from "react";
import { Check, Send, Sparkles, Shield, Trophy } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useGemini } from "@/src/components/GeminiContext";
import { motion } from "framer-motion";

export default function Pricing() {
  const { isPremium, premiumStatus, sendPremiumRequest } = useGemini();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await sendPremiumRequest("Premium");
      setMessage({ type: "success", text: "Premium request sent! Admin will review it shortly." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to send request. Please try again or contact support." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300 mb-6">
          <Sparkles className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 font-heading tracking-tight">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Plan</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Start for free and upgrade when you need more power. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Free</CardTitle>
              <CardDescription className="text-base mt-2 text-slate-500 dark:text-slate-400">Perfect for occasional use</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5"><Check className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                  <span className="text-slate-700 dark:text-slate-300">Up to 4 operations total</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5"><Check className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                  <span className="text-slate-700 dark:text-slate-300">Max file size: 15MB</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5"><Check className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                  <span className="text-slate-700 dark:text-slate-300">Standard processing speed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5"><Check className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                  <span className="text-slate-700 dark:text-slate-300">Contains advertisements</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button className="w-full h-12 rounded-xl text-base border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white" variant="outline" disabled={!isPremium}>
                {isPremium ? "Downgrade to Free" : "Current Plan"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Premium Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-blue-200 dark:border-blue-800 shadow-xl shadow-blue-900/5 dark:shadow-none relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-violet-500" />
            <div className="absolute top-6 right-6">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </span>
            </div>
            <CardHeader className="p-8 pb-6">
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                Premium <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardTitle>
              <CardDescription className="text-base mt-2 text-slate-500 dark:text-slate-400">For professionals and heavy users</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">Code</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/activation</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-600 rounded-full p-0.5"><Check className="h-4 w-4 text-white" /></div>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Unlimited operations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-600 rounded-full p-0.5"><Check className="h-4 w-4 text-white" /></div>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Max file size: 100MB</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-600 rounded-full p-0.5"><Check className="h-4 w-4 text-white" /></div>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Lightning fast processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-600 rounded-full p-0.5"><Check className="h-4 w-4 text-white" /></div>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">Ad-free experience</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                className="w-full h-12 rounded-xl text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" 
                onClick={() => document.getElementById('request-panel')?.scrollIntoView({ behavior: 'smooth' })}
                disabled={isPremium || premiumStatus === "pending"}
              >
                {isPremium ? "Active Plan" : premiumStatus === "pending" ? "Request Pending" : "Get Premium Access"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Activation Panel */}
      <motion.div 
        id="request-panel" 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="bg-slate-900 dark:bg-slate-950 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {premiumStatus === "pending" ? "Request Pending" : isPremium ? "Premium Active" : "Request Premium"}
            </h2>
            <p className="text-slate-300 max-w-md mx-auto">
              {isPremium 
                ? "You have full access to all materials." 
                : premiumStatus === "pending" 
                  ? "Your request is being reviewed by an administrator."
                  : "Click below to request premium access from an administrator."}
            </p>
          </div>
          
          <CardContent className="p-8 md:p-10">
            {isPremium ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Premium Active</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">You currently have access to all premium features.</p>
                <Button asChild className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800">
                  <a href="/">Go to Materials</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {premiumStatus === "pending" ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col items-center text-center">
                    <Trophy className="h-12 w-12 text-amber-500 mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400 mb-2">Wait for Approval</h3>
                    <p className="text-amber-700 dark:text-amber-500 text-sm">
                      Your request has been received. Our team will review your profile shortly.
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleRequest}
                    disabled={loading}
                    className="w-full h-16 rounded-2xl text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                  >
                    {loading ? "Sending..." : "Request Premium Access"}
                  </Button>
                )}

                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                  }`}>
                    {message.type === 'success' ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    {message.text}
                  </div>
                )}

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Fast Response?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                    For faster activation, you can also contact our administrator directly on Telegram.
                  </p>
                  <a 
                    href="https://t.me/jujutsukaisen_jap" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    <Send className="h-4 w-4 mr-2" /> Message Admin on Telegram
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
