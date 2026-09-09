import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  FolderIcon,
  EyeIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";

export default function MemberDashboard() {
  const { user } = useAuth();

  // Fetch user's reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["my-reports"],
    queryFn: async () => {
      const res = await api.get("/reports/my-history");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <AppLayout title="Member Workspace">
        <div className="flex flex-col gap-6 mx-auto w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  // 1. Calculate Current Week Monday
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const currentWeekMonday = new Date(today.setDate(diff));
  currentWeekMonday.setHours(0, 0, 0, 0);

  const currentWeekReport = reports?.find((r: any) => {
    const reportDate = new Date(r.weekStart);
    reportDate.setHours(0, 0, 0, 0);
    return reportDate.getTime() === currentWeekMonday.getTime();
  });

  // 2. Filter Reports Requiring Attention
  const correctionReports =
    reports?.filter((r: any) => r.status === "NEEDS_CORRECTION") || [];

  // 3. Quick Stats Calculation
  const totalSubmitted =
    reports?.filter((r: any) => r.status !== "DRAFT").length || 0;
  const approvedCount =
    reports?.filter((r: any) => r.status === "APPROVED").length || 0;
  const approvalRate =
    totalSubmitted > 0
      ? Math.round((approvedCount / totalSubmitted) * 100)
      : 0;

  // 4. Recent Reports Mini-History (Top 5)
  const recentReports = reports?.slice(0, 5) || [];

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
      <Badge variant="outline" className="px-2.5 py-0.5 text-muted-foreground font-medium">
        Draft
      </Badge>
    );
  };

  return (
    <AppLayout title={`Welcome, ${user?.name || "Member"}`}>
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Member Workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Submit your weekly updates, track report statuses, and view personal progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/member/reports/new">
              <Button size="sm" className="gap-2 font-medium cursor-pointer shadow-xs">
                <PlusIcon className="size-4" />
                Create Weekly Report
              </Button>
            </Link>
          </div>
        </div>

        {/* HIGH PRIORITY ALERT BOXES */}
        {correctionReports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlertIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Action Required: Correction Requested</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have {correctionReports.length} report(s) that require updates and resubmission.
                </p>
              </div>
            </div>
            <Link to={`/member/reports/${correctionReports[0].id}/edit`}>
              <Button size="sm" variant="destructive" className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs">
                Fix & Resubmit
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {!currentWeekReport && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <ClockIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">This Week's Report Not Created Yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Week of {currentWeekMonday.toLocaleDateString()} status update is pending submission.
                </p>
              </div>
            </div>
            <Link to="/member/reports/new">
              <Button size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs">
                ➕ Create This Week's Report
              </Button>
            </Link>
          </div>
        )}

        {/* Personal Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-xs hover:border-primary/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Submitted
                </span>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileTextIcon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">{totalSubmitted}</p>
                <span className="text-xs text-muted-foreground">reports</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total weekly reports logged
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-emerald-500/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Approval Rate
                </span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {approvalRate}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Approved submissions ratio
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-amber-500/30 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Needs Attention
                </span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertTriangleIcon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {correctionReports.length}
                </p>
                <span className="text-xs text-muted-foreground">reports</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Returned for modifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Week Status Card */}
        <Card className="shadow-xs border">
          <CardHeader className="border-b bg-muted/15 pb-4">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                <span>Current Week Status</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                Week of {currentWeekMonday.toLocaleDateString()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Track your weekly progress and handle submission actions for the active period.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {currentWeekReport ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Week of {new Date(currentWeekReport.weekStart).toLocaleDateString()}
                    </span>
                    {getStatusBadge(currentWeekReport.status)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <FolderIcon className="size-3.5 text-blue-500" />
                    Project: <span className="font-medium text-foreground">{currentWeekReport.project?.name || "N/A"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {currentWeekReport.status === "DRAFT" && (
                    <Link to={`/member/reports/${currentWeekReport.id}/edit`}>
                      <Button size="sm" variant="default" className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs">
                        Continue Editing
                        <ArrowRightIcon className="size-3.5" />
                      </Button>
                    </Link>
                  )}
                  {currentWeekReport.status === "NEEDS_CORRECTION" && (
                    <Link to={`/member/reports/${currentWeekReport.id}/edit`}>
                      <Button size="sm" variant="destructive" className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs animate-pulse">
                        🚨 Fix & Resubmit
                      </Button>
                    </Link>
                  )}
                  {currentWeekReport.status === "SUBMITTED" && (
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">
                      Waiting for Manager Review...
                    </span>
                  )}
                  {currentWeekReport.status === "APPROVED" && (
                    <Link to={`/member/reports/${currentWeekReport.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium cursor-pointer">
                        <EyeIcon className="size-3.5" />
                        View Submission
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed">
                <SparklesIcon className="size-8 text-primary mb-2" />
                <h3 className="font-semibold text-foreground text-sm">
                  Ready to log your progress for this week?
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Log your completed tasks, planned next steps, blockers, and hours spent for week of {currentWeekMonday.toLocaleDateString()}.
                </p>
                <Link to="/member/reports/new" className="mt-4">
                  <Button size="sm" className="gap-2 font-medium shadow-xs">
                    <PlusIcon className="size-4" />
                    Create This Week's Report
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity / Mini-History Table Card */}
        <Card className="shadow-xs overflow-hidden border">
          <CardHeader className="border-b bg-muted/15 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Overview of your 5 most recently submitted or edited weekly reports.
              </CardDescription>
            </div>
            <Link
              to="/member/history"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full History
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Week Start
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Project
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
                {recentReports.length > 0 ? (
                  recentReports.map((report: any) => (
                    <TableRow key={report.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium text-foreground font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5 text-amber-500 shrink-0" />
                          {new Date(report.weekStart).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <FolderIcon className="size-3.5 text-blue-500 shrink-0" />
                          <span>{report.project?.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/member/reports/${report.id}`}>
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs font-medium cursor-pointer">
                            <EyeIcon className="size-3.5" />
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                      No reports yet. Create your first report to get started!
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
