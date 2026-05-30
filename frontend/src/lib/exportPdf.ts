/**
 * GymFit PDF Export Utility — Data-driven
 * Menggunakan jsPDF untuk generate PDF profesional dari data mentah.
 * Tidak menggunakan screenshot / html-to-image.
 *
 * Fitur:
 * - Header branded GymFit (teal strip)
 * - Summary cards (KPI)
 * - Tabel data otomatis multi-halaman
 * - Footer dengan nomor halaman
 */

import { jsPDF } from "jspdf";

// ── Brand Colors ──
const BRAND = {
  primary:      [15, 118, 110] as [number, number, number],   // teal-700
  primaryLight: [204, 251, 241] as [number, number, number],  // teal-50
  dark:         [24, 24, 27] as [number, number, number],     // zinc-900
  muted:        [113, 113, 122] as [number, number, number],  // zinc-500
  border:       [228, 228, 231] as [number, number, number],  // zinc-200
  white:        [255, 255, 255] as [number, number, number],
  rowAlt:       [249, 250, 251] as [number, number, number],  // gray-50
  headerBg:     [240, 253, 250] as [number, number, number],  // teal-50
};

// ── Types ──

export interface PdfSummaryItem {
  label: string;
  value: string | number;
}

export interface PdfTableSection {
  title: string;
  columns: { header: string; key: string; align?: "left" | "right" | "center"; width?: number }[];
  rows: Record<string, any>[];
}

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  tenantName?: string;
  summary?: PdfSummaryItem[];
  tables?: PdfTableSection[];
}

// ── Constants ──
const MARGIN = 14;
const FONT_BODY = 8;
const FONT_SMALL = 7;
const LINE_HEIGHT = 5;
const ROW_PADDING = 3;

// ── Helpers ──

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Gambar header branded di halaman pertama.
 */
function drawHeader(
  doc: jsPDF,
  pw: number,
  title: string,
  subtitle?: string,
  tenantName?: string
): number {
  // ── Teal strip ──
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pw, 36, "F");

  // ── Brand name ──
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("GymFit", MARGIN, 14);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Management System", MARGIN, 19);

  // ── Printed date (right) ──
  const printedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  doc.setFontSize(7);
  doc.text(`Dicetak: ${printedAt}`, pw - MARGIN, 14, { align: "right" });
  if (tenantName) {
    doc.text(tenantName, pw - MARGIN, 19, { align: "right" });
  }

  // ── Divider ──
  doc.setDrawColor(...BRAND.white);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, 24, pw - MARGIN, 24);

  // ── Report title ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN, 32);

  let y = 42;

  // ── Subtitle badge ──
  if (subtitle) {
    doc.setFillColor(...BRAND.primaryLight);
    doc.roundedRect(MARGIN - 2, y - 4, pw - MARGIN * 2 + 4, 9, 2, 2, "F");
    doc.setTextColor(...BRAND.primary);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, MARGIN + 1, y + 1);
    y += 12;
  }

  doc.setTextColor(...BRAND.dark);
  return y + 2;
}

/**
 * Header ringkas untuk halaman lanjutan.
 */
function drawContinuationHeader(doc: jsPDF, pw: number, title: string): number {
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pw, 11, "F");
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(`GymFit  \u2022  ${title}`, MARGIN, 7.5);
  return 15;
}

/**
 * Footer di setiap halaman.
 */
function drawFooter(
  doc: jsPDF,
  pw: number,
  ph: number,
  page: number,
  total: number
): void {
  const footerY = ph - 8;
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, footerY - 3, pw - MARGIN, footerY - 3);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.muted);
  doc.text("GymFit Management System  \u2022  Confidential", MARGIN, footerY);
  doc.text(`Halaman ${page} dari ${total}`, pw - MARGIN, footerY, { align: "right" });
}

/**
 * Gambar summary cards (KPI) secara horizontal.
 */
function drawSummary(
  doc: jsPDF,
  pw: number,
  y: number,
  items: PdfSummaryItem[]
): number {
  if (items.length === 0) return y;

  const contentW = pw - MARGIN * 2;
  const cols = Math.min(items.length, 4);
  const cardW = (contentW - (cols - 1) * 4) / cols;
  const cardH = 18;

  // ── Section title ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text("RINGKASAN", MARGIN, y);
  y += 5;

  // Jika lebih dari 4, bagi ke beberapa baris
  const rows = Math.ceil(items.length / 4);

  for (let row = 0; row < rows; row++) {
    const startIdx = row * 4;
    const rowItems = items.slice(startIdx, startIdx + 4);
    const rowCols = rowItems.length;
    const rowCardW = (contentW - (rowCols - 1) * 4) / rowCols;

    rowItems.forEach((item, i) => {
      const x = MARGIN + i * (rowCardW + 4);

      // Card background
      doc.setFillColor(...BRAND.headerBg);
      doc.setDrawColor(...BRAND.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, rowCardW, cardH, 2, 2, "FD");

      // Value
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.primary);
      const valStr = typeof item.value === "number"
        ? new Intl.NumberFormat("id-ID").format(item.value)
        : String(item.value);
      doc.text(valStr, x + 4, y + 8);

      // Label
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.muted);
      doc.text(item.label, x + 4, y + 14);
    });
    y += cardH + 3;
  }

  return y + 3;
}

/**
 * Gambar satu tabel data dengan auto-pagination.
 * Mengembalikan posisi Y akhir.
 */
function drawTable(
  doc: jsPDF,
  pw: number,
  ph: number,
  startY: number,
  section: PdfTableSection,
  title: string, // report title for continuation headers
  pageCountRef: { current: number }
): number {
  const contentW = pw - MARGIN * 2;
  const cols = section.columns;

  // ── Auto-calculate column widths ──
  const totalExplicit = cols.reduce((s, c) => s + (c.width || 0), 0);
  const autoCount = cols.filter(c => !c.width).length;
  const autoWidth = autoCount > 0 ? (contentW - totalExplicit) / autoCount : 0;
  const colWidths = cols.map(c => c.width || autoWidth);

  const rowH = LINE_HEIGHT + ROW_PADDING * 2;
  const headerH = rowH + 1;
  const footerSpace = 14;

  let y = startY;

  // ── Section title ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text(section.title.toUpperCase(), MARGIN, y);
  y += 5;

  // ── Draw table header ──
  function drawTableHeader() {
    doc.setFillColor(...BRAND.primary);
    doc.rect(MARGIN, y, contentW, headerH, "F");

    doc.setTextColor(...BRAND.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");

    let x = MARGIN;
    cols.forEach((col, i) => {
      const align = col.align || "left";
      const textX = align === "right" ? x + colWidths[i] - 2
        : align === "center" ? x + colWidths[i] / 2
        : x + 2;
      const textAlign = align === "right" ? "right" : align === "center" ? "center" : "left";
      doc.text(col.header, textX, y + headerH / 2 + 1.5, { align: textAlign as any });
      x += colWidths[i];
    });
    y += headerH;
  }

  drawTableHeader();

  // ── Draw rows ──
  section.rows.forEach((row, rowIdx) => {
    // Check if we need a new page
    if (y + rowH > ph - footerSpace) {
      drawFooter(doc, pw, ph, pageCountRef.current, 0); // total will be filled later
      doc.addPage();
      pageCountRef.current++;
      y = drawContinuationHeader(doc, pw, title);
      drawTableHeader();
    }

    // Alternate row background
    if (rowIdx % 2 === 1) {
      doc.setFillColor(...BRAND.rowAlt);
      doc.rect(MARGIN, y, contentW, rowH, "F");
    }

    // Row border bottom
    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, y + rowH, MARGIN + contentW, y + rowH);

    // Cell values
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.dark);

    let x = MARGIN;
    cols.forEach((col, i) => {
      const val = row[col.key];
      const text = val === null || val === undefined ? "-" : String(val);
      const align = col.align || "left";

      // Truncate if too wide
      const maxW = colWidths[i] - 4;
      let displayText = text;
      while (doc.getTextWidth(displayText) > maxW && displayText.length > 3) {
        displayText = displayText.slice(0, -4) + "...";
      }

      const textX = align === "right" ? x + colWidths[i] - 2
        : align === "center" ? x + colWidths[i] / 2
        : x + 2;
      const textAlign = align === "right" ? "right" : align === "center" ? "center" : "left";
      doc.text(displayText, textX, y + rowH / 2 + 1.5, { align: textAlign as any });
      x += colWidths[i];
    });

    y += rowH;
  });

  // Empty state
  if (section.rows.length === 0) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...BRAND.muted);
    doc.text("Tidak ada data untuk ditampilkan.", MARGIN + 2, y + 6);
    y += 12;
  }

  return y + 6;
}

/**
 * Main export function — data-driven, tidak menggunakan screenshot.
 *
 * @param options - Summary items & table sections yang akan ditampilkan
 */
export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const { title, subtitle, filename, tenantName, summary, tables } = options;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const pageCountRef = { current: 1 };

  // ── Header halaman pertama ──
  let y = drawHeader(doc, pw, title, subtitle, tenantName);

  // ── Summary cards ──
  if (summary && summary.length > 0) {
    y = drawSummary(doc, pw, y, summary);
  }

  // ── Tables ──
  if (tables) {
    for (const section of tables) {
      // Check if section title + header + 1 row fits
      const minNeeded = 25;
      if (y + minNeeded > ph - 14) {
        drawFooter(doc, pw, ph, pageCountRef.current, 0);
        doc.addPage();
        pageCountRef.current++;
        y = drawContinuationHeader(doc, pw, title);
      }
      y = drawTable(doc, pw, ph, y, section, title, pageCountRef);
    }
  }

  // ── Draw footers on all pages ──
  const totalPages = pageCountRef.current;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pw, ph, p, totalPages);
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Helper: generate nama file PDF standar GymFit.
 */
export function buildPdfFilename(
  reportType: string,
  startDate?: string,
  endDate?: string,
  branchName?: string
): string {
  const today = new Date().toISOString().split("T")[0];
  const parts = ["GymFit", reportType.replace(/\s+/g, "_")];
  if (branchName && branchName !== "Semua Cabang") {
    parts.push(branchName.replace(/\s+/g, "_"));
  }
  if (startDate) parts.push(startDate);
  if (endDate && endDate !== startDate) parts.push(`s.d_${endDate}`);
  if (!startDate) parts.push(today);
  return parts.join("_");
}

/**
 * Helper: format angka ke Rupiah string.
 */
export function formatRpForPdf(v: number | string | null | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
