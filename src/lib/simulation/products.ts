// Product catalog for Sarisari Store
import { Product } from './types';

export const PRODUCTS: Product[] = [
  // Beverages
  {
    id: 'coke_sakto',
    name: 'Coke Sakto (200ml)',
    category: 'beverage',
    costPrice: 8,
    sellPrice: 12,
    shelfLife: 180,
    popularity: 0.9,
  },
  {
    id: 'rc_cola',
    name: 'RC Cola (240ml)',
    category: 'beverage',
    costPrice: 7,
    sellPrice: 10,
    shelfLife: 180,
    popularity: 0.7,
  },
  {
    id: 'zest_o',
    name: 'Zest-O Orange (200ml)',
    category: 'beverage',
    costPrice: 6,
    sellPrice: 9,
    shelfLife: 90,
    popularity: 0.8,
  },
  {
    id: 'c2_green',
    name: 'C2 Green Tea',
    category: 'beverage',
    costPrice: 12,
    sellPrice: 18,
    shelfLife: 120,
    popularity: 0.6,
  },

  // Snacks
  {
    id: 'boy_bawang',
    name: 'Boy Bawang Garlic',
    category: 'snack',
    costPrice: 5,
    sellPrice: 8,
    shelfLife: 120,
    popularity: 0.85,
  },
  {
    id: 'piattos',
    name: 'Piattos Cheese',
    category: 'snack',
    costPrice: 8,
    sellPrice: 12,
    shelfLife: 90,
    popularity: 0.75,
  },
  {
    id: 'chicharon',
    name: 'Chicharon (small)',
    category: 'snack',
    costPrice: 10,
    sellPrice: 15,
    shelfLife: 60,
    popularity: 0.7,
  },
  {
    id: 'skyflakes',
    name: 'Skyflakes Crackers',
    category: 'snack',
    costPrice: 4,
    sellPrice: 7,
    shelfLife: 180,
    popularity: 0.65,
  },

  // Canned goods
  {
    id: 'argentina_corned',
    name: 'Argentina Corned Beef',
    category: 'canned',
    costPrice: 28,
    sellPrice: 38,
    shelfLife: 730,
    popularity: 0.8,
  },
  {
    id: 'century_tuna',
    name: 'Century Tuna Flakes',
    category: 'canned',
    costPrice: 22,
    sellPrice: 30,
    shelfLife: 730,
    popularity: 0.85,
  },
  {
    id: 'sardines_mega',
    name: 'Mega Sardines',
    category: 'canned',
    costPrice: 15,
    sellPrice: 22,
    shelfLife: 730,
    popularity: 0.75,
  },

  // Instant noodles
  {
    id: 'lucky_me_pancit',
    name: 'Lucky Me Pancit Canton',
    category: 'instant',
    costPrice: 9,
    sellPrice: 13,
    shelfLife: 240,
    popularity: 0.95,
  },
  {
    id: 'payless',
    name: 'Payless Noodles',
    category: 'instant',
    costPrice: 5,
    sellPrice: 8,
    shelfLife: 240,
    popularity: 0.7,
  },
  {
    id: 'nissin_cup',
    name: 'Nissin Cup Noodles',
    category: 'instant',
    costPrice: 18,
    sellPrice: 25,
    shelfLife: 180,
    popularity: 0.6,
  },

  // Condiments (sachets)
  {
    id: 'datu_puti_soy',
    name: 'Datu Puti Soy Sauce (sachet)',
    category: 'condiment',
    costPrice: 1.5,
    sellPrice: 3,
    shelfLife: 365,
    popularity: 0.9,
  },
  {
    id: 'maggi_magic',
    name: 'Maggi Magic Sarap (sachet)',
    category: 'condiment',
    costPrice: 2,
    sellPrice: 4,
    shelfLife: 365,
    popularity: 0.85,
  },

  // Personal care
  {
    id: 'safeguard_sachet',
    name: 'Safeguard Soap (sachet)',
    category: 'personal_care',
    costPrice: 3,
    sellPrice: 6,
    shelfLife: 730,
    popularity: 0.7,
  },
  {
    id: 'shampoo_sachet',
    name: 'Palmolive Shampoo (sachet)',
    category: 'personal_care',
    costPrice: 4,
    sellPrice: 7,
    shelfLife: 730,
    popularity: 0.75,
  },
  {
    id: 'toothpaste_sachet',
    name: 'Colgate Toothpaste (sachet)',
    category: 'personal_care',
    costPrice: 5,
    sellPrice: 9,
    shelfLife: 730,
    popularity: 0.65,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};

export const getProductsByCategory = (category: Product['category']): Product[] => {
  return PRODUCTS.filter(p => p.category === category);
};
