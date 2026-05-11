import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ApplianceManager from "./pages/ApplianceManager";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
        />
        
        {/* Protected Routes */}
        <Route 
          element={user ? <MainLayout user={user} /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appliances" element={<ApplianceManager />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}
