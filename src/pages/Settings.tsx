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
import { HOME_TYPES, TARIFF_METHODOLOGIES } from "@/src/constants/appliances";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Bell, 
  Globe,
  Wallet
} from "lucide-react";
import { auth, db } from "@/src/lib/firebase";
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
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight italic">Settings</h1>
        <p className="text-slate-500">Manage your account and energy preferences.</p>
      </header>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-slate-400" /> Account Profile
            </CardTitle>
            <CardDescription>Your personal information and home details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input 
                  placeholder="John Doe" 
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Home Type</Label>
                <Select 
                  value={settings.homeType} 
                  onValueChange={(val) => setSettings({ ...settings, homeType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOME_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location / Region</Label>
              <div className="flex gap-2">
                <Select 
                  value={settings.region}
                  onValueChange={(val) => setSettings({ ...settings, region: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east">United States (East)</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="in">India (Delhi/NCR)</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                  </SelectContent>
                </Select>
                <Globe className="h-9 w-9 p-2 border rounded-md text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tariff Settings */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-slate-400" /> Billing & Tariff
            </CardTitle>
            <CardDescription>Configure how your bill is calculated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tariff Methodology</Label>
              <Select 
                value={settings.tariffMethodology}
                onValueChange={(val) => setSettings({ ...settings, tariffMethodology: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARIFF_METHODOLOGIES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rate per kWh (USD)</Label>
              <Input 
                type="number" 
                value={settings.rate} 
                step="0.01" 
                onChange={(e) => setSettings({ ...settings, rate: e.target.value })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Peak Pricing</Label>
                <p className="text-sm text-slate-500">Adjust bill based on standard peak hours in your region.</p>
              </div>
              <Switch 
                checked={settings.peakPricing} 
                onCheckedChange={(val) => setSettings({ ...settings, peakPricing: val })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Notifications */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usage Threshold Alerts</Label>
                <p className="text-sm text-slate-500">Notify me when usage exceeds predicted budget.</p>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={(val) => setSettings({ ...settings, notifications: val })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>AI Monthly Reports</Label>
                <p className="text-sm text-slate-500">Send personalized efficiency reports via email.</p>
              </div>
              <Switch 
                checked={settings.aiReports} 
                onCheckedChange={(val) => setSettings({ ...settings, aiReports: val })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => window.location.reload()}>Discard Changes</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
