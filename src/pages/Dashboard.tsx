import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "@/src/lib/firebase";
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
import { motion } from "motion/react";

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

    // Fetch user settings
    const fetchSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSettings({
            rate: parseFloat(data.rate) || 0.15,
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

    // Simulated weekly trend data
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
      co2: (totalKwh * 0.85).toFixed(1), // Average CO2 per kWh
      categoryData,
      weeklyData
    };
  }, [appliances, settings]);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans italic">Energy Dashboard</h1>
        <p className="text-slate-500">Real-time overview of your household consumption.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Monthly Units</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKwh} kWh</div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-red-500" /> +2.5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Estimated Monthly Bill</CardTitle>
              <Wallet className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{settings.currency}{stats.estimatedBill}</div>
              <Badge variant="secondary" className="mt-1 font-normal text-xs">Rate: {settings.currency}{settings.rate}/unit</Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Primary Consumer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stats.highestConsumer}</div>
              <p className="text-xs text-slate-500 mt-1 capitalize">Action needed for high usage</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">CO2 Footprint</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.co2} kg</div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3 text-green-500" /> -1.2% this year
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Weekly Usage Pattern</CardTitle>
            <CardDescription>Daily energy consumption in units (kWh)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Consumption by Category</CardTitle>
            <CardDescription>Distribution across your home</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {stats.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm italic">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Prediction Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-primary/10">
                <span className="text-sm font-medium">Next Month Est.</span>
                <span className="text-xl font-bold">{(parseFloat(stats.totalKwh) * 1.08).toFixed(1)} kWh</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on your current appliances and 5% historical growth in your region, we predict a slight increase in consumption for the next billing cycle.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm">Your AC usage is 15% higher than similar homes in your area.</p>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <p className="text-sm">Switching to LED lights could save you $12/month.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
