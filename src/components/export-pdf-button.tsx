"use client";

import { useState } from "react";
import {
  renderElementToPdf,
  shareFile,
  copyImageToClipboard,
  downloadBlob,
  safeFilename,
  type PdfPageSize,
  type RenderedDoc,
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
  const [doc, setDoc] = useState<RenderedDoc | null>(null);
  const [toast, setToast] = useState("");
  const [baseName, setBaseName] = useState("");

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2600);
  };

  const close = () => {
    setDoc(null);
    setBusy(false);
  };

  /** 第一步：点按钮 → 渲染 PDF/PNG → 弹出操作面板 */
  const handleRender = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) throw new Error("未找到单据内容");
      const name = safeFilename(filename);
      const rendered = await renderElementToPdf(el, size);
      setBaseName(name);
      setDoc(rendered);
    } catch (e: any) {
      showToast(e?.message || "生成失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  /** 分享：优先 PDF */
  const handleShare = async () => {
    if (!doc) return;
    const result = await shareFile(doc.pdfBlob, `${baseName}.pdf`, baseName);
    if (result === "shared") close();
    else if (result === "unsupported") showToast("当前浏览器不支持系统分享，请用下载");
  };

  /** 复制图片：直接粘到微信 */
  const handleCopyImage = async () => {
    if (!doc?.pngBlob) {
      showToast("图片生成失败，请用下载");
      return;
    }
    const ok = await copyImageToClipboard(doc.pngBlob);
    if (ok) {
      showToast("图片已复制，去微信/QQ 里粘贴即可");
      close();
    } else {
      showToast("当前浏览器不支持复制图片，请用分享或下载");
    }
  };

  const handleDownloadPdf = () => {
    if (!doc) return;
    downloadBlob(doc.pdfBlob, `${baseName}.pdf`);
    close();
  };

  const handleDownloadImage = () => {
    if (!doc?.pngBlob) {
      showToast("图片生成失败");
      return;
    }
    downloadBlob(doc.pngBlob, `${baseName}.png`);
    close();
  };

  return (
    <>
      <button
        onClick={handleRender}
        disabled={busy}
        className={
          className ||
          "px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait"
        }
      >
        {busy ? "生成中..." : label}
      </button>

      {/* 操作面板 */}
      {doc && (
        <div className="no-print fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={close}>
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 text-sm font-medium text-slate-900">单据已生成</div>
            <div className="mb-3 truncate text-xs text-slate-500">
              {baseName}.pdf{doc.pageCount > 1 ? ` · 共 ${doc.pageCount} 页` : ""}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleShare}
                className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                分享（微信 / QQ / 邮件）
              </button>

              <button
                onClick={handleCopyImage}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                复制图片（直接粘到微信）
              </button>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  下载 PDF
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  下载图片
                </button>
              </div>
            </div>

            <button
              onClick={close}
              className="mt-3 w-full rounded-lg py-2 text-xs text-slate-500 hover:text-slate-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="no-print fixed left-1/2 top-6 z-[110] -translate-x-1/2 rounded-lg bg-slate-900/95 px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
