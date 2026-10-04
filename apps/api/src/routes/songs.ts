import { Router } from "express";
import { epidemicService, type EpidemicTrack } from "../lib/epidemic";
import { generateLrcFromAudio } from "../lib/deepgram";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Transform Epidemic Sound track to our unified format
 */
function transformEpidemicTrack(track: EpidemicTrack) {
  return {
    id: track.id,
    title: track.title,
    artist: [...track.mainArtists, ...track.featuredArtists].join(", "),
    duration: track.length,
    bpm: track.bpm,
    imageUrl: track.images.M || track.images.default,
    waveformUrl: track.waveformUrl,
    hasVocals: track.hasVocals,
    isExplicit: track.isExplicit,
    moods: track.moods.map((m) => m.name),
    genres: track.genres.map((g) => g.name),
    added: track.added,
  };
}

/**
 * GET /api/songs
 * Search songs from Epidemic Sound
 */
router.get("/", async (req, res) => {
  try {
    const { search, limit = "20" } = req.query;

    if (!search || typeof search !== "string") {
      return res.status(400).json({
        error: "Missing search query",
        message: "Please provide a search query",
      });
    }

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 60);
    const userId = req.session.userId;
    
    const { tracks, total } = await epidemicService.searchTracks(search, limitNum, userId);

    res.json({
      tracks: tracks.map(transformEpidemicTrack),
      total: tracks.length,
      totalResults: total,
    });
  } catch (error: any) {
    logger.error("Failed to search songs", error);

    res.status(500).json({
      error: "Failed to search songs",
      message: "Could not search Epidemic Sound catalog",
    });
  }
});

/**
 * GET /api/songs/featured
 * Get featured tracks (popular songs with guaranteed full-length audio)
 * IMPORTANT: This must be before /:id route to avoid "featured" being treated as an ID
 */
router.get("/featured", async (req, res) => {
  try {
    const { limit = "20" } = req.query;
    const userId = req.session.userId;

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 60);
    const { tracks, total } = await epidemicService.getFeaturedTracks(limitNum, userId);

    logger.info("Featured tracks fetched", { 
      count: tracks.length, 
      firstTrackId: tracks[0]?.id,
      firstTrackTitle: tracks[0]?.title 
    });

    res.json({
      tracks: tracks.map(transformEpidemicTrack),
      totalResults: total,
    });
  } catch (error) {
    logger.error("Failed to fetch featured songs", error);
    res.status(500).json({
      error: "Failed to fetch featured songs",
      message: "Could not load featured tracks",
    });
  }
});

/**
 * GET /api/songs/:id
 * Get detailed info about a specific song from Epidemic Sound
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const track = await epidemicService.getTrack(id, userId);

    res.json(transformEpidemicTrack(track));
  } catch (error: any) {
    logger.error("Failed to fetch song details", { trackId: req.params.id, error });

    res.status(404).json({
      error: "Song not found",
      message: "The requested song could not be found on Epidemic Sound",
    });
  }
});

/**
 * GET /api/songs/:id/download
 * Get download URL for a song
 */
router.get("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "mp3", quality = "high" } = req.query;
    const userId = req.session.userId;

    const downloadData = await epidemicService.getDownloadUrl(
      id,
      format as "mp3" | "wav",
      quality as "normal" | "high",
      userId
    );

    res.json(downloadData);
  } catch (error) {
    logger.error("Failed to get download URL", { trackId: req.params.id, error });
    res.status(500).json({
      error: "Failed to get download URL",
      message: "Could not generate download link",
    });
  }
});

/**
 * GET /api/songs/:id/stream
 * Get streaming URL for a song
 */
router.get("/:id/stream", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const streamData = await epidemicService.getStreamingUrl(id, userId);

    res.json(streamData);
  } catch (error) {
    logger.error("Failed to get streaming URL", { trackId: req.params.id, error });
    res.status(500).json({
      error: "Failed to get streaming URL",
      message: "Could not generate streaming link",
    });
  }
});

/**
 * GET /api/songs/:id/lyrics
 * Get lyrics for a song
 */
router.get("/:id/lyrics", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const lyrics = await epidemicService.getLyrics(id, userId);

    res.json({ lyrics });
  } catch (error) {
    logger.error("Failed to get lyrics", { trackId: req.params.id, error });
    res.json({ lyrics: null });
  }
});

/**
 * POST /api/songs/:id/lyrics/generate
 * Generate LRC lyrics from audio using Deepgram transcription
 * This is an async operation that downloads the audio and transcribes it
 */
router.post("/:id/lyrics/generate", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    logger.info("Generating LRC lyrics with Deepgram", { trackId: id });

    // Get streaming URL for the audio
    const streamData = await epidemicService.getStreamingUrl(id, userId);
    
    if (!streamData.url) {
      return res.status(400).json({
        error: "No audio URL available",
        message: "Could not get audio URL for transcription",
      });
    }

    // Generate LRC from audio using Deepgram
    const lrcLyrics = await generateLrcFromAudio(streamData.url);

    // TODO: Cache in database
    // await db.query("INSERT INTO lyrics_cache (track_id, lrc, generated_at) VALUES ($1, $2, NOW()) ON CONFLICT (track_id) DO UPDATE SET lrc = $2, generated_at = NOW()", [id, lrcLyrics]);

    logger.info("LRC generated successfully", { trackId: id, linesCount: lrcLyrics.split("\n").length });

    res.json({ 
      lyrics: lrcLyrics,
      generated: true,
    });
  } catch (error) {
    logger.error("Failed to generate LRC lyrics", { trackId: req.params.id, error });
    res.status(500).json({
      error: "Failed to generate lyrics",
      message: error instanceof Error ? error.message : "Could not generate LRC from audio",
    });
  }
});

export default router;
