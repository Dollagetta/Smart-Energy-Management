import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { HOME_TYPES, TARIFF_METHODOLOGIES } from "@/constants/appliances";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Bell, 
  Globe,
  Wallet
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    displayName: "",
    homeType: HOME_TYPES[0],
    region: "us-east",
    tariffMethodology: "fixed",
    rate: "0.12",
    peakPricing: true,
    notifications: true,
    aiReports: true
  });

  const user = auth.currentUser;

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), settings, { merge: true });
      toast.success("Configuration updated successfully");
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center -mt-20">
        <div className="h-14 w-14 animate-spin rounded-2xl border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            System Config
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Network <br />
            <span className="text-gradient italic">Settings</span>
          </h1>
          <p className="text-muted-foreground font-medium">Calibrate account parameters and global energy preferences.</p>
        </div>
      </header>

      <div className="grid gap-10">
        {/* Profile Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-md rounded-[2.5rem] shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-2xl">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              Identity & Workspace
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Authentication profile and environmental classification</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Display Alias</Label>
                <Input 
                  placeholder="DESIGNATION" 
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus-visible:ring-primary/40"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Environmental Type</Label>
                <Select 
                  value={settings.homeType} 
                  onValueChange={(val) => setSettings({ ...settings, homeType: val })}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus:ring-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 p-2 glass">
                    {HOME_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Regional Node / Location</Label>
              <div className="flex gap-4">
                <Select 
                  value={settings.region}
                  onValueChange={(val) => setSettings({ ...settings, region: val })}
                >
                  <SelectTrigger className="flex-1 h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus:ring-primary/40">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 p-2 glass">
                    <SelectItem value="us-east" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">United States (East Index)</SelectItem>
                    <SelectItem value="uk" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">United Kingdom (GMT)</SelectItem>
                    <SelectItem value="in" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">India (Delhi Node)</SelectItem>
                    <SelectItem value="de" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">Germany (EU Core)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center border border-border/40">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tariff Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-md rounded-[2.5rem] shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-2xl">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              Tariff & Billing Core
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Algorithmic costing and rate synchronization</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Calculation Methodology</Label>
                <Select 
                  value={settings.tariffMethodology}
                  onValueChange={(val) => setSettings({ ...settings, tariffMethodology: val })}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus:ring-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 p-2 glass">
                    {TARIFF_METHODOLOGIES.map(t => (
                      <SelectItem key={t.id} value={t.id} className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Rate per kWh (Units)</Label>
                <Input 
                  type="number" 
                  value={settings.rate} 
                  step="0.01" 
                  onChange={(e) => setSettings({ ...settings, rate: e.target.value })}
                  className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus-visible:ring-primary/40"
                />
              </div>
            </div>
            
            <Separator className="bg-border/40" />
            
            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 group">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-widest leading-none">Automated Peak Pricing</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Adjust load calculations based on regional temporal spikes.</p>
              </div>
              <Switch 
                checked={settings.peakPricing} 
                onCheckedChange={(val) => setSettings({ ...settings, peakPricing: val })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Notifications */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-md rounded-[2.5rem] shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-2xl">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              Pulse & Integration
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Internal system alerts and neural report delivery</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-widest leading-none">Telemetry Threshold Alerts</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Notify when usage exceeds projected audit budget.</p>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={(val) => setSettings({ ...settings, notifications: val })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-widest leading-none">Neural Monthly Audits</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Dispatch personalized efficiency profiles via encrypted mail.</p>
              </div>
              <Switch 
                checked={settings.aiReports} 
                onCheckedChange={(val) => setSettings({ ...settings, aiReports: val })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
          <Button variant="outline" size="lg" className="rounded-2xl px-10 h-14 uppercase font-black tracking-widest text-[10px] border-border/40" onClick={() => window.location.reload()}>
            Discard Changes
          </Button>
          <Button size="lg" className="rounded-2xl px-12 h-14 uppercase font-black tracking-widest text-[10px] shadow-lg shadow-primary/20" onClick={handleSave} disabled={loading}>
            {loading ? "Synchronizing..." : "Commit Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
