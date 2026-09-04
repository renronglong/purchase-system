import { seedProducts, seedSuppliers, type Product, type Supplier } from "./seed-data";
import {
  deliveryCustomers, deliveryProducts, deliveryNotes,
  type DeliveryCustomer, type DeliveryProduct, type DeliveryNote, type DeliveryItem,
} from "./delivery-seed-data";
import { seedPurchaseOrders } from "./purchase-seed-data";
import { plateProducts } from "./plate-seed-data";

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
  company?: string;
  maker?: string;
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
  // 板材专属字段（可选，向后兼容）
  material?: string;        // 材质
  sheetsCount?: number;     // 订单数量（张数）
  piecesPerSheet?: number;  // 每张出材数
  actualOutput?: number;    // 实际出材数
  bladeCount?: number;      // 刀数
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
  maker: string;
  orderType?: 'profile' | 'plate';  // 订单类型，默认 profile（向后兼容）
  items: PurchaseOrderItem[];
  totalQuantity: number;
  totalWeight: number;
  totalSheets?: number;       // 板材用：总张数
  totalActualOutput?: number; // 板材用：总实际出材数
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
const STORAGE_VERSION = "v12";

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


// 板材采购单种子数据
export const seedPlatePurchaseOrders: PurchaseOrder[] = [
  {
    id: 'plate-po-1',
    orderNo: 'PO-B2025021001',
    company: '佛山市质稳五金有限公司',
    supplierId: 's-plate-1',
    supplierName: '铝板供应商',
    contact: '张经理',
    phone: '13800138001',
    address: '佛山市南海区',
    orderDate: '2025-02-10',
    maker: '易金兰',
    orderType: 'plate',
    items: [
      {
        id: 'plate-item-1',
        productCode: 'PLT-lk-003',
        productName: 'lk-003',
        spec: '1220*116.19*0.5',
        length: 0,
        quantity: 0,
        unit: '',
        weightPerMeter: 0,
        totalWeight: 0,
        surfaceTreatment: '',
        deliveryDate: '',
        remark: '不要附膜',
        material: '普通铝板',
        sheetsCount: 5000,
        piecesPerSheet: 210,
        actualOutput: 5040,
        bladeCount: 504,
      }
    ],
    totalQuantity: 0,
    totalWeight: 0,
    totalSheets: 5000,
    totalActualOutput: 5040,
    createdAt: '2025-02-10T10:00:00.000Z',
    updatedAt: '2025-02-10T10:00:00.000Z'
  },
  {
    id: 'plate-po-2',
    orderNo: 'PO-B2025021002',
    company: '佛山市质稳五金有限公司',
    supplierId: 's-plate-1',
    supplierName: '铝板供应商',
    contact: '张经理',
    phone: '13800138001',
    address: '佛山市南海区',
    orderDate: '2025-02-10',
    maker: '易金兰',
    orderType: 'plate',
    items: [
      {
        id: 'plate-item-2',
        productCode: 'PLT-yl-014',
        productName: 'yl-014',
        spec: '1220*152*1.2',
        length: 0,
        quantity: 0,
        unit: '',
        weightPerMeter: 0,
        totalWeight: 0,
        surfaceTreatment: '',
        deliveryDate: '',
        remark: '',
        material: '5052',
        sheetsCount: 3000,
        piecesPerSheet: 640,
        actualOutput: 3200,
        bladeCount: 65,
      }
    ],
    totalQuantity: 0,
    totalWeight: 0,
    totalSheets: 3000,
    totalActualOutput: 3200,
    createdAt: '2025-02-10T11:00:00.000Z',
    updatedAt: '2025-02-10T11:00:00.000Z'
  },
  {
    id: 'plate-po-3',
    orderNo: 'PO-B2025021003',
    company: '佛山市质稳五金有限公司',
    supplierId: 's-plate-1',
    supplierName: '铝板供应商',
    contact: '张经理',
    phone: '13800138001',
    address: '佛山市南海区',
    orderDate: '2025-02-10',
    maker: '易金兰',
    orderType: 'plate',
    items: [
      {
        id: 'plate-item-3',
        productCode: 'PLT-YL-071',
        productName: 'YL-071',
        spec: '1220*51.9*1.2',
        length: 0,
        quantity: 0,
        unit: '',
        weightPerMeter: 0,
        totalWeight: 0,
        surfaceTreatment: '',
        deliveryDate: '',
        remark: '',
        material: '5052',
        sheetsCount: 2000,
        piecesPerSheet: 1316,
        actualOutput: 2632,
        bladeCount: 94,
      }
    ],
    totalQuantity: 0,
    totalWeight: 0,
    totalSheets: 2000,
    totalActualOutput: 2632,
    createdAt: '2025-02-10T12:00:00.000Z',
    updatedAt: '2025-02-10T12:00:00.000Z'
  }
];

// 初始化数据
function initializeData(): void {
  if (typeof window === "undefined") return;

  const currentVersion = localStorage.getItem(KEYS.STORAGE_VERSION);

  // 首次访问：写入全部初始数据
  if (currentVersion === null) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([...seedProducts, ...plateProducts]));
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([...seedSuppliers, { id: "s-plate-1", name: "铝板供应商", contact: "张经理", phone: "13800138001", address: "佛山市南海区" }]));
    localStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify([...seedPurchaseOrders, ...seedPlatePurchaseOrders]));
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
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([...seedProducts, ...plateProducts]));
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([...seedSuppliers, { id: "s-plate-1", name: "铝板供应商", contact: "张经理", phone: "13800138001", address: "佛山市南海区" }]));
    localStorage.setItem(KEYS.DELIVERY_CUSTOMERS, JSON.stringify(deliveryCustomers));
    localStorage.setItem(KEYS.DELIVERY_PRODUCTS, JSON.stringify(deliveryProducts));
    localStorage.setItem(KEYS.DELIVERY_NOTES, JSON.stringify(deliveryNotes));
    // 对帐单保留用户数据，不覆盖
    if (!localStorage.getItem(KEYS.RECONCILIATION_ORDERS)) {
      localStorage.setItem(KEYS.RECONCILIATION_ORDERS, JSON.stringify([]));
    }
    localStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION);
  }

  // 采购单种子数据补充：如果采购单键不存在或为空数组，写入种子数据
  const purchaseOrdersData = localStorage.getItem(KEYS.PURCHASE_ORDERS);
  if (!purchaseOrdersData || JSON.parse(purchaseOrdersData).length === 0) {
    localStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify([...seedPurchaseOrders, ...seedPlatePurchaseOrders]));
  }

  // 补充铝板供应商（如不存在）
  const suppliersData = localStorage.getItem(KEYS.SUPPLIERS);
  if (suppliersData) {
    const suppliersList = JSON.parse(suppliersData) as Supplier[];
    if (!suppliersList.some(s => s.id === 's-plate-1')) {
      suppliersList.push({ id: 's-plate-1', name: '铝板供应商', contact: '张经理', phone: '13800138001', address: '佛山市南海区' });
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliersList));
    }
  }

  // v12升级：补充板材采购单种子数据（如不存在则添加）
  if (currentVersion === "v11" && purchaseOrdersData) {
    const existing = JSON.parse(purchaseOrdersData) as PurchaseOrder[];
    const plateIds = seedPlatePurchaseOrders.map(p => p.id);
    const hasPlate = existing.some(o => plateIds.includes(o.id));
    if (!hasPlate) {
      localStorage.setItem(KEYS.PURCHASE_ORDERS, JSON.stringify([...existing, ...seedPlatePurchaseOrders]));
    }
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

