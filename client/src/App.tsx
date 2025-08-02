import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { GamePage } from "./pages/GamePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { usePlayerStore } from "./stores/playerStore";

export default function App() {
  const { playerInfo } = usePlayerStore();

  return (
    <Routes>
      <Route
        path="/"
        element={playerInfo ? <Navigate to="/play" replace /> : <LoginPage />}
      />
      <Route
        path="/play"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
