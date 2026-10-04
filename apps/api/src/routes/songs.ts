import { Router } from "express";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const router = Router();

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  album_name: string;
  album_id: string;
  duration: number;
  audio: string;
  audiodownload: string;
  image: string;
  license_ccurl: string;
}

/**
 * GET /api/songs
 * Search and browse songs from Jamendo
 */
router.get("/", async (req, res) => {
  try {
    const { search, limit = "20", offset = "0" } = req.query;

    const params = new URLSearchParams({
      client_id: env.JAMENDO_CLIENT_ID,
      format: "json",
      limit: limit as string,
      offset: offset as string,
      audioformat: "mp32",
      include: "musicinfo",
    });

    if (search) {
      params.set("search", search as string);
    } else {
      // Default: popular tracks
      params.set("order", "popularity_total");
    }

    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.statusText}`);
    }

    const data: any = await response.json();

    const tracks = data.results.map((track: JamendoTrack) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      album: track.album_name,
      albumId: track.album_id,
      duration: track.duration,
      audioUrl: track.audio,
      downloadUrl: track.audiodownload,
      imageUrl: track.image,
      licenseUrl: track.license_ccurl,
    }));

    res.json({
      tracks,
      total: data.headers.results_count,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    logger.error("Failed to fetch songs", error);
    res.status(500).json({
      error: "Failed to fetch songs",
      message: "Could not load songs from Jamendo",
    });
  }
});

/**
 * GET /api/songs/:id
 * Get detailed info about a specific song
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const params = new URLSearchParams({
      client_id: env.JAMENDO_CLIENT_ID,
      format: "json",
      id,
      audioformat: "mp32",
      include: "musicinfo+lyrics",
    });

    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.statusText}`);
    }

    const data: any = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({
        error: "Song not found",
        message: "The requested song could not be found",
      });
    }

    const track = data.results[0];

    res.json({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      album: track.album_name,
      albumId: track.album_id,
      duration: track.duration,
      audioUrl: track.audio,
      downloadUrl: track.audiodownload,
      imageUrl: track.image,
      licenseUrl: track.license_ccurl,
      musicinfo: track.musicinfo,
      lyrics: track.lyrics || null,
    });
  } catch (error) {
    logger.error("Failed to fetch song details", error);
    res.status(500).json({
      error: "Failed to fetch song details",
      message: "Could not load song information",
    });
  }
});

/**
 * GET /api/songs/genres
 * Get available music genres
 */
router.get("/meta/genres", async (_req, res) => {
  try {
    const params = new URLSearchParams({
      client_id: env.JAMENDO_CLIENT_ID,
      format: "json",
    });

    const response = await fetch(`${JAMENDO_API_BASE}/tracks/genres/?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.statusText}`);
    }

    const data: any = await response.json();

    res.json({
      genres: data.results,
    });
  } catch (error) {
    logger.error("Failed to fetch genres", error);
    res.status(500).json({
      error: "Failed to fetch genres",
      message: "Could not load music genres",
    });
  }
});

export default router;
