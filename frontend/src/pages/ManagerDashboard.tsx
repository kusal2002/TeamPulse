import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  FolderIcon,
  CalendarIcon,
  EyeIcon,
  ShieldAlertIcon,
} from "lucide-react";

// Theme color palette matching system design
const STATUS_COLORS = {
  DRAFT: "hsl(var(--muted-foreground) / 0.5)",
  SUBMITTED: "#3B82F6",
  NEEDS_CORRECTION: "#F59E0B",
  APPROVED: "#10B981",
};

const pieChartConfig: ChartConfig = {
  draft: { label: "Draft", color: "#9CA3AF" },
  submitted: { label: "Submitted", color: "#3B82F6" },
  needsCorrection: { label: "Needs Correction", color: "#F59E0B" },
  approved: { label: "Approved", color: "#10B981" },
};

const barChartConfig: ChartConfig = {
  reports: { label: "Reports Logged", color: "hsl(var(--primary))" },
};

export default function ManagerDashboard() {
  // The dashboard always reports on the whole team; per-report filtering
  // lives on the Team Reports page.
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["manager-reports"],
    queryFn: async () => (await api.get("/reports")).data,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects")).data,
  });

  const isLoading = reportsLoading || projectsLoading;

  if (isLoading) {
    return (
      <AppLayout title="Manager Dashboard">
        <div className="flex flex-col gap-6 mx-auto w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  // --- Calculate Metrics ---
  const totalReports = reports?.length || 0;
  const statusCounts = {
    DRAFT: reports?.filter((r: any) => r.status === "DRAFT").length || 0,
    SUBMITTED:
      reports?.filter((r: any) => r.status === "SUBMITTED").length || 0,
    NEEDS_CORRECTION:
      reports?.filter((r: any) => r.status === "NEEDS_CORRECTION").length || 0,
    APPROVED: reports?.filter((r: any) => r.status === "APPROVED").length || 0,
  };

  const complianceRate =
    totalReports > 0
      ? Math.round(
          ((statusCounts.SUBMITTED + statusCounts.APPROVED) / totalReports) *
            100,
        )
      : 0;

  // --- Prepare Chart Data ---
  const pieData = [
    { name: "Draft", value: statusCounts.DRAFT, fill: STATUS_COLORS.DRAFT },
    {
      name: "Submitted",
      value: statusCounts.SUBMITTED,
      fill: STATUS_COLORS.SUBMITTED,
    },
    {
      name: "Needs Correction",
      value: statusCounts.NEEDS_CORRECTION,
      fill: STATUS_COLORS.NEEDS_CORRECTION,
    },
    {
      name: "Approved",
      value: statusCounts.APPROVED,
      fill: STATUS_COLORS.APPROVED,
    },
  ].filter((d) => d.value > 0);

  const projectCounts =
    projects?.map((p: any) => ({
      name: p.name,
      reports: reports?.filter((r: any) => r.projectId === p.id).length || 0,
    })) || [];

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2.5 py-0.5 font-medium"
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
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 px-2.5 py-0.5 font-medium"
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
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-2.5 py-0.5 font-medium"
        >
          <AlertTriangleIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
          Needs Correction
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="px-2.5 py-0.5 text-muted-foreground font-medium"
      >
        Draft
      </Badge>
    );
  };

  return (
    <AppLayout title="Manager Dashboard">
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manager Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Review team reports, analyze project performance metrics, and
              manage workflows.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-xs hover:border-primary/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Reports
                </span>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileTextIcon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">
                  {totalReports}
                </p>
                <span className="text-xs text-muted-foreground">logged</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all team projects
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-blue-500/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Compliance Rate
                </span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CheckCircle2Icon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {complianceRate}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Submitted & Approved ratio
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-amber-500/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Pending Review
                </span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ClockIcon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {statusCounts.SUBMITTED}
                </p>
                <span className="text-xs text-muted-foreground">reports</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Awaiting review & decision
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-rose-500/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Needs Correction
                </span>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlertIcon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  {statusCounts.NEEDS_CORRECTION}
                </p>
                <span className="text-xs text-muted-foreground">reports</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Returned to team member
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Pie Chart */}
          <Card className="shadow-xs flex flex-col justify-between">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Report Status Distribution</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Real-time
                </Badge>
              </CardTitle>
              <CardDescription>
                Proportion of submitted, pending, draft, and approved reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ChartContainer
                  config={pieChartConfig}
                  className="mx-auto aspect-square max-h-[260px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No data available for status distribution chart.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports per Project Bar Chart */}
          <Card className="shadow-xs flex flex-col justify-between">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Reports per Project</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Project Volume
                </Badge>
              </CardTitle>
              <CardDescription>
                Total volume of reports filed per project workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex items-center justify-center">
              {projectCounts.length > 0 ? (
                <ChartContainer
                  config={barChartConfig}
                  className="aspect-auto h-[240px] w-full"
                >
                  <BarChart
                    data={projectCounts}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border/40"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      className="text-xs text-muted-foreground"
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      className="text-xs text-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="reports"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No projects available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Reports Data Table Card */}
        <Card className="shadow-xs overflow-hidden border">
          <CardHeader className="border-b bg-muted/15 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Team Reports Summary
              </CardTitle>
              <CardDescription>
                Review submitted updates, check status, and navigate to detailed
                submissions.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {reports?.length || 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
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
                {reports && reports.length > 0 ? (
                  reports.map((report: any) => (
                    <TableRow
                      key={report.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {report.user?.name
                              ? report.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <span className="truncate">
                            {report.user?.name || "Unassigned"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                            variant={
                              report.status === "SUBMITTED"
                                ? "default"
                                : "outline"
                            }
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
                        <FileTextIcon className="size-8 text-muted-foreground/50 mb-1" />
                        <p className="font-medium text-foreground">
                          No reports match your filters
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try clearing your status or project filter selection.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
