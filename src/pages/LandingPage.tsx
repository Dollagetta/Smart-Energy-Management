import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Zap, 
  BrainCircuit, 
  BarChart3, 
  Leaf, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/40 px-6 h-16 flex items-center">
        <Link className="flex items-center gap-2 group" to="/">
          <Zap className="h-6 w-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-tight font-heading">FluxLogic</span>
        </Link>
        <nav className="ml-auto flex gap-8 items-center">
          <Link className="hidden md:block text-sm font-medium hover:text-primary transition-colors hover:underline underline-offset-8" to="/features">
            Features
          </Link>
          <Link className="hidden md:block text-sm font-medium hover:text-primary transition-colors hover:underline underline-offset-8" to="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" to="/login">
            Sign In
          </Link>
          <Link to="/login" className={buttonVariants({ variant: "default", size: "sm", className: "rounded-full px-6 shadow-lg shadow-primary/20" })}>
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        {/* Split Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse opacity-70" />
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary mb-6 ring-1 ring-primary/20">
                  <Zap className="h-3 w-3" />
                  NEW VERSION 2.0 IS LIVE
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6 uppercase">
                  Master Your <br />
                  <span className="text-gradient">Energy Flow</span>
                </h1>
                <p className="max-w-[540px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                  Predict bills, optimize usage, and cut costs with precision AI intelligence.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/login" className={buttonVariants({ size: "lg", className: "rounded-full px-10 text-lg shadow-xl shadow-primary/20" })}>
                  Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Button variant="outline" size="lg" className="rounded-full px-10 text-lg group">
                  Watch Demo <Zap className="ml-2 h-5 w-5 group-hover:text-primary transition-colors" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 pt-8 border-t border-border/40"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-foreground">12.5k+</span>
                  <span className="text-muted-foreground ml-1">users saving money daily</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative aspect-square lg:aspect-auto h-full min-h-[500px]"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent rounded-3xl -rotate-3 translate-x-4 translate-y-4" />
              <div className="absolute inset-0 border border-border/60 rounded-3xl overflow-hidden shadow-2xl bg-card">
                <img
                  src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2670&auto=format&fit=crop"
                  alt="Modern Home Interior"
                  className="object-cover w-full h-full opacity-90 transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Live Efficiency</span>
                    <span className="text-xs text-white/60">Updated 2m ago</span>
                  </div>
                  <div className="text-2xl font-black text-white">94.2% OPTIMIZED</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="w-[94%] bg-primary h-full rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Carousel/Grid */}
        <section className="py-32 bg-secondary/30 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-20">
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 leading-none">
                Not Just Another <br />
                <span className="text-primary italic">Energy Tracker</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Real-time data and ML models for total energy control and efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: BrainCircuit, 
                  title: "Neuro Predict", 
                  desc: "Neural network predicts bills with 98% accuracy in just 7 days.",
                  color: "bg-blue-500"
                },
                { 
                  icon: BarChart3, 
                  title: "Deep Analytics", 
                  desc: "Granular breakdown of every appliance and usage cost.",
                  color: "bg-purple-500"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Leak Guard", 
                  desc: "Instant alerts for power drains and abnormal usage patterns.",
                  color: "bg-emerald-500"
                },
                { 
                  icon: Smartphone, 
                  title: "Edge Control", 
                  desc: "Integrate with smart hubs for automated energy saving.",
                  color: "bg-orange-500"
                }
              ].map((feature, i) => (
                <FeatureCard key={i} index={i} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Big Text Divider */}
        <section className="py-12 md:py-20 overflow-hidden bg-foreground text-background whitespace-nowrap border-y border-orange-500/20">
          <div className="flex animate-marquee-right gap-12 md:gap-20">
            {[1, 2, 3, 4, 5, 6].map((set) => (
              <div key={set} className="flex gap-12 md:gap-20 items-center">
                <span className="text-4xl md:text-9xl font-black opacity-60 text-orange-200/80 uppercase">SAVE MONEY</span>
                <Zap className="h-10 w-10 md:h-20 md:w-20 text-orange-400" />
                <span className="text-4xl md:text-9xl font-black opacity-60 text-primary/80 uppercase">SAVE ENERGY</span>
                <Leaf className="h-10 w-10 md:h-20 md:w-20 text-emerald-400" />
                <span className="text-4xl md:text-9xl font-black opacity-60 text-blue-300/80 uppercase">SAVE PLANET</span>
                <BrainCircuit className="h-10 w-10 md:h-20 md:w-20 text-blue-400" />
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-5xl md:text-8xl font-black uppercase mb-12 leading-[0.85]">
              Stop Guessing. <br />
              <span className="text-gradient italic">Start Saving.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/login" className={buttonVariants({ size: "lg", className: "rounded-full px-12 group" })}>
                Get Started for Free <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest leading-none">
                <CheckCircle2 className="h-4 w-4 text-primary" /> No Credit Card Required
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-border/40 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary fill-primary" />
                <span className="font-bold text-xl tracking-tight font-heading uppercase">FluxLogic</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                FluxLogic is a premier tech entity specializing in advanced AI-powered systems designed to optimize energy flow and infrastructure efficiency. Based on proprietary neural architecture, we redefine how resources are managed.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Global Contacts</h4>
              <div className="flex flex-col gap-4">
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

            <div className="space-y-6 text-right">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Navigation</h4>
              <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Link className="hover:text-primary transition-colors" to="/features">Products</Link>
                <Link className="hover:text-primary transition-colors" to="/login">Dashboard</Link>
                <Link className="hover:text-primary transition-colors" to="#">Legal</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
              © 2026 FluxLogic Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">AI-Powered Precision</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: any, index: number, key?: any }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
      className="p-8 rounded-3xl bg-card border-2 border-orange-500/10 hover:border-orange-500/30 shadow-lg hover:shadow-orange-500/5 group"
    >
      <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg ring-4 ring-${feature.color}/20`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold uppercase mb-4 tracking-tight">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {feature.desc}
      </p>
    </motion.div>
  );
}

