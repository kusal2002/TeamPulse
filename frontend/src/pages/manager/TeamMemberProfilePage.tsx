import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { AppLayout } from "@/pages/Layout/app-layout";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  MailIcon,
  ShieldIcon,
  CalendarIcon,
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  EyeIcon,
  TrendingUpIcon,
  FolderIcon,
} from "lucide-react";

export default function TeamMemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
    enabled: !!id,
  });

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
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
            Approved
          </Badge>
        );
      case "NEEDS_CORRECTION":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
            Needs Correction
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
            Submitted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Draft
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Member Profile">
        <div className="flex flex-col gap-6 mx-auto w-full pb-8">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout title="Member Profile">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangleIcon className="size-12 text-destructive" />
          <h2 className="text-xl font-bold">Team Member Not Found</h2>
          <Button onClick={() => navigate("/manager/team")} variant="outline" className="gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Team Directory
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { user, stats, reports } = data;

  return (
    <AppLayout title={`${user.name} - Profile`}>
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Navigation back */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        </div>

        {/* Member Header Card */}
        <Card className="shadow-xs border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 gap-1 px-2.5 py-0.5 font-medium text-xs"
                    >
                      <ShieldIcon className="size-3" />
                      {user.role === "MANAGER" ? "Manager" : "Team Member"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      <MailIcon className="size-4 text-muted-foreground/70" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="size-4 text-muted-foreground/70" />
                      Joined {format(parseISO(user.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reports Filed
              </CardTitle>
              <FileTextIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.submittedReports} awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Approval Rate
              </CardTitle>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stats.complianceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.approvedReports} approved reports
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Needs Correction
              </CardTitle>
              <ClockIcon className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stats.needsCorrectionReports}</div>
              <p className="text-xs text-muted-foreground mt-1">Reports pending fixes</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Open Blockers
              </CardTitle>
              <AlertTriangleIcon className="size-4 text-destructive" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stats.openBlockersCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Key issues flagged</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border sm:col-span-2 lg:col-span-1">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Hours
              </CardTitle>
              <TrendingUpIcon className="size-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stats.totalHoursLogged} hrs</div>
              <p className="text-xs text-muted-foreground mt-1">Total time logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Submission History */}
        <Card className="shadow-xs border overflow-hidden">
          <CardHeader className="border-b bg-muted/15 pb-4">
            <CardTitle className="text-base font-semibold">Report Submission History</CardTitle>
            <CardDescription>
              Chronological log of weekly reports submitted by {user.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Report Week
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Project
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Tasks Logged
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Last Reviewer Note
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((r: any) => {
                    const latestVersion = r.versions?.[0];
                    const latestComment = r.comments?.[0];
                    const tasksCount = latestVersion?.tasksCompleted?.length || 0;

                    return (
                      <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                            <span>
                              Week of {format(parseISO(r.weekStart), "MMM d, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <FolderIcon className="size-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {r.project?.name || "General"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell className="text-center font-mono font-semibold text-sm">
                          {tasksCount} tasks
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                          {latestComment ? (
                            <span>
                              <strong className="text-foreground">
                                {latestComment.manager?.name}:
                              </strong>{" "}
                              {latestComment.comment}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground/60">No comments</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => navigate(`/reports/${r.id}`)}
                          >
                            <EyeIcon className="size-3.5" />
                            View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileTextIcon className="size-8 text-muted-foreground/40 mb-1" />
                        <p className="font-medium text-foreground">No reports filed yet</p>
                        <p className="text-xs text-muted-foreground">
                          This team member has not submitted any weekly work reports.
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
