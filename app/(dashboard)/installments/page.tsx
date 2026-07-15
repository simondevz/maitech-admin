"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";

import { useInstallments } from "@/hooks/queries/useInstallments";
import { PageHeader } from "@/components/shared/page-header";
import { InstallmentStatusBadge } from "@/components/installments/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { InstallmentStatus, PlanType } from "@/lib/backend/types";

const PAGE_SIZE = 20;
const STATUSES: InstallmentStatus[] = ["pending", "approved", "declined", "forwarded"];

export default function InstallmentsPage() {
  const [status, setStatus] = useState<string>("all");
  const [planType, setPlanType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const {
    data: applications,
    isLoading,
    isError,
    error,
  } = useInstallments({
    status: status === "all" ? undefined : status,
    planType: planType === "all" ? undefined : (planType as PlanType),
    page,
    pageSize: PAGE_SIZE,
  });

  const currency = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  return (
    <div>
      <PageHeader
        title="Installment applications"
        description="Review and process customer installment requests."
        actions={
          <Button variant="outline" asChild>
            <Link href="/installments/settings">
              <Settings /> Settings
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={planType}
          onValueChange={(v) => {
            setPlanType(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="maritech">Maritech</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load applications"}
        </p>
      )}

      {applications && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/installments/${application.id}`}
                      className="hover:underline"
                    >
                      {application.customer_name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {application.customer_email}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.product?.name ?? `#${application.product_id}`}
                  </TableCell>
                  <TableCell className="capitalize">{application.plan_type}</TableCell>
                  <TableCell>{currency.format(application.total_value)}</TableCell>
                  <TableCell>
                    <InstallmentStatusBadge status={application.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (applications.length === PAGE_SIZE) setPage((p) => p + 1);
                  }}
                  className={
                    applications.length < PAGE_SIZE ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
