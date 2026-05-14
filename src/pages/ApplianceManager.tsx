import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "@/lib/firebase";
import { APPLIANCE_TEMPLATES, ApplianceTemplate } from "@/constants/appliances";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Search, 
  Zap,
  TrendingDown,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface HouseholdAppliance {
  id: string;
  name: string;
  category: string;
  watts: number;
  quantity: number;
  hours: number;
  days: number;
  efficiency: string;
}

export default function ApplianceManager() {
  const [appliances, setAppliances] = useState<HouseholdAppliance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplianceTemplate | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Other",
    watts: 0,
    quantity: 1,
    hours: 5,
    days: 30,
    efficiency: "3 Star"
  });

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "appliances"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HouseholdAppliance[];
      setAppliances(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/appliances`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddAppliance = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "appliances"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setIsAddOpen(false);
      setSelectedTemplate(null);
      toast.success(`${formData.name} added successfully!`);
    } catch (error) {
      toast.error("Failed to add appliance");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "appliances", id));
      toast.success("Appliance removed");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const filteredTemplates = APPLIANCE_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-primary/20">
            Node Configuration
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Appliance <br />
            <span className="text-gradient italic">Manager</span>
          </h1>
          <p className="text-muted-foreground font-medium">Provision and calibrate electrical nodes within your network.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} size="lg" className="rounded-2xl px-8 shadow-lg shadow-primary/20 group">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Add New Node
        </Button>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr,320px]">
        {/* Active Appliances List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              Active Household Nodes
            </h2>
            <Badge variant="secondary" className="rounded-full px-4 bg-muted font-black text-[10px] tracking-widest">{appliances.length} TOTAL</Badge>
          </div>
          
          <AnimatePresence mode="popLayout">
            {appliances.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border-2 border-dashed border-border bg-muted/30 text-center"
              >
                <div className="h-20 w-20 bg-card rounded-3xl shadow-xl flex items-center justify-center mb-6 border border-border/40">
                  <Settings2 className="h-10 w-10 text-muted-foreground animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">No Active Nodes Detected</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8 uppercase text-[10px] tracking-widest">
                  Initialize your network by provisioning high-load appliances.
                </p>
                <Button variant="outline" size="lg" onClick={() => setIsAddOpen(true)} className="rounded-2xl px-10">
                  Initialize Catalog
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {appliances.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <Card className="group relative overflow-hidden bg-card border border-border/60 shadow-sm h-full">
                      <div className="absolute top-4 right-4 z-20">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                            <Zap className="h-7 w-7 transition-all group-hover:scale-110" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                              {app.name}
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
                              {app.category}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-2">
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="p-3 bg-secondary/50 rounded-xl">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Consumption</div>
                            <div className="text-sm font-black whitespace-nowrap">{((app.watts * app.hours * app.days * app.quantity) / 1000).toFixed(1)} kWh/m</div>
                          </div>
                          <div className="p-3 bg-secondary/50 rounded-xl">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Runtime</div>
                            <div className="text-sm font-black">{app.hours}h : {app.days}d</div>
                          </div>
                          <div className="p-3 bg-secondary/50 rounded-xl">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Load Rating</div>
                            <div className="text-sm font-black">{app.watts} W</div>
                          </div>
                          <div className="p-3 bg-secondary/50 rounded-xl flex items-center justify-center">
                            <Badge variant="outline" className="font-black text-[9px] tracking-widest uppercase border-primary/20 text-primary bg-primary/5">
                              {app.efficiency}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 relative overflow-hidden group p-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="bg-primary-foreground/5 rounded-3xl p-6 relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest leading-none">System Optimization</CardTitle>
              </div>
              <p className="text-xs font-medium opacity-80 leading-relaxed uppercase tracking-tight">
                Upgrading to <span className="font-black text-white underline decoration-white/40 underline-offset-4">5-star high-efficiency nodes</span> can mitigate consumption by up to <span className="font-black text-white underline decoration-white/40 underline-offset-4">42.5%</span>.
              </p>
            </div>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Technical Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-muted-foreground pt-4">
              Cross-reference the <span className="text-foreground">wattage rating</span> on your appliance terminal with its physical hardware sticker for precise telemetry.
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl sm:max-h-[90vh] flex flex-col p-8 rounded-[2rem] gap-8 border-border shadow-2xl glass">
          <DialogHeader className="p-0">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Node Provisioning</DialogTitle>
            <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">
              Integrate new appliance node into telemetry network.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {!selectedTemplate ? (
              <div className="space-y-8">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="QUERY CATALOG (e.g. HVAC, DISPLAY...)" 
                    className="pl-12 h-14 rounded-2xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus-visible:ring-primary/40 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setFormData({
                          ...formData,
                          name: template.name,
                          category: template.category,
                          watts: template.defaultWatts
                        });
                      }}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border/40 hover:border-primary/40 bg-card hover:bg-primary/5 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Zap className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-black text-center uppercase tracking-widest">{template.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTemplate({ category: "Other", name: "Custom Appliance", defaultWatts: 100 })}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group"
                  >
                    <Plus className="h-6 w-6 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-sans">Initialize Custom</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-full px-4 border border-border/40 font-black text-[10px] tracking-widest uppercase mb-4"
                >
                  ← RETURN TO CATALOG
                </Button>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Label Designation</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] focus-visible:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Classification</Label>
                    <Input 
                      value={formData.category} 
                      disabled
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px] opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Load Rating (W)</Label>
                    <Input 
                      type="number"
                      value={formData.watts} 
                      onChange={(e) => setFormData({...formData, watts: parseInt(e.target.value) || 0})}
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Quantity Count</Label>
                    <Input 
                      type="number"
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Temporal Duty (Hrs/Day)</Label>
                    <Input 
                      type="number"
                      step="0.5"
                      value={formData.hours} 
                      onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Operation Span (Days/Month)</Label>
                    <Input 
                      type="number"
                      value={formData.days} 
                      onChange={(e) => setFormData({...formData, days: parseInt(e.target.value) || 0})}
                      className="h-12 rounded-xl bg-secondary border-none font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-0 border-none flex-col sm:flex-row gap-4 pt-4 border-t border-border/40">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs">
              Decline Integration
            </Button>
            <Button onClick={handleAddAppliance} disabled={!selectedTemplate} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20">
              Confirm Provisioning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
