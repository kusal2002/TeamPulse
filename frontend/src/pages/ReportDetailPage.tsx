import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { AppLayout } from "@/pages/Layout/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  SparklesIcon,
  MessageSquareIcon,
  HistoryIcon,
  FileTextIcon,
  TargetIcon,
  AlertCircleIcon,
  LayersIcon,
  PencilIcon,
} from "lucide-react";

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0); // 0 is the latest version

  const isManager = user?.role === "MANAGER";
  const endpoint = isManager ? `/reports/manager/${id}` : `/reports/${id}`;

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id, isManager],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const formatted = status ? status.toUpperCase() : "";
    if (formatted === "APPROVED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2.5 py-1"
        >
          <CheckCircle2Icon className="size-3.5" />
          Approved
        </Badge>
      );
    }
    if (
      formatted === "SUBMITTED" ||
      formatted === "PENDING" ||
      formatted === "IN_PROGRESS"
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-2.5 py-1"
        >
          <ClockIcon className="size-3.5" />
          Submitted / Pending
        </Badge>
      );
    }
    if (formatted === "CHANGES_REQUESTED" || formatted === "REJECTED") {
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 px-2.5 py-1"
        >
          <AlertCircleIcon className="size-3.5" />
          Changes Requested
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 px-2.5 py-1">
        {status || "Draft"}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = (priority || "").toUpperCase();
    if (p === "HIGH") {
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-xs"
        >
          High
        </Badge>
      );
    }
    if (p === "MEDIUM") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs"
        >
          Medium
        </Badge>
      );
    }
    if (p === "LOW") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs"
        >
          Low
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {priority || "Normal"}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || s === "DONE") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs"
        >
          Completed
        </Badge>
      );
    }
    if (s === "IN_PROGRESS") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs"
        >
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {status || "Pending"}
      </Badge>
    );
  };

  const backLink = isManager ? "/manager" : "/member/history";
  const backLabel = isManager ? "Back to Dashboard" : "Back to History";

  if (isLoading) {
    return (
      <AppLayout title="Report Details">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !report) {
    return (
      <AppLayout title="Report Details">
        <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto text-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Report Not Found</h2>
            <p className="text-sm text-muted-foreground">
              The requested report could not be loaded or does not exist.
            </p>
          </div>
          <Link
            to={backLink}
            className="mt-2 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs hover:bg-muted transition-colors"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            {backLabel}
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Get the currently selected version safely
  const versions = report.versions || [];
  const currentVersion = versions[selectedVersionIndex] || versions[0] || {};
  const totalHours =
    currentVersion.hoursWorked?.reduce(
      (sum: number, h: any) => sum + (Number(h.hours) || 0),
      0,
    ) || 0;

  return (
    <AppLayout title={`Report: ${report.project?.name || "Details"}`}>
      <div className="flex flex-col gap-6 w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={backLink}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline transition-colors"
              >
                <ArrowLeftIcon className="size-4" />
                {backLabel}
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              Report Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Detailed view of weekly progress, completed tasks, and review
              status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isManager && (
              <Link
                to={`/member/reports/${id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3.5 py-1.5 text-sm font-medium shadow-xs hover:bg-muted transition-colors"
              >
                <PencilIcon className="size-4 text-primary" />
                Edit Report
              </Link>
            )}
            {getStatusBadge(report.status)}
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider">
                User
              </span>
              <UserIcon className="size-4 text-primary" />
            </div>
            <p className="font-semibold text-foreground text-base truncate">
              {report.user?.name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {report.user?.role?.replace("_", " ").toLowerCase() || "Member"}
            </p>
          </Card>

          <Card className="p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider">
                Project
              </span>
              <FolderIcon className="size-4 text-blue-500" />
            </div>
            <p className="font-semibold text-foreground text-base truncate">
              {report.project?.name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Team Workspace
            </p>
          </Card>

          <Card className="p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider">
                Week
              </span>
              <CalendarIcon className="size-4 text-amber-500" />
            </div>
            <p className="font-semibold text-foreground text-base">
              {report.weekStart
                ? new Date(report.weekStart).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Weekly Cycle</p>
          </Card>

          <Card className="p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider">
                Status
              </span>
              <ClockIcon className="size-4 text-emerald-500" />
            </div>
            <div className="mt-1">{getStatusBadge(report.status)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalHours} hrs logged
            </p>
          </Card>
        </div>

        {/* Main content (left) + review sidebar (right) */}
        <div className="flex flex-col-reverse xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Report Content Card */}
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="border-b bg-muted/15 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <LayersIcon className="size-5 text-primary" />
                  Report Content (Read-Only)
                </CardTitle>
                <CardDescription>
                  Version{" "}
                  {currentVersion.versionNumber ||
                    versions.length - selectedVersionIndex}{" "}
                  submitted on{" "}
                  {currentVersion.submittedAt
                    ? new Date(currentVersion.submittedAt).toLocaleString()
                    : "N/A"}
                </CardDescription>
              </div>
              {selectedVersionIndex === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Latest Version
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Tasks Planned for Next Week */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <TargetIcon className="size-4 text-blue-500" />
                Tasks Planned for Next Week
              </h3>
              <div className="bg-muted/40 border rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {currentVersion.tasksPlannedNext || "No tasks specified."}
              </div>
            </div>

            {/* Tasks Completed Table */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <CheckCircle2Icon className="size-4 text-emerald-500" />
                Tasks Completed
              </h3>
              {currentVersion.tasksCompleted &&
              currentVersion.tasksCompleted.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">Task</TableHead>
                        <TableHead className="text-center font-semibold">
                          Priority
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Planned %
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Actual %
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Time (Plan/Spent)
                        </TableHead>
                        <TableHead className="font-semibold">
                          Deliverable
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentVersion.tasksCompleted.map(
                        (task: any, index: number) => (
                          <TableRow key={task.id || index}>
                            <TableCell className="font-medium text-foreground">
                              {task.taskName}
                            </TableCell>
                            <TableCell className="text-center">
                              {getPriorityBadge(task.priority)}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {task.plannedPercent}%
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs font-semibold">
                              {task.actualPercent}%
                            </TableCell>
                            <TableCell className="text-center">
                              {getTaskStatusBadge(task.status)}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {task.timePlanned || 0}h /{" "}
                              <span className="font-semibold text-foreground">
                                {task.timeSpent || 0}h
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {task.deliverable || "—"}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No tasks completed recorded for this version.
                </p>
              )}
            </div>

            {/* Blockers / Challenges */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <AlertTriangleIcon className="size-4 text-rose-500" />
                Blockers / Challenges
              </h3>
              {currentVersion.blockers && currentVersion.blockers.length > 0 ? (
                <ul className="space-y-2">
                  {currentVersion.blockers.map((b: any, index: number) => (
                    <li
                      key={b.id || index}
                      className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 transition-colors ${
                        b.isKeyIssue
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200 font-semibold"
                          : "bg-muted/30 border-border text-foreground"
                      }`}
                    >
                      <AlertTriangleIcon
                        className={`size-4 shrink-0 mt-0.5 ${b.isKeyIssue ? "text-rose-600 dark:text-rose-400" : "text-amber-500"}`}
                      />
                      <div className="flex-1">
                        <span>{b.description}</span>
                        {b.isKeyIssue && (
                          <span className="ml-2 font-bold text-rose-600 dark:text-rose-400">
                            (Key Issue)
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No blockers reported.
                </p>
              )}
            </div>

            {/* Achievements / Highlights */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <SparklesIcon className="size-4 text-emerald-500" />
                Achievements / Highlights
              </h3>
              {currentVersion.achievements &&
              currentVersion.achievements.length > 0 ? (
                <ul className="space-y-2">
                  {currentVersion.achievements.map((a: any, index: number) => (
                    <li
                      key={a.id || index}
                      className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 transition-colors ${
                        a.isKeyHighlight
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-semibold"
                          : "bg-muted/30 border-border text-foreground"
                      }`}
                    >
                      <SparklesIcon
                        className={`size-4 shrink-0 mt-0.5 ${a.isKeyHighlight ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-500"}`}
                      />
                      <div className="flex-1">
                        <span>{a.description}</span>
                        {a.isKeyHighlight && (
                          <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                            (Key Highlight)
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No achievements reported.
                </p>
              )}
            </div>

            {/* Hours Worked */}
            {currentVersion.hoursWorked &&
              currentVersion.hoursWorked.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <ClockIcon className="size-4 text-blue-500" />
                    Hours Worked
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentVersion.hoursWorked.map((h: any, index: number) => (
                      <li
                        key={h.id || index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {h.taskType}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {h.hours}h
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Optional Notes */}
            {currentVersion.optionalNotes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  Optional Notes
                </h3>
                <p className="bg-muted/30 border rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed italic">
                  {currentVersion.optionalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

          </div>

          {/* Right sidebar: version history + review activity */}
          <aside className="w-full xl:w-[22rem] xl:shrink-0 flex flex-col gap-6 xl:sticky xl:top-6">
        <VersionHistoryPanel
          versions={versions}
          comments={report.comments || []}
          selectedIndex={selectedVersionIndex}
          onSelect={setSelectedVersionIndex}
        />

        {/* Review Comments History */}
        {report.comments && report.comments.length > 0 && (
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquareIcon className="size-5 text-primary" />
                Review Comments History
              </CardTitle>
              <CardDescription>
                Feedback and approval history recorded by project managers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {report.comments.map((c: any, index: number) => {
                  const isApproved = c.action === "APPROVED";
                  const targetVersion = versions.find(
                    (v: any) => v.id === c.reportVersionId,
                  );
                  const versionNum = targetVersion?.versionNumber || "N/A";

                  return (
                    <div
                      key={c.id || index}
                      className={`p-4 rounded-xl border-l-4 transition-all ${
                        isApproved
                          ? "border-l-emerald-500 bg-emerald-500/5 border-emerald-500/20"
                          : "border-l-amber-500 bg-amber-500/5 border-amber-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <UserIcon className="size-3.5 text-primary" />
                          {c.manager?.name || "Manager"}
                        </span>
                        <span>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>

                      <p
                        className={`font-medium text-sm my-1 ${isApproved ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                      >
                        {isApproved ? "✅ Approved" : "🔄 Requested Changes"}{" "}
                        (Against Version {versionNum})
                      </p>

                      <p className="text-sm text-foreground mt-2 leading-relaxed bg-background/60 p-3 rounded-lg border">
                        {c.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MANAGER REVIEW ACTION */}
        {isManager && report.status === "SUBMITTED" && (
          <ManagerReviewForm reportId={report.id} />
        )}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

/**
 * Right-hand sidebar panel listing every submitted version of the report.
 * Both team members and managers use this to jump between past versions and
 * see which review comments were made against each one.
 */
function VersionHistoryPanel({
  versions,
  comments,
  selectedIndex,
  onSelect,
}: {
  versions: any[];
  comments: any[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (!versions || versions.length === 0) return null;

  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="border-b bg-muted/15 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <HistoryIcon className="size-4 text-primary" />
          Version History
        </CardTitle>
        <CardDescription className="text-xs">
          {versions.length === 1
            ? "This report has one submitted version."
            : `This report has ${versions.length} submitted versions. Select one to view its content.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <ol className="flex flex-col gap-1">
          {versions.map((v: any, idx: number) => {
            const isActive = idx === selectedIndex;
            const versionNumber = v.versionNumber || versions.length - idx;
            const commentCount = comments.filter(
              (c: any) => c.reportVersionId === v.id,
            ).length;

            return (
              <li key={v.id || idx}>
                <button
                  type="button"
                  onClick={() => onSelect(idx)}
                  aria-current={isActive}
                  className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Version {versionNumber}
                    </span>
                    {idx === 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.submittedAt
                      ? new Date(v.submittedAt).toLocaleString()
                      : "No submission date"}
                  </p>
                  {commentCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <MessageSquareIcon className="size-3" />
                      {commentCount} review comment
                      {commentCount === 1 ? "" : "s"}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function ManagerReviewForm({ reportId }: { reportId: string }) {
  const [action, setAction] = useState<"APPROVED" | "REQUESTED_CHANGES">("APPROVED");
  const [comment, setComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/reports/${reportId}/review`, { action, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["manager-reports"] });
      queryClient.invalidateQueries({ queryKey: ["manager-reports-page"] });

      if (action === "APPROVED") {
        toast.success("Report approved", {
          description: "The team member has been notified. No further edits are expected.",
        });
      } else {
        toast.success("Changes requested", {
          description: "The report is back with the team member for correction.",
        });
      }
      navigate("/manager");
    },
    onError: (error: any) => {
      toast.error("Could not submit review", {
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
  });

  const isApproval = action === "APPROVED";

  return (
    <Card className="shadow-xs border-t-4 border-t-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <CheckCircle2Icon className="size-5 text-primary" />
          Take Review Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <input
              type="radio"
              name="action"
              value="APPROVED"
              checked={action === "APPROVED"}
              onChange={() => setAction("APPROVED")}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">
              ✅ Approve Report
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <input
              type="radio"
              name="action"
              value="REQUESTED_CHANGES"
              checked={action === "REQUESTED_CHANGES"}
              onChange={() => setAction("REQUESTED_CHANGES")}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-medium text-amber-700 dark:text-amber-400 text-sm">
              🔄 Request Changes
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            {action === "REQUESTED_CHANGES"
              ? "Comment (Required)"
              : "Optional Comment"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-input rounded-lg p-3 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Leave feedback for the team member..."
            required={action === "REQUESTED_CHANGES"}
          />
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                disabled={
                  mutation.isPending ||
                  (action === "REQUESTED_CHANGES" && !comment.trim())
                }
                className="px-6 font-medium cursor-pointer"
              />
            }
          >
            {mutation.isPending ? "Submitting..." : "Submit Review"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isApproval
                  ? "Approve this report?"
                  : "Send this report back for correction?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isApproval
                  ? "The report will be marked as approved and locked. No further edits are expected from the team member."
                  : "The report will reopen for editing and the team member will see your comment. They can revise it and resubmit for another review."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={mutation.isPending}
                onClick={() => {
                  setConfirmOpen(false);
                  mutation.mutate();
                }}
              >
                {isApproval ? "Approve Report" : "Request Changes"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
