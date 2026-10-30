import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../supabase-server";

/**
 * 通用 CRUD 路由工厂
 *
 * 每个业务集合一个 Route Handler 文件，setOf(crudConfig) 生成 GET/POST/PUT/DELETE。
 * 安全要点：
 * - 用 /entities/<table> 与业务数据对象本身解耦，返回/接收的都是 {id, ...data} 实体；
 * - user_id 一律取请求方 token 的 auth.uid()，写入时强制覆盖，禁止信任前端传值；
 * - 读取时按 auth.uid() = user_id 过滤，天然实现按账号隔离。
 */

interface CrudConfig {
  /** Drizzle 表名（数据库表名） */
  table: string;
  /** 实体主键字段名（前端 store 里用的 id 字段） */
  keyField?: string;
}

function getBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = getBearer(req);
  if (!token) return null;
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

/** 从实体中提取主键值，默认取 id 字段，兼容 data.id */
function extractId(entity: any, keyField: string): string | null {
  return entity?.[keyField] ?? entity?.id ?? null;
}

/** 组装一个 CRUD handler 集 */
export function makeCrud(config: CrudConfig) {
  const keyField = config.keyField || "id";
  const table = config.table;

  async function GET(req: NextRequest) {
    const uid = await getUserId(req);
    if (!uid) return NextResponse.json({ error: "未授权" }, { status: 401 });
    try {
      const supabase = getSupabaseServer();
      // 从 service_role 视角查表（绕过 RLS），按 user_id 过滤实现隔离
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", uid);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const rows: any[] = data || [];
      // 读取入口统一去重：同一业务主键只保留 updated_at 最新的一条。
      // 历史遗留的重复行（同 data.id、不同行 id）在返回时被折叠，
      // 并把多余行物理删除，避免重复随每次读写反复放大。
      const best = new Map<string, { entity: any; ts: string; rowId: string }>();
      const staleRowIds: string[] = [];
      for (const row of rows) {
        const entity = row.data || {};
        const bid = String(entity?.id ?? row.id);
        const ts = String(row.updated_at || "");
        const prev = best.get(bid);
        if (!prev) {
          best.set(bid, { entity, ts, rowId: row.id });
        } else if (ts > prev.ts) {
          staleRowIds.push(prev.rowId);
          best.set(bid, { entity, ts, rowId: row.id });
        } else {
          staleRowIds.push(row.id);
        }
      }
      if (staleRowIds.length > 0) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq("user_id", uid)
            .in("id", staleRowIds);
        } catch {
          /* 清理失败不影响读取 */
        }
      }
      return NextResponse.json(Array.from(best.values()).map((v) => v.entity));
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  async function POST(req: NextRequest) {
    const uid = await getUserId(req);
    if (!uid) return NextResponse.json({ error: "未授权" }, { status: 401 });
    try {
      const body: any = await req.json();
      const id = extractId(body, keyField) || crypto.randomUUID();
      const entity = { ...body, id };
      // 强制设置 user_id = 调用方 uid，不信任前端
      const supabase = getSupabaseServer();
      // 幂等写入：同一账号下同一业务主键已存在则更新，不再插入新行。
      // 这是防止「存量迁移/重试提交」把同一批数据写成多份的关键。
      const { data: existing } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", uid)
        .eq("data->>id", String(id))
        .limit(1);
      if (existing && existing.length > 0) {
        const { error: upErr } = await supabase
          .from(table)
          .update({ data: entity, updated_at: new Date().toISOString() })
          .eq("user_id", uid)
          .eq("data->>id", String(id));
        if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
        return NextResponse.json(entity, { status: 200 });
      }
      const { data, error } = await supabase
        .from(table)
        .insert({ user_id: uid, data: entity, id: crypto.randomUUID() })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data?.data || entity, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  async function PUT(req: NextRequest) {
    const uid = await getUserId(req);
    if (!uid) return NextResponse.json({ error: "未授权" }, { status: 401 });
    try {
      const body: any = await req.json();
      const id = extractId(body, keyField);
      if (!id) return NextResponse.json({ error: "缺少主键" }, { status: 400 });
      const entity = { ...body, id };
      const supabase = getSupabaseServer();
      // 用 data->>id 定位该用户下的具体业务行（user_id + 业务主键双重过滤）
      const { data, error } = await supabase
        .from(table)
        .update({ data: entity, updated_at: new Date().toISOString() })
        .eq("user_id", uid)
        .eq("data->>id", String(id));
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(entity);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  async function DELETE(req: NextRequest) {
    const uid = await getUserId(req);
    if (!uid) return NextResponse.json({ error: "未授权" }, { status: 401 });
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "缺少主键" }, { status: 400 });
      const supabase = getSupabaseServer();
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", uid)
        .eq("data->>id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return { GET, POST, PUT, DELETE };
}

export { getUserId };