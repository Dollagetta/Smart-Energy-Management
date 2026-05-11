import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Zap, 
  BrainCircuit, 
  BarChart3, 
  Leaf, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-100">
        <Link className="flex items-center justify-center gap-2" to="/">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <span className="font-bold text-xl tracking-tight">SmartEnergy AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/login">
            Login
          </Link>
          <Button asChild pill-rounded size="sm">
            <Link to="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:gap-12 xl:grid-cols-[1fr,600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  >
                    Optimize Your Energy <br />
                    <span className="text-primary italic">Powered by AI</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-[600px] text-slate-500 md:text-xl"
                  >
                    Estimate your monthly bill, track appliance usage, and receive personalized AI recommendations to reduce your electricity costs by up to 30%.
                  </motion.p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="px-8">
                    <Link to="/login">
                      Start Savings Now <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    See How It Works
                  </Button>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mx-auto aspect-video overflow-hidden rounded-xl bg-slate-200 sm:w-full lg:order-last border-4 border-white shadow-2xl"
              >
                <img
                  alt="App Dashboard Preview"
                  className="object-cover w-full h-full"
                  src="https://images.unsplash.com/photo-1592833159155-c62df1b35624?q=80&w=2670&auto=format&fit=crop"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-bold">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need to save</h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive toolset helps you understand exactly where your money goes every month.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Predictive Analytics</h3>
                <p className="text-slate-500">ML-driven predictions for your next bill based on historical usage and appliance trends.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <BrainCircuit className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">AI Assistant</h3>
                <p className="text-slate-500">Ask our AI anything about energy saving. Get custom tips for your specific home setup.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Eco-Friendly</h3>
                <p className="text-slate-500">Track your carbon footprint and discover ways to reduce your environmental impact.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Ready to reduce your electricity bill?</h2>
            <p className="mx-auto max-w-[600px] mb-8 opacity-90 text-lg">
              Join thousands of smart homeowners who are taking control of their energy usage.
            </p>
            <Button asChild size="lg" variant="secondary" className="px-10">
              <Link to="/login">Join SmartEnergy AI Today</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-slate-500">© 2026 SmartEnergy AI Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="#">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4" to="#">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
