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

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  createdAt: Date;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export type EmployeeRole = 'Admin' | 'Cashier' | 'Inventory';

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  role: EmployeeRole;
  createdAt: Date;
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  note?: string;
  createdAt: Date;
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export interface QuoteItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export type QuoteExpiration = 'week' | '15days' | 'month' | 'never';
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Quote {
  id: string;
  tenantId: string;
  type: 'products' | 'free';
  items: QuoteItem[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
  customerId?: string;
  customerName: string;
  concept: string;
  expiration: QuoteExpiration;
  expiresAt?: Date;
  status: QuoteStatus;
  footerNote?: string;
  createdAt: Date;
  createdBy: string;
}

// ─── Debt ────────────────────────────────────────────────────────────────────

export type DebtType = 'receivable' | 'payable';
export type DebtStatus = 'pending' | 'partial' | 'paid';

export interface Debt {
  id: string;
  tenantId: string;
  type: DebtType;
  amount: number;
  paidAmount: number;
  description: string;
  entityName: string;
  entityId?: string;
  dueDate?: Date;
  status: DebtStatus;
  note?: string;
  createdAt: Date;
  createdBy: string;
}
