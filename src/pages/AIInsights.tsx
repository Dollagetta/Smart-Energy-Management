import { useState, useRef, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { Button } from "@/components/ui/button";
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
      const systemInstruction = `You are an expert AI Energy Consultant for the Smart Energy Manager AI app. 
      Your goal is to provide personalized, actionable advice to residential customers based on their appliance data and usage patterns.
      
      User's Current Appliances:
      ${JSON.stringify(appliances, null, 2)}
      
      Always be professional, encouraging, and data-driven. Suggest specific replacements (e.g., LED vs Incandescent) or habit changes (e.g., peak hours).
      If the user asks about specific calculations, use the formula: Energy (kWh) = (Watts * Hours * Days * Quantity) / 1000.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        config: {
          systemInstruction,
        },
      });

      if (result.text) {
        setMessages(prev => [...prev, { role: "ai", content: result.text || "" }]);
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
    "Which appliance is most inefficient?",
    "Calculate AC cost for 8 hours daily",
    "Best time to use washing machine?"
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic">AI Insights</h1>
          <p className="text-slate-500">Intelligent recommendations for your smart home.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
          <Sparkles className="h-4 w-4" /> AI Powered
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-[1fr,300px] gap-6 overflow-hidden">
        {/* Chat Section */}
        <Card className="flex flex-col border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">Energy Specialist</CardTitle>
                <CardDescription className="text-xs">Always online & ready to help</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        msg.role === "user" ? "bg-slate-200" : "bg-primary text-white"
                      )}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm shadow-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-slate-100 text-slate-800 rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white animate-pulse">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-slate-50">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask about your energy usage..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-white border-slate-200"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools/Actions Sidebar */}
        <div className="space-y-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-indigo-600" /> One-Click Ops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs h-9 bg-white" onClick={() => {
                setInput("Optimize all my appliances");
                setTimeout(handleSendMessage, 0);
              }}>
                <Calculator className="h-3 w-3 mr-2 text-slate-400" /> Optimize All
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 bg-white" onClick={() => {
                setInput("Show energy saving patterns");
                setTimeout(handleSendMessage, 0);
              }}>
                <Sparkles className="h-3 w-3 mr-2 text-slate-400" /> Pattern Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" /> AI Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>Our AI is trained on thousands of energy residential patterns and latest appliance efficiency standards.</p>
              <div className="p-3 bg-slate-50 rounded-lg">
                <b>Pro Tip:</b> Mention your region in the chat for accurate tariff-based advice!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
