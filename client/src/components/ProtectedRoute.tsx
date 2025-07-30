import { Navigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { playerInfo } = usePlayer();

  if (!playerInfo) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
