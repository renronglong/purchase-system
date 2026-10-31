"use client";

/**
 * 单据导出工具
 * 思路：把打印区域（#print-area）按物理尺寸截图，再按目标纸张尺寸写入 PDF。
 * 同时产出 PNG，方便用户直接「复制图片」粘到微信/QQ。
 */

export interface PdfPageSize {
  /** 单据物理宽度（毫米） */
  widthMm: number;
  /** 单据物理高度（毫米）；内容超出时自动分页 */
  heightMm: number;
}

/** 常用纸张尺寸 */
export const PDF_SIZE = {
  /** 针式连续纸（采购单/送货单/委外/对帐单） */
  continuous: { widthMm: 241, heightMm: 140 } as PdfPageSize,
  /** A4 横向（购销合同） */
  a4Landscape: { widthMm: 297, heightMm: 210 } as PdfPageSize,
  /** A4 纵向（报价单） */
  a4Portrait: { widthMm: 210, heightMm: 297 } as PdfPageSize,
};

export interface RenderedDoc {
  pdfBlob: Blob;
  /** 整张图（不分页），用于复制/保存图片 */
  pngBlob: Blob | null;
  pageCount: number;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), type, quality);
    } catch {
      resolve(null);
    }
  });
}

/** 把 DOM 元素渲染成 PDF + PNG */
export async function renderElementToPdf(
  el: HTMLElement,
  size: PdfPageSize
): Promise<RenderedDoc> {
  const html2canvasMod: any = await import("html2canvas-pro");
  const html2canvas = html2canvasMod?.default || html2canvasMod;
  const jspdfMod: any = await import("jspdf");
  const JsPDF = jspdfMod?.jsPDF || jspdfMod?.default;

  if (typeof html2canvas !== "function" || typeof JsPDF !== "function") {
    throw new Error("PDF 组件加载失败，请刷新页面重试");
  }

  const targetWidth = Math.max(el.scrollWidth || 0, el.offsetWidth || 0, 1);
  // 目标像素宽度约 1600px，兼顾清晰度与文件体积
  const scale = Math.min(3, Math.max(1.5, 1600 / targetWidth));

  const canvas: HTMLCanvasElement = await html2canvas(el, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: Math.max(document.documentElement.clientWidth, targetWidth + 40),
  });

  const { widthMm, heightMm } = size;
  // jsPDF 会按 orientation 强制宽高关系：横向单据必须传 landscape，
  // 否则 241×140 会被翻成 140×241（导出后方向是竖的）。
  const orientation: "portrait" | "landscape" = widthMm > heightMm ? "landscape" : "portrait";
  const pdf = new JsPDF({
    unit: "mm",
    format: [widthMm, heightMm],
    orientation,
    compress: true,
  });

  // 图片按宽度铺满后对应的总高度
  const imgHeightMm = (canvas.height * widthMm) / canvas.width;
  let pageCount = 1;

  if (imgHeightMm <= heightMm + 0.5) {
    // 单页装得下
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      0,
      widthMm,
      heightMm,
      undefined,
      "FAST"
    );
  } else {
    // 多页：按像素切片，逐页放入
    pageCount = Math.ceil(imgHeightMm / heightMm);
    const pxPerPage = Math.floor((canvas.height * heightMm) / imgHeightMm);

    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage([widthMm, heightMm], orientation);
      const sy = i * pxPerPage;
      const sh = Math.min(pxPerPage, canvas.height - sy);
      if (sh <= 0) break;

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sh;
      const ctx = slice.getContext("2d");
      if (!ctx) continue;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      const sliceHeightMm = (sh * widthMm) / canvas.width;
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        widthMm,
        sliceHeightMm,
        undefined,
        "FAST"
      );
    }
  }

  const pdfBlob = pdf.output("blob");
  const pngBlob = await canvasToBlob(canvas, "image/png");

  return { pdfBlob, pngBlob, pageCount };
}

/** 下载文件到本地 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** 调起系统分享面板（手机可发微信/QQ/邮件/存文件）；返回是否成功 */
export async function shareFile(
  blob: Blob,
  filename: string,
  title?: string
): Promise<"shared" | "canceled" | "unsupported"> {
  const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
  const nav: any = typeof navigator !== "undefined" ? navigator : null;

  if (!nav?.share || !nav?.canShare || !nav.canShare({ files: [file] })) {
    return "unsupported";
  }
  try {
    await nav.share({ files: [file], title: title || filename });
    return "shared";
  } catch (err: any) {
    if (err && err.name === "AbortError") return "canceled";
    return "unsupported";
  }
}

/** 复制图片到剪贴板；返回是否成功 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    const CI: any = (window as any).ClipboardItem;
    const clip: any = typeof navigator !== "undefined" ? navigator.clipboard : null;
    if (!CI || !clip?.write) return false;
    const png = blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" });
    await clip.write([new CI({ "image/png": png })]);
    return true;
  } catch {
    return false;
  }
}

/** 文件名安全化：去掉系统不允许的字符 */
export function safeFilename(name: string): string {
  return (name || "单据").replace(/[\\/:*?"<>|\r\n]/g, "_").slice(0, 80);
}
