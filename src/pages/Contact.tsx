import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-heading tracking-tight">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Us</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Have a question or need help? We're here for you. Fill out the form below or reach out to us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-1 space-y-6"
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Email</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">support@ieltsaid.net</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Phone</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">+1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Office</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">123 IELTS Street, Suite 100<br/>San Francisco, CA 94103</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">Send us a message</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">We'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <input id="firstName" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <input id="lastName" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input id="email" type="email" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea id="message" rows={5} className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <Button type="submit" className="w-full h-12 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
