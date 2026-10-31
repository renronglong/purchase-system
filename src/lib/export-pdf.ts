"use client";

/**
 * 单据导出 PDF 工具
 * 思路：把打印区域（#print-area）按物理尺寸截图，再按目标纸张尺寸写入 PDF。
 * 内容超出一页时自动纵向分页，避免长单据被压扁。
 */

export type ExportResult = "shared" | "downloaded" | "canceled";

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

/** 把 DOM 元素渲染成 PDF Blob */
export async function elementToPdfBlob(
  el: HTMLElement,
  size: PdfPageSize
): Promise<Blob> {
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
  const pdf = new JsPDF({
    unit: "mm",
    format: [widthMm, heightMm],
    orientation: "portrait",
    compress: true,
  });

  // 图片按宽度铺满后对应的总高度
  const imgHeightMm = (canvas.height * widthMm) / canvas.width;

  // 单页装得下：直接放
  if (imgHeightMm <= heightMm + 0.5) {
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
    return pdf.output("blob");
  }

  // 多页：按像素切片，逐页放入
  const pageCount = Math.ceil(imgHeightMm / heightMm);
  const pxPerPage = Math.floor((canvas.height * heightMm) / imgHeightMm);

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage([widthMm, heightMm], "portrait");
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

  return pdf.output("blob");
}

/** 优先调起系统分享（手机可发微信/QQ/存文件），不支持则下载 */
export async function shareOrDownloadPdf(
  blob: Blob,
  filename: string
): Promise<ExportResult> {
  const name = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  const file = new File([blob], name, { type: "application/pdf" });

  const nav: any = typeof navigator !== "undefined" ? navigator : null;
  try {
    if (nav?.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: name });
      return "shared";
    }
  } catch (err: any) {
    // 用户主动取消分享：不报错也不下载
    if (err && err.name === "AbortError") return "canceled";
    // 其他情况（如生成耗时导致分享手势失效）：继续走下载兜底
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}

/** 一步到位：元素 → PDF → 分享或下载 */
export async function exportElementPdf(
  el: HTMLElement,
  size: PdfPageSize,
  filename: string
): Promise<ExportResult> {
  const blob = await elementToPdfBlob(el, size);
  return shareOrDownloadPdf(blob, filename);
}

/** 文件名安全化：去掉系统不允许的字符 */
export function safeFilename(name: string): string {
  return (name || "单据").replace(/[\\/:*?"<>|\r\n]/g, "_").slice(0, 80);
}
