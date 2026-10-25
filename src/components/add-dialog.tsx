"use client";

import { useState, type ReactNode } from "react";
import { ImportPanel, type Kind } from "@/components/import-dialog";

export default function AddDialog({
  title,
  kind,
  onClose,
  onImported,
  extraTab,
  children,
}: {
  title: string;
  kind: Kind;
  onClose: () => void;
  onImported?: () => void;
  extraTab?: { key: string; label: string; content: ReactNode };
  children: ReactNode;
}) {
  const [tab, setTab] = useState<"manual" | "import" | string>("manual");

  const switchTab = (t: "manual" | "import" | string) => {
    setTab(t);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-100">
          <button
            onClick={() => switchTab("manual")}
            className={"px-4 py-2 text-sm font-medium rounded-t-md " + (tab === "manual" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            手动填写
          </button>
          <button
            onClick={() => switchTab("import")}
            className={"px-4 py-2 text-sm font-medium rounded-t-md " + (tab === "import" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            批量导入
          </button>
          {extraTab ? (
            <button
              onClick={() => switchTab(extraTab.key)}
              className={"px-4 py-2 text-sm font-medium rounded-t-md " + (tab === extraTab.key ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700")}
            >
              {extraTab.label}
            </button>
          ) : null}
        </div>

        <div className="p-5 overflow-y-auto">
          {tab === "manual" ? children : tab === "import" ? <ImportPanel kind={kind} onImported={onImported} /> : extraTab ? extraTab.content : null}
        </div>
      </div>
    </div>
  );
}