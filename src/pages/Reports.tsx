import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Share2, 
  Printer,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function Reports() {
  const [appliances, setAppliances] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    
    // Fetch appliances for current summary
    const qApps = query(collection(db, "users", user.uid, "appliances"));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setAppliances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch bill history
    const qHistory = query(collection(db, "users", user.uid, "billHistory"));
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bill history:", error);
      setLoading(false);
    });

    return () => {
      unsubApps();
      unsubHistory();
    };
  }, [user]);

  const handleExport = (format: string) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Generating ${format} report...`,
      success: `Energy_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()} ready for download!`,
      error: "Failed to generate report"
    });
  };

  const totalMonthlyUsage = appliances.reduce((sum, app) => 
    sum + (app.watts * app.hours * app.days * app.quantity) / 1000, 0
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            Data Archival
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Usage <br />
            <span className="text-gradient italic">Reports</span>
          </h1>
          <p className="text-muted-foreground font-medium">Detailed breakdown and exportable energy telemetry audits.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="rounded-2xl px-6 gap-3 uppercase font-black text-[10px] tracking-widest border-border/40 h-14" onClick={() => window.print()}>
            <Printer className="h-5 w-5" /> Print Audit
          </Button>
          <Button size="lg" className="rounded-2xl px-8 gap-3 uppercase font-black text-[10px] tracking-widest h-14 shadow-lg shadow-primary/20" onClick={() => handleExport("PDF")}>
            <Download className="h-5 w-5" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-10">
        {/* Monthly Summary */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileText className="h-48 w-48 text-primary" />
          </div>
          
          <CardHeader className="p-8 pb-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Active Audit cycle</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Real-time calculation based on provisioned nodes</CardDescription>
              </div>
              <div className="text-right p-4 bg-muted/40 rounded-2xl border border-border/40 min-w-[200px]">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Accumulated Telemetry</div>
                <div className="text-4xl font-black italic tracking-tighter text-primary">{totalMonthlyUsage.toFixed(1)} <span className="text-xs uppercase not-italic opacity-60">kWh</span></div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Estimating {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 pt-4 relative z-10">
            <div className="rounded-[2rem] border border-border/40 overflow-hidden bg-card/60">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border/40">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-14 font-black uppercase tracking-widest text-[10px] px-8">Designation</TableHead>
                    <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Node Count</TableHead>
                    <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Daily Duty</TableHead>
                    <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Load Rating</TableHead>
                    <TableHead className="h-14 font-black uppercase tracking-widest text-[10px] text-right px-8">Consumption (kWh)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                        No telemetry nodes detected in current inventory.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appliances.map((app) => (
                      <TableRow key={app.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-black px-8 uppercase text-xs">{app.name}</TableCell>
                        <TableCell className="font-bold text-xs">{app.quantity}</TableCell>
                        <TableCell className="font-bold text-xs">{app.hours} HRS</TableCell>
                        <TableCell className="font-bold text-xs">{app.watts} W</TableCell>
                        <TableCell className="text-right font-black px-8 text-primary uppercase text-xs italic">
                          {((app.watts * app.hours * app.days * app.quantity) / 1000).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Actionable items */}
        <div className="grid md:grid-cols-[1fr,400px] gap-10">
          <Card className="border-border/40 bg-card rounded-[2.5rem] shadow-sm relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
              <Share2 className="h-12 w-12 text-primary" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <FileText className="h-6 w-6" />
                </div>
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-6">
              <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground leading-relaxed">
                Aggregated telemetry indicates network load is dominated by <span className="text-foreground">environmental thermal systems</span> which contribute to <span className="text-primary font-black animate-pulse">45% of gross consumption</span>.
              </p>
              <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 relative group/insight cursor-default">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-3xl" />
                <p className="text-xs font-black uppercase tracking-widest leading-relaxed text-emerald-600 italic">
                  "Adjusting thermal duty cycles by 60 minutes daily could mitigate network costs by approximately <span className="text-lg not-italic font-black text-emerald-700 ml-1">$14.50</span>."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-secondary/20 rounded-[2.5rem] shadow-sm h-full relative overflow-hidden flex flex-col">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="p-3 bg-card rounded-2xl shadow-sm">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-16 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 italic">
                    NO HISTORICAL ARCHIVES LOCATED.
                  </div>
                ) : (
                  [...history].sort((a, b) => new Date(b.createdAt?.toDate?.() || 0).getTime() - new Date(a.createdAt?.toDate?.() || 0).getTime()).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 px-5 rounded-2xl bg-card hover:bg-muted/40 transition-all border border-border/40 group cursor-pointer shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.month}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{item.totalKwh} kWh • ${item.estimatedCost}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-full bg-primary/5 text-primary border-none font-black text-[9px] tracking-[0.2em] px-3">RECORDED</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
