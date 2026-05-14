import { useState, useRef, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Send, User, Sparkles, Wand2, Calculator, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIInsights() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI Energy Assistant. How can I help you optimize your energy usage today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliances, setAppliances] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "appliances"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppliances(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const systemInstruction = `You are an expert AI Energy Consultant for the FluxLogic app. 
      Your goal is to provide personalized, actionable advice to residential customers based on their appliance data and usage patterns.
      
      User's Current Appliances:
      ${JSON.stringify(appliances, null, 2)}
      
      Always be professional, encouraging, and data-driven. Suggest specific replacements (e.g., LED vs Incandescent) or habit changes (e.g., peak hours).
      If the user asks about specific calculations, use the formula: Energy (kWh) = (Watts * Hours * Days * Quantity) / 1000.`;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        config: {
          systemInstruction,
        },
      });

      const text = result.text;
      if (text) {
        setMessages(prev => [...prev, { role: "ai", content: text }]);
      } else {
        throw new Error("No response from Gemini");
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "I'm sorry, I encountered an error while reaching the energy specialist. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How can I save $50 this month?",
    "Which node is most inefficient?",
    "Calculate AC cost for 8 hours daily",
    "Identify optimization patterns"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            Intelligence Engine
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Neural <br />
            <span className="text-gradient italic">Insights</span>
          </h1>
          <p className="text-muted-foreground font-medium">Calibrated advice from our core.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          <Sparkles className="h-4 w-4 fill-current animate-pulse" /> Neural Core Active
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-[1fr,320px] gap-10 overflow-hidden">
        {/* Chat Section */}
        <Card className="flex flex-col border border-border/40 bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          {/* Noise/Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <CardHeader className="border-b border-border/40 p-6 bg-muted/30 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 relative group">
                  <BrainCircuit className="h-8 w-8 relative z-10 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Energy Specialist</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Node: Gemini-1.5-Flash</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] tracking-widest animate-pulse">LIVE CORE</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col relative z-10">
            <ScrollArea className="flex-1 p-8" ref={scrollRef}>
              <div className="space-y-8 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex gap-4 max-w-[90%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border",
                        msg.role === "user" ? "bg-secondary border-border/40" : "bg-primary border-primary text-primary-foreground"
                      )}>
                        {msg.role === "user" ? <User className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
                      </div>
                      <div className={cn(
                        "p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-secondary/40 text-foreground rounded-tl-none border border-border/40"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <div className="flex gap-4 mr-auto max-w-[90%]">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground animate-pulse shadow-xl shadow-primary/20">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div className="px-6 py-4 rounded-[1.5rem] bg-secondary/40 rounded-tl-none border border-border/40">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-60">Synthesizing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-8 border-t border-border/40 bg-muted/20">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 w-full ml-1">Suggested Inquiries:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-card rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 p-2 bg-card rounded-2xl border border-border/40 shadow-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Input 
                  placeholder="TRANSMIT TO INTELLIGENCE CORE..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-transparent border-none font-bold uppercase tracking-widest text-[10px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 h-12 flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Section */}
        <div className="space-y-8 overflow-y-auto custom-scrollbar">
          <Card className="border border-border/40 bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group p-1 rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="bg-primary-foreground/5 rounded-[1.5rem] p-6 relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Wand2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Rapid Ops</CardTitle>
              </div>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] justify-start px-5 group/btn" onClick={() => {
                  setInput("Perform global network optimization across all appliances");
                  setTimeout(handleSendMessage, 0);
                }}>
                  <Calculator className="h-4 w-4 mr-3 group-hover/btn:rotate-12 transition-transform" /> Optimize Global
                </Button>
                <Button variant="secondary" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] justify-start px-5 group/btn" onClick={() => {
                  setInput("Construct detailed energy consumption profile for next 30 days");
                  setTimeout(handleSendMessage, 0);
                }}>
                  <Sparkles className="h-4 w-4 mr-3 group-hover/btn:scale-125 transition-transform" /> Pattern Mapping
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="pb-2 p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Training Model
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-muted-foreground p-6 pt-2 space-y-4">
              <p>Engine trained on <span className="text-foreground">7,500+ telemetry sets</span>.</p>
              <div className="p-4 bg-muted/30 rounded-[1.25rem] border border-border/40 italic">
                <span className="text-primary font-black mr-2">CALIBRATION:</span> 
                Supply regional tariff data for sub-cent billing accuracy.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
