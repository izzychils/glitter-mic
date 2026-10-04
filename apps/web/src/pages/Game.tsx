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

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl: string | null;
  audioUrl: string | null;
  hasPreview: boolean;
}

type Genre = 
  | "pop" 
  | "rock" 
  | "hip-hop" 
  | "r&b" 
  | "country" 
  | "jazz" 
  | "electronic" 
  | "indie"
  | "latin"
  | "all";

const GENRES: { value: Genre; label: string }[] = [
  { value: "all", label: "All Genres" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "r&b", label: "R&B" },
  { value: "country", label: "Country" },
  { value: "electronic", label: "Electronic" },
  { value: "indie", label: "Indie" },
  { value: "jazz", label: "Jazz" },
  { value: "latin", label: "Latin" },
];

export function Game() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("all");
  const [songs, setSongs] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{ total: number; totalResults: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    loadFeaturedSongs(); // Load popular songs on mount
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

  const loadFeaturedSongs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/featured?limit=20`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load featured songs");

      const data = await response.json();
      if (data.tracks.length > 0) {
        setSongs(data.tracks);
        setSearchStats({ total: data.tracks.length, totalResults: data.totalResults });
      }
    } catch (error) {
      console.error("Failed to load featured songs:", error);
      // Don't show error toast - just silently fail and let user search
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast("Please enter a search query", "info");
      return;
    }

    setSearching(true);
    setSongs([]);
    setSearchStats(null);

    try {
      // Build search query with genre filter
      let finalQuery = searchQuery;
      if (selectedGenre !== "all") {
        finalQuery = `${searchQuery} genre:${selectedGenre}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs?search=${encodeURIComponent(finalQuery)}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSongs(data.tracks);
      setSearchStats({ total: data.total, totalResults: data.totalResults });

      if (data.total === 0 && data.totalResults > 0) {
        // Found songs but none have previews
        toast(
          `Found ${data.totalResults} songs, but none have previews. Try searching for specific song titles like "7 rings" or "thank u, next"!`,
          "info"
        );
      } else if (data.total === 0) {
        // No songs found at all
        toast("No songs found. Try a different search term or artist!", "info");
      }
    } catch (error) {
      toast("Failed to search songs. Please try again.", "error");
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    toast(`${mode} mode selected! Search for a song to start.`, "success");
  };

  const handleSongSelect = (song: Song) => {
    if (!selectedMode) {
      toast("Please select a game mode first", "info");
      return;
    }

    toast(`Starting ${selectedMode} with "${song.title}"...`, "info");
    // TODO: Navigate to game session
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
            isSelected={selectedMode === "Solo Performance"}
            onClick={() => handleModeSelect("Solo Performance")}
          />
          <ActionCard
            icon={Users}
            title="Collab Room"
            description="Join up to 8 friends"
            delay={0.15}
            isSelected={selectedMode === "Collab Room"}
            onClick={() => handleModeSelect("Collab Room")}
          />
          <ActionCard
            icon={Music}
            title="Duet Mode"
            description="Sing together with a partner"
            delay={0.2}
            isSelected={selectedMode === "Duet Mode"}
            onClick={() => handleModeSelect("Duet Mode")}
          />
          <ActionCard
            icon={Trophy}
            title="Daily Challenge"
            description="Compete for top scores"
            delay={0.25}
            isSelected={selectedMode === "Daily Challenge"}
            onClick={() => handleModeSelect("Daily Challenge")}
          />
        </motion.div>

        {/* Song Selection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-2xl border border-white/10 bg-navy-lighter/90 p-6 shadow-xl md:mb-8 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {songs.length > 0 && !searchQuery ? "Featured Songs" : "Choose Your Song"}
            </h2>
            {songs.length > 0 && !searchQuery && (
              <span className="text-xs text-white/50">Popular tracks with previews</span>
            )}
          </div>

          {/* Search Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 w-full rounded-xl border border-white/20 bg-navy-dark pl-12 pr-4 text-sm text-white placeholder:text-white/40 transition-all focus:border-blood-pink focus:outline-none focus:ring-2 focus:ring-blood-pink/50 md:h-14 md:text-base"
              />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as Genre)}
              className="h-12 rounded-xl border border-white/20 bg-navy-dark px-4 text-sm text-white transition-all focus:border-blood-pink focus:outline-none focus:ring-2 focus:ring-blood-pink/50 md:h-14 md:text-base"
            >
              {GENRES.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="mb-6">
            <Button 
              size="lg" 
              leftIcon={Search} 
              onClick={handleSearch} 
              disabled={searching}
              fullWidth
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Song List */}
          {searching ? (
            <div className="py-12 text-center">
              <LoadingSpinner message="Searching Spotify..." size="sm" />
            </div>
          ) : songs.length > 0 ? (
            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-navy-dark p-4 transition-all hover:border-blood-pink/50 hover:bg-navy-light"
                >
                  {song.imageUrl ? (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover shadow-lg md:h-16 md:w-16"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blood-pink to-blood-red shadow-lg md:h-16 md:w-16">
                      <Music size={24} className="text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-white">{song.title}</h4>
                    <p className="truncate text-sm text-white/60">{song.artist}</p>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={Play}
                    className="shrink-0"
                    onClick={() => handleSongSelect(song)}
                  >
                    <span className="hidden sm:inline">Select</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-navy-dark/50 p-6 text-center">
              <Music className="mx-auto mb-3 h-12 w-12 text-white/30" />
              {searchStats && searchStats.totalResults > 0 ? (
                <>
                  <p className="text-sm text-white/50">
                    Found {searchStats.totalResults} songs on Spotify, but none have 30-second previews available.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blood-pink">
                    💡 Try searching for specific song titles instead:
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-white/40">
                    <p>• "7 rings" instead of "ariana grande"</p>
                    <p>• "positions" by Ariana Grande</p>
                    <p>• Recent chart hits usually have previews</p>
                  </div>
                </>
              ) : searchQuery ? (
                <>
                  <p className="text-sm text-white/50">
                    No songs found. Try a different search term!
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blood-pink">
                    Search tips:
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-white/40">
                    <p>• Use song titles: "Blinding Lights", "Shape of You"</p>
                    <p>• Try artist + song: "The Weeknd Starboy"</p>
                    <p>• Popular songs have better preview availability</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-white/50">
                    Search for songs to get started. Popular songs usually have 30-second previews.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blood-pink">
                    Try these popular searches:
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-white/40">
                    <p>• "Blinding Lights" • "Levitating" • "Anti-Hero"</p>
                    <p>• "As It Was" • "Flowers" • "Cruel Summer"</p>
                  </div>
                </>
              )}
              <p className="mt-4 text-xs text-white/30">Powered by Spotify</p>
            </div>
          )}
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
  isSelected,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`group rounded-xl border p-5 text-left transition-all hover:scale-[1.02] hover:shadow-xl md:p-6 ${
        isSelected
          ? "border-blood-pink bg-blood-pink/10 shadow-lg shadow-blood-pink/20"
          : "border-white/10 bg-navy-light/80 hover:border-blood-pink/50 hover:bg-navy-light hover:shadow-blood-pink/10"
      }`}
    >
      <div
        className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-lg transition-transform group-hover:scale-110 ${
          isSelected ? "bg-gradient-to-br from-blood-pink to-blood-red scale-110" : "bg-gradient-to-br from-blood-pink to-blood-red"
        }`}
      >
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
