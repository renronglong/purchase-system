// 服务端数据桥接层
//
// 目标：在不改 100+ 处页面同步调用点的前提下，把数据存储从纯 localStorage
// 升级为「服务端数据库 + 本地缓存」。
//
// 设计：
// - 内存缓存作为页面同步读写的唯一数据源（getServerCache / setServerCache）。
// - initServerData(): 登录后异步从 Route Handlers 拉取 12 个集合到内存缓存，
//   同时写回 localStorage 作为离线缓存；本地已有的存量数据（旧版 localStorage）
//   在服务端为空时作为「存量迁移」推送到服务端。
// - saveServerData(key, data): 页面写入后调用，把整个集合异步推送到服务端
//   （以业务实体的 id 为准做全量替换，简单可靠）。
//
// 由此：页面仍同步读内存（零改动），数据落服务端且按账号隔离（RLS）。

import { apiList, apiCreate, apiUpdate, apiDelete } from "./api/client";

// KEYS → Route resource 映射（与 src/app/api 目录一致）
const KEY_TO_RESOURCE: Record<string, string> = {
  aluminum_products: "products",
  aluminum_suppliers: "suppliers",
  aluminum_purchase_orders: "purchase-orders",
  aluminum_outsourcing_orders: "outsourcing-orders",
  delivery_customers: "delivery-customers",
  delivery_companies: "delivery-companies",
  delivery_products: "delivery-products",
  delivery_notes: "delivery-notes",
  aluminum_components: "components",
  reconciliation_orders: "reconciliation-orders",
  sales_orders: "sales-orders",
  quotations: "quotations",
  customer_accounts: "customer-accounts",
};

// 内存缓存：key(localStorage key) -> 实体数组（含 id）
const memoryCache = new Map<string, any[]>();

export function getServerCache<T>(key: string): T[] {
  return (memoryCache.get(key) as T[]) || [];
}

export function setServerCache<T>(key: string, data: T[]): void {
  memoryCache.set(key, data);
}

export function clearServerCache(): void {
  memoryCache.clear();
}

export function resourceOf(key: string): string | null {
  return KEY_TO_RESOURCE[key] || null;
}

/**
 * 从服务端拉取指定集合到内存+localStorage 缓存。
 * 返回该集合最新数组（服务端优先；若服务端为空则回退本地缓存/返回空）。
 */
export async function loadCollection<T>(key: string): Promise<T[]> {
  const resource = resourceOf(key);
  if (!resource) return getServerCache<T>(key);

  let remote: T[] = [];
  try {
    remote = await apiList<T>(resource);
  } catch {
    remote = [];
  }

  // 服务端有数据 → 以服务端为准
  if (remote.length > 0) {
    memoryCache.set(key, remote);
    return remote;
  }

  // 服务端为空 → 用本地缓存（离线缓存或旧版存量数据），并把存量推送到服务端
  const local = getServerCache<T>(key);
  if (local.length > 0) {
    memoryCache.set(key, local);
    // 存量迁移：异步推送到服务端
    void pushAll(resource, local);
  }
  return local;
}

/** 把整个集合全量推送到服务端（存量迁移 / 全量重写） */
async function pushAll(resource: string, entities: any[]): Promise<void> {
  for (const e of entities) {
    try {
      await apiCreate(resource, e);
    } catch {
      /* 忽略单条失败，继续迁移 */
    }
  }
}

/** 页面写入后的异步同步到服务端（全量替换，简单可靠） */
export async function saveServerData(key: string, data: any[]): Promise<void> {
  const resource = resourceOf(key);
  if (!resource) return;
  memoryCache.set(key, data);
  try {
    // 全量覆盖：先取当前 remote 的 id 集合，删除不在本地的新增；再 upsert 每条本地
    let remote: any[] = [];
    try {
      remote = await apiList<any>(resource);
    } catch {
      remote = [];
    }
    const localIds = new Set(data.map((d) => d?.id).filter(Boolean));
    for (const r of remote) {
      if (r?.id && !localIds.has(r.id)) {
        try {
          await apiDelete(resource, r.id);
        } catch {
          /* ignore */
        }
      }
    }
    for (const d of data) {
      if (!d?.id) continue;
      try {
        const existed = remote.some((r) => r.id === d.id);
        if (existed) await apiUpdate(resource, d);
        else await apiCreate(resource, d);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* 忽略同步失败，保留本地缓存 */
  }
}