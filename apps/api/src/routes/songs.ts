import { Router } from "express";
import { spotifyService, type SpotifyTrack } from "../lib/spotify";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Transform Spotify track to our unified format
 */
function transformSpotifyTrack(track: SpotifyTrack) {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    artistId: track.artists[0]?.id,
    album: track.album.name,
    duration: Math.floor(track.duration_ms / 1000),
    audioUrl: track.preview_url, // 30-second preview
    imageUrl: track.album.images[0]?.url || null,
    spotifyUrl: track.external_urls.spotify,
    hasPreview: track.preview_url !== null,
  };
}

/**
 * GET /api/songs
 * Search and browse songs from Spotify
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

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 50);
    const { tracks, totalResults } = await spotifyService.searchTracks(search, limitNum);

    res.json({
      tracks: tracks.map(transformSpotifyTrack),
      total: tracks.length,
      totalResults, // Total results in Spotify (before preview filtering)
    });
  } catch (error: any) {
    logger.error("Failed to search songs", error);

    // Handle rate limiting
    if (error.message?.includes("Rate limited")) {
      return res.status(429).json({
        error: "Too many requests",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to search songs",
      message: "Could not search Spotify catalog",
    });
  }
});

/**
 * GET /api/songs/:id
 * Get detailed info about a specific song from Spotify
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const track = await spotifyService.getTrack(id);

    res.json(transformSpotifyTrack(track));
  } catch (error: any) {
    logger.error("Failed to fetch song details", { trackId: req.params.id, error });

    res.status(404).json({
      error: "Song not found",
      message: "The requested song could not be found on Spotify",
    });
  }
});

/**
 * GET /api/songs/meta/popular
 * Get popular/trending songs
 */
router.get("/meta/popular", async (req, res) => {
  try {
    const { genre, limit = "20" } = req.query;

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 50);
    const { tracks, totalResults } = await spotifyService.getPopularTracks(genre as string | undefined, limitNum);

    res.json({
      tracks: tracks.map(transformSpotifyTrack),
      genre: genre || "all",
      totalResults,
    });
  } catch (error) {
    logger.error("Failed to fetch popular songs", error);
    res.status(500).json({
      error: "Failed to fetch popular songs",
      message: "Could not load trending tracks",
    });
  }
});

/**
 * GET /api/songs/featured
 * Get featured tracks (popular songs with guaranteed previews)
 */
router.get("/featured", async (req, res) => {
  try {
    const { limit = "20" } = req.query;

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 50);
    const { tracks, totalResults } = await spotifyService.getFeaturedTracks(limitNum);

    res.json({
      tracks: tracks.map(transformSpotifyTrack),
      totalResults,
    });
  } catch (error) {
    logger.error("Failed to fetch featured songs", error);
    res.status(500).json({
      error: "Failed to fetch featured songs",
      message: "Could not load featured tracks",
    });
  }
});

export default router;
