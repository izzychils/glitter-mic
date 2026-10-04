import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, Palette, Trophy, Users, Wand2 } from "lucide-react";
import { GlitterMic } from "../components/GlitterMic";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

const FEATURES = [
  {
    icon: Wand2,
    title: "Blurred lyrics",
    body: "Lines start blurred and every word un-blurs the moment you sing it right. Miss one and it shakes red.",
  },
  {
    icon: Users,
    title: "Collab rooms",
    body: "Up to 8 singers join by room code and sing the same beat - one server clock keeps everyone in sync.",
  },
  {
    icon: Trophy,
    title: "Fair scoring",
    body: "Lyrics, pitch and timing are recomputed server-side from raw features, so nobody can fake a winning score.",
  },
] as const;

export function Landing() {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-14 px-6 pb-24 pt-20">
      <section className="flex flex-col items-center gap-8 text-center">
        <GlitterMic active />
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            Glitter <span className="text-[var(--pink-500)]">Mic</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/75">
            Karaoke that rewards the words you actually sing. Blurred lyrics reveal as you nail them, and every note is
            scored fairly - solo, duet, or live with friends.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            leftIcon={LogIn}
            onClick={() =>
              toast("Google sign-in arrives in Phase 2 - button, API route and httpOnly cookie session.", "info")
            }
          >
            Continue with Google
          </Button>
          <Button size="lg" variant="ghost" leftIcon={Palette} onClick={() => navigate("/design")}>
            Explore the design system
          </Button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
          Solo - Collab Rooms - Duets - Daily Challenge
        </p>
      </section>

      <section className="grid w-full gap-4 sm:grid-cols-3" aria-label="Game features">
        {FEATURES.map((feature) => (
          <GlassCard key={feature.title} className="p-6 text-left">
            <feature.icon size={22} className="text-[var(--pink-300)]" aria-hidden="true" />
            <h2 className="mt-4 text-base font-bold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.body}</p>
          </GlassCard>
        ))}
      </section>

      <section className="glass w-full p-6 md:p-8" aria-label="Headphone requirement">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Headphones required for ranked play</h2>
            <p className="mt-1 text-sm text-white/70">
              Speaker bleed ruins pitch scoring, so a headphone check runs before every ranked attempt.
            </p>
          </div>
          <Link
            to="/design"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-300)] hover:text-white"
          >
            See the components
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
