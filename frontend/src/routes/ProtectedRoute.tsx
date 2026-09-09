import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  requiredRole?: "TEAM_MEMBER" | "MANAGER";
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect managers to manager dashboard, members to member dashboard
    return (
      <Navigate to={user.role === "MANAGER" ? "/manager" : "/member"} replace />
    );
  }

  return <>{children}</>;
}
