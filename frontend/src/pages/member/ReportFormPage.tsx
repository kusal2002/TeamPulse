import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { AppLayout } from "@/pages/Layout/app-layout";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  PlusIcon,
  Trash2Icon,
  ArrowLeftIcon,
  AlertTriangleIcon,
  SaveIcon,
  SendIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  SparklesIcon,
  FileTextIcon,
  TargetIcon,
} from "lucide-react";

export default function ReportFormPage() {
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const { id } = useParams(); // If editing, id will be present
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects")).data,
  });

  // Fetch existing report if editing
  const { data: existingReport } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => (await api.get(`/reports/${id}`)).data,
    enabled: isEditing,
  });

  // Form State
  const [formData, setFormData] = useState({
    weekStart: "",
    projectId: "",
    tasksPlannedNext: "",
    optionalNotes: "",
    tasksCompleted: [] as any[],
    blockers: [] as any[],
    achievements: [] as any[],
    hoursWorked: [] as any[],
  });

  // Populate form if editing
  useEffect(() => {
    if (existingReport && existingReport.versions && existingReport.versions.length > 0) {
      const latestVersion = existingReport.versions[0]; // Latest version is first
      setFormData({
        weekStart: existingReport.weekStart ? existingReport.weekStart.split("T")[0] : "",
        projectId: existingReport.projectId || "",
        tasksPlannedNext: latestVersion.tasksPlannedNext || "",
        optionalNotes: latestVersion.optionalNotes || "",
        tasksCompleted: latestVersion.tasksCompleted || [],
        blockers: latestVersion.blockers || [],
        achievements: latestVersion.achievements || [],
        hoursWorked: latestVersion.hoursWorked || [],
      });
    } else if (!isEditing) {
      // Default date to current week's Monday
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      setFormData((prev) => ({
        ...prev,
        weekStart: monday.toISOString().split("T")[0],
      }));
    }
  }, [existingReport, isEditing]);

  // --- Helper functions for dynamic arrays ---
  const addRow = (field: keyof typeof formData, template: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as any[]), template],
    }));
  };

  const removeRow = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_: any, i: number) => i !== index),
    }));
  };

  const updateRow = (field: keyof typeof formData, index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev[field] as any[])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [field]: updated };
    });
  };

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: async (submit: boolean) => {
      if (isEditing) {
        await api.put(`/reports/${id}`, formData);
        if (submit) await api.post(`/reports/${id}/submit`);
      } else {
        const res = await api.post("/reports", formData);
        if (submit) await api.post(`/reports/${res.data.id}/submit`);
      }
    },
    onSuccess: (_data, submitted) => {
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
      toast.success(
        submitted ? "Report submitted for review" : "Draft saved",
        {
          description: submitted
            ? "Your manager can now review it."
            : "You can keep editing it until you submit.",
        },
      );
      navigate("/member/history");
    },
    onError: (error: any) => {
      toast.error("Could not save your report", {
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
  });

  const handleSubmit = (e: FormEvent, submit: boolean) => {
    e.preventDefault();
    saveMutation.mutate(submit);
  };

  // Show manager comment if Needs Correction
  const managerComment = existingReport?.comments?.[0];
  const isNeedsCorrection = existingReport?.status === "NEEDS_CORRECTION";

  return (
    <AppLayout title={isEditing ? "Edit Weekly Report" : "Create Weekly Report"}>
      <div className="flex flex-col gap-6 w-full">
        {/* Navigation & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/member/history"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline transition-colors"
            >
              <ArrowLeftIcon className="size-4" />
              Back to History
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              {isEditing ? "Edit Weekly Report" : "Create Weekly Report"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill in your weekly tasks, achievements, blockers, and planned work.
            </p>
          </div>
        </div>

        {/* Manager Requested Changes Banner */}
        {isNeedsCorrection && managerComment && (
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertTriangleIcon className="size-4 text-amber-600" />
              Manager Requested Changes (Version {managerComment.reportVersion?.versionNumber || "N/A"}):
            </div>
            <p className="text-sm mt-1 text-amber-800 dark:text-amber-300">
              {managerComment.comment}
            </p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Section 1: Basic Info */}
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                Report Information
              </CardTitle>
              <CardDescription>
                Select the starting Monday date for the report week and associated project.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Week Starting (Monday)
                  </label>
                  <div>
                    <DatePicker
                      value={formData.weekStart}
                      onChange={(_, dateStr) => setFormData({ ...formData, weekStart: dateStr })}
                      placeholder="Pick a Monday date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Project / Category
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Tasks Completed */}
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-emerald-500" />
                    Tasks Completed
                  </CardTitle>
                  <CardDescription>
                    Add tasks worked on during the week with completion percentage and hours spent.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addRow("tasksCompleted", {
                      taskName: "",
                      priority: "Medium",
                      plannedPercent: 100,
                      actualPercent: 0,
                      status: "In Progress",
                      timePlanned: 0,
                      timeSpent: 0,
                      deliverable: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <PlusIcon className="size-3.5" />
                  Add Task
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.tasksCompleted.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">Task Name</TableHead>
                        <TableHead className="w-28 font-semibold">Priority</TableHead>
                        <TableHead className="w-20 text-center font-semibold">Plan %</TableHead>
                        <TableHead className="w-20 text-center font-semibold">Act %</TableHead>
                        <TableHead className="w-32 font-semibold">Status</TableHead>
                        <TableHead className="w-36 text-center font-semibold">Hours (Plan / Spent)</TableHead>
                        <TableHead className="font-semibold">Deliverable</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.tasksCompleted.map((task, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="p-2">
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) => updateRow("tasksCompleted", idx, "taskName", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
                              placeholder="Task name..."
                              required
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <select
                              value={task.priority}
                              onChange={(e) => updateRow("tasksCompleted", idx, "priority", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm cursor-pointer"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <input
                              type="number"
                              value={task.plannedPercent}
                              onChange={(e) => updateRow("tasksCompleted", idx, "plannedPercent", Number(e.target.value))}
                              className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center"
                              min="0"
                              max="100"
                            />
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <input
                              type="number"
                              value={task.actualPercent}
                              onChange={(e) => updateRow("tasksCompleted", idx, "actualPercent", Number(e.target.value))}
                              className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center font-semibold"
                              min="0"
                              max="100"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <select
                              value={task.status}
                              onChange={(e) => updateRow("tasksCompleted", idx, "status", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm cursor-pointer"
                            >
                              <option value="Done">Done</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Blocked">Blocked</option>
                            </select>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-1.5 justify-center">
                              <input
                                type="number"
                                step="0.5"
                                value={task.timePlanned}
                                onChange={(e) => updateRow("tasksCompleted", idx, "timePlanned", Number(e.target.value))}
                                className="w-14 rounded-md border border-input bg-background px-1.5 py-1.5 text-sm text-center"
                                placeholder="Plan"
                              />
                              <span className="self-center text-muted-foreground text-xs">/</span>
                              <input
                                type="number"
                                step="0.5"
                                value={task.timeSpent}
                                onChange={(e) => updateRow("tasksCompleted", idx, "timeSpent", Number(e.target.value))}
                                className="w-14 rounded-md border border-input bg-background px-1.5 py-1.5 text-sm text-center font-semibold"
                                placeholder="Spent"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <input
                              type="text"
                              value={task.deliverable}
                              onChange={(e) => updateRow("tasksCompleted", idx, "deliverable", e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
                              placeholder="Link or output..."
                            />
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow("tasksCompleted", idx)}
                              className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                              title="Remove task"
                            >
                              <Trash2Icon className="size-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No tasks added yet. Click "+ Add Task" to record your completed tasks.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Tasks Planned Next Week */}
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TargetIcon className="size-4 text-blue-500" />
                Tasks Planned for Next Week
              </CardTitle>
              <CardDescription>
                Outline upcoming objectives and planned work items for the following week.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <textarea
                value={formData.tasksPlannedNext}
                onChange={(e) => setFormData({ ...formData, tasksPlannedNext: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed"
                placeholder="List planned goals and deliverables..."
                rows={3}
                required
              />
            </CardContent>
          </Card>

          {/* Section 4: Blockers & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blockers */}
            <Card className="shadow-xs">
              <CardHeader className="border-b bg-muted/15 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangleIcon className="size-4 text-rose-500" />
                    Blockers / Challenges
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => addRow("blockers", { description: "", isKeyIssue: false })}
                    className="inline-flex items-center gap-1 text-xs bg-rose-600 text-white font-medium px-2.5 py-1 rounded-md hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <PlusIcon className="size-3.5" /> Add
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {formData.blockers.length > 0 ? (
                  formData.blockers.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <input
                        type="text"
                        value={b.description}
                        onChange={(e) => updateRow("blockers", idx, "description", e.target.value)}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        placeholder="Describe blocker..."
                        required
                      />
                      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={b.isKeyIssue}
                          onChange={(e) => updateRow("blockers", idx, "isKeyIssue", e.target.checked)}
                          className="rounded border-input text-rose-600 focus:ring-rose-500"
                        />
                        Key?
                      </label>
                      <button
                        type="button"
                        onClick={() => removeRow("blockers", idx)}
                        className="p-1 text-muted-foreground hover:text-rose-600 transition-colors shrink-0"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No blockers recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-xs">
              <CardHeader className="border-b bg-muted/15 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <SparklesIcon className="size-4 text-emerald-500" />
                    Achievements / Highlights
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => addRow("achievements", { description: "", isKeyHighlight: false })}
                    className="inline-flex items-center gap-1 text-xs bg-emerald-600 text-white font-medium px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <PlusIcon className="size-3.5" /> Add
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {formData.achievements.length > 0 ? (
                  formData.achievements.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <input
                        type="text"
                        value={a.description}
                        onChange={(e) => updateRow("achievements", idx, "description", e.target.value)}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        placeholder="Describe achievement..."
                        required
                      />
                      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={a.isKeyHighlight}
                          onChange={(e) => updateRow("achievements", idx, "isKeyHighlight", e.target.checked)}
                          className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                        />
                        Key?
                      </label>
                      <button
                        type="button"
                        onClick={() => removeRow("achievements", idx)}
                        className="p-1 text-muted-foreground hover:text-rose-600 transition-colors shrink-0"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No achievements recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 5: Hours Worked */}
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClockIcon className="size-4 text-blue-500" />
                    Hours Worked (Optional)
                  </CardTitle>
                  <CardDescription>
                    Log total hours broken down by work category.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => addRow("hoursWorked", { taskType: "Development", hours: 0 })}
                  className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground font-medium px-2.5 py-1 rounded-md hover:bg-secondary/80 transition-colors shadow-xs border"
                >
                  <PlusIcon className="size-3.5" /> Add Category
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {formData.hoursWorked.length > 0 ? (
                formData.hoursWorked.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-muted/20 p-2 rounded-lg border">
                    <select
                      value={h.taskType}
                      onChange={(e) => updateRow("hoursWorked", idx, "taskType", e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm cursor-pointer"
                    >
                      <option value="Development">Development</option>
                      <option value="Testing">Testing</option>
                      <option value="Meetings">Meetings</option>
                      <option value="Documentation">Documentation</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={h.hours}
                        onChange={(e) => updateRow("hoursWorked", idx, "hours", Number(e.target.value))}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-semibold text-center"
                        min="0"
                      />
                      <span className="text-xs text-muted-foreground">hrs</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow("hoursWorked", idx)}
                      className="p-1 text-muted-foreground hover:text-rose-600 transition-colors ml-auto"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No hours category added.</p>
              )}
            </CardContent>
          </Card>

          {/* Section 6: Optional Notes */}
          <Card className="shadow-xs">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileTextIcon className="size-4 text-muted-foreground" />
                Optional Notes / Links
              </CardTitle>
              <CardDescription>
                Add additional comments, PR links, or context for your manager.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <textarea
                value={formData.optionalNotes}
                onChange={(e) => setFormData({ ...formData, optionalNotes: e.target.value })}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Optional notes or references..."
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-2 text-sm font-medium shadow-xs hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            >
              <SaveIcon className="size-4" />
              Save as Draft
            </button>
            <AlertDialog
              open={confirmSubmitOpen}
              onOpenChange={setConfirmSubmitOpen}
            >
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    disabled={saveMutation.isPending}
                    className="gap-2 px-6 py-2 font-medium cursor-pointer"
                  />
                }
              >
                <SendIcon className="size-4" />
                Submit for Review
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Submit this report for review?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Your current changes will be saved and sent to your manager.
                    You will not be able to edit this report again unless they
                    send it back for correction.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={saveMutation.isPending}
                    onClick={() => {
                      setConfirmSubmitOpen(false);
                      saveMutation.mutate(true);
                    }}
                    className="gap-2"
                  >
                    <SendIcon className="size-4" />
                    Submit for Review
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
