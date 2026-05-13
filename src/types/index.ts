// src/types/index.ts

export type VatMode = 'included' | 'added' | 'none';

export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  plan: 'free' | 'pro';
  businessType?: string;
  channels?: string[];
  vatMode?: VatMode;
  paymentMethods?: string[];
  currency?: string;
  logoUrl?: string;
}

export interface User {
  uid: string;
  phone?: string;
  email?: string;
  displayName?: string;
  tenantId: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  cost?: number;
  stock: number;
  unit: string;
  category?: string;
  sku?: string;
  barcode?: string;
  alertAt?: number;
  controlStock?: boolean;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  tenantId: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount?: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'qr' | 'other';
  channel?: string;
  note?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  category: string;
  supplier?: string;
  note?: string;
  createdAt: Date;
  createdBy: string;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  salesCount: number;
}
