import { ReactNode, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { 
  LayoutDashboard, 
  Zap, 
  BrainCircuit, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Leaf,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  user: User;
}

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/appliances", icon: Zap, label: "Appliances" },
  { path: "/ai-insights", icon: BrainCircuit, label: "AI Insights" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function MainLayout({ user }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartEnergy</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  location.pathname === item.path
                    ? "bg-slate-100 text-primary"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-3 py-4 mb-4">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{user.displayName || user.email?.split('@')[0]}</span>
                <span className="text-xs text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-bottom bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">SmartEnergy</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
