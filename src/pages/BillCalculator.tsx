import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Globe, Zap, Receipt, ArrowRight } from "lucide-react";

interface RegionRate {
  name: string;
  rate: number;
  currency: string;
  symbol: string;
}

const regions: Record<string, RegionRate> = {
  "usa": { name: "United States", rate: 0.15, currency: "USD", symbol: "$" },
  "uk": { name: "United Kingdom", rate: 0.30, currency: "GBP", symbol: "£" },
  "eu": { name: "Germany (EU)", rate: 0.40, currency: "EUR", symbol: "€" },
  "india": { name: "India", rate: 7.00, currency: "INR", symbol: "₹" },
  "sa": { name: "South Africa", rate: 2.50, currency: "ZAR", symbol: "R" },
  "zim": { name: "Zimbabwe", rate: 0.12, currency: "USD", symbol: "$" },
};

export default function BillCalculator() {
  const [region, setRegion] = useState<string>("usa");
  const [meterReading, setMeterReading] = useState<string>("");
  const [result, setResult] = useState<{ total: number; kwh: number } | null>(null);

  const calculateBill = () => {
    const kwh = parseFloat(meterReading);
    if (isNaN(kwh)) return;
    
    const rate = regions[region].rate;
    setResult({
      total: kwh * rate,
      kwh: kwh
    });
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto relative z-10">
      <header className="space-y-3">
        <Badge variant="outline" className="rounded-full px-4 py-1.5 uppercase font-black tracking-[0.3em] text-[8px] bg-primary/5 text-primary border-primary/20 backdrop-blur-md">
          Finance Module
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Bill <span className="text-primary">Calculator</span>
        </h1>
        <p className="text-muted-foreground font-medium max-w-xl">
          Estimate your electricity costs based on regional utility rates.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border/40 bg-card shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Input Data
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                Configure your calculation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Region / Country</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="rounded-xl border-border/40 h-12">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(regions).map(([key, r]) => (
                      <SelectItem key={key} value={key}>{r.name} ({r.currency})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meter Reading (kWh)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="e.g. 450" 
                    className="rounded-xl border-border/40 h-12 pl-10"
                    value={meterReading}
                    onChange={(e) => setMeterReading(e.target.value)}
                  />
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button 
                onClick={calculateBill}
                disabled={!meterReading}
                className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              >
                Calculate Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {result ? (
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-xl h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Bill Estimate
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                  Estimated based on {regions[region].rate} {regions[region].currency}/kWh
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
                <div className="text-center">
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-primary/60 mb-2">Total Amount</div>
                  <div className="text-6xl font-black tracking-tighter text-foreground flex items-baseline">
                    <span className="text-2xl text-primary mr-1">{regions[region].symbol}</span>
                    {result.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-4 pt-6 mt-6 border-t border-primary/10">
                  <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Consumption</div>
                    <div className="font-black">{result.kwh} kWh</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Currency</div>
                    <div className="font-black">{regions[region].currency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border/60 bg-muted/20 shadow-none h-full flex flex-col items-center justify-center text-center p-8 space-y-4 transition-colors">
              <div className="p-4 rounded-full bg-muted border border-border/40">
                <Globe className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-muted-foreground">No Calculation Yet</h3>
                <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                  Fill in your meter data to see an instant regional bill estimate.
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      <Card className="border border-border/40 bg-card shadow-sm">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-tight">Pro Tip: Night Rates</h4>
            <p className="text-xs text-muted-foreground">
              Most regions offer lower tariffs between 11 PM and 6 AM. Use high-power appliances during these hours to save up to 25% on your bill.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
