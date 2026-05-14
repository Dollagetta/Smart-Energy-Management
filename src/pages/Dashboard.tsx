import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Zap, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  Leaf,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronLeft,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ApplianceData {
  name: string;
  category: string;
  watts: number;
  quantity: number;
  hours: number;
  days: number;
  id: string;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function Dashboard() {
  const [role, setRole] = useState<"consumer" | "prosumer" | null>(null);
  const [step, setStep] = useState<"role" | "identification">("role");
  const [idNumber, setIdNumber] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);
  const [settings, setSettings] = useState({
    rate: 0.15,
    sellRate: 0.10, // Added sell rate for prosumers
    currency: "$",
    tariffMethodology: "fixed"
  });
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSettings({
            rate: typeof data.baseRate === 'number' ? data.baseRate : parseFloat(data.baseRate) || 0.15,
            sellRate: 0.10, // Default sell rate
            currency: data.currency || "$",
            tariffMethodology: data.tariffMethodology || "fixed"
          });
          // Set role from saved profile if exists
          if (data.role === "consumer" || data.role === "prosumer") {
            setRole(data.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    fetchSettings();

    const q = query(collection(db, "users", user.uid, "appliances"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ApplianceData[];
      setAppliances(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/appliances`);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const totalKwh = appliances.reduce((sum, app) => {
      return sum + (app.watts * app.hours * app.days * app.quantity) / 1000;
    }, 0);

    // Mock generated energy for prosumers (e.g., from solar panels)
    // In a real app, this would come from a database or smart meter
    const generatedKwh = role === "prosumer" ? totalKwh * 0.7 : 0;
    const gridTakenKwh = role === "prosumer" ? Math.max(0, totalKwh - generatedKwh) : totalKwh;
    const gridSuppliedKwh = role === "prosumer" ? Math.max(0, generatedKwh - totalKwh) : 0;

    const totalCost = gridTakenKwh * settings.rate;
    const totalEarned = gridSuppliedKwh * settings.sellRate;
    const netMoney = role === "prosumer" ? totalEarned - totalCost : -totalCost;

    const highestConsumer = appliances.length > 0 
      ? appliances.reduce((prev, current) => {
          const prevUsage = (prev.watts * prev.hours * prev.days * prev.quantity) / 1000;
          const currentUsage = (current.watts * current.hours * current.days * current.quantity) / 1000;
          return prevUsage > currentUsage ? prev : current;
        })
      : null;

    const categoryData = appliances.reduce((acc: any[], app) => {
      const usage = (app.watts * app.hours * app.days * app.quantity) / 1000;
      const existing = acc.find(item => item.name === app.category);
      if (existing) {
        existing.value += usage;
      } else {
        acc.push({ name: app.category, value: usage });
      }
      return acc;
    }, []);

    const weeklyData = [
      { day: "Mon", units: totalKwh / 30 * 1.1, generated: generatedKwh / 30 * 1.05 },
      { day: "Tue", units: totalKwh / 30 * 0.9, generated: generatedKwh / 30 * 0.95 },
      { day: "Wed", units: totalKwh / 30 * 1.2, generated: generatedKwh / 30 * 1.1 },
      { day: "Thu", units: totalKwh / 30 * 1.05, generated: generatedKwh / 30 * 1.0 },
      { day: "Fri", units: totalKwh / 30 * 1.3, generated: generatedKwh / 30 * 1.2 },
      { day: "Sat", units: totalKwh / 30 * 1.5, generated: generatedKwh / 30 * 0.8 },
      { day: "Sun", units: totalKwh / 30 * 1.4, generated: generatedKwh / 30 * 0.9 },
    ];

    return {
      totalKwh: totalKwh.toFixed(1),
      generatedKwh: generatedKwh.toFixed(1),
      gridTakenKwh: gridTakenKwh.toFixed(1),
      gridSuppliedKwh: gridSuppliedKwh.toFixed(1),
      totalCost: totalCost.toFixed(2),
      totalEarned: totalEarned.toFixed(2),
      netMoney: Math.abs(netMoney).toFixed(2),
      isProfit: netMoney >= 0,
      estimatedBill: (totalKwh * settings.rate).toFixed(2),
      highestConsumer: highestConsumer?.name || "N/A",
      co2: (totalKwh * 0.85 - generatedKwh * 0.85).toFixed(1),
      categoryData,
      weeklyData,
      idNumber // Expose for header
    };
  }, [appliances, settings, role, idNumber]);

  if (!isFinalized) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div 
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full space-y-12"
            >
              <div className="text-center space-y-4">
                <Badge className="rounded-full px-4 py-1.5 uppercase font-black tracking-[0.3em] text-[10px] bg-primary/10 text-primary border-none">
                  FluxLogic Experience
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight">
                  How do you <br />
                  <span className="text-gradient italic">operate?</span>
                </h1>
                <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
                  Select your energy profile to calibrate the neural management core.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 w-full">
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole("consumer");
                    setStep("identification");
                  }}
                  className="p-10 rounded-[2.5rem] bg-card border border-border/40 hover:border-primary/40 transition-all text-left space-y-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Consumer</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                      Focus on consumption monitoring, bill prediction, and appliance optimization.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    Select Profile <ArrowRight className="h-3 w-3" />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole("prosumer");
                    setStep("identification");
                  }}
                  className="p-10 rounded-[2.5rem] bg-card border border-border/40 hover:border-emerald-500/40 transition-all text-left space-y-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Leaf className="h-8 w-8 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Prosumer</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                      Track generation, grid supply, and net energy balance for maximum profit.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Select Profile <ArrowRight className="h-3 w-3" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="identification"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "h-20 w-20 rounded-[1.75rem] flex items-center justify-center mb-4 shadow-xl",
                  role === "prosumer" ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20" : "bg-primary/10 text-primary shadow-primary/20"
                )}>
                  {role === "prosumer" ? <Leaf className="h-10 w-10 fill-current" /> : <Zap className="h-10 w-10 fill-current" />}
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Identify <span className="text-gradient">Node</span>
                </h2>
                <p className="text-muted-foreground font-medium">
                  Enter your {role} identification number to authorize access.
                </p>
              </div>

              <Card className="border border-border/40 bg-card overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      {role === "consumer" ? "Consumer Number" : "Prosumer License ID"}
                    </label>
                    <div className="relative group">
                      <Input
                        type="text"
                        placeholder={role === "consumer" ? "CON-XXXX-XXXX" : "PRO-XXXX-XXXX"}
                        className="h-14 rounded-2xl border-border/60 bg-muted/20 px-6 font-mono text-lg focus:ring-primary/20 transition-all"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button 
                      disabled={!idNumber || idNumber.length < 4}
                      onClick={() => setIsFinalized(true)}
                      className={cn(
                        "h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all",
                        role === "prosumer" 
                          ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" 
                          : "bg-primary hover:bg-primary/90 shadow-primary/20"
                      )}
                    >
                      Authorize & Proceed <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      onClick={() => setStep("role")}
                      className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="mr-2 h-3.5 w-3.5" /> Back to Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const overviewStats = role === "consumer" ? [
    { 
      label: "Energy Consumed", 
      value: `${stats.totalKwh} kWh`, 
      icon: Zap, 
      sub: "Total load demand" 
    },
    { 
      label: "Grid Supply", 
      value: `${stats.totalKwh} kWh`, 
      icon: ArrowDownRight, 
      sub: "From utility network" 
    },
    { 
      label: "Estimated Bill", 
      value: `${settings.currency}${stats.totalCost}`, 
      icon: Wallet, 
      trend: "Liability",
      trendColor: "text-destructive",
      sub: `Rate: ${settings.currency}${settings.rate}/kWh`
    },
    { 
      label: "Carbon Footprint", 
      value: `${stats.co2} kg`, 
      icon: Leaf, 
      sub: "Net emission total" 
    },
  ] : [
    { 
      label: "Energy Generated", 
      value: `${stats.generatedKwh} kWh`, 
      icon: Sparkles, 
      sub: "Private production" 
    },
    { 
      label: "Grid Interaction", 
      value: `${stats.gridTakenKwh} | ${stats.gridSuppliedKwh}`, 
      icon: ArrowUpRight, 
      sub: "Taken | Supplied (kWh)" 
    },
    { 
      label: "Net Balance", 
      value: `${settings.currency}${stats.netMoney}`, 
      icon: Wallet, 
      trend: stats.isProfit ? "Profit" : "Net Cost",
      trendColor: stats.isProfit ? "text-emerald-500" : "text-destructive",
      sub: stats.isProfit ? "Generated revenue" : "Amount to pay"
    },
    { 
      label: "CO2 Reduction", 
      value: `${stats.co2} kg`, 
      icon: Leaf, 
      sub: "Green energy impact" 
    },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            {role.toUpperCase()} MODE ACTIVE
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Efficiency <br />
            <span className="text-gradient italic">Dashboard</span>
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <p className="text-sm font-medium">Real-time energy telemetry</p>
            <button 
              onClick={() => {
                setRole(null);
                setStep("role");
                setIsFinalized(false);
              }}
              className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors ml-4"
            >
              <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
              Reset Core Role
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: {stats.idNumber}</div>
            <div className="text-sm font-bold">{user?.email?.split('@')[0]}@home.local</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center border border-border/60 shadow-sm">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      </header>

      {/* Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm group relative overflow-hidden h-full transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</CardTitle>
                <div className="p-2.5 bg-secondary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-black tracking-tighter uppercase">{stat.value}</div>
                <div className="flex items-center gap-2 mt-3">
                  {stat.trend && (
                    <span className={cn("text-[10px] font-black uppercase tracking-widest py-0.5 px-2 bg-muted rounded-full", stat.trendColor)}>
                      {stat.trend}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="grid gap-8 lg:grid-cols-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* Weekly Chart */}
        <motion.div className="lg:col-span-8 h-full" whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}>
          <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm h-[350px] md:h-[450px] transition-colors">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Temporal Analysis</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Electricity load across 168-hour cycle</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-md px-2 py-0">Daily</Badge>
              <Badge variant="outline" className="rounded-md px-2 py-0 opacity-50 hidden sm:inline-flex">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[240px] md:h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))", fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))", fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: "oklch(var(--primary) / 0.05)" }}
                  contentStyle={{ 
                    backgroundColor: "oklch(var(--card))", 
                    borderRadius: "16px", 
                    border: "1px solid oklch(var(--border) / 0.4)",
                    boxShadow: "0 20px 40px -10px oklch(0 0 0 / 0.1)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Bar 
                  dataKey="units" 
                  fill="oklch(var(--primary))" 
                  radius={[6, 6, 0, 0]} 
                  barSize={role === "prosumer" ? 20 : 32}
                  name="Consumption"
                >
                  {stats.weeklyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8 + (index / 10)} />
                  ))}
                </Bar>
                {role === "prosumer" && (
                  <Bar 
                    dataKey="generated" 
                    fill="oklch(var(--primary) / 0.4)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={20}
                    name="Generation"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        {/* Category Pie */}
        <motion.div className="lg:col-span-4 h-auto lg:h-[450px]" whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}>
          <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm h-full transition-colors">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Category Mapping</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Load distribution by node type</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[340px] pt-0 pb-6">
            {stats.categoryData.length > 0 ? (
              <>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-4">
                  {stats.categoryData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-black uppercase truncate max-w-[80px]">{entry.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground ml-auto">{((entry.value / parseFloat(stats.totalKwh)) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-xs font-black uppercase tracking-widest italic opacity-30">No Telementry Data</div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
        <Card className="h-full border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              Financial Pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 group-hover:translate-x-1 transition-transform">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{role === "prosumer" ? "Net Impact" : "Total Cost"}</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Pro</span>
              </div>
              <div className="text-4xl font-black tracking-tighter uppercase italic">
                {settings.currency}{stats.netMoney}
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              {role === "prosumer" 
                ? (stats.isProfit ? "Generated surplus revenue this cycle." : "Net operational cost despite generation.")
                : "Projected monthly liability based on load nodes."}
            </p>
            <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
              View Detailed Forecast
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
        <Card className="h-full border-none bg-emerald-500 text-primary-foreground shadow-xl shadow-emerald-500/20 relative overflow-hidden group cursor-pointer" onClick={() => window.location.href='/energy-balance'}>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 blur-[80px] rounded-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Leaf className="h-5 w-5" />
              </div>
              Energy Balance
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Prosumer Marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 group-hover:-translate-y-1 transition-transform">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Generated</div>
                <div className="text-2xl font-black tracking-tighter uppercase">85.2<span className="text-xs">kWh</span></div>
              </div>
              <div className="flex-1 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 group-hover:-translate-y-1 transition-transform delay-75">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Grid Diff</div>
                <div className="text-2xl font-black tracking-tighter uppercase text-emerald-100">+24.5<span className="text-xs">kWh</span></div>
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              Net surplus. 4 active local trades.
            </p>
            <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12 text-emerald-600 group-hover:bg-white group-hover:text-emerald-700">
              Open Marketplace <Zap className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
        <Card className="h-full border-none bg-card shadow-sm hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight">AI Insights</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Automated efficiency recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { 
                text: "HVAC node consumption is 18.2% above regional baseline.", 
                color: "bg-primary" 
              },
              { 
                text: "Edge case detected in thermal appliance idle states.", 
                color: "bg-emerald-500" 
              },
              { 
                text: "Shift heavy loads to 22:00 - 05:00 for optimal costing.", 
                color: "bg-amber-500" 
              }
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all cursor-pointer group">
                <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 group-hover:scale-150 transition-transform", insight.color)} />
                <p className="text-xs font-bold uppercase tracking-tight leading-relaxed group-hover:translate-x-1 transition-transform">
                  {insight.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
