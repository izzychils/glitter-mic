import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/Button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-6">
      <GlassCard className="p-10 text-center">
        <p className="text-6xl font-extrabold text-[var(--pink-500)]">404</p>
        <h1 className="mt-3 text-xl font-bold text-white">This stage is empty</h1>
        <p className="mt-2 text-sm text-white/70">The page you were looking for is not on the setlist.</p>
        <div className="mt-6 flex justify-center">
          <Button leftIcon={Home} onClick={() => navigate("/")}>
            Back to landing
          </Button>
        </div>
      </GlassCard>
    </main>
  );
}
