import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { Link } from "react-router-dom";
import { AppLayout } from "@/pages/Layout/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  FolderIcon,
  CalendarIcon,
  EyeIcon,
  ShieldAlertIcon,
  SearchIcon,
  ArrowLeftIcon,
  LayersIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

export default function ManagerReportsPage() {
  // Filter & Search States
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterProject, setFilterProject] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all reports and projects
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["manager-reports-page"],
    queryFn: async () => (await api.get("/reports")).data,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects")).data,
  });

  const isLoading = reportsLoading || projectsLoading;

  // Status, project and search all narrow the table; the overview above it
  // always describes the unfiltered set.
  const filteredReports = reports?.filter((report: any) => {
    if (filterStatus !== "ALL" && report.status !== filterStatus) return false;
    if (filterProject !== "ALL" && report.projectId !== filterProject)
      return false;

    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      (report.user?.name || "").toLowerCase().includes(query) ||
      (report.project?.name || "").toLowerCase().includes(query)
    );
  });

  const hasActiveFilters =
    filterStatus !== "ALL" || filterProject !== "ALL" || searchTerm !== "";

  const clearFilters = () => {
    setFilterStatus("ALL");
    setFilterProject("ALL");
    setSearchTerm("");
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "TP";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2.5 py-0.5 font-medium text-xs"
        >
          <CheckCircle2Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Approved
        </Badge>
      );
    }
    if (s === "SUBMITTED") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 px-2.5 py-0.5 font-medium text-xs"
        >
          <ClockIcon className="size-3.5 text-blue-600 dark:text-blue-400" />
          Submitted
        </Badge>
      );
    }
    if (s === "NEEDS_CORRECTION") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-2.5 py-0.5 font-medium text-xs"
        >
          <AlertTriangleIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
          Needs Correction
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="px-2.5 py-0.5 text-muted-foreground font-medium text-xs">
        Draft
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AppLayout title="Team Reports">
        <div className="flex flex-col gap-6 mx-auto w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  // --- Overview metrics (always across every report, never the filtered view) ---
  const allReports: any[] = reports || [];
  const totalReports = allReports.length;
  const countBy = (status: string) =>
    allReports.filter((r: any) => r.status === status).length;

  const statusBreakdown = [
    {
      key: "DRAFT",
      label: "Draft",
      count: countBy("DRAFT"),
      bar: "bg-muted-foreground/40",
      dot: "bg-muted-foreground/50",
    },
    {
      key: "SUBMITTED",
      label: "Submitted",
      count: countBy("SUBMITTED"),
      bar: "bg-blue-500",
      dot: "bg-blue-500",
    },
    {
      key: "NEEDS_CORRECTION",
      label: "Needs Correction",
      count: countBy("NEEDS_CORRECTION"),
      bar: "bg-amber-500",
      dot: "bg-amber-500",
    },
    {
      key: "APPROVED",
      label: "Approved",
      count: countBy("APPROVED"),
      bar: "bg-emerald-500",
      dot: "bg-emerald-500",
    },
  ];

  const pendingReviewCount = countBy("SUBMITTED");
  const needsCorrectionCount = countBy("NEEDS_CORRECTION");
  const approvedCount = countBy("APPROVED");

  const completionRate =
    totalReports > 0 ? Math.round((approvedCount / totalReports) * 100) : 0;

  const memberCount = new Set(
    allReports.map((r: any) => r.userId).filter(Boolean),
  ).size;
  const projectCount = new Set(
    allReports.map((r: any) => r.projectId).filter(Boolean),
  ).size;

  return (
    <AppLayout title="Team Reports">
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Reports</h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive overview of weekly status reports submitted by all team members.
            </p>
          </div>
          <Link to="/manager">
            <Button variant="outline" size="sm" className="gap-2 font-medium">
              <ArrowLeftIcon className="size-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Team Reporting Overview */}
        <Card className="shadow-xs border overflow-hidden">
          <CardHeader className="border-b bg-muted/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <LayersIcon className="size-4 text-primary" />
                  Reporting Overview
                </CardTitle>
                <CardDescription>
                  Where every weekly report currently sits in the review cycle.
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="size-3.5" />
                  {memberCount} member{memberCount === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1.5">
                  <FolderIcon className="size-3.5" />
                  {projectCount} project{projectCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-start">
            {/* Status distribution */}
            <div className="min-w-0 flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  {totalReports}
                </span>
                <span className="text-sm text-muted-foreground">
                  report{totalReports === 1 ? "" : "s"} logged in total
                </span>
              </div>

              {/* One stacked bar reads faster than four separate numbers */}
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                {totalReports > 0 &&
                  statusBreakdown
                    .filter((seg) => seg.count > 0)
                    .map((seg) => (
                      <div
                        key={seg.key}
                        className={seg.bar}
                        style={{ width: `${(seg.count / totalReports) * 100}%` }}
                        title={`${seg.label}: ${seg.count}`}
                      />
                    ))}
              </div>

              {/* The legend doubles as a status filter for the table below */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {statusBreakdown.map((seg) => {
                  const isActive = filterStatus === seg.key;
                  const percent =
                    totalReports > 0
                      ? Math.round((seg.count / totalReports) * 100)
                      : 0;
                  return (
                    <button
                      key={seg.key}
                      type="button"
                      onClick={() => setFilterStatus(isActive ? "ALL" : seg.key)}
                      aria-pressed={isActive}
                      className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-xs transition-colors cursor-pointer ${
                        isActive ? "bg-muted" : "hover:bg-muted/60"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${seg.dot}`} />
                      <span className="font-medium text-foreground">
                        {seg.label}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {seg.count} &middot; {percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What needs the manager's attention right now */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() =>
                  setFilterStatus(
                    filterStatus === "SUBMITTED" ? "ALL" : "SUBMITTED",
                  )
                }
                aria-pressed={filterStatus === "SUBMITTED"}
                className={`rounded-xl border p-3 text-left transition-colors cursor-pointer lg:w-36 ${
                  filterStatus === "SUBMITTED"
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                  <span className="text-2xl font-bold tabular-nums">
                    {pendingReviewCount}
                  </span>
                  <ClockIcon className="size-4" />
                </div>
                <p className="text-xs font-medium text-foreground mt-1">
                  Awaiting review
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilterStatus(
                    filterStatus === "NEEDS_CORRECTION"
                      ? "ALL"
                      : "NEEDS_CORRECTION",
                  )
                }
                aria-pressed={filterStatus === "NEEDS_CORRECTION"}
                className={`rounded-xl border p-3 text-left transition-colors cursor-pointer lg:w-36 ${
                  filterStatus === "NEEDS_CORRECTION"
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                  <span className="text-2xl font-bold tabular-nums">
                    {needsCorrectionCount}
                  </span>
                  <ShieldAlertIcon className="size-4" />
                </div>
                <p className="text-xs font-medium text-foreground mt-1">
                  With the member
                </p>
              </button>

              <div className="rounded-xl border p-3 col-span-2 lg:col-span-1 lg:w-36">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="text-2xl font-bold tabular-nums">
                    {completionRate}%
                  </span>
                  <CheckCircle2Icon className="size-4" />
                </div>
                <p className="text-xs font-medium text-foreground mt-1">
                  Approved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card className="shadow-xs bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by team member or project name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Status:
                  </span>
                  <Select
                    value={filterStatus}
                    onValueChange={(val) => setFilterStatus(val || "ALL")}
                  >
                    <SelectTrigger className="w-40 h-9 text-xs">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="NEEDS_CORRECTION">
                        Needs Correction
                      </SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Project:
                  </span>
                  <Select
                    value={filterProject}
                    onValueChange={(val) => setFilterProject(val || "ALL")}
                  >
                    <SelectTrigger className="w-48 h-9 text-xs">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Projects</SelectItem>
                      {projects?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
          </CardContent>
        </Card>

        {/* Team Reports Data Table Card */}
        <Card className="shadow-xs overflow-hidden border">
          <CardHeader className="border-b bg-muted/15 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Submitted Reports
              </CardTitle>
              <CardDescription>
                Detailed list of weekly updates logged across team projects.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {filteredReports?.length || 0} Reports
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="pb-4">
                A list of team weekly status reports.
              </TableCaption>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[240px] font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Team Member
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Project
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Week Start
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports && filteredReports.length > 0 ? (
                  filteredReports.map((report: any) => (
                    <TableRow
                      key={report.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {getInitials(report.user?.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{report.user?.name || "Unassigned"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <FolderIcon className="size-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-foreground/90">
                            {report.project?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5 text-amber-500 shrink-0" />
                          {report.weekStart
                            ? new Date(report.weekStart).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/reports/${report.id}`}>
                          <Button
                            size="sm"
                            variant={report.status === "SUBMITTED" ? "default" : "outline"}
                            className="h-8 gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
                          >
                            <EyeIcon className="size-3.5" />
                            {report.status === "SUBMITTED" ? "Review" : "View"}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileTextIcon className="size-8 text-muted-foreground/40 mb-1" />
                        <p className="font-medium text-foreground">
                          No team reports found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try clearing or adjusting your search filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {filteredReports && filteredReports.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium text-xs text-muted-foreground">
                      Total Filtered Reports
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {filteredReports.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
