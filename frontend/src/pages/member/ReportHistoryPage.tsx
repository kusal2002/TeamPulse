import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { Link } from "react-router-dom";
import { AppLayout } from "../Layout/app-layout";
import { DataTable } from "@/components/data-table";

export default function ReportHistoryPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["my-reports"],
    queryFn: async () => {
      try {
        const res = await api.get("/reports/my-history");
        return res.data;
      } catch (err) {
        return [];
      }
    },
  });

  const tableData = React.useMemo(() => {
    if (!reports || reports.length === 0) return [];

    return reports.map((report: any, index: number) => {
      const latestComment = report.comments?.[0];
      return {
        id: report.id ?? index + 1,
        header: report.weekStart
          ? `Week of ${new Date(report.weekStart).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`
          : `Weekly Status Report #${index + 1}`,
        project: report.project?.name || "General Project",
        status: report.status || "DRAFT",
        reviewer: latestComment?.manager?.name || "Not reviewed yet",
        weekStart: report.weekStart,
        updatedAt: report.updatedAt || report.weekStart,
      };
    });
  }, [reports]);

  return (
    <AppLayout title="My Report History">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              My Report History
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage, filter, and track all your weekly reports using the
              interactive data table.
            </p>
          </div>
          <Link
            to="/member/reports/new"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-xs"
          >
            + Create New Report
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading reports...
          </div>
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-2 md:p-4">
            <DataTable data={tableData} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
