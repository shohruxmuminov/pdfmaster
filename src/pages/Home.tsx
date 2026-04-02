import { Link } from "react-router-dom";
import { ArrowRight, FileImage, FileText, SplitSquareHorizontal, Minimize2, Layers, FileDown, FileUp, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { motion } from "framer-motion";

export const toolsList = [
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one unified document.",
    icon: Layers,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    path: "/tools/merge"
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: SplitSquareHorizontal,
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    path: "/tools/split"
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: Minimize2,
    color: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    path: "/tools/compress"
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert JPG, PNG, or TIFF images to PDF in seconds.",
    icon: FileImage,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    path: "/tools/image-to-pdf"
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Extract text from your PDF files and save as Word.",
    icon: FileText,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    path: "/tools/pdf-to-word"
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents (.docx) into PDF files.",
    icon: FileUp,
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    path: "/tools/word-to-pdf"
  },
  {
    id: "text-to-pdf",
    name: "Text to PDF",
    description: "Convert plain text files into PDF documents.",
    icon: FileDown,
    color: "text-teal-500 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-500/10",
    path: "/tools/text-to-pdf"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 bg-white dark:bg-slate-950 text-center px-4 overflow-hidden transition-colors duration-300">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] dark:opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container relative mx-auto max-w-4xl z-10"
        >
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300 mb-8">
            <Sparkles className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>The ultimate PDF toolkit</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            All PDF Tools in <br className="hidden md:block" />
            <span className="text-gradient">One Place</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Convert, compress, and manage PDFs instantly. Fast, secure, and right in your browser. No installation required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
              <Link to="/tools">Start Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 dark:text-slate-300 transition-all hover:scale-105">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Ad Placeholder */}
      <div className="w-full max-w-4xl mx-auto h-24 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm mb-16 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
        Advertisement Space
      </div>

      {/* Tools Grid */}
      <section className="w-full py-20 bg-slate-50 dark:bg-slate-950/50 px-4 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Most Popular Tools</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to work with PDFs in one place.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {toolsList.map((tool) => (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link to={tool.path} className="group block h-full">
                  <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden">
                    <CardHeader className="p-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tool.bgColor}`}>
                        <tool.icon className={`h-7 w-7 ${tool.color}`} />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</CardTitle>
                      <CardDescription className="text-base mt-3 leading-relaxed text-slate-500 dark:text-slate-400">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-white dark:bg-slate-950 px-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Choose PDFMaster?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Built for speed, security, and simplicity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">Fast & Secure</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Files are processed directly in your browser. We don't store your sensitive data on our servers.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-violet-100 dark:hover:border-violet-900/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 shadow-sm text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">Easy to Use</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Clean, intuitive interface. Just drag, drop, and click to get your results instantly without any hassle.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-fuchsia-100 dark:hover:border-fuchsia-900/50 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/20 transition-colors"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 shadow-sm text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">High Quality</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Get the best possible results with our advanced PDF processing algorithms, preserving original quality.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
