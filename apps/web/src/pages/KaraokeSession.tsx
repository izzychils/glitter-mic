import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, Volume2, Mic, X, Music } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { sessionFetch } from "../lib/session";

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  waveformUrl?: string;
}

export function KaraokeSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const songId = searchParams.get("songId");
  const songTitle = searchParams.get("title");
  const songArtist = searchParams.get("artist");
  const mode = searchParams.get("mode");

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!songId) {
      toast("No song selected", "error");
      navigate("/game");
      return;
    }

    loadSongData();
  }, [songId]);

  const loadSongData = async () => {
    try {
      setLoading(true);

      // Try to fetch song details, but fall back to URL params if it fails
      try {
        const songResponse = await sessionFetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/${songId}`
        );

        if (songResponse.ok) {
          const songData = await songResponse.json();
          setSong(songData);
        } else {
          // Use data from URL params as fallback
          setSong({
            id: songId!,
            title: songTitle || "Unknown Title",
            artist: songArtist || "Unknown Artist",
            imageUrl: null,
          });
        }
      } catch (error) {
        console.warn("Could not fetch song details, using URL params:", error);
        setSong({
          id: songId!,
          title: songTitle || "Unknown Title",
          artist: songArtist || "Unknown Artist",
          imageUrl: null,
        });
      }

      // Fetch streaming URL
      const streamResponse = await sessionFetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/${songId}/stream`
      );

      if (!streamResponse.ok) throw new Error("Failed to get stream URL");

      const streamData = await streamResponse.json();
      setStreamUrl(streamData.url);

      // Fetch lyrics if available
      try {
        const lyricsResponse = await sessionFetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/${songId}/lyrics`
        );

        if (lyricsResponse.ok) {
          const lyricsData = await lyricsResponse.json();
          setLyrics(lyricsData.lyrics);
        }
      } catch (error) {
        console.log("No lyrics available");
      }
    } catch (error) {
      console.error("Failed to load song data:", error);
      toast("Failed to load song. Please try again.", "error");
      navigate("/game");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    toast("Performance complete! 🎤", "success");
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    navigate("/game");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading your performance..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-blood-pink/20 px-3 py-1 text-xs font-semibold text-blood-pink">
                {mode || "Performance"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">{songTitle || song?.title}</h1>
            <p className="text-white/60">{songArtist || song?.artist}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExit} leftIcon={X}>
            Exit
          </Button>
        </div>

        {/* Main Performance Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-white/10 bg-navy-lighter/90 p-8 shadow-xl"
        >
          {/* Album Art / Visualization */}
          <div className="mb-8 flex justify-center">
            {song?.imageUrl ? (
              <img
                src={song.imageUrl}
                alt={song.title}
                className="h-64 w-64 rounded-xl object-cover shadow-2xl"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-gradient-to-br from-blood-pink to-blood-red shadow-2xl">
                <Music size={80} className="text-white/50" />
              </div>
            )}
          </div>

          {/* Lyrics Display */}
          {lyrics ? (
            <div className="mb-8 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-navy-dark p-6">
              <pre className="whitespace-pre-wrap text-center text-lg leading-relaxed text-white/80">
                {lyrics}
              </pre>
            </div>
          ) : (
            <div className="mb-8 rounded-xl border border-white/10 bg-navy-dark p-6 text-center">
              <Mic className="mx-auto mb-2 h-8 w-8 text-white/30" />
              <p className="text-sm text-white/50">Instrumental track - no lyrics available</p>
            </div>
          )}

          {/* Audio Player */}
          {streamUrl && (
            <audio
              ref={audioRef}
              src={streamUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnd}
            />
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
              style={{
                background: `linear-gradient(to right, #FF1744 0%, #FF1744 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              leftIcon={SkipBack}
            >
              Restart
            </Button>

            <button
              onClick={togglePlayPause}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blood-pink to-blood-red shadow-lg transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={28} className="text-white" fill="white" /> : <Play size={28} className="text-white" fill="white" />}
            </button>

            <Button variant="ghost" size="sm" leftIcon={Volume2}>
              Volume
            </Button>
          </div>
        </motion.div>

        {/* Tips */}
        <div className="rounded-xl border border-white/10 bg-navy-light/80 p-4 text-center text-sm text-white/50">
          🎤 Sing along and have fun! Your performance will be scored when complete.
        </div>
      </div>
    </div>
  );
}
