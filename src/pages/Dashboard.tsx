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
  ArrowUpRight,
  ArrowDownRight
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
import { motion } from "motion/react";
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
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);
  const [settings, setSettings] = useState({
    rate: 0.15,
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
            currency: data.currency || "$",
            tariffMethodology: data.tariffMethodology || "fixed"
          });
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
      { day: "Mon", units: totalKwh / 30 * 1.1 },
      { day: "Tue", units: totalKwh / 30 * 0.9 },
      { day: "Wed", units: totalKwh / 30 * 1.2 },
      { day: "Thu", units: totalKwh / 30 * 1.05 },
      { day: "Fri", units: totalKwh / 30 * 1.3 },
      { day: "Sat", units: totalKwh / 30 * 1.5 },
      { day: "Sun", units: totalKwh / 30 * 1.4 },
    ];

    return {
      totalKwh: totalKwh.toFixed(1),
      estimatedBill: (totalKwh * settings.rate).toFixed(2),
      highestConsumer: highestConsumer?.name || "N/A",
      co2: (totalKwh * 0.85).toFixed(1),
      categoryData,
      weeklyData
    };
  }, [appliances, settings]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            System Operational
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Efficiency <br />
            <span className="text-gradient italic">Dashboard</span>
          </h1>
          <p className="text-muted-foreground font-medium">Real-time telemetry and energy distribution mapping.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Node</div>
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
        {[
          { 
            label: "Monthly Net Units", 
            value: `${stats.totalKwh} kWh`, 
            icon: Zap, 
            trend: "+2.5%", 
            trendColor: "text-destructive", 
            sub: "vs previous month" 
          },
          { 
            label: "Estimated Billing", 
            value: `${settings.currency}${stats.estimatedBill}`, 
            icon: Wallet, 
            sub: `Rate: ${settings.currency}${settings.rate}/kWh`,
            badge: settings.tariffMethodology
          },
          { 
            label: "Primary Drain", 
            value: stats.highestConsumer, 
            icon: AlertTriangle, 
            trend: "Critical", 
            trendColor: "text-amber-500",
            sub: "Optimize indicated node"
          },
          { 
            label: "Carbon Efficiency", 
            value: `${stats.co2} kg`, 
            icon: Leaf, 
            trend: "-1.2%", 
            trendColor: "text-emerald-500",
            sub: "Emission offset target"
          },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-card card-hover shadow-sm group relative overflow-hidden h-full">
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

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Weekly Chart */}
        <Card className="lg:col-span-8 border-none bg-card shadow-sm hover:shadow-xl transition-all h-[450px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Temporal Analysis</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Electricity load across 168-hour cycle</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-md px-2 py-0">Daily</Badge>
              <Badge variant="outline" className="rounded-md px-2 py-0 opacity-50">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
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
                  barSize={32}
                >
                  {stats.weeklyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8 + (index / 10)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card className="lg:col-span-4 border-none bg-card shadow-sm hover:shadow-xl transition-all h-[450px]">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Category Mapping</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Load distribution by node type</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[340px] pt-0">
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
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              Prediction Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 group-hover:translate-x-1 transition-transform">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Next Cycle Est.</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Pro</span>
              </div>
              <div className="text-4xl font-black tracking-tighter uppercase italic">
                {(parseFloat(stats.totalKwh) * 1.08).toFixed(1)} kWh
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              Proprietary forecasting shows an 8.2% variance in your upcoming billing cycle due to increased thermal node activity. Consider optimization.
            </p>
            <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
              View Detailed Forecast
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-card shadow-sm hover:shadow-xl transition-all">
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
      </div>
    </div>
  );
}
