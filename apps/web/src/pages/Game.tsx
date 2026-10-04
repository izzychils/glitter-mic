import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Music, Users, Trophy, LogOut, Search, Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface User {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
}

export function Game() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      toast("Failed to load user data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");

      toast("Logged out successfully", "success");
      window.location.reload();
    } catch (error) {
      toast("Failed to logout", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading your profile..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blood-pink to-blood-red bg-clip-text text-transparent">
                {user?.display_name || user?.username}
              </span>
            </h1>
            <p className="mt-1 text-sm text-white/60 md:text-base">Ready to hit the high notes?</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={LogOut}>
            Logout
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mb-8 md:gap-4"
        >
          <ActionCard
            icon={Mic}
            title="Solo Performance"
            description="Sing alone and perfect your score"
            delay={0.1}
          />
          <ActionCard
            icon={Users}
            title="Collab Room"
            description="Join up to 8 friends"
            delay={0.15}
          />
          <ActionCard
            icon={Music}
            title="Duet Mode"
            description="Sing together with a partner"
            delay={0.2}
          />
          <ActionCard
            icon={Trophy}
            title="Daily Challenge"
            description="Compete for top scores"
            delay={0.25}
          />
        </motion.div>

        {/* Song Selection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-2xl border border-white/10 bg-navy-lighter/90 p-6 shadow-xl md:mb-8 md:p-8"
        >
          <h2 className="mb-6 text-xl font-bold text-white md:text-2xl">Choose Your Song</h2>

          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search songs, artists..."
                className="h-12 w-full rounded-xl border border-white/20 bg-navy-dark pl-12 pr-4 text-sm text-white placeholder:text-white/40 transition-all focus:border-blood-pink focus:outline-none focus:ring-2 focus:ring-blood-pink/50 md:h-14 md:text-base"
              />
            </div>
            <Button size="lg" leftIcon={Search}>
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>

          {/* Song List */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-navy-dark p-4 transition-all hover:border-blood-pink/50 hover:bg-navy-light"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blood-pink to-blood-red shadow-lg md:h-16 md:w-16">
                  <Music size={24} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold text-white">Song Title {i}</h4>
                  <p className="truncate text-sm text-white/60">Artist Name</p>
                </div>
                <Button size="sm" leftIcon={Play} className="shrink-0">
                  <span className="hidden sm:inline">Select</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-navy-dark/50 p-6 text-center">
            <Music className="mx-auto mb-3 h-12 w-12 text-white/30" />
            <p className="text-sm text-white/50">Song library integration coming soon...</p>
            <p className="mt-1 text-xs text-white/30">Powered by Jamendo Music</p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-3 sm:grid-cols-3 md:gap-4"
        >
          <StatCard label="Songs Completed" value="0" delay={0.4} />
          <StatCard label="Highest Score" value="0" delay={0.45} />
          <StatCard label="Level" value="1" delay={0.5} />
        </motion.div>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group rounded-xl border border-white/10 bg-navy-light/80 p-5 text-left transition-all hover:scale-[1.02] hover:border-blood-pink/50 hover:bg-navy-light hover:shadow-xl hover:shadow-blood-pink/10 md:p-6"
    >
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blood-pink to-blood-red shadow-lg transition-transform group-hover:scale-110">
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="mb-1 font-bold text-white md:text-lg">{title}</h3>
      <p className="text-xs text-white/60 md:text-sm">{description}</p>
    </motion.button>
  );
}

// Stat Card Component
function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/10 bg-navy-light/80 p-6 text-center"
    >
      <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-blood-pink to-blood-red bg-clip-text text-transparent md:text-4xl">
        {value}
      </div>
      <div className="text-sm text-white/60">{label}</div>
    </motion.div>
  );
}
