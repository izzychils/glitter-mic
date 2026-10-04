import axios, { AxiosError } from "axios";
import { env } from "./env";
import { logger } from "./logger";

const EPIDEMIC_API_BASE = "https://partner-content-api.epidemicsound.com/v0";

interface EpidemicTrack {
  id: string;
  title: string;
  mainArtists: string[];
  featuredArtists: string[];
  bpm: number;
  length: number; // in seconds
  moods: Array<{ id: string; name: string }>;
  genres: Array<{
    id: string;
    name: string;
    parent?: { id: string; name: string };
  }>;
  images: {
    default: string;
    XS?: string;
    S?: string;
    M?: string;
    L?: string;
  };
  waveformUrl: string;
  isExplicit: boolean;
  hasVocals: boolean;
  added: string;
  isPreviewOnly: boolean;
  tierOption: string;
}

interface EpidemicSearchResponse {
  tracks: EpidemicTrack[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
  };
  links: {
    next: string | null;
    prev: string | null;
  };
}

interface EpidemicDownloadResponse {
  url: string;
  expires: string;
}

interface EpidemicLyricsResponse {
  lyrics: string | null;
}

class EpidemicSoundService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = env.EPIDEMIC_SOUND_API_KEY;
    this.baseURL = EPIDEMIC_API_BASE;
  }

  private getHeaders(userId?: string) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
    
    if (userId) {
      headers["x-partner-user-id"] = userId;
    }
    
    return headers;
  }

  /**
   * Search for tracks on Epidemic Sound
   */
  async searchTracks(
    query: string,
    limit = 20,
    userId?: string
  ): Promise<{ tracks: EpidemicTrack[]; total: number }> {
    try {
      const response = await axios.get<EpidemicSearchResponse>(
        `${this.baseURL}/tracks/search`,
        {
          headers: this.getHeaders(userId),
          params: {
            term: query,
            limit: Math.min(limit, 60), // Max 60 per page
            sort: "Relevance",
            order: "desc",
          },
        }
      );

      logger.info("Epidemic Sound search results", {
        query,
        totalFound: response.data.tracks.length,
        hasLyrics: response.data.tracks.filter((t) => t.hasVocals).length,
      });

      return {
        tracks: response.data.tracks,
        total: response.data.pagination.total || response.data.tracks.length,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Epidemic Sound search failed", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw new Error("Failed to search Epidemic Sound");
    }
  }

  /**
   * Get track details by ID using batch metadata endpoint
   */
  async getTrack(trackId: string, userId?: string): Promise<EpidemicTrack> {
    try {
      // Use batch metadata endpoint with single track ID
      const response = await axios.get<{ tracks: EpidemicTrack[] }>(
        `${this.baseURL}/tracks/metadata`,
        {
          headers: this.getHeaders(userId),
          params: {
            trackId: trackId,
          },
        }
      );

      const track = response.data.tracks[0];
      if (!track) {
        throw new Error("Track not found");
      }

      return track;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get Epidemic Sound track", {
          trackId,
          status: error.response?.status,
        });
      }
      throw new Error("Failed to fetch track from Epidemic Sound");
    }
  }

  /**
   * Get download URL for a track
   */
  async getDownloadUrl(
    trackId: string,
    format: "mp3" | "wav" = "mp3",
    quality: "normal" | "high" = "high",
    userId?: string
  ): Promise<EpidemicDownloadResponse> {
    try {
      const response = await axios.get<EpidemicDownloadResponse>(
        `${this.baseURL}/tracks/${trackId}/download`,
        {
          headers: this.getHeaders(userId),
          params: {
            format,
            quality, // normal=128kbps, high=320kbps
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get download URL", {
          trackId,
          status: error.response?.status,
        });
      }
      throw new Error("Failed to get download URL");
    }
  }

  /**
   * Get streaming URL (HLS) for a track
   */
  async getStreamingUrl(trackId: string, userId?: string): Promise<{ url: string }> {
    try {
      const response = await axios.get<{ url: string }>(
        `${this.baseURL}/tracks/${trackId}/stream`,
        {
          headers: this.getHeaders(userId),
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get streaming URL", {
          trackId,
          status: error.response?.status,
        });
      }
      throw new Error("Failed to get streaming URL");
    }
  }

  /**
   * Get lyrics for a track
   */
  async getLyrics(trackId: string, userId?: string): Promise<string | null> {
    try {
      const response = await axios.get<EpidemicLyricsResponse>(
        `${this.baseURL}/tracks/${trackId}/lyrics`,
        {
          headers: this.getHeaders(userId),
        }
      );

      return response.data.lyrics;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get lyrics", {
          trackId,
          status: error.response?.status,
        });
      }
      return null; // Lyrics may not be available
    }
  }

  /**
   * Get featured/curated tracks from collections
   */
  async getFeaturedTracks(limit = 20, userId?: string): Promise<{ tracks: EpidemicTrack[]; total: number }> {
    try {
      // Instead of collections, let's search for popular/trending tracks
      // Collections endpoint might not be available in all Epidemic Sound plans
      const response = await axios.get<EpidemicSearchResponse>(
        `${this.baseURL}/tracks/search`,
        {
          headers: this.getHeaders(userId),
          params: {
            term: "popular", // Search for popular tracks
            limit: Math.min(limit, 60),
            sort: "Relevance",
            order: "desc",
          },
        }
      );

      logger.info("Featured tracks loaded from search", {
        totalFound: response.data.tracks.length,
        firstId: response.data.tracks[0]?.id,
        firstTitle: response.data.tracks[0]?.title,
      });

      return {
        tracks: response.data.tracks,
        total: response.data.pagination.total || response.data.tracks.length,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get featured tracks", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw new Error("Failed to get featured tracks");
    }
  }
}

export const epidemicService = new EpidemicSoundService();
export type { EpidemicTrack };
