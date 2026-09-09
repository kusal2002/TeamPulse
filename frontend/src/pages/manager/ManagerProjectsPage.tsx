import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  FolderIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  FileTextIcon,
  AlertTriangleIcon,
} from "lucide-react";

export default function ManagerProjectsPage() {
  const queryClient = useQueryClient();

  // Dialog & Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects")).data,
  });

  // Create / Update mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
      } else {
        await api.post("/projects", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      closeFormDialog();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteTarget(null);
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setIsFormOpen(true);
  };

  const openEditDialog = (project: any) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description || "" });
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  if (isLoading) {
    return (
      <AppLayout title="Manage Projects">
        <div className="flex flex-col gap-6 mx-auto w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Manage Projects">
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manage Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              Create, edit, and organize project workspaces for team weekly
              reporting.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/manager">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <ArrowLeftIcon className="size-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              onClick={openCreateDialog}
              size="sm"
              className="gap-2 font-medium cursor-pointer shadow-xs"
            >
              <PlusIcon className="size-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Projects Data Table Card */}
        <Card className="shadow-xs overflow-hidden border">
          <CardHeader className="border-b bg-muted/15 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Active Projects
              </CardTitle>
              <CardDescription>
                List of all configured project categories in the system.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {projects?.length || 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="pb-4">
                A list of your active projects.
              </TableCaption>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[260px] font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Project Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects && projects.length > 0 ? (
                  projects.map((project: any) => (
                    <TableRow
                      key={project.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <FolderIcon className="size-4 text-primary shrink-0" />
                          <span>{project.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {project.description ? (
                          <div className="flex items-center gap-1.5">
                            <FileTextIcon className="size-3.5 text-muted-foreground/70 shrink-0" />
                            <span>{project.description}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 italic">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(project)}
                            className="h-8 gap-1.5 text-xs text-foreground cursor-pointer"
                          >
                            <PencilIcon className="size-3.5 text-blue-500" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteTarget({
                                id: project.id,
                                name: project.name,
                              })
                            }
                            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2Icon className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderIcon className="size-8 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">
                          No projects created yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click "Add Project" to create your first project
                          category.
                        </p>
                        <Button
                          onClick={openCreateDialog}
                          size="sm"
                          variant="outline"
                          className="mt-2 gap-1.5 text-xs"
                        >
                          <PlusIcon className="size-3.5" />
                          Add Project Now
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {projects && projects.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="font-medium text-xs text-muted-foreground"
                    >
                      Total Configured Projects
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {projects.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </CardContent>
        </Card>

        {/* CREATE / EDIT PROJECT DIALOG */}
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => !open && closeFormDialog()}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                {editingId ? (
                  <>
                    <PencilIcon className="size-4 text-amber-500" />
                    Edit Project
                  </>
                ) : (
                  <>
                    <PlusIcon className="size-4 text-primary" />
                    Add New Project
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the project workspace details below."
                  : "Fill in the details below to create a new project workspace for your team."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-10 text-sm"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Description (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. React Native frontend rewrite and API integration"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeFormDialog}
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                onClick={() => mutation.mutate()}
                disabled={!formData.name.trim() || mutation.isPending}
                size="sm"
                className="gap-2 font-medium cursor-pointer"
              >
                {mutation.isPending
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangleIcon className="size-5" />
                Confirm Project Deletion
              </DialogTitle>
              <DialogDescription className="pt-2 text-foreground/90">
                Are you sure you want to delete project{" "}
                <span className="font-semibold text-foreground">
                  "{deleteTarget?.name}"
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 pt-4">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(null)}
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  deleteTarget && deleteMutation.mutate(deleteTarget.id)
                }
                disabled={deleteMutation.isPending}
                className="gap-2 font-medium cursor-pointer"
              >
                <Trash2Icon className="size-4" />
                {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
