import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellIcon, CheckCheckIcon, AlertTriangleIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title = "Dashboard" }: SiteHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Action Required",
      message: "Manager requested changes on your report for Week of Sep 1, 2026.",
      time: "2 hours ago",
      type: "warning",
      read: false,
      link: "/member/history",
    },
    {
      id: "2",
      title: "Report Approved",
      message: "Your report for Week of Aug 25, 2026 has been approved.",
      time: "1 day ago",
      type: "success",
      read: false,
      link: "/member/history",
    },
    {
      id: "3",
      title: "Weekly Submission Due",
      message: "Don't forget to submit your report for this week.",
      time: "2 days ago",
      type: "info",
      read: true,
      link: "/member/reports/new",
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) px-4 lg:px-6 bg-card/40 backdrop-blur-xs">
      <div className="flex items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <ModeToggle />

        {/* Notification Bell Panel */}
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" className="relative size-8 text-muted-foreground hover:text-foreground">
                <BellIcon className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex size-2 rounded-full bg-destructive animate-pulse" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                >
                  <CheckCheckIcon className="size-3.5" />
                  Mark read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 text-xs transition-colors hover:bg-muted/40 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <Link to={n.link} className="block space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {n.type === "warning" && (
                          <AlertTriangleIcon className="size-3.5 text-amber-500 shrink-0" />
                        )}
                        {n.type === "success" && (
                          <CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                        {n.type === "info" && (
                          <ClockIcon className="size-3.5 text-blue-500 shrink-0" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-normal">{n.message}</p>
                  </Link>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t bg-muted/10 text-center">
              <Link
                to="/member/history"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all report history →
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
