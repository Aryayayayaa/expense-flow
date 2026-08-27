"use client";

export type ExportColumn = {
  key: string;
  header: string;
};

const EXPORT_FONT_NAME = "NotoSans";
const EXPORT_FONT_FILE = "NotoSans-Export.ttf";
const EXPORT_FONT_URL = "/fonts/NotoSans-Export.ttf";

let exportFontBase64Promise: Promise<string> | null = null;

function escapeCsvValue(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function getExportFontBase64() {
  if (!exportFontBase64Promise) {
    exportFontBase64Promise = fetch(EXPORT_FONT_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load export font.");
        }

        return arrayBufferToBase64(await response.arrayBuffer());
      })
      .catch((error) => {
        exportFontBase64Promise = null;
        throw error;
      });
  }

  return exportFontBase64Promise;
}

function toPdfSafeText(value: string) {
  return value
    .replaceAll("₹", "Rs.")
    .replaceAll("\u20B9", "Rs.")
    .replaceAll("—", "-")
    .replaceAll("–", "-");
}

export function buildCsvContent(
  columns: ExportColumn[],
  rows: Record<string, string>[],
) {
  const header = columns.map((column) => escapeCsvValue(column.header)).join(",");

  const body = rows
    .map((row) =>
      columns
        .map((column) => escapeCsvValue(row[column.key] ?? ""))
        .join(","),
    )
    .join("\r\n");

  return `\uFEFF${header}\r\n${body}`;
}

export function downloadCsv(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, string>[],
) {
  triggerDownload(
    new Blob([buildCsvContent(columns, rows)], {
      type: "text/csv;charset=utf-8;",
    }),
    `${filename}.csv`,
  );
}

async function buildPdfDocument(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, string>[],
) {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable = autoTableModule.default;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  let tableFont = "helvetica";

  try {
    const fontBase64 = await getExportFontBase64();

    doc.addFileToVFS(EXPORT_FONT_FILE, fontBase64);
    doc.addFont(EXPORT_FONT_FILE, EXPORT_FONT_NAME, "normal");
    doc.setFont(EXPORT_FONT_NAME, "normal");
    tableFont = EXPORT_FONT_NAME;
  } catch (error) {
    console.error("Export font error:", error);
    doc.setFont("helvetica", "normal");
  }

  const useUnicodeFont = tableFont === EXPORT_FONT_NAME;

  const pdfText = (value: string) =>
    useUnicodeFont ? value : toPdfSafeText(value);

  doc.setFontSize(16);
  doc.text(pdfText(title), 40, 36);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(pdfText(`Exported ${new Date().toLocaleString()}`), 40, 54);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 68,
    head: [columns.map((column) => pdfText(column.header))],
    body: rows.map((row) =>
      columns.map((column) => pdfText(row[column.key] ?? "")),
    ),
    styles: {
      font: tableFont,
      fontStyle: "normal",
      fontSize: 8,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      font: tableFont,
      fontStyle: "normal",
      fillColor: [15, 23, 42],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
  });

  return doc;
}

export async function downloadPdf(
  filename: string,
  title: string,
  columns: ExportColumn[],
  rows: Record<string, string>[],
) {
  const doc = await buildPdfDocument(title, columns, rows);

  doc.save(`${filename}.pdf`);
}

export async function buildPdfBase64(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, string>[],
) {
  const doc = await buildPdfDocument(title, columns, rows);

  return doc.output("datauristring").split(",")[1] ?? "";
}

export function utf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);

  return arrayBufferToBase64(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
