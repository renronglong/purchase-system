import { seedProducts, seedSuppliers, type Product, type Supplier } from "./seed-data";

export type { Product, Supplier };

// 采购单明细
export interface PurchaseOrderItem {
  id: string;
  productCode: string;
  productName: string;
  spec: string;
  length: number;
  quantity: number;
  unit: string;
  weightPerMeter: number;
  totalWeight: number;
  surfaceTreatment: string;
  deliveryDate: string;
  remark: string;
}

// 采购单
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  company: string;
  supplierId: string;
  supplierName: string;
  contact: string;
  phone: string;
  address: string;
  orderDate: string;
  items: PurchaseOrderItem[];
  totalQuantity: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

// 委外加工单明细
export interface OutsourcingItem {
  id: string;
  productCode: string;
  productName: string;
  spec: string;
  quantity: number;
  unit: string;
  length: number;
  process: string;
  weight: number;
  unitPrice: number;
  remark: string;
}

// 委外加工单
export interface OutsourcingOrder {
  id: string;
  orderNo: string;
  company: string;
  supplierId: string;
  supplierName: string;
  contact: string;
  phone: string;
  address: string;
  orderDate: string;
  items: OutsourcingItem[];
  totalQuantity: number;
  totalWeight: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// 存储键名
const KEYS = {
  PRODUCTS: "aluminum_products",
  SUPPLIERS: "aluminum_suppliers",
  PURCHASE_ORDERS: "aluminum_purchase_orders",
  OUTSOURCING_ORDERS: "aluminum_outsourcing_orders",
  INITIALIZED: "aluminum_data_initialized",
};

// 初始化数据
function initializeData(): void {
  if (typeof window === "undefined") return;
  const initialized = localStorage.getItem(KEYS.INITIALIZED);
  if (initialized) return;

  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seedProducts));
  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(seedSuppliers));
  localStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify([]));
  localStorage.setItem(KEYS.OUTSOURCING_ORDERS, JSON.stringify([]));
  localStorage.setItem(KEYS.INITIALIZED, "true");
}

// 通用 CRUD
function getAll<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveAll<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateOrderNo(prefix: string): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const orders = getAll<PurchaseOrder | OutsourcingOrder>(
    prefix === "CG" ? KEYS.PURCHASE_ORDERS : KEYS.OUTSOURCING_ORDERS
  );
  const todayOrders = orders.filter(o => o.orderNo.startsWith(prefix + dateStr));
  const seq = String(todayOrders.length + 1).padStart(3, "0");
  return prefix + dateStr + seq;
}

// 产品管理
export const productStore = {
  getAll(): Product[] {
    return getAll<Product>(KEYS.PRODUCTS);
  },
  getById(id: string): Product | undefined {
    return this.getAll().find(p => p.id === id);
  },
  add(product: Omit<Product, "id">): Product {
    const products = this.getAll();
    const newProduct: Product = { ...product, id: generateId() };
    products.push(newProduct);
    saveAll(KEYS.PRODUCTS, products);
    return newProduct;
  },
  update(id: string, data: Partial<Product>): Product | undefined {
    const products = this.getAll();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    products[idx] = { ...products[idx], ...data };
    saveAll(KEYS.PRODUCTS, products);
    return products[idx];
  },
  remove(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    saveAll(KEYS.PRODUCTS, filtered);
    return true;
  },
  search(keyword: string): Product[] {
    const kw = keyword.toLowerCase();
    return this.getAll().filter(p =>
      p.id.toLowerCase().includes(kw) ||
      p.name.toLowerCase().includes(kw) ||
      p.spec.toLowerCase().includes(kw)
    );
  },
};

// 供应商管理
export const supplierStore = {
  getAll(): Supplier[] {
    return getAll<Supplier>(KEYS.SUPPLIERS);
  },
  getById(id: string): Supplier | undefined {
    return this.getAll().find(s => s.id === id);
  },
  add(supplier: Omit<Supplier, "id">): Supplier {
    const suppliers = this.getAll();
    const newSupplier: Supplier = { ...supplier, id: generateId() };
    suppliers.push(newSupplier);
    saveAll(KEYS.SUPPLIERS, suppliers);
    return newSupplier;
  },
  update(id: string, data: Partial<Supplier>): Supplier | undefined {
    const suppliers = this.getAll();
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    suppliers[idx] = { ...suppliers[idx], ...data };
    saveAll(KEYS.SUPPLIERS, suppliers);
    return suppliers[idx];
  },
  remove(id: string): boolean {
    const suppliers = this.getAll();
    const filtered = suppliers.filter(s => s.id !== id);
    if (filtered.length === suppliers.length) return false;
    saveAll(KEYS.SUPPLIERS, filtered);
    return true;
  },
};

// 采购单管理
export const purchaseOrderStore = {
  getAll(): PurchaseOrder[] {
    return getAll<PurchaseOrder>(KEYS.PURCHASE_ORDERS);
  },
  getById(id: string): PurchaseOrder | undefined {
    return this.getAll().find(o => o.id === id);
  },
  add(order: Omit<PurchaseOrder, "id" | "orderNo" | "createdAt" | "updatedAt">): PurchaseOrder {
    const orders = this.getAll();
    const now = new Date().toISOString();
    const newOrder: PurchaseOrder = {
      ...order,
      id: generateId(),
      orderNo: generateOrderNo("CG"),
      createdAt: now,
      updatedAt: now,
    };
    orders.push(newOrder);
    saveAll(KEYS.PURCHASE_ORDERS, orders);
    return newOrder;
  },
  update(id: string, data: Partial<PurchaseOrder>): PurchaseOrder | undefined {
    const orders = this.getAll();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
    saveAll(KEYS.PURCHASE_ORDERS, orders);
    return orders[idx];
  },
  remove(id: string): boolean {
    const orders = this.getAll();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return false;
    saveAll(KEYS.PURCHASE_ORDERS, filtered);
    return true;
  },
};

// 委外加工单管理
export const outsourcingOrderStore = {
  getAll(): OutsourcingOrder[] {
    return getAll<OutsourcingOrder>(KEYS.OUTSOURCING_ORDERS);
  },
  getById(id: string): OutsourcingOrder | undefined {
    return this.getAll().find(o => o.id === id);
  },
  add(order: Omit<OutsourcingOrder, "id" | "orderNo" | "createdAt" | "updatedAt">): OutsourcingOrder {
    const orders = this.getAll();
    const now = new Date().toISOString();
    const newOrder: OutsourcingOrder = {
      ...order,
      id: generateId(),
      orderNo: generateOrderNo("WO"),
      createdAt: now,
      updatedAt: now,
    };
    orders.push(newOrder);
    saveAll(KEYS.OUTSOURCING_ORDERS, orders);
    return newOrder;
  },
  update(id: string, data: Partial<OutsourcingOrder>): OutsourcingOrder | undefined {
    const orders = this.getAll();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
    saveAll(KEYS.OUTSOURCING_ORDERS, orders);
    return orders[idx];
  },
  remove(id: string): boolean {
    const orders = this.getAll();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return false;
    saveAll(KEYS.OUTSOURCING_ORDERS, filtered);
    return true;
  },
};

// 初始化
export function initData(): void {
  initializeData();
}
