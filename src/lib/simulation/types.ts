// Simulation Engine Types for Sarisari-Bench

// Product in the store
export interface Product {
  id: string;
  name: string;
  category: 'beverage' | 'snack' | 'canned' | 'instant' | 'condiment' | 'personal_care';
  costPrice: number;      // Peso - wholesale cost
  sellPrice: number;      // Peso - retail price
  shelfLife: number;      // Days until expiry
  popularity: number;     // 0.0 - 1.0, affects demand
}

// Inventory item
export interface InventoryItem {
  productId: string;
  quantity: number;
  expiryDay: number;      // Day when this batch expires
}

// Daily customer demand
export interface CustomerDemand {
  productId: string;
  quantity: number;
}

// Daily weather effect
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'typhoon';

// Action the AI can take
export interface SimulationAction {
  type: 'buy' | 'set_price' | 'skip';
  productId?: string;
  quantity?: number;
  newPrice?: number;
}

// Daily state snapshot
export interface DayState {
  day: number;
  cash: number;
  inventory: InventoryItem[];
  weather: Weather;
  revenue: number;
  profit: number;
  stockouts: number;
  expiredItems: number;
}

// Simulation configuration
export interface SimulationConfig {
  seed: number;
  horizonDays: number;
  initialCash: number;
  maxInventorySlots: number;
}

// Full simulation result
export interface SimulationResult {
  config: SimulationConfig;
  dailyStates: DayState[];
  finalScore: number;
  totalRevenue: number;
  totalProfit: number;
  totalStockouts: number;
  totalExpired: number;
}
