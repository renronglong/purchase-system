"use client";

import { useState } from "react";
import {
  elementToPdfBlob,
  shareOrDownloadPdf,
  safeFilename,
  type PdfPageSize,
} from "@/lib/export-pdf";

interface Props {
  /** 单据物理尺寸 */
  size: PdfPageSize;
  /** 文件名（不含 .pdf 也可以） */
  filename: string;
  /** 打印区域元素 id，默认 print-area */
  targetId?: string;
  label?: string;
  className?: string;
}

export default function ExportPdfButton({
  size,
  filename,
  targetId = "print-area",
  label = "导出PDF",
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2600);
  };

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) throw new Error("未找到单据内容");
      const blob = await elementToPdfBlob(el, size);
      const result = await shareOrDownloadPdf(blob, safeFilename(filename));
      if (result === "shared") showToast("已生成 PDF，请在分享面板中选择微信/QQ/文件");
      else if (result === "downloaded") showToast("PDF 已下载到本地");
    } catch (e: any) {
      showToast(e?.message || "导出失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        className={
          className ||
          "px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait"
        }
      >
        {busy ? "生成中..." : label}
      </button>

      {toast && (
        <div className="no-print fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-lg bg-slate-900/95 px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
