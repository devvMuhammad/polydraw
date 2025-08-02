import { Navigate } from "react-router-dom";
import { usePlayerStore } from "../stores/playerStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { playerInfo } = usePlayerStore();

  if (!playerInfo) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
