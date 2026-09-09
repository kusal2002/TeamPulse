import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  FolderIcon,
  UsersIcon,
  FileChartColumnIcon,
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const location = useLocation();

  const isManager = user?.role === "MANAGER";

  const navMain = isManager
    ? [
        {
          title: "Dashboard",
          url: "/manager",
          icon: <LayoutDashboardIcon />,
          isActive: location.pathname === "/manager",
        },
        {
          title: "Team Reports",
          url: "/manager/reports",
          icon: <FileChartColumnIcon />,
          isActive: location.pathname === "/manager/reports",
        },
        {
          title: "Projects",
          url: "/manager/projects",
          icon: <FolderIcon />,
          isActive: location.pathname === "/manager/projects",
        },
        {
          title: "Team Members",
          url: "/manager/team",
          icon: <UsersIcon />,
          isActive: location.pathname.startsWith("/manager/team"),
        },
      ]
    : [
        {
          title: "Dashboard",
          url: "/member",
          icon: <LayoutDashboardIcon />,
          isActive: location.pathname === "/member",
        },
        {
          title: "My Reports",
          url: "/member/history",
          icon: <FileChartColumnIcon />,
          isActive: location.pathname === "/member/history",
        },
      ];

  // Managers spend their time setting up work; members spend it filing reports.
  const quickAction = isManager
    ? { label: "Create Project", url: "/manager/projects" }
    : { label: "Create Report", url: "/member/reports/new" };

  const userData = {
    name: user?.name || (isManager ? "Manager User" : "Team Member"),
    email: user?.email || "user@teampulse.com",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/" />}
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TeamPulse</span>
                <span className="truncate text-xs text-muted-foreground">
                  {isManager ? "Manager Portal" : "Member Portal"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} quickAction={quickAction} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
