import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Menu, X, Github, Twitter, Calendar, LogOut, User as UserIcon, LogIn, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { Sidebar } from "./Sidebar";
import { useGemini } from "./GeminiContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { user, role } = useGemini();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Listening", path: "/listening" },
    { name: "Reading", path: "/reading" },
    { name: "Writing", path: "/writing" },
    { name: "Speaking", path: "/speaking" },
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
              <span className="text-xl font-black px-1">I</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              IELTS<span className="text-blue-600 dark:text-blue-400">.net</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex xl:hidden items-center gap-8">
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
            <Button 
              onClick={() => setIsCalendarOpen(true)}
              variant="outline"
              className="rounded-full border-slate-200 dark:border-slate-800 font-bold flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              Schedule
            </Button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" className="rounded-full p-2 h-10 w-10">
                  <Link to="/settings" title="Profile Settings">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                </Button>
                {(role === "admin" || role === "teacher") && (
                  <Button asChild variant="ghost" className="rounded-full p-2 h-10 w-10 text-blue-600">
                    <Link to={role === "admin" ? "/admin" : "/teacher"} title={`${role === "admin" ? "Admin" : "Teacher"} Panel`}>
                      <Shield className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="rounded-full p-2 h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md px-6">
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
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
              
              {user ? (
                <>
                  <Link to="/admin" className="p-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3">
                    <UserIcon className="h-5 w-5" />
                    Admin Panel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Button asChild className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 h-12 text-white">
                  <Link to="/auth">Login / Signup</Link>
                </Button>
              )}

              <Button 
                onClick={() => setIsCalendarOpen(true)}
                variant="outline"
                className="w-full rounded-xl border-slate-200 dark:border-slate-800 h-12 font-bold flex items-center justify-center gap-2 mt-2"
              >
                <Calendar className="h-4 w-4 text-blue-600" />
                Schedule Practice
              </Button>
            </nav>
          </div>
        )}
      </header>
      
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col xl:pl-24">
        <Outlet />
      </main>

      <ScheduleCalendar 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentCategory={location.pathname.split('/')[1] || 'General'}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <span className="font-black px-1">I</span>
                </div>
                <span className="font-heading font-bold text-xl text-white">
                  IELTS<span className="text-blue-400">.net</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-md">
                The ultimate platform for IELTS preparation. Aid Listening, Reading, Writing, and Speaking with our comprehensive materials and AI-powered tools.
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
              <h3 className="font-semibold text-white mb-6">Sections</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/listening" className="hover:text-blue-400 transition-colors">Listening</Link></li>
                <li><Link to="/reading" className="hover:text-blue-400 transition-colors">Reading</Link></li>
                <li><Link to="/writing" className="hover:text-blue-400 transition-colors">Writing</Link></li>
                <li><Link to="/speaking" className="hover:text-blue-400 transition-colors">Speaking</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-6">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/admin" className="hover:text-blue-400 transition-colors">Admin Panel</Link></li>
                <li><Link to="/teacher" className="hover:text-blue-400 transition-colors">Teacher Panel</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} IELTS.net. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <p>Designed for excellence.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
