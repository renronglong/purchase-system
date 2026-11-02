"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 可选可输组合框：
 * - 点右侧箭头 → 展开全部候选（不受当前输入影响）
 * - 直接打字 → 同时按输入内容过滤候选，也可以保存一个全新的值
 * 比原生 datalist 可靠（datalist 依赖同页面 DOM 里存在对应 id，且手机端体验差）
 */
export function ComboInput({
  value,
  onChange,
  onSelect,
  options,
  placeholder = "- 选择或输入 -",
  className = "",
  inputClassName = "",
}: {
  value: string;
  onChange: (v: string) => void;
  /** 仅当用户从候选列表里点选时触发（手动打字不触发），适合做联动填充 */
  onSelect?: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  // null 表示「显示全部候选」，字符串表示按输入过滤
  const [query, setQuery] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, [open]);

  const list = useMemo(() => {
    if (query === null || query === "") return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const pick = (v: string) => {
    onChange(v);
    onSelect?.(v);
    setOpen(false);
    setQuery(null);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(null);
          setOpen(true);
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-1.5 pr-9 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${inputClassName}`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="展开候选"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (open) {
            setOpen(false);
            setQuery(null);
          } else {
            setQuery(null);
            setOpen(true);
          }
        }}
        className="absolute right-0 top-0 flex h-full w-8 items-center justify-center rounded-r-md text-slate-400 hover:text-slate-600"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[70] mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {list.length > 0 ? (
            list.map((o) => (
              <button
                key={o}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 ${
                  o === value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
                }`}
              >
                {o}
              </button>
            ))
          ) : (
            <div className="px-3 py-1.5 text-xs text-slate-400">
              {query ? `没有匹配的候选，可直接使用「${query}」` : "暂无候选，可直接输入"}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
