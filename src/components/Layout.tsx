import { Link, Outlet, useLocation } from "react-router-dom";
import { FileText, Menu, X, Github, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm" 
            : "bg-white dark:bg-slate-950 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 text-white p-1.5 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
              <FileText className="h-6 w-6" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              PDF<span className="text-blue-600 dark:text-blue-400">Master</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  location.pathname === link.path ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300">
              <Link to="/pricing">Go Premium</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md">
              <Link to="/tools">All Tools</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`p-3 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <Button asChild className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 h-12 text-white">
                <Link to="/tools">Explore All Tools</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-heading font-bold text-xl text-white">
                  PDF<span className="text-blue-400">Master</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                The ultimate toolkit for all your PDF needs. Fast, secure, and completely in your browser.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-6">Popular Tools</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/tools/merge" className="hover:text-blue-400 transition-colors">Merge PDF</Link></li>
                <li><Link to="/tools/split" className="hover:text-blue-400 transition-colors">Split PDF</Link></li>
                <li><Link to="/tools/compress" className="hover:text-blue-400 transition-colors">Compress PDF</Link></li>
                <li><Link to="/tools/word-to-pdf" className="hover:text-blue-400 transition-colors">Word to PDF</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-6">More Tools</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/tools/image-to-pdf" className="hover:text-blue-400 transition-colors">Image to PDF</Link></li>
                <li><Link to="/tools/pdf-to-word" className="hover:text-blue-400 transition-colors">PDF to Word</Link></li>
                <li><Link to="/tools/text-to-pdf" className="hover:text-blue-400 transition-colors">Text to PDF</Link></li>
                <li><Link to="/tools" className="hover:text-blue-400 transition-colors">All Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} PDFMaster. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed with ❤️ for productivity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
