import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, Volume2, Mic, X, Music } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LyricsPanel } from "../components/LyricsPanel";
import { useLyrics } from "../hooks/useLyrics";
import { sessionFetch } from "../lib/session";
import { getLrcForSong } from "../data/demo-lyrics";

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
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Use lyrics hook for LRC parsing and sync
  const { lines, currentLineIndex } = useLyrics(lrcContent || "", currentTime);

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

      // Try to fetch song details for better data, but don't fail if it 404s
      try {
        const songResponse = await sessionFetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/${songId}`
        );

        if (songResponse.ok) {
          const songData = await songResponse.json();
          setSong(songData);
        } else {
          // Use data from URL params as fallback (we have everything we need)
          setSong({
            id: songId!,
            title: songTitle || "Unknown Title",
            artist: songArtist || "Unknown Artist",
            imageUrl: null,
          });
        }
      } catch (error) {
        // Fallback to URL params if detail endpoint fails
        console.log("Using URL params for song data");
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

      // Fetch LRC lyrics if available, otherwise use demo data
      try {
        const lyricsResponse = await sessionFetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/songs/${songId}/lyrics`
        );

        if (lyricsResponse.ok) {
          const lyricsData = await lyricsResponse.json();
          // Check if lyrics are actually available (not null or empty)
          if (lyricsData.lyrics && lyricsData.lyrics.trim().length > 0) {
            setLrcContent(lyricsData.lyrics);
          } else {
            console.log("Lyrics endpoint returned null, using demo lyrics data");
            setLrcContent(getLrcForSong(songId!));
          }
        } else {
          console.log("Using demo lyrics data");
          setLrcContent(getLrcForSong(songId!));
        }
      } catch (error) {
        console.log("No lyrics available, using demo data");
        setLrcContent(getLrcForSong(songId!));
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleEnd = () => {
    setIsPlaying(false);
    if (isRecording) {
      stopRecording();
    }
    toast("Performance complete! 🎤", "success");
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (isRecording) {
      stopRecording();
    }
    navigate("/game");
  };

  const startGame = () => {
    if (!audioRef.current) return;

    setIsRecording(true);
    
    // Lower audio volume for karaoke mode
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      setVolume(0.3);
    }

    // Start from beginning
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    
    // Play audio
    audioRef.current.play();
    setIsPlaying(true);

    toast("🎤 Recording started! Sing along!", "success");
    
    // TODO: Initialize microphone recording
    // TODO: Initialize pitch detection
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Restore full audio volume
    if (audioRef.current) {
      audioRef.current.volume = 1;
      setVolume(1);
    }

    toast("Recording stopped", "success");
    
    // TODO: Stop microphone recording
    // TODO: Calculate and display score
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
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-blood-pink/20 px-3 py-1 text-xs font-semibold text-blood-pink">
                {mode || "Solo Performance"}
              </span>
              {isRecording && (
                <span className="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400"></span>
                  Recording
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">{songTitle || song?.title}</h1>
            <p className="text-white/60">{songArtist || song?.artist}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExit} leftIcon={X}>
            Exit
          </Button>
        </div>

        {/* Side-by-side Layout: Music Player (left) + Lyrics Panel (right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side: Music Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Album Art / Visualization */}
            <div className="rounded-2xl border border-white/10 bg-navy-lighter/90 p-8 shadow-xl">
              <div className="mb-6 flex justify-center">
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
              <div className="mb-4 flex items-center justify-center gap-4">
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
                  disabled={isRecording}
                >
                  Restart
                </Button>

                <button
                  onClick={togglePlayPause}
                  disabled={isRecording}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blood-pink to-blood-red shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <Pause size={28} className="text-white" fill="white" />
                  ) : (
                    <Play size={28} className="text-white" fill="white" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 size={20} className="text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    disabled={isRecording}
                    className="h-2 w-20 cursor-pointer appearance-none rounded-lg bg-white/10"
                  />
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center gap-3">
                {!isRecording ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startGame}
                    leftIcon={Mic}
                    className="w-full"
                  >
                    Start Karaoke
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={stopRecording}
                    className="w-full"
                  >
                    Stop & Show Score
                  </Button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-white/10 bg-navy-light/80 p-4 text-center text-sm text-white/50">
              {!isRecording ? (
                <>🎤 Click "Start Karaoke" to begin recording your performance!</>
              ) : (
                <>🎵 Sing along! Your pitch and timing are being scored in real-time.</>
              )}
            </div>
          </motion.div>

          {/* Right Side: Lyrics Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <LyricsPanel
              lines={lines}
              currentLineIndex={currentLineIndex}
              isRecording={isRecording}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
