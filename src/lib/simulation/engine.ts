// Core simulation engine for Sarisari-Bench
import { SeededRandom } from './random';
import { PRODUCTS, getProductById } from './products';
import {
  SimulationConfig,
  DayState,
  InventoryItem,
  Weather,
  CustomerDemand,
  SimulationAction,
  SimulationResult,
} from './types';

const WEATHER_EFFECTS: Record<Weather, number> = {
  sunny: 1.2,    // More customers
  cloudy: 1.0,   // Normal
  rainy: 0.7,    // Fewer customers
  typhoon: 0.3,  // Very few customers
};

const WEATHER_PROBABILITIES: { weather: Weather; prob: number }[] = [
  { weather: 'sunny', prob: 0.4 },
  { weather: 'cloudy', prob: 0.35 },
  { weather: 'rainy', prob: 0.2 },
  { weather: 'typhoon', prob: 0.05 },
];

export class SimulationEngine {
  private random: SeededRandom;
  private config: SimulationConfig;
  private currentDay: number;
  private cash: number;
  private inventory: InventoryItem[];
  private dailyStates: DayState[];

  constructor(config: SimulationConfig) {
    this.config = config;
    this.random = new SeededRandom(config.seed);
    this.currentDay = 0;
    this.cash = config.initialCash;
    this.inventory = [];
    this.dailyStates = [];
  }

  // Generate weather for a day
  private generateWeather(): Weather {
    const roll = this.random.next();
    let cumulative = 0;
    for (const { weather, prob } of WEATHER_PROBABILITIES) {
      cumulative += prob;
      if (roll < cumulative) {
        return weather;
      }
    }
    return 'cloudy';
  }

  // Generate customer demand for a day
  private generateDemand(weather: Weather): CustomerDemand[] {
    const demands: CustomerDemand[] = [];
    const weatherMod = WEATHER_EFFECTS[weather];

    for (const product of PRODUCTS) {
      // Base demand influenced by popularity and weather
      const baseDemand = product.popularity * 5 * weatherMod;
      const actualDemand = Math.max(0, Math.round(
        this.random.nextGaussian(baseDemand, baseDemand * 0.3)
      ));

      if (actualDemand > 0) {
        demands.push({
          productId: product.id,
          quantity: actualDemand,
        });
      }
    }

    return demands;
  }

  // Process expired items
  private processExpiry(): number {
    let expiredCount = 0;
    this.inventory = this.inventory.filter(item => {
      if (item.expiryDay <= this.currentDay) {
        expiredCount += item.quantity;
        return false;
      }
      return true;
    });
    return expiredCount;
  }

  // Fulfill customer demand
  private fulfillDemand(demands: CustomerDemand[]): { revenue: number; profit: number; stockouts: number } {
    let revenue = 0;
    let profit = 0;
    let stockouts = 0;

    for (const demand of demands) {
      const product = getProductById(demand.productId);
      if (!product) continue;

      let remaining = demand.quantity;

      // Sort inventory by expiry (FIFO - sell oldest first)
      const relevantItems = this.inventory
        .filter(i => i.productId === demand.productId)
        .sort((a, b) => a.expiryDay - b.expiryDay);

      for (const item of relevantItems) {
        if (remaining <= 0) break;

        const sold = Math.min(remaining, item.quantity);
        item.quantity -= sold;
        remaining -= sold;

        revenue += sold * product.sellPrice;
        profit += sold * (product.sellPrice - product.costPrice);
      }

      // Remove empty inventory items
      this.inventory = this.inventory.filter(i => i.quantity > 0);

      // Track stockouts
      if (remaining > 0) {
        stockouts += remaining;
      }
    }

    this.cash += revenue;
    return { revenue, profit, stockouts };
  }

  // Execute a buy action
  executeBuyAction(productId: string, quantity: number): boolean {
    const product = getProductById(productId);
    if (!product) return false;

    const totalCost = product.costPrice * quantity;
    if (totalCost > this.cash) return false;

    this.cash -= totalCost;
    this.inventory.push({
      productId,
      quantity,
      expiryDay: this.currentDay + product.shelfLife,
    });

    return true;
  }

  // Get current state for AI decision making
  getCurrentState(): DayState {
    return {
      day: this.currentDay,
      cash: this.cash,
      inventory: [...this.inventory],
      weather: this.generateWeather(), // Preview weather
      revenue: 0,
      profit: 0,
      stockouts: 0,
      expiredItems: 0,
    };
  }

  // Simulate one day
  simulateDay(actions: SimulationAction[]): DayState {
    this.currentDay++;

    // Process actions (buying)
    for (const action of actions) {
      if (action.type === 'buy' && action.productId && action.quantity) {
        this.executeBuyAction(action.productId, action.quantity);
      }
    }

    // Generate weather and demand
    const weather = this.generateWeather();
    const demands = this.generateDemand(weather);

    // Process expiry
    const expiredItems = this.processExpiry();

    // Fulfill demand
    const { revenue, profit, stockouts } = this.fulfillDemand(demands);

    // Calculate inventory value
    const inventoryValue = this.inventory.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product ? product.costPrice * item.quantity : 0);
    }, 0);

    const dayState: DayState = {
      day: this.currentDay,
      cash: this.cash,
      inventory: [...this.inventory],
      weather,
      revenue,
      profit,
      stockouts,
      expiredItems,
    };

    this.dailyStates.push(dayState);
    return dayState;
  }

  // Get final results
  getResults(): SimulationResult {
    const totalRevenue = this.dailyStates.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = this.dailyStates.reduce((sum, d) => sum + d.profit, 0);
    const totalStockouts = this.dailyStates.reduce((sum, d) => sum + d.stockouts, 0);
    const totalExpired = this.dailyStates.reduce((sum, d) => sum + d.expiredItems, 0);

    return {
      config: this.config,
      dailyStates: this.dailyStates,
      finalScore: this.cash,
      totalRevenue,
      totalProfit,
      totalStockouts,
      totalExpired,
    };
  }
}
