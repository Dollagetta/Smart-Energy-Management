import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Target, BatteryCharging, History, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const performanceData = [
  { time: "00:00", generation: 12, consumption: 20 },
  { time: "04:00", generation: 15, consumption: 18 },
  { time: "08:00", generation: 45, consumption: 35 },
  { time: "12:00", generation: 85, consumption: 40 },
  { time: "16:00", generation: 60, consumption: 55 },
  { time: "20:00", generation: 20, consumption: 65 },
  { time: "24:00", generation: 10, consumption: 25 },
];

const activeTrades = [
  { id: "TRD-882", peer: "Local Grid (Sector 7G)", amount: "4.5 kWh", type: "sell", status: "completed", price: "$0.42/kWh" },
  { id: "TRD-883", peer: "Neighbor (ID: 4x99)", amount: "2.1 kWh", type: "sell", status: "active", price: "$0.38/kWh" },
  { id: "TRD-884", peer: "City Substation Alpha", amount: "15.0 kWh", type: "buy", status: "completed", price: "$0.12/kWh" },
];

export default function EnergyBalance() {
  return (
    <div className="space-y-12 max-w-7xl mx-auto relative z-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="space-y-3">
          <Badge variant="outline" style={{ width: "550px", height: "100px", fontSize: "30px" }} className="rounded-full px-4 py-1.5 uppercase font-black tracking-[0.3em] text-[8px] bg-primary/5 text-primary border-primary/20 backdrop-blur-md">
            Marketplace Active
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Energy <span className="text-primary">Balance</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-xl">Prosumer market overview.</p>
        </div>
        <Button variant="outline" size="lg" className="rounded-2xl px-8 shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Export Ledger
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Net Balance", value: "+24.5 kWh", sub: "Surplus", icon: BatteryCharging, color: "text-emerald-500" },
          { label: "Total Generated", value: "85.2 kWh", sub: "Today", icon: Zap, color: "text-amber-500" },
          { label: "Total Consumed", value: "60.7 kWh", sub: "Today", icon: Target, color: "text-blue-500" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm h-full flex flex-col justify-center py-6 px-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-muted ${stat.color} bg-opacity-10`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground">{stat.sub}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <motion.div 
          className="lg:col-span-2 h-[450px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm h-full transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Generation vs Consumption</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">24-hour cycle performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGeneration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="k" />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="generation" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGeneration)" />
                    <Area type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorConsumption)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="h-[450px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="border border-border/40 hover:border-orange-500/20 bg-card shadow-sm h-full flex flex-col transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Active Ledger</CardTitle>
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Recent marketplace transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto custom-scrollbar pr-2">
              <div className="space-y-4">
                {activeTrades.map((trade, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{trade.id}</span>
                      <Badge variant={trade.type === 'sell' ? 'default' : 'secondary'} className="text-[9px] uppercase tracking-widest px-2 py-0">
                        {trade.type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate">{trade.peer}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-black bg-background px-2 py-1 rounded-md">{trade.amount}</span>
                        <span className="text-xs text-muted-foreground font-medium">{trade.price}</span>
                      </div>
                    </div>
                    {trade.status === 'active' && (
                      <div className="mt-2 text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending Settlement
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
