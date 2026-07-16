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
import { useBulkImportCategories } from "@/hooks/queries/useBulkImport";
import type { BulkCategoryRow, BulkRowResult } from "@/lib/actions/bulk-import";
import {
  CATEGORY_TEMPLATE_CSV,
  downloadTextFile,
  parseSpreadsheetFile,
} from "@/lib/bulk-import/spreadsheet";

interface ParsedRow {
  row: BulkCategoryRow;
  error?: string;
}

function toRows(raw: Record<string, string>[]): ParsedRow[] {
  return raw.map((r) => {
    const name = (r.name ?? "").trim();
    const slug = (r.slug ?? "").trim();
    const description = (r.description ?? "").trim();
    return {
      row: { name, slug, description },
      error: !name || !slug ? "name and slug are required" : undefined,
    };
  });
}

export function BulkImportCategories() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  // Keyed by index into `parsed`, so status survives across retries that only
  // resubmit a shrinking subset of rows.
  const [rowStatus, setRowStatus] = useState<Record<number, BulkRowResult>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const bulkImport = useBulkImportCategories();

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
      if (failed === 0) toast.success(`Imported ${rowResults.length} categories`);
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
      "name,slug,description\n" +
      failedRows.map((r) => [r.name, r.slug, r.description].join(",")).join("\n");
    downloadTextFile("categories-failed.csv", csv);
  }

  const hasFailures = Object.values(rowStatus).some((r) => !r.success);
  const allDone = hasSubmitted && submittableIndices.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTextFile("categories-template.csv", CATEGORY_TEMPLATE_CSV)}
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
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsed.map((p, i) => {
                const result = rowStatus[i];
                return (
                  <TableRow key={i}>
                    <TableCell>{p.row.name}</TableCell>
                    <TableCell>{p.row.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">{p.row.description}</TableCell>
                    <TableCell>
                      {p.error ? (
                        <span className="text-destructive">{p.error}</span>
                      ) : result ? (
                        result.success ? (
                          <span className="text-emerald-600">Imported</span>
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
              <Button onClick={handleSubmit} disabled={bulkImport.isPending}>
                {hasSubmitted
                  ? `Retry ${submittableIndices.length} failed row${submittableIndices.length === 1 ? "" : "s"}`
                  : `Import ${submittableIndices.length} categor${submittableIndices.length === 1 ? "y" : "ies"}`}
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
