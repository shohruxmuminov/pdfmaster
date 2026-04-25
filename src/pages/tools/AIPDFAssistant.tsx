import { useState } from "react";
import ToolLayout from "@/src/components/ToolLayout";
import * as pdfjsLib from "pdfjs-dist";
import { summarizeContent, translateContent, improveWriting } from "@/src/services/geminiService";
import { Sparkles, FileText, Globe, Zap, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function AIPDFAssistant() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [aiResult, setAiResult] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTask, setActiveTask] = useState<string>("summary");
  const [targetLang, setTargetLang] = useState<string>("Uzbek");

  const handleFileProcess = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 PDF file.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `${pageText}\n\n`;
    }

    setExtractedText(fullText);
    
    // We don't return a blob here because we want to show the AI options first
    // ToolLayout will handle the "Processing" state for extraction
    return null; 
  };

  const runAiTask = async (task: string) => {
    if (!extractedText) return;
    
    setIsAiProcessing(true);
    setActiveTask(task);
    try {
      let result = "";
      if (task === "summary") {
        result = await summarizeContent(extractedText);
      } else if (task === "translate") {
        result = await translateContent(extractedText, targetLang);
      } else if (task === "improve") {
        result = await improveWriting(extractedText);
      }
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const downloadAiResult = () => {
    const blob = new Blob([aiResult], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-${activeTask}-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      {!extractedText ? (
        <ToolLayout
          title="DeepSeek AI PDF Assistant"
          description="Analyze, summarize, and translate your PDF documents with the power of DeepSeek AI."
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          actionButtonText="Analyze PDF"
          onProcess={async (files) => {
            await handleFileProcess(files);
            return null; // We handle the UI transition manually
          }}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                AI PDF Assistant
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Choose an AI task to perform on your document.</p>
            </div>
            <Button variant="outline" onClick={() => setExtractedText("")} className="rounded-xl">
              Upload New File
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Controls */}
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">AI Tasks</CardTitle>
                <CardDescription>Select what you want DeepSeek to do</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => runAiTask("summary")} 
                  disabled={isAiProcessing}
                  className="w-full justify-start gap-3 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-none"
                >
                  <FileText className="h-5 w-5" /> Summarize Content
                </Button>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => runAiTask("translate")} 
                    disabled={isAiProcessing}
                    className="w-full justify-start gap-3 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border-none"
                  >
                    <Globe className="h-5 w-5" /> Translate to...
                  </Button>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm"
                  >
                    <option value="Uzbek">Uzbek</option>
                    <option value="English">English</option>
                    <option value="Russian">Russian</option>
                    <option value="Spanish">Spanish</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <Button 
                  onClick={() => runAiTask("improve")} 
                  disabled={isAiProcessing}
                  className="w-full justify-start gap-3 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-none"
                >
                  <Zap className="h-5 w-5" /> Improve Writing
                </Button>
              </CardContent>
            </Card>

            {/* AI Result Area */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {isAiProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        DeepSeek is thinking...
                      </>
                    ) : aiResult ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        AI Result
                      </>
                    ) : (
                      "Select a task to begin"
                    )}
                  </CardTitle>
                  {aiResult && !isAiProcessing && (
                    <Button size="sm" onClick={downloadAiResult} className="rounded-lg gap-2">
                      <Download className="h-4 w-4" /> Download .txt
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {isAiProcessing ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
                    <div className="w-full max-w-md space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse w-5/6" />
                    </div>
                    <p className="text-sm font-medium animate-pulse">Processing your document with DeepSeek AI...</p>
                  </div>
                ) : aiResult ? (
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiResult}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <Sparkles className="h-16 w-16 opacity-20" />
                    <p className="text-center max-w-xs">
                      DeepSeek AI will analyze your document's text and provide insights here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
