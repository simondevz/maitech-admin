"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBulkImportProducts } from "@/hooks/queries/useBulkImport";
import type { BulkProductRow, BulkRowResult } from "@/lib/actions/bulk-import";
import {
  PRODUCT_TEMPLATE_CSV,
  downloadTextFile,
  parseBool,
  parseSpreadsheetFile,
  splitList,
} from "@/lib/bulk-import/spreadsheet";

interface ParsedRow {
  row: BulkProductRow;
  error?: string;
}

function toRows(raw: Record<string, string>[]): ParsedRow[] {
  return raw.map((r) => {
    const category_slug = (r.category_slug ?? "").trim();
    const name = (r.name ?? "").trim();
    const slug = (r.slug ?? "").trim();
    const description = (r.description ?? "").trim();
    const basePriceRaw = (r.base_price ?? "").trim();
    const base_price = Number(basePriceRaw);
    const in_stock = parseBool(r.in_stock);
    const image_urls = splitList(r.image_urls);
    const features = splitList(r.features);
    const specs = splitList(r.specs).map((entry) => {
      const [label, ...rest] = entry.split(":");
      return { label: (label ?? "").trim(), value: rest.join(":").trim() };
    });
    const variants = splitList(r.variants).map((entry) => {
      const [vname, priceAdjust, isDefault, inStock] = entry.split(":");
      return {
        name: (vname ?? "").trim(),
        price_adjust: Number(priceAdjust) || 0,
        is_default: parseBool(isDefault),
        in_stock: inStock === undefined ? true : parseBool(inStock),
      };
    });

    let error: string | undefined;
    if (!category_slug || !name || !slug) {
      error = "category_slug, name and slug are required";
    } else if (!basePriceRaw || Number.isNaN(base_price) || base_price <= 0) {
      error = "base_price must be a positive number";
    }

    return {
      row: {
        category_slug,
        name,
        slug,
        description,
        base_price,
        in_stock,
        image_urls,
        features,
        specs,
        variants,
      },
      error,
    };
  });
}

export function BulkImportProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  // Keyed by index into `parsed`, so status survives across retries that only
  // resubmit a shrinking subset of rows.
  const [rowStatus, setRowStatus] = useState<Record<number, BulkRowResult>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const bulkImport = useBulkImportProducts();

  // Rows still eligible to (re)send: no client-side error, and not already
  // recorded as a success from a previous submit.
  const submittableIndices = useMemo(
    () => parsed.map((_, i) => i).filter((i) => !parsed[i].error && !rowStatus[i]?.success),
    [parsed, rowStatus]
  );

  function resetImportState() {
    setParsed([]);
    setRowStatus({});
    setHasSubmitted(false);
  }

  async function handleFile(file: File) {
    try {
      const raw = await parseSpreadsheetFile(file);
      setParsed(toRows(raw));
      setRowStatus({});
      setHasSubmitted(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not parse file");
    }
  }

  async function handleSubmit() {
    const indices = submittableIndices;
    const rows = indices.map((i) => parsed[i].row);
    try {
      const rowResults = await bulkImport.mutateAsync(rows);
      setRowStatus((prev) => {
        const next = { ...prev };
        indices.forEach((idx, j) => {
          next[idx] = rowResults[j];
        });
        return next;
      });
      setHasSubmitted(true);
      const failed = rowResults.filter((r) => !r.success).length;
      if (failed === 0) toast.success(`Imported ${rowResults.length} products`);
      else toast.warning(`${rowResults.length - failed} succeeded, ${failed} failed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  }

  function handleDownloadFailed() {
    const failedRows = Object.entries(rowStatus)
      .filter(([, r]) => !r.success)
      .map(([i]) => parsed[Number(i)].row);
    if (failedRows.length === 0) return;
    const csv =
      "category_slug,name,slug,description,base_price,in_stock,image_urls,features,specs,variants\n" +
      failedRows
        .map((r) =>
          [
            r.category_slug,
            r.name,
            r.slug,
            r.description,
            r.base_price,
            r.in_stock,
            r.image_urls.join(";"),
            r.features.join(";"),
            r.specs.map((s) => `${s.label}:${s.value}`).join(";"),
            r.variants
              .map((v) => `${v.name}:${v.price_adjust}:${v.is_default}:${v.in_stock}`)
              .join(";"),
          ].join(",")
        )
        .join("\n");
    downloadTextFile("products-failed.csv", csv);
  }

  const hasFailures = Object.values(rowStatus).some((r) => !r.success);
  const allDone = hasSubmitted && submittableIndices.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTextFile("products-template.csv", PRODUCT_TEMPLATE_CSV)}
        >
          <Download /> Download template
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload /> Choose file
        </Button>
        {parsed.length > 0 && (
          <Button variant="ghost" size="sm" onClick={resetImportState}>
            Start new import
          </Button>
        )}
      </div>

      {parsed.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsed.map((p, i) => {
                const result = rowStatus[i];
                return (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{p.row.category_slug}</TableCell>
                    <TableCell>{p.row.name}</TableCell>
                    <TableCell>{p.row.slug}</TableCell>
                    <TableCell>{p.row.base_price}</TableCell>
                    <TableCell>{p.row.image_urls.length}</TableCell>
                    <TableCell>
                      {p.error ? (
                        <span className="text-destructive">{p.error}</span>
                      ) : result ? (
                        result.success ? (
                          <span className="text-emerald-600">
                            Imported
                            {result.warning && (
                              <span className="ml-1 text-amber-600">({result.warning})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-destructive">{result.error}</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">Ready</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center gap-2">
            {submittableIndices.length > 0 && (
              <Button onClick={handleSubmit} loading={bulkImport.isPending}>
                {hasSubmitted
                  ? `Retry ${submittableIndices.length} failed row${submittableIndices.length === 1 ? "" : "s"}`
                  : `Import ${submittableIndices.length} product${submittableIndices.length === 1 ? "" : "s"}`}
              </Button>
            )}
            {allDone && (
              <span className="text-sm text-emerald-600">All rows imported successfully.</span>
            )}
            {parsed.some((p) => p.error) && (
              <span className="text-sm text-muted-foreground">
                {parsed.filter((p) => p.error).length} row(s) skipped due to errors
              </span>
            )}
            {hasFailures && (
              <Button variant="outline" onClick={handleDownloadFailed}>
                Download failed rows
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
