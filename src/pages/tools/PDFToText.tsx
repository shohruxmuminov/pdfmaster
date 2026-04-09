import { useState, useEffect } from "react";
import ToolLayout from "@/src/components/ToolLayout";
import * as pdfjsLib from "pdfjs-dist";
import { summarizeContent, analyzeContent } from "@/src/services/geminiService";
import { Sparkles, Loader2, FileText, Download, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { motion } from "framer-motion";
import { useGemini } from "@/src/components/GeminiContext";
import { useNavigate } from "react-router-dom";

// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PDFToText() {
  const { isGeminiEnabled } = useGemini();
  const navigate = useNavigate();
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeminiProcessing, setIsGeminiProcessing] = useState(false);

  useEffect(() => {
    if (!isGeminiEnabled) {
      navigate("/");
    }
  }, [isGeminiEnabled, navigate]);

  const handleConvert = async (files: File[]) => {
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

    let finalResult = fullText;

    // If Gemini is enabled, use it to "perfect" the extraction
    if (isGeminiEnabled) {
      setIsGeminiProcessing(true);
      try {
        finalResult = await analyzeContent(fullText, "Clean up this extracted PDF text. Fix broken words, correct formatting errors caused by extraction, and ensure it reads naturally while preserving all original information.");
      } catch (error) {
        console.error("Gemini cleanup failed:", error);
      } finally {
        setIsGeminiProcessing(false);
      }
    }

    setExtractedText(finalResult);

    const blob = new Blob([finalResult], { type: "text/plain;charset=utf-8" });
    
    return {
      blob,
      filename: `${file.name.replace('.pdf', '')}.txt`
    };
  };

  const handleSummarize = async () => {
    if (!extractedText) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeContent(extractedText);
      setSummary(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-8">
      <ToolLayout
        title="PDF to Text"
        description={isGeminiEnabled ? "AI-Powered Text Extraction. Gemini AI will clean and format the extracted text for perfect results." : "Extract plain text content from your PDF files."}
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        actionButtonText={isGeminiProcessing ? "Gemini is perfecting text..." : "Extract Text"}
        onProcess={handleConvert}
      />

      {isGeminiProcessing && (
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <p className="text-blue-700 dark:text-blue-300 font-medium">Gemini AI is cleaning up the extracted text for you...</p>
          </div>
        </div>
      )}

      {extractedText && !isGeminiProcessing && (
        <div className="container mx-auto max-w-4xl px-4 pb-20">
          <Card className="border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Summary</h3>
                    <p className="text-slate-600 dark:text-slate-400">Want a quick summary of the extracted text?</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSummarize} 
                  disabled={isSummarizing || !!summary}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-8"
                >
                  {isSummarizing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</>
                  ) : summary ? (
                    "Summary Ready"
                  ) : (
                    "Summarize with Gemini"
                  )}
                </Button>
              </div>

              {summary && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" /> Executive Summary
                    </h4>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
                      const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "summary.txt";
                      a.click();
                    }}>
                      <Download className="h-3 w-3 mr-1" /> Download Summary
                    </Button>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {summary}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
