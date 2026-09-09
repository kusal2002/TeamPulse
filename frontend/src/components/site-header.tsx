import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellIcon, CheckCheckIcon, AlertTriangleIcon, CheckCircle2Icon, ClockIcon, Loader2Icon } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "success" | "info";
  link: string;
  createdAt: string;
}

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title = "Dashboard" }: SiteHeaderProps) {
  const { user } = useAuth();
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`teampulse_read_notifs_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const res = await api.get("/reports/notifications");
      return res.data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`teampulse_read_notifs_${user.id}`);
        setReadIds(saved ? JSON.parse(saved) : []);
      } catch {
        setReadIds([]);
      }
    }
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    if (user?.id) {
      localStorage.setItem(`teampulse_read_notifs_${user.id}`, JSON.stringify(updated));
    }
  };

  const markSingleRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      if (user?.id) {
        localStorage.setItem(`teampulse_read_notifs_${user.id}`, JSON.stringify(updated));
      }
    }
  };

  const formatRelativeTime = (timeStr: string) => {
    try {
      return formatDistanceToNow(parseISO(timeStr), { addSuffix: true });
    } catch {
      return "recently";
    }
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
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2Icon className="size-4 animate-spin text-primary" />
                  Fetching live notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No new notifications right now.
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors hover:bg-muted/40 ${
                        !isRead ? "bg-primary/5 font-medium" : ""
                      }`}
                      onClick={() => markSingleRead(n.id)}
                    >
                      <Link to={n.link} className="block space-y-1">
                        <div className="flex items-center justify-between gap-2">
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
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatRelativeTime(n.time)}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-normal">{n.message}</p>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2.5 border-t bg-muted/10 text-center">
              <Link
                to={user?.role === "MANAGER" ? "/manager/reports" : "/member/history"}
                className="text-xs font-medium text-primary hover:underline"
              >
                {user?.role === "MANAGER" ? "View team report reviews →" : "View all report history →"}
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

