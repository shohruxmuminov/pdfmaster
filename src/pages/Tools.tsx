import { toolsList } from "./Home";
import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { motion } from "framer-motion";

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

export default function Tools() {
  return (
    <div className="container mx-auto max-w-6xl py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-heading tracking-tight">
          All PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Tools</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Make use of our collection of PDF tools to process digital documents and streamline your workflow seamlessly.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
  );
}
