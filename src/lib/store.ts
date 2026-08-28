import { seedProducts, seedSuppliers, type Product, type Supplier } from "./seed-data";
import {
  deliveryCustomers, deliveryProducts, deliveryNotes,
  type DeliveryCustomer, type DeliveryProduct, type DeliveryNote, type DeliveryItem,
} from "./delivery-seed-data";

export type { Product, Supplier };
export type { DeliveryCustomer, DeliveryProduct, DeliveryNote, DeliveryItem };

// 对帐单明细
export interface ReconciliationItem {
  id: string;
  deliveryNoteNo: string;
  deliveryDate: string;
  materialCode: string;
  productName: string;
  spec: string;
  surface: string;
  unit: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

// 对帐单
export interface ReconciliationOrder {
  id: string;
  orderNo: string;
  customer: string;
  startDate: string;
  endDate: string;
  status: string;
  remark: string;
  items: ReconciliationItem[];
  totalQty: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

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

// 种子数据版本号：每次更新 seed-data 时升此值，强制覆盖旧缓存
const STORAGE_VERSION = "v8";

// 存储键名
const KEYS = {
  PRODUCTS: "aluminum_products",
  SUPPLIERS: "aluminum_suppliers",
  PURCHASE_ORDERS: "aluminum_purchase_orders",
  OUTSOURCING_ORDERS: "aluminum_outsourcing_orders",
  DELIVERY_CUSTOMERS: "delivery_customers",
  DELIVERY_PRODUCTS: "delivery_products",
  DELIVERY_NOTES: "delivery_notes",
  RECONCILIATION_ORDERS: "reconciliation_orders",
  STORAGE_VERSION: "aluminum_storage_version",
};

// 预览下一个送货单号
export function previewDeliveryOrderNo(): string {
  if (typeof window === "undefined") return "";
  return generateOrderNo("BL", KEYS.DELIVERY_NOTES);
}

// 客户管理（送货模块）
export const deliveryCustomerStore = {
  getAll(): DeliveryCustomer[] {
    return getAll<DeliveryCustomer>(KEYS.DELIVERY_CUSTOMERS);
  },
  getById(id: string): DeliveryCustomer | undefined {
    return this.getAll().find(c => c.id === id);
  },
  add(customer: Omit<DeliveryCustomer, "id">): DeliveryCustomer {
    const list = this.getAll();
    const newCustomer: DeliveryCustomer = { ...customer, id: generateId() };
    list.push(newCustomer);
    saveAll(KEYS.DELIVERY_CUSTOMERS, list);
    return newCustomer;
  },
  update(id: string, data: Partial<DeliveryCustomer>): DeliveryCustomer | undefined {
    const list = this.getAll();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...data };
    saveAll(KEYS.DELIVERY_CUSTOMERS, list);
    return list[idx];
  },
  remove(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    saveAll(KEYS.DELIVERY_CUSTOMERS, filtered);
    return true;
  },
  search(keyword: string): DeliveryCustomer[] {
    const kw = keyword.toLowerCase();
    return this.getAll().filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.contact.toLowerCase().includes(kw)
    );
  },
};

// 送货产品管理
export const deliveryProductStore = {
  getAll(): DeliveryProduct[] {
    return getAll<DeliveryProduct>(KEYS.DELIVERY_PRODUCTS);
  },
  getById(id: string): DeliveryProduct | undefined {
    return this.getAll().find(p => p.id === id);
  },
  add(product: Omit<DeliveryProduct, "id">): DeliveryProduct {
    const list = this.getAll();
    const newProduct: DeliveryProduct = { ...product, id: generateId() };
    list.push(newProduct);
    saveAll(KEYS.DELIVERY_PRODUCTS, list);
    return newProduct;
  },
  update(id: string, data: Partial<DeliveryProduct>): DeliveryProduct | undefined {
    const list = this.getAll();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...data };
    saveAll(KEYS.DELIVERY_PRODUCTS, list);
    return list[idx];
  },
  remove(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length === list.length) return false;
    saveAll(KEYS.DELIVERY_PRODUCTS, filtered);
    return true;
  },
  search(keyword: string): DeliveryProduct[] {
    const kw = keyword.toLowerCase();
    return this.getAll().filter(p =>
      p.id.toLowerCase().includes(kw) ||
      p.name.toLowerCase().includes(kw) ||
      p.spec.toLowerCase().includes(kw)
    );
  },
};

// 送货单管理
export const deliveryNoteStore = {
  getAll(): DeliveryNote[] {
    return getAll<DeliveryNote>(KEYS.DELIVERY_NOTES);
  },
  getById(id: string): DeliveryNote | undefined {
    return this.getAll().find(o => o.id === id);
  },
  add(order: Omit<DeliveryNote, "id" | "noteNo">): DeliveryNote {
    const list = this.getAll();
    const newOrder: DeliveryNote = {
      ...order,
      id: generateId(),
      noteNo: generateOrderNo("BL", KEYS.DELIVERY_NOTES),
    };
    list.push(newOrder);
    saveAll(KEYS.DELIVERY_NOTES, list);
    return newOrder;
  },
  update(id: string, data: Partial<DeliveryNote>): DeliveryNote | undefined {
    const list = this.getAll();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...data };
    saveAll(KEYS.DELIVERY_NOTES, list);
    return list[idx];
  },
  remove(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(o => o.id !== id);
    if (filtered.length === list.length) return false;
    saveAll(KEYS.DELIVERY_NOTES, filtered);
    return true;
  },
};

// 预览下一个对帐单号
export function previewReconciliationOrderNo(): string {
  if (typeof window === "undefined") return "";
  return generateOrderNo("DZ", KEYS.RECONCILIATION_ORDERS);
}

// 对帐单管理
export const reconciliationStore = {
  getAll(): ReconciliationOrder[] {
    return getAll<ReconciliationOrder>(KEYS.RECONCILIATION_ORDERS);
  },
  getById(id: string): ReconciliationOrder | undefined {
    return this.getAll().find(o => o.id === id);
  },
  add(order: Omit<ReconciliationOrder, "id" | "orderNo" | "createdAt" | "updatedAt">): ReconciliationOrder {
    const list = this.getAll();
    const now = new Date().toISOString();
    const newOrder: ReconciliationOrder = {
      ...order,
      id: generateId(),
      orderNo: generateOrderNo("DZ", KEYS.RECONCILIATION_ORDERS),
      createdAt: now,
      updatedAt: now,
    };
    list.push(newOrder);
    saveAll(KEYS.RECONCILIATION_ORDERS, list);
    return newOrder;
  },
  update(id: string, data: Partial<ReconciliationOrder>): ReconciliationOrder | undefined {
    const list = this.getAll();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    saveAll(KEYS.RECONCILIATION_ORDERS, list);
    return list[idx];
  },
  remove(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(o => o.id !== id);
    if (filtered.length === list.length) return false;
    saveAll(KEYS.RECONCILIATION_ORDERS, filtered);
    return true;
  },
};

// 初始化数据
function initializeData(): void {
  if (typeof window === "undefined") return;

  const currentVersion = localStorage.getItem(KEYS.STORAGE_VERSION);

  // 首次访问：写入全部初始数据
  if (currentVersion === null) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seedProducts));
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(seedSuppliers));
    localStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.OUTSOURCING_ORDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.DELIVERY_CUSTOMERS, JSON.stringify(deliveryCustomers));
    localStorage.setItem(KEYS.DELIVERY_PRODUCTS, JSON.stringify(deliveryProducts));
    localStorage.setItem(KEYS.DELIVERY_NOTES, JSON.stringify(deliveryNotes));
    localStorage.setItem(KEYS.RECONCILIATION_ORDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION);
    return;
  }

  // 版本号不匹配：强制用最新种子数据覆盖，保留用户订单数据
  if (currentVersion !== STORAGE_VERSION) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seedProducts));
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(seedSuppliers));
    localStorage.setItem(KEYS.DELIVERY_CUSTOMERS, JSON.stringify(deliveryCustomers));
    localStorage.setItem(KEYS.DELIVERY_PRODUCTS, JSON.stringify(deliveryProducts));
    localStorage.setItem(KEYS.DELIVERY_NOTES, JSON.stringify(deliveryNotes));
    // 对帐单保留用户数据，不覆盖
    if (!localStorage.getItem(KEYS.RECONCILIATION_ORDERS)) {
      localStorage.setItem(KEYS.RECONCILIATION_ORDERS, JSON.stringify([]));
    }
    localStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION);
  }
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

function generateOrderNo(prefix: string, storageKey: string): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const dayPrefix = `${prefix}-${dateStr}-`;
  const orders = getAll<PurchaseOrder | OutsourcingOrder>(storageKey);
  let maxSeq = 0;
  for (const o of orders) {
    if (o.orderNo.startsWith(dayPrefix)) {
      const seqStr = o.orderNo.slice(dayPrefix.length);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  const seq = String(maxSeq + 1).padStart(3, "0");
  return `${dayPrefix}${seq}`;
}

// 预览下一个采购单号（新建表单展示用）
export function previewPurchaseOrderNo(): string {
  if (typeof window === "undefined") return "";
  return generateOrderNo("CG", KEYS.PURCHASE_ORDERS);
}

// 预览下一个委外加工单号
export function previewOutsourcingOrderNo(): string {
  if (typeof window === "undefined") return "";
  return generateOrderNo("WO", KEYS.OUTSOURCING_ORDERS);
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
      orderNo: generateOrderNo("CG", KEYS.PURCHASE_ORDERS),
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
      orderNo: generateOrderNo("WO", KEYS.OUTSOURCING_ORDERS),
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
