#!/usr/bin/env python3
"""
把真实账号的业务数据完整复制一份给演示账号（两份独立数据，互不影响）。

真实账号：3074409285@qq.com          bd6c990b-d17e-4815-8edf-5768aee99ae0
演示账号：longge2623@agent.qq.com    03fa88c5-7aae-48df-bf5c-9cc0e9914124

流程：
  1. 拉取源账号 13 张表全部数据
  2. 备份目标账号现有数据到 backup/（不删备份）
  3. 清空目标账号数据
  4. 以新主键写入副本（data 内业务 id 原样保留）
  5. 核对行数

用法：
  python3 scripts/copy-data-demo.py            # 执行复制
  python3 scripts/copy-data-demo.py --dry-run  # 只看数据量，不写
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_EMAIL = "3074409285@qq.com"
DST_EMAIL = "longge2623@agent.qq.com"

TABLES = [
    "products", "suppliers", "purchase_orders", "outsourcing_orders",
    "delivery_customers", "delivery_companies", "delivery_products", "delivery_notes",
    "components", "reconciliation_orders", "sales_orders", "quotations",
    "customer_accounts",
]


def load_env():
    env = {}
    for name in (".env.local", ".env.vercel"):
        p = ROOT / name
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env.setdefault(k.strip(), v.strip())
    return env


ENV = load_env()
URL = ENV["SUPABASE_URL"].rstrip("/")
KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]
HEAD = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}


def req(method, path, body=None, extra=None, retries=3):
    headers = dict(HEAD)
    if extra:
        headers.update(extra)
    data = json.dumps(body).encode() if body is not None else None
    last = None
    for attempt in range(retries):
        try:
            r = urllib.request.Request(URL + path, data=data, headers=headers, method=method)
            with urllib.request.urlopen(r) as resp:
                raw = resp.read().decode()
                return json.loads(raw) if raw.strip() else None
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:400]
            last = f"{e.code} {detail}"
            if e.code in (429, 500, 502, 503):
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"{method} {path} -> {last}") from None
        except Exception as e:  # 网络抖动重试
            last = str(e)
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"{method} {path} -> {last}")


def find_user(email):
    users = req("GET", "/auth/v1/admin/users?per_page=200").get("users", [])
    for u in users:
        if (u.get("email") or "").lower() == email.lower():
            return u["id"]
    raise SystemExit(f"找不到账号：{email}")


def fetch_rows(table, uid):
    out, offset, step = [], 0, 1000
    while True:
        rows = req("GET", f"/rest/v1/{table}?select=id,data,created_at&user_id=eq.{uid}"
                          f"&order=created_at.asc&limit={step}&offset={offset}")
        out.extend(rows)
        if len(rows) < step:
            return out
        offset += step


def delete_all(table, uid):
    req("DELETE", f"/rest/v1/{table}?user_id=eq.{uid}", extra={"Prefer": "return=minimal"})


def insert_rows(table, uid, rows):
    payload = [{
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "data": r.get("data") or {},
    } for r in rows]
    for i in range(0, len(payload), 200):
        chunk = payload[i:i + 200]
        req("POST", f"/rest/v1/{table}", chunk, extra={"Prefer": "return=minimal"})


def main():
    dry = "--dry-run" in sys.argv
    src = find_user(SRC_EMAIL)
    dst = find_user(DST_EMAIL)
    print(f"源账号 {SRC_EMAIL} -> {src}")
    print(f"目标   {DST_EMAIL} -> {dst}\n")

    if src == dst:
        raise SystemExit("源和目标是同一个账号，中止")

    snapshot = {}
    print(f"{'表':24s}{'源':>7s}{'目标(现)':>10s}")
    for t in TABLES:
        rows = fetch_rows(t, src)
        cur = fetch_rows(t, dst)
        snapshot[t] = {"source": rows, "dest_before": cur}
        print(f"{t:24s}{len(rows):>7d}{len(cur):>10d}")

    total = sum(len(v["source"]) for v in snapshot.values())
    print(f"\n合计待复制：{total} 条")
    if dry:
        print("--dry-run，未写入")
        return

    # 备份目标账号现有数据（只增不删）
    bdir = ROOT / "backup"
    bdir.mkdir(exist_ok=True)
    bfile = bdir / f"demo-account-before-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    bfile.write_text(json.dumps({t: v["dest_before"] for t, v in snapshot.items()},
                                ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"已备份目标账号原数据 -> {bfile}")

    for t in TABLES:
        delete_all(t, dst)
        insert_rows(t, dst, snapshot[t]["source"])
        print(f"  ✓ {t:24s} 复制 {len(snapshot[t]['source'])} 条")

    print("\n核对：")
    ok = True
    for t in TABLES:
        got = len(fetch_rows(t, dst))
        want = len(snapshot[t]["source"])
        flag = "OK" if got == want else "!!"
        if got != want:
            ok = False
        print(f"  {flag} {t:24s}{got}/{want}")

    print("\n全部完成" if ok else "\n有表数量不一致，请检查")


if __name__ == "__main__":
    main()
