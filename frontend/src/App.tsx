import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "../src/pages/RegisterPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import MemberDashboard from "./pages/MemberDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerProjectsPage from "./pages/manager/ManagerProjectsPage";
import ManagerReportsPage from "./pages/manager/ManagerReportsPage";
import TeamMembersPage from "./pages/manager/TeamMembersPage";
import AccountPage from "./pages/AccountPage";
import { LoginPage } from "./pages/LoginPage";
import ReportHistoryPage from "./pages/member/ReportHistoryPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import ReportFormPage from "./pages/member/ReportFormPage";

const queryClient = new QueryClient();

const SmartRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <Navigate to={user.role === "MANAGER" ? "/manager" : "/member"} replace />
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Shared Protected routes */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Member routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute requiredRole="TEAM_MEMBER">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Manager routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/projects"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerProjectsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/team"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <TeamMembersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/history"
        element={
          <ProtectedRoute requiredRole="TEAM_MEMBER">
            <ReportHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/reports/new"
        element={
          <ProtectedRoute requiredRole="TEAM_MEMBER">
            <ReportFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/reports/:id/edit"
        element={
          <ProtectedRoute requiredRole="TEAM_MEMBER">
            <ReportFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/reports/:id"
        element={
          <ProtectedRoute requiredRole="TEAM_MEMBER">
            <ReportDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports/:id"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ReportDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <ReportDetailPage />
          </ProtectedRoute>
        }
      />
      {/* Default Route */}
      <Route path="/" element={<SmartRedirect />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
