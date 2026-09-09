import * as React from "react";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CircleCheckIcon,
  LoaderIcon,
  AlertCircleIcon,
  FileEditIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  XIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
} from "lucide-react";

export const schema = z.object({
  id: z.union([z.number(), z.string()]),
  header: z.string(),
  project: z.string(),
  status: z.string(),
  reviewer: z.string(),
  /** ISO date of the report week — used for sorting and as a tiebreaker. */
  weekStart: z.string().optional(),
  /** ISO timestamp of the last change, shown in the Updated column. */
  updatedAt: z.string().optional(),
});

export type ReportRow = z.infer<typeof schema>;

type SortKey = "header" | "project" | "status" | "reviewer" | "updatedAt";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
};

/** Status values a member is still allowed to edit. */
const EDITABLE = new Set(["DRAFT", "NEEDS_CORRECTION"]);

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();

  if (s === "APPROVED") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2.5 py-0.5"
      >
        <CircleCheckIcon className="size-3" />
        Approved
      </Badge>
    );
  }
  if (s === "SUBMITTED") {
    return (
      <Badge
        variant="outline"
        className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 px-2.5 py-0.5"
      >
        <LoaderIcon className="size-3" />
        Submitted
      </Badge>
    );
  }
  if (s === "NEEDS_CORRECTION") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-2.5 py-0.5"
      >
        <AlertCircleIcon className="size-3" />
        Needs Correction
      </Badge>
    );
  }
  if (s === "DRAFT") {
    return (
      <Badge
        variant="outline"
        className="bg-muted text-muted-foreground gap-1 px-2.5 py-0.5"
      >
        <FileEditIcon className="size-3" />
        Draft
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="px-2 py-0.5">
      {status}
    </Badge>
  );
}

function SortableHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (column: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === column;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1.5 -ml-1 px-1 py-1 rounded hover:bg-muted/60 transition-colors cursor-pointer font-medium"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {!active && (
          <ChevronsUpDownIcon className="size-3.5 text-muted-foreground/60" />
        )}
        {active && sortDir === "asc" && (
          <ChevronUpIcon className="size-3.5 text-primary" />
        )}
        {active && sortDir === "desc" && (
          <ChevronDownIcon className="size-3.5 text-primary" />
        )}
      </button>
    </TableHead>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DataTable({ data }: { data: ReportRow[] }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [projectFilter, setProjectFilter] = React.useState("ALL");
  const [sortKey, setSortKey] = React.useState<SortKey | null>("updatedAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  // Project options come from the rows themselves, so the filter always
  // matches what is actually in the table.
  const projectOptions = React.useMemo(
    () => Array.from(new Set(data.map((r) => r.project).filter(Boolean))).sort(),
    [data]
  );

  const statusOptions = React.useMemo(
    () => Array.from(new Set(data.map((r) => (r.status || "").toUpperCase()))),
    [data]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      const status = (row.status || "").toUpperCase();
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (projectFilter !== "ALL" && row.project !== projectFilter) return false;
      if (!q) return true;
      // Free-text search runs across every visible text column.
      return [
        row.header,
        row.project,
        row.reviewer,
        STATUS_LABELS[status] ?? row.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [data, search, statusFilter, projectFilter]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "updatedAt") {
        const av = new Date(a.updatedAt || a.weekStart || 0).getTime();
        const bv = new Date(b.updatedAt || b.weekStart || 0).getTime();
        return (av - bv) * dir;
      }
      if (sortKey === "header") {
        // The header is a week label, so sort it chronologically when we can.
        const av = new Date(a.weekStart || 0).getTime();
        const bv = new Date(b.weekStart || 0).getTime();
        if (av && bv && av !== bv) return (av - bv) * dir;
      }
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return av.localeCompare(bv) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  // Any change to the result set can leave us past the last page.
  React.useEffect(() => {
    setPageIndex((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const pageRows = React.useMemo(
    () => sorted.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [sorted, pageIndex, pageSize]
  );

  const handleSort = (column: SortKey) => {
    if (sortKey === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      setSortDir("asc");
    }
    setPageIndex(0);
  };

  const hasActiveFilters =
    search !== "" || statusFilter !== "ALL" || projectFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setProjectFilter("ALL");
    setPageIndex(0);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-2">
        <div className="relative flex-1 lg:max-w-md">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search week, project, status, reviewer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val || "ALL");
              setPageIndex(0);
            }}
            items={[
              { label: "All Statuses", value: "ALL" },
              ...statusOptions.map((s) => ({
                label: STATUS_LABELS[s] ?? s,
                value: s,
              })),
            ]}
          >
            <SelectTrigger size="sm" className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={projectFilter}
            onValueChange={(val) => {
              setProjectFilter(val || "ALL");
              setPageIndex(0);
            }}
            items={[
              { label: "All Projects", value: "ALL" },
              ...projectOptions.map((p) => ({ label: p, value: p })),
            ]}
          >
            <SelectTrigger size="sm" className="w-48 h-9 text-xs">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
              {projectOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 text-xs text-muted-foreground cursor-pointer"
            >
              <XIcon className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <SortableHeader
                label="Weekly Report"
                column="header"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Project"
                column="project"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                column="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Reviewer"
                column="reviewer"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label="Updated"
                column="updatedAt"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row) => {
                const status = (row.status || "").toUpperCase();
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        to={`/member/reports/${row.id}`}
                        className="font-medium text-primary hover:underline transition-colors"
                      >
                        {row.header}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-muted-foreground font-medium"
                      >
                        {row.project}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <UserIcon className="size-3.5 text-muted-foreground" />
                        <span>{row.reviewer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(row.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs cursor-pointer"
                          render={<Link to={`/member/reports/${row.id}`} />}
                        >
                          <EyeIcon className="size-3.5" />
                          View
                        </Button>
                        {EDITABLE.has(status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs cursor-pointer"
                            render={
                              <Link to={`/member/reports/${row.id}/edit`} />
                            }
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No reports match your search or filters."
                    : "No reports found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-sm">
        <div className="text-muted-foreground text-xs">
          Showing {sorted.length === 0 ? 0 : pageIndex * pageSize + 1}–
          {Math.min((pageIndex + 1) * pageSize, sorted.length)} of{" "}
          {sorted.length} report{sorted.length === 1 ? "" : "s"}
          {hasActiveFilters && data.length !== sorted.length && (
            <span> (filtered from {data.length})</span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 sm:flex">
            <Label htmlFor="rows-per-page" className="text-xs font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
              items={[10, 20, 30, 50].map((size) => ({
                label: `${size}`,
                value: `${size}`,
              }))}
            >
              <SelectTrigger size="sm" className="w-18" id="rows-per-page">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-medium">
            Page {pageIndex + 1} of {pageCount}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() =>
                setPageIndex((i) => Math.min(pageCount - 1, i + 1))
              }
              disabled={pageIndex >= pageCount - 1}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => setPageIndex(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
