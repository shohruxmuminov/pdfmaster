import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Download, Loader2, CheckCircle2, AlertCircle, Lock, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { useUser } from "@/src/hooks/useUser";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/src/components/ui/card";

interface ToolLayoutProps {
  title: string;
  description: string;
  accept: Record<string, string[]>;
  maxFiles?: number;
  actionButtonText: string;
  onProcess: (files: File[]) => Promise<{ blob: Blob; filename: string } | null>;
}

export default function ToolLayout({
  title,
  description,
  accept,
  maxFiles = 0, // 0 means unlimited
  actionButtonText,
  onProcess,
}: ToolLayoutProps) {
  const { isPremium, usageCount, incrementUsage } = useUser();
  const MAX_FREE_USAGE = 4;
  const hasReachedLimit = !isPremium && usageCount >= MAX_FREE_USAGE;

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (hasReachedLimit) {
      setError(`You have reached your free usage limit (${MAX_FREE_USAGE} operations). Please upgrade to Premium to continue.`);
      return;
    }
    if (maxFiles > 0 && files.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files for this tool.`);
      return;
    }
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, [files, maxFiles, hasReachedLimit]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: isPremium ? 100 * 1024 * 1024 : 15 * 1024 * 1024, // 100MB premium, 15MB free
    onDropRejected: (fileRejections: any[]) => {
      const errors = fileRejections.map(r => r.errors.map((e: any) => e.message).join(", ")).join("; ");
      setError(`File rejected: ${errors}`);
    }
  } as any);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    if (hasReachedLimit) {
      setError(`You have reached your free usage limit (${MAX_FREE_USAGE} operations). Please upgrade to Premium to continue.`);
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + (isPremium ? 15 : 5) : p));
      }, 500);

      const output = await onProcess(files);
      
      clearInterval(interval);
      setProgress(100);

      if (output) {
        const url = URL.createObjectURL(output.blob);
        setResult({ url, filename: output.filename });
        incrementUsage(); // Increment usage after successful process
      } else {
        setError("Processing failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-heading tracking-tight">{title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{description}</p>
      </div>

      {hasReachedLimit && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3 text-orange-800 dark:text-orange-200">
            <Lock className="h-6 w-6 flex-shrink-0 text-orange-500 dark:text-orange-400" />
            <div>
              <p className="font-semibold">Free Limit Reached</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">You've used all {MAX_FREE_USAGE} free operations. Upgrade to Premium for unlimited access.</p>
            </div>
          </div>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md">
            <Link to="/pricing">Unlock Premium</Link>
          </Button>
        </motion.div>
      )}

      {!isPremium && !hasReachedLimit && (
        <div className="mb-6 text-center text-sm font-medium">
          <span className="text-slate-600 dark:text-slate-400">
            Free Usage: {usageCount} / {MAX_FREE_USAGE} operations used.
          </span>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <CardContent className="p-6 md:p-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 mb-6"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {!result ? (
            <div className="space-y-8">
              {files.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]" : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  } ${hasReachedLimit ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <input {...getInputProps()} disabled={hasReachedLimit} />
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">or click to browse from your computer</p>
                  <Button disabled={hasReachedLimit} variant="secondary" className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white">
                    Select Files
                  </Button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                    Max file size: {isPremium ? "100MB" : "15MB"} {maxFiles > 0 ? `| Up to ${maxFiles} files` : ''}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <motion.div 
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                              <FileIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <button 
                            onClick={() => removeFile(index)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add more files button if not reached max */}
                  {(maxFiles === 0 || files.length < maxFiles) && !isProcessing && (
                    <div {...getRootProps()} className="text-center">
                      <input {...getInputProps()} disabled={hasReachedLimit} />
                      <Button variant="outline" className="w-full border-dashed rounded-xl h-12 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-slate-300 dark:border-slate-700">
                        + Add more files
                      </Button>
                    </div>
                  )}

                  {isProcessing ? (
                    <div className="space-y-3 pt-4">
                      <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" /> Processing...
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ) : (
                    <div className="flex justify-center pt-4">
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                        onClick={handleProcess}
                        disabled={hasReachedLimit}
                      >
                        {actionButtonText}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Task Complete!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Your file has been processed successfully.</p>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors max-w-md mx-auto mb-8">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{result.filename}</span>
                </div>
                <Button asChild size="sm" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <a href={result.url} download={result.filename}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              </div>
              
              <Button variant="outline" onClick={reset} className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                Process Another File
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Pro Tip
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {isPremium 
            ? "You are a Premium user! Enjoy unlimited operations, up to 100MB file uploads, and lightning-fast processing speeds."
            : "Free users can process files up to 15MB and perform 4 operations. Upgrade to Premium for 100MB limits and unlimited usage."}
        </p>
      </div>
    </div>
  );
}
