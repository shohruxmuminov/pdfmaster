import React, { useState } from "react";
import { Check, Send, Sparkles, Shield, Trophy } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useGemini } from "@/src/components/GeminiContext";
import { motion } from "framer-motion";

export default function Pricing() {
  const { isPremium } = useGemini();

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
                onClick={() => document.getElementById('info-panel')?.scrollIntoView({ behavior: 'smooth' })}
                disabled={isPremium}
              >
                {isPremium ? "Active Plan" : "Get Premium Access"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

          <AnimatePresence mode="wait">
            <motion.div 
              id="info-panel" 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">How to get Premium?</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                    Premium access is granted manually by administrators. <br />
                    Please contact our admin team on Telegram to get your account activated.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <a 
                      href="https://t.me/jujutsukaisen_jap" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-8 h-16 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
                    >
                      <Send className="h-6 w-6 mr-3" /> Message Admin on Telegram
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
    </div>
  );
}
