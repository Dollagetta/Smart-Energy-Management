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
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/40 px-6 h-16 flex items-center">
        <Link className="flex items-center gap-2 group" to="/">
          <Zap className="h-6 w-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-tight font-heading">SmartEnergy <span className="text-primary italic">AI</span></span>
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
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
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
                  The most advanced AI dashboard for your home. Predict bills, optimize appliance usage, and cut costs by up to 40% with precision intelligence.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
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
                We combine real-time sensor data with proprietary ML models to give you control you never thought possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: BrainCircuit, 
                  title: "Neuro Predict", 
                  desc: "Our neural network predicts your monthly bill with 98% accuracy after just 7 days of usage.",
                  color: "bg-blue-500"
                },
                { 
                  icon: BarChart3, 
                  title: "Deep Analytics", 
                  desc: "Granular breakdown of every appliance. Know exactly what your dryer costs per load.",
                  color: "bg-purple-500"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Leak Guard", 
                  desc: "Instant alerts for vampire power drains and abnormal usage patterns that signal faulty tech.",
                  color: "bg-emerald-500"
                },
                { 
                  icon: Smartphone, 
                  title: "Edge Control", 
                  desc: "Seamlessly integrate with your existing smart home hubs for automated energy saving.",
                  color: "bg-orange-500"
                }
              ].map((feature, i) => (
                <FeatureCard key={i} index={i} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Big Text Divider */}
        <section className="py-20 overflow-hidden bg-foreground text-background whitespace-nowrap">
          <div className="flex animate-marquee gap-20">
            {[1, 2, 3].map((set) => (
              <div key={set} className="flex gap-20 items-center">
                <span className="text-7xl md:text-9xl font-black opacity-20 uppercase">SAVE MONEY</span>
                <Zap className="h-20 w-20 text-primary" />
                <span className="text-7xl md:text-9xl font-black opacity-20 uppercase">SAVE ENERGY</span>
                <Leaf className="h-20 w-20 text-emerald-500" />
                <span className="text-7xl md:text-9xl font-black opacity-20 uppercase">SAVE PLANET</span>
                <BrainCircuit className="h-20 w-20 text-blue-500" />
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
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold text-lg tracking-tight font-heading uppercase">SmartEnergy</span>
          </div>
          <div className="flex gap-12 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link className="hover:text-primary transition-colors" to="#">Products</Link>
            <Link className="hover:text-primary transition-colors" to="#">Company</Link>
            <Link className="hover:text-primary transition-colors" to="#">Support</Link>
            <Link className="hover:text-primary transition-colors" to="#">Legal</Link>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            © 2026 SmartEnergy AI Inc. 
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: any, index: number, key?: any }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 rounded-3xl bg-card border border-border/60 card-hover group"
    >
      <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold uppercase mb-4 tracking-tight">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {feature.desc}
      </p>
    </motion.div>
  );
}

