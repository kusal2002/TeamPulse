import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { AppLayout } from "@/pages/Layout/app-layout";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UsersIcon, MailIcon, ShieldIcon, SearchIcon, FileTextIcon, ExternalLinkIcon } from "lucide-react";

export default function TeamMembersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from backend /users API
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-directory"],
    queryFn: async () => (await api.get("/users")).data,
  });

  const members = (users || []).filter(
    (m: any) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "TP";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <AppLayout title="Team Members">
        <div className="flex flex-col gap-6 mx-auto w-full">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team Members">
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Directory</h1>
            <p className="text-sm text-muted-foreground">
              Directory of active team members. Click any member to view their report history and performance profile.
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search member name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Team Members Data Table Card */}
        <Card className="shadow-xs overflow-hidden border">
          <CardHeader className="border-b bg-muted/15 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Member Directory
              </CardTitle>
              <CardDescription>
                Overview of team members and logged report volume.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {members.length} Members
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[260px] font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Member
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Reports Filed
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length > 0 ? (
                  members.map((m: any) => (
                    <TableRow
                      key={m.id}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/manager/team/${m.id}`)}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hover:underline font-semibold">{m.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <MailIcon className="size-3.5 text-muted-foreground/70 shrink-0" />
                          <span>{m.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20 gap-1 px-2 py-0.5 font-medium text-xs"
                        >
                          <ShieldIcon className="size-3" />
                          {m.role === "MANAGER" ? "Manager" : "Team Member"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-foreground">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <FileTextIcon className="size-3.5 text-muted-foreground" />
                          <span>{m.reportCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manager/team/${m.id}`);
                          }}
                        >
                          View Profile
                          <ExternalLinkIcon className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UsersIcon className="size-8 text-muted-foreground/40 mb-1" />
                        <p className="font-medium text-foreground">No members found</p>
                        <p className="text-xs text-muted-foreground">
                          Try searching for a different name or email address.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {members.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium text-xs text-muted-foreground">
                      Total Active Directory Members
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {members.length}
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
