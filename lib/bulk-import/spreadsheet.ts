import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Parses a .csv/.xlsx/.xls file into rows keyed by lowercased header name.
 * Both formats are supported so an admin can use whichever their machine's
 * default spreadsheet app produces.
 */
export async function parseSpreadsheetFile(
  file: File
): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const { data, errors } = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }
    return data;
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), String(v)])
    )
  );
}

export function parseBool(value: string | undefined): boolean {
  if (!value) return false;
  return ["true", "yes", "1"].includes(value.trim().toLowerCase());
}

/** Splits a `;`-separated multi-value cell, e.g. an image_urls or features column. */
export function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const CATEGORY_TEMPLATE_CSV = `name,slug,description
Tubular Battery Systems,tubular-battery-systems,Inverter + tubular battery backup systems
`;

// image_urls / features: multiple values separated by ";".
// specs: multiple "label:value" pairs separated by ";".
// variants: multiple "name:price_adjust:is_default:in_stock" entries separated by ";".
export const PRODUCT_TEMPLATE_CSV = `category_slug,name,slug,description,base_price,in_stock,image_urls,features,specs,variants
tubular-battery-systems,1KVA Tubular Battery System,tubular-1kva,Entry-level 1KVA inverter system with tubular battery backup.,870000,true,https://example.com/tubular-1kva.png,Complete inverter + tubular battery setup;Low maintenance tubular design,Inverter Capacity:1KVA;Battery Type:Tubular Lead-Acid,Standard:0:true:true;Premium:50000:false:true
`;
