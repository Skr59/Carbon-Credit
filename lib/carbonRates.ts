export interface TreeType {
  key: string;
  label: string;
  desc: string;
  creditsPerHa: number; // tCO2e estimated per hectare per year
}

export const TREE_TYPES: TreeType[] = [
  { key: "mango", label: "Mango Orchard", desc: "Fruit trees for farm income + carbon", creditsPerHa: 15 },
  { key: "coconut", label: "Coconut Plantation", desc: "Tall palms storing carbon for decades", creditsPerHa: 18 },
  { key: "neem", label: "Neem / Avenue Trees", desc: "Fast-growing shade & carbon capture", creditsPerHa: 20 },
  { key: "teak", label: "Teak / Timber", desc: "High-biomass timber species", creditsPerHa: 25 },
  { key: "mixedfruit", label: "Mixed Fruit Orchard", desc: "Variety of fruit trees", creditsPerHa: 17 },
  { key: "agroforestry", label: "Agroforestry", desc: "Trees + crops on same land", creditsPerHa: 22 },
  { key: "forest", label: "Dense Forest", desc: "Native forest (Sal / Teak / mixed)", creditsPerHa: 30 },
  { key: "eucalyptus", label: "Eucalyptus", desc: "Fast-growing industrial wood", creditsPerHa: 19 },
  { key: "grassland", label: "Grassland / Pasture", desc: "Perennial grasses & bushes", creditsPerHa: 6 },
];

export const TREE_TYPE_MAP: Record<string, TreeType> = Object.fromEntries(
  TREE_TYPES.map((t) => [t.key, t])
);

export const DEFAULT_CREDIT_PRICE_INR = 1800;

export let CREDIT_PRICE_INR = DEFAULT_CREDIT_PRICE_INR;

export function setCreditPriceINR(n: number) {
  if (typeof n === "number" && isFinite(n) && n > 0) CREDIT_PRICE_INR = n;
}

const LEGACY_MAP: Record<string, string> = {
  plantation: "mango",
  forest: "forest",
  agroforestry: "agroforestry",
  grassland: "grassland",
  barren: "grassland",
  wetland: "grassland",
  mixed: "mixedfruit",
};

export function getCreditsPerHa(key?: string): number {
  if (!key) return 15;
  if (TREE_TYPE_MAP[key]) return TREE_TYPE_MAP[key].creditsPerHa;
  if (LEGACY_MAP[key]) return TREE_TYPE_MAP[LEGACY_MAP[key]].creditsPerHa;
  return 15;
}
