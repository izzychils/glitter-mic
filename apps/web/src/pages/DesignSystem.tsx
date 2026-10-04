import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
  Flame,
  Gauge,
  Heart,
  Layers,
  Mic,
  Music,
  Palette,
  Sliders,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Type,
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { GlitterMic } from "../components/GlitterMic";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Tabs } from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import { useSettings, type Difficulty } from "../store/settings";

const SWATCHES = [
  { name: "pink-500", cssVar: "--pink-500", hex: "#ff4f9a" },
  { name: "pink-300", cssVar: "--pink-300", hex: "#ff9cc7" },
  { name: "pink-100", cssVar: "--pink-100", hex: "#ffe3ef" },
  { name: "red-500", cssVar: "--red-500", hex: "#ef233c" },
  { name: "red-600", cssVar: "--red-600", hex: "#d90429" },
  { name: "blue-500", cssVar: "--blue-500", hex: "#2b6fff" },
  { name: "blue-300", cssVar: "--blue-300", hex: "#8ab4ff" },
  { name: "blue-900", cssVar: "--blue-900", hex: "#0b1b4d" },
  { name: "ink", cssVar: "--ink", hex: "#14102b" },
] as const;

const CATEGORIES = ["Pop", "Afrobeats", "Gospel", "Amapiano", "Hip-Hop", "Throwbacks"] as const;

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "pro"];

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <GlassCard className="p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
          <Icon size={18} className="text-[var(--pink-300)]" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </GlassCard>
  );
}

export function DesignSystem() {
  const { toast } = useToast();
  const [category, setCategory] = useState<string>("Afrobeats");
  const [tab, setTab] = useState("sing");
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(true);

  const difficulty = useSettings((state) => state.difficulty);
  const setDifficulty = useSettings((state) => state.setDifficulty);
  const keyInvariant = useSettings((state) => state.keyInvariant);
  const setKeyInvariant = useSettings((state) => state.setKeyInvariant);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-24 pt-10">
      <div className="flex flex-col gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to landing
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Design System</h1>
          <p className="mt-1 text-sm text-white/65">
            Flat solid colors, glass surfaces, motion with purpose. Icons only - no emojis anywhere.
          </p>
        </div>
      </div>

      <Section icon={Palette} title="Palette">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <div key={swatch.cssVar} className="overflow-hidden rounded-2xl border border-white/20">
              <div className="h-16" style={{ backgroundColor: `var(${swatch.cssVar})` }} />
              <div className="bg-white/5 px-3 py-2">
                <p className="text-xs font-bold text-white">{swatch.name}</p>
                <p className="text-[11px] text-white/55">{swatch.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Layers} title="Glass surfaces">
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 transition-transform duration-200 hover:-translate-y-1">
            <h3 className="text-sm font-bold text-white">GlassCard</h3>
            <p className="mt-1 text-sm text-white/70">
              Translucent white fill, 1px border, backdrop blur and an inset top highlight. Hover lifts the card.
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-white">Surface tokens</h3>
            <p className="mt-1 text-sm text-white/70">
              Radius 24px, 8px spacing scale. All tokens come from the CSS variables above.
            </p>
            <div className="mt-4 flex gap-2">
              {["rounded-2xl", "rounded-3xl"].map((radius) => (
                <span key={radius} className={`${radius} bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80`}>
                  {radius}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </Section>

      <Section icon={MousePointerIcon} title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button leftIcon={Music}>Primary</Button>
          <Button variant="secondary" leftIcon={Gauge}>
            Secondary
          </Button>
          <Button variant="danger" leftIcon={Flame}>
            Danger
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" leftIcon={Check}>
            Small
          </Button>
          <Button size="md">Medium</Button>
          <Button size="lg" leftIcon={Sparkles}>
            Large
          </Button>
        </div>
      </Section>

      <Section icon={Star} title="Chips">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Chip key={item} label={item} selected={category === item} onClick={() => setCategory(item)} />
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55">Selected category: {category}</p>
      </Section>

      <Section icon={Type} title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Display name" placeholder="GlitterSinger" />
          <Input label="Search" hint="Type a song, artist or lyric." placeholder="Search songs" />
          <Input label="Email" error="That email is already linked to another account." defaultValue="singer@" />
          <Input label="Disabled" placeholder="Not editable" disabled />
        </div>
      </Section>

      <Section icon={Music} title="Tabs">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "sing", label: "Sing", icon: Mic },
            { id: "scores", label: "Scores", icon: Trophy },
            { id: "daily", label: "Daily", icon: Timer },
          ]}
        />
        <p className="mt-4 text-sm text-white/70">
          {tab === "sing" ? "Pick a song and start singing." : tab === "scores" ? "Leaderboards live here." : "One ranked attempt per day."}
        </p>
      </Section>

      <Section icon={Gauge} title="Progress">
        <div className="space-y-5">
          <ProgressBar value={0.92} label="Lyrics" tone="pink" />
          <ProgressBar value={0.68} label="Pitch" tone="blue" />
          <ProgressBar value={0.41} label="Timing" tone="red" />
        </div>
      </Section>

      <Section icon={Sparkles} title="Modal and toasts">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="ghost" onClick={() => toast("Nothing to worry about - this is a demo toast.", "info")}>
            Info toast
          </Button>
          <Button variant="ghost" onClick={() => toast("Score saved to your profile.", "success")}>
            Success toast
          </Button>
          <Button variant="ghost" onClick={() => toast("Microphone permission was denied.", "danger")}>
            Danger toast
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Leave the room?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Stay
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setModalOpen(false);
                  toast("Room scuttled. Everyone got the boot.", "danger");
                }}
              >
                Leave room
              </Button>
            </>
          }
        >
          Your pick will be lost and the room keeps singing without you.
        </Modal>
      </Section>

      <Section icon={Mic} title="Glitter mic">
        <div className="flex flex-wrap items-center gap-8">
          <GlitterMic active={active} />
          <div className="space-y-3">
            <GlitterMic />
            <Button variant="secondary" size="sm" onClick={() => setActive((value) => !value)}>
              {active ? "Stop pulsing" : "Start pulsing"}
            </Button>
          </div>
        </div>
      </Section>

      <Section icon={Sliders} title="Gameplay settings (Zustand)">
        <div className="flex flex-wrap items-center gap-3">
          {DIFFICULTIES.map((item) => (
            <Chip key={item} label={item} selected={difficulty === item} onClick={() => setDifficulty(item)} />
          ))}
          <Chip
            label="Key-invariant"
            icon={keyInvariant ? Check : Heart}
            selected={keyInvariant}
            onClick={() => setKeyInvariant(!keyInvariant)}
          />
        </div>
        <p className="mt-3 text-xs text-white/55">
          Difficulty {difficulty} - key-invariant {keyInvariant ? "on" : "off"}. Persisted to localStorage.
        </p>
      </Section>
    </main>
  );
}

/** Kept as a variable so the section list stays readable. */
const MousePointerIcon: LucideIcon = Sparkles;
