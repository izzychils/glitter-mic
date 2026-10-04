import { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Auth } from "./pages/Auth";
import { Game } from "./pages/Game";
import { KaraokeSession } from "./pages/KaraokeSession";
import { DesignSystem } from "./pages/DesignSystem";
import { NotFound } from "./pages/NotFound";
import { LoadingScreen } from "./components/LoadingSpinner";
import { sessionFetch } from "./lib/session";

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await sessionFetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/session`);

      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch (error) {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setAuthenticated(true);
    navigate("/game");
  };

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route
          path="/"
          element={authenticated ? <Navigate to="/game" replace /> : <Auth onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/game"
          element={authenticated ? <Game /> : <Navigate to="/" replace />}
        />
        <Route
          path="/session"
          element={authenticated ? <KaraokeSession /> : <Navigate to="/" replace />}
        />
        <Route path="/design" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
