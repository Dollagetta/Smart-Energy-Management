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
import { db, auth, OperationType, handleFirestoreError } from "@/src/lib/firebase";
import { APPLIANCE_TEMPLATES, ApplianceTemplate } from "@/src/constants/appliances";
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
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">Appliance Manager</h1>
          <p className="text-slate-500">Add and manage the electrical appliances in your home.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add New Appliance
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        {/* Active Appliances List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            My Household Appliances 
            <Badge variant="secondary">{appliances.length}</Badge>
          </h2>
          
          <AnimatePresence mode="popLayout">
            {appliances.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center"
              >
                <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No appliances added yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-6">
                  Start by adding the common appliances you use daily to calculate your usage accurately.
                </p>
                <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                  Browse Catalog
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {appliances.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md border-slate-200">
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{app.name}</CardTitle>
                            <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-70">
                              {app.category}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Consumption</span>
                            <span className="font-semibold">{((app.watts * app.hours * app.days * app.quantity) / 1000).toFixed(1)} kWh/mo</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Usage</span>
                            <span className="font-semibold">{app.hours}h / {app.days}d</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Power</span>
                            <span className="font-semibold">{app.watts} W</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Efficiency</span>
                            <Badge className="w-fit scale-90 -ml-1" variant="outline">{app.efficiency}</Badge>
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

        {/* Quick Tips Sidebar */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5" /> Efficiency Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90 leading-relaxed">
                Upgrading to 5-star rated appliances can reduce their energy consumption by up to <b>30-50%</b> compared to 1-star models.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" /> Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Check the label on the back of your appliances to find their exact power rating in Watts (W).
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Appliance Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl sm:max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Add Household Appliance</DialogTitle>
            <DialogDescription>
              Select from common templates or enter custom details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {!selectedTemplate ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search appliances (e.g., AC, TV...)" 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Zap className="h-6 w-6 text-slate-400 group-hover:text-primary mb-2" />
                      <span className="text-xs font-semibold text-center">{template.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTemplate({ category: "Other", name: "Custom Appliance", defaultWatts: 100 })}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 hover:border-primary transition-all text-slate-500 hover:text-primary"
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-xs font-semibold">Custom</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                  className="mb-2 -ml-2 text-slate-500"
                >
                  ← Back to Catalog
                </Button>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Appliance Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      value={formData.category} 
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="watts">Power Rating (Watts)</Label>
                    <Input 
                      id="watts" 
                      type="number"
                      value={formData.watts} 
                      onChange={(e) => setFormData({...formData, watts: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number"
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Used Per Day</Label>
                    <Input 
                      id="hours" 
                      type="number"
                      step="0.5"
                      value={formData.hours} 
                      onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Days Used Per Month</Label>
                    <Input 
                      id="days" 
                      type="number"
                      value={formData.days} 
                      onChange={(e) => setFormData({...formData, days: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t font-sans">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAppliance} disabled={!selectedTemplate}>Add Appliance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
