export interface ApplianceTemplate {
  category: string;
  name: string;
  defaultWatts: number;
  icon?: string;
}

export const APPLIANCE_TEMPLATES: ApplianceTemplate[] = [
  // Kitchen
  { category: "Kitchen", name: "Refrigerator", defaultWatts: 150 },
  { category: "Kitchen", name: "Microwave", defaultWatts: 1200 },
  { category: "Kitchen", name: "Induction Stove", defaultWatts: 2000 },
  { category: "Kitchen", name: "Mixer Grinder", defaultWatts: 500 },
  { category: "Kitchen", name: "Dishwasher", defaultWatts: 1800 },
  
  // Living Room
  { category: "Living Room", name: "LED TV", defaultWatts: 100 },
  { category: "Living Room", name: "Ceiling Fan", defaultWatts: 75 },
  { category: "Living Room", name: "Air Conditioner (1.5 Ton)", defaultWatts: 1500 },
  { category: "Living Room", name: "Laptop/PC", defaultWatts: 200 },
  { category: "Living Room", name: "Gaming Console", defaultWatts: 150 },
  
  // Bedroom
  { category: "Bedroom", name: "AC (1 Ton)", defaultWatts: 1000 },
  { category: "Bedroom", name: "Table Fan", defaultWatts: 50 },
  { category: "Bedroom", name: "Heater", defaultWatts: 1500 },
  { category: "Bedroom", name: "Reading Light", defaultWatts: 10 },
  
  // Bathroom
  { category: "Bathroom", name: "Geyser", defaultWatts: 3000 },
  { category: "Bathroom", name: "Exhaust Fan", defaultWatts: 40 },
  
  // Utility
  { category: "Utility", name: "Washing Machine", defaultWatts: 500 },
  { category: "Utility", name: "Iron Box", defaultWatts: 1000 },
  { category: "Utility", name: "Water Pump", defaultWatts: 750 },
];

export const HOME_TYPES = ["Apartment", "Independent House", "Hostel Room", "Office"];

export const TARIFF_METHODOLOGIES = [
  { id: "fixed", name: "Fixed Tariff", description: "Constant rate per unit" },
  { id: "slab", name: "Slab Tariff", description: "Rate increases with usage" },
  { id: "time", name: "Time-based Tariff", description: "Variable rate based on hour" },
];
