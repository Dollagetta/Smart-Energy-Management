import { ReactNode, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  LayoutDashboard, 
  Zap, 
  BrainCircuit, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Leaf,
  FileText,
  Calculator
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
  { path: "/energy-balance", icon: Leaf, label: "Energy Balance" },
  { path: "/bill-calculator", icon: Calculator, label: "Bill Calculator" },
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
    <div className="flex h-screen bg-background font-sans overflow-hidden selection:bg-primary/20">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card/70 backdrop-blur-3xl border-r border-border/40 transition-transform lg:relative lg:translate-x-0 overflow-hidden",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-transparent via-transparent to-primary/5">
          {/* Sidebar Header */}
          <div className="p-8">
            <Link className="flex items-center gap-4 group" to="/dashboard">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 group-hover:scale-110 transition-all duration-500 relative">
                <Zap className="h-6 w-6 fill-current relative z-10" />
                <div className="absolute inset-0 bg-white/20 rounded-[1.25rem] animate-pulse opacity-20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black leading-none tracking-tighter">Flux</span>
                <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mt-0.5 animate-pulse">Logic</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5 space-y-2 overflow-y-auto py-6 custom-scrollbar">
            <div className="mb-6 px-4">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Command Center</span>
            </div>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black transition-all duration-500 group uppercase tracking-widest",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all duration-500", 
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 rotate-3" 
                        : "bg-secondary text-muted-foreground group-hover:bg-foreground group-hover:text-background group-hover:-translate-y-1"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="transition-transform group-hover:translate-x-1">{item.label}</span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-dot" 
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary relative z-10 shadow-sm shadow-primary"
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-6 border-t border-border/40 bg-muted/30 backdrop-blur-md">
            <div className="flex items-center gap-4 p-4 rounded-[1.75rem] bg-card border border-border/40 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-colors">
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                <SettingsIcon className="h-10 w-10 text-primary rotate-45" />
              </div>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted ring-2 ring-primary/10 group-hover:ring-primary transition-all duration-500">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                  className="object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1 relative z-10">
                <span className="text-xs font-black truncate uppercase tracking-tight leading-none mb-1">{user.displayName || user.email?.split('@')[0]}</span>
                <span className="text-[9px] text-muted-foreground truncate uppercase font-bold tracking-[0.15em] opacity-60 italic">{user.email}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full mt-6 justify-start gap-4 h-14 rounded-2xl hover:bg-destructive/5 hover:text-destructive group transition-all"
              onClick={handleLogout}
            >
              <div className="p-3 rounded-xl bg-destructive/10 group-hover:bg-destructive group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">Terminate Session</span>
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-20 shrink-0 items-center border-b border-border/40 bg-card/50 backdrop-blur-xl px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-primary/5 hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" /> <span className="hidden xs:inline">Back</span>
              </Button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <span className="font-black uppercase tracking-tighter text-lg">FluxLogic</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">System Ready</div>
                <div className="text-xs font-bold uppercase tracking-tight">Active Session</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-10 md:p-12 lg:p-16 space-y-16 custom-scrollbar relative z-10 flex flex-col justify-between">
          <div>
            {/* subtle background pattern for the whole app */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0" />
            <Outlet />
          </div>
          
          {/* Main Layout Footer */}
          <footer className="mt-40 border-t border-border/40 pt-16 pb-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 fill-primary text-primary" />
                  <span className="font-bold text-xl tracking-tight font-heading uppercase">FluxLogic</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  FluxLogic is a premier tech entity specializing in advanced AI-powered systems designed to optimize energy flow and infrastructure efficiency.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Contact Hub</h4>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://wa.me/917396507539" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    WhatsApp Support
                  </a>
                  <a 
                    href="mailto:fluxlogic@gmail.com" 
                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText className="h-5 w-5" />
                    </div>
                    fluxlogic@gmail.com
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Global Operations</h4>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">© 2026 FluxLogic Inc. All rights reserved.</p>
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Powered by Antigravity Engines</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
