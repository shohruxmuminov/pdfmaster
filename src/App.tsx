import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import TeacherPanel from "./pages/TeacherPanel";
import IELTSSection from "./pages/IELTSSection";
import Auth from "./pages/Auth";
import { GeminiProvider, useGemini } from "./components/GeminiContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect } from "react";

import ProfileSettings from "./pages/ProfileSettings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useGemini();
  
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="teacher" element={<ProtectedRoute><TeacherPanel /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path=":category" element={<ProtectedRoute><IELTSSection /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ielts-theme">
      <GeminiProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </GeminiProvider>
    </ThemeProvider>
  );
}


