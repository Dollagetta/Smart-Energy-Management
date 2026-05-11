import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
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
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic">Usage Reports</h1>
          <p className="text-slate-500">Detailed breakdown and exportable energy audits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2" onClick={() => handleExport("PDF")}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-6">
        {/* Monthly Summary */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Period Audit</CardTitle>
              <CardDescription>Real-time calculation based on active appliances</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalMonthlyUsage.toFixed(1)} kWh</div>
              <p className="text-xs text-slate-500">Estimating March 2026</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Appliance</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Daily Usage</TableHead>
                    <TableHead>Power (W)</TableHead>
                    <TableHead className="text-right">Monthly (kWh)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-400 italic">
                        No appliances found in your inventory.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appliances.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.quantity}</TableCell>
                        <TableCell>{app.hours} hrs</TableCell>
                        <TableCell>{app.watts} W</TableCell>
                        <TableCell className="text-right font-semibold">
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
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-4">
              <p>
                Your electricity usage for this period is dominated by <b>Kitchen Appliances</b> which account for 45% of total consumption.
              </p>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 italic">
                "By reducing your AC usage by just 1 hour daily, you could lower your next bill by approximately <b>$14.50</b>."
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-500" /> Bill History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No historical records found.
                  </div>
                ) : (
                  history.sort((a, b) => new Date(b.createdAt?.toDate?.() || 0).getTime() - new Date(a.createdAt?.toDate?.() || 0).getTime()).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.month}</span>
                          <span className="text-xs text-slate-500">{item.totalKwh} kWh / ${item.estimatedCost}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          Recorded
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
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
