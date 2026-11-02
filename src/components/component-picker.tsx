"use client";

import { useState } from "react";
import { componentStore, type Component } from "@/lib/store";
import { ComboInput } from "@/components/combo-input";

/**
 * 组件带入器：选一个组件，把它的物料清单一次性带进当前单据明细。
 * 候选支持「组件编号 + 名称」，可搜索。
 */
export function ComponentPicker({
  onPick,
  label = "从组件带入明细",
}: {
  onPick: (component: Component) => void;
  label?: string;
}) {
  const [value, setValue] = useState("");
  const components = componentStore.getAll();
  const options = components.map((c) => `${c.id} ${c.name || ""}`.trim());

  const doPick = () => {
    const key = value.trim();
    if (!key) return;
    const hit =
      components.find((c) => `${c.id} ${c.name || ""}`.trim() === key) ||
      components.find((c) => c.id === key) ||
      components.find((c) => (c.name || "") === key);
    if (!hit) {
      alert(`没有找到组件「${key}」，请从候选中选择`);
      return;
    }
    onPick(hit);
    setValue("");
  };

  if (components.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
      <ComboInput
        value={value}
        onChange={setValue}
        options={options}
        placeholder="- 选组件 -"
        className="w-56"
        inputClassName="py-1 text-xs"
      />
      <button
        type="button"
        onClick={doPick}
        className="px-3 py-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-md hover:bg-emerald-100 whitespace-nowrap"
      >
        带入
      </button>
    </div>
  );
}
