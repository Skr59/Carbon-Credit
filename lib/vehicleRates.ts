export interface VehicleType {
  key: string;
  category: string;
  label: string;
  fuel: string;
  desc: string;
  emissionGPerKm: number; // grams of CO2 emitted per km driven
}

export const VEHICLE_TYPES: VehicleType[] = [
  // --- Cars ---
  { key: "car_petrol", category: "car", label: "Compact Car (Petrol)", fuel: "petrol", desc: "1.0-1.2L hatchbacks & sedans", emissionGPerKm: 135 },
  { key: "car_diesel", category: "car", label: "Car (Diesel)", fuel: "diesel", desc: "Sedans & SUVs running on diesel", emissionGPerKm: 150 },
  { key: "car_cng", category: "car", label: "Car (CNG)", fuel: "cng", desc: "Compressed natural gas cars", emissionGPerKm: 105 },
  { key: "car_hybrid", category: "car", label: "Car (Hybrid)", fuel: "hybrid", desc: "Petrol-electric hybrids", emissionGPerKm: 90 },
  { key: "car_electric", category: "car", label: "Car (Electric)", fuel: "electric", desc: "Pure battery electric vehicles", emissionGPerKm: 25 },
  { key: "suv_petrol", category: "car", label: "SUV / Large Car (Petrol)", fuel: "petrol", desc: "Large SUVs & luxury sedans", emissionGPerKm: 185 },
  { key: "suv_diesel", category: "car", label: "SUV / Large Car (Diesel)", fuel: "diesel", desc: "Large SUVs running on diesel", emissionGPerKm: 195 },

  // --- Two-wheelers ---
  { key: "moto_petrol", category: "motorcycle", label: "Motorcycle (Petrol)", fuel: "petrol", desc: "150cc+ commuter bikes", emissionGPerKm: 75 },
  { key: "moto_scooter", category: "scooter", label: "Scooter (Petrol)", fuel: "petrol", desc: "110-125cc scooters", emissionGPerKm: 60 },
  { key: "moto_electric", category: "scooter", label: "E-Scooter / E-Bike", fuel: "electric", desc: "Electric two-wheelers", emissionGPerKm: 12 },

  // --- Auto-rickshaws ---
  { key: "auto_cng", category: "auto", label: "Auto-Rickshaw (CNG)", fuel: "cng", desc: "Three-wheeler passenger auto", emissionGPerKm: 70 },
  { key: "auto_petrol", category: "auto", label: "Auto-Rickshaw (Petrol)", fuel: "petrol", desc: "Three-wheeler passenger auto", emissionGPerKm: 88 },
  { key: "auto_electric", category: "auto", label: "E-Rickshaw", fuel: "electric", desc: "Battery electric rickshaw", emissionGPerKm: 15 },

  // --- Commercial / Heavy ---
  { key: "truck_diesel", category: "truck", label: "Truck / Lorry (Diesel)", fuel: "diesel", desc: "HCV freight trucks", emissionGPerKm: 620 },
  { key: "bus_diesel", category: "bus", label: "Bus (Diesel)", fuel: "diesel", desc: "City & intercity buses", emissionGPerKm: 700 },
  { key: "tractor_diesel", category: "tractor", label: "Tractor (Diesel)", fuel: "diesel", desc: "Farm tractors", emissionGPerKm: 480 },
  { key: "van_diesel", category: "van", label: "Van / Pickup (Diesel)", fuel: "diesel", desc: "LGV delivery vans", emissionGPerKm: 220 },
  { key: "van_petrol", category: "van", label: "Van / Pickup (Petrol)", fuel: "petrol", desc: "LGV delivery vans", emissionGPerKm: 200 },
];

export const VEHICLE_TYPE_MAP: Record<string, VehicleType> = Object.fromEntries(
  VEHICLE_TYPES.map((t) => [t.key, t])
);

export const CATEGORY_LABELS: Record<string, string> = {
  car: "Car",
  motorcycle: "Motorcycle",
  scooter: "Scooter",
  auto: "Auto-Rickshaw",
  truck: "Truck",
  bus: "Bus",
  tractor: "Tractor",
  van: "Van / Pickup",
};

export const FUEL_LABELS: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  hybrid: "Hybrid",
  electric: "Electric",
};

export function getEmissionGPerKm(key?: string): number {
  if (!key) return 135;
  if (VEHICLE_TYPE_MAP[key]) return VEHICLE_TYPE_MAP[key].emissionGPerKm;
  return 135;
}

export function searchVehicleCatalog(query?: string): VehicleType[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return VEHICLE_TYPES;
  return VEHICLE_TYPES.filter((v) =>
    `${v.label} ${v.category} ${v.fuel} ${v.desc}`.toLowerCase().includes(q)
  );
}

// CO2 per km in KG for a given vehicle type
export function getKgPerKm(key: string): number {
  return getEmissionGPerKm(key) / 1000;
}
