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
   * Filters to only include tracks with actual lyrics available
   */
  async searchTracks(
    query: string,
    limit = 20,
    userId?: string
  ): Promise<{ tracks: EpidemicTrack[]; total: number }> {
    try {
      // Fetch MORE than we need since we'll filter for lyrics
      const fetchLimit = Math.min(limit * 3, 60); // Fetch 3x to account for filtering
      
      const response = await axios.get<EpidemicSearchResponse>(
        `${this.baseURL}/tracks/search`,
        {
          headers: this.getHeaders(userId),
          params: {
            term: query,
            vocalType: "LEAD", // Only tracks with sung lead vocals (karaoke-ready!)
            limit: fetchLimit,
            sort: "Relevance",
            order: "desc",
          },
        }
      );

      logger.info("Epidemic Sound search results, checking for lyrics", {
        query,
        totalFetched: response.data.tracks.length,
      });

      // Filter tracks to only those with lyrics available
      const tracksWithLyrics: EpidemicTrack[] = [];
      
      for (const track of response.data.tracks) {
        if (tracksWithLyrics.length >= limit) break;
        
        const hasLyrics = await this.hasLyricsAvailable(track.id, userId);
        
        if (hasLyrics) {
          tracksWithLyrics.push(track);
        }
      }

      logger.info("Search results with lyrics", {
        query,
        totalWithLyrics: tracksWithLyrics.length,
        requestedLimit: limit,
      });

      return {
        tracks: tracksWithLyrics,
        total: tracksWithLyrics.length,
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
   * Check if a track has lyrics available
   */
  private async hasLyricsAvailable(trackId: string, userId?: string): Promise<boolean> {
    try {
      const lyrics = await this.getLyrics(trackId, userId);
      return lyrics !== null && lyrics.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get featured/curated tracks from collections
   * Filters to only include tracks with actual lyrics available
   */
  async getFeaturedTracks(limit = 20, userId?: string): Promise<{ tracks: EpidemicTrack[]; total: number }> {
    try {
      // Fetch MORE than we need since we'll filter for lyrics
      const fetchLimit = Math.min(limit * 3, 60); // Fetch 3x to account for filtering
      
      const response = await axios.get<EpidemicSearchResponse>(
        `${this.baseURL}/tracks/search`,
        {
          headers: this.getHeaders(userId),
          params: {
            term: "popular", // Search for popular tracks
            vocalType: "LEAD", // Only tracks with sung lead vocals (karaoke-ready!)
            limit: fetchLimit,
            sort: "Popularity",
            order: "desc",
          },
        }
      );

      logger.info("Featured tracks loaded, checking for lyrics", {
        totalFetched: response.data.tracks.length,
      });

      // Filter tracks to only those with lyrics available
      const tracksWithLyrics: EpidemicTrack[] = [];
      
      for (const track of response.data.tracks) {
        if (tracksWithLyrics.length >= limit) break;
        
        const hasLyrics = await this.hasLyricsAvailable(track.id, userId);
        
        if (hasLyrics) {
          tracksWithLyrics.push(track);
          logger.info("Track has lyrics", { id: track.id, title: track.title });
        } else {
          logger.info("Track has no lyrics - skipping", { id: track.id, title: track.title });
        }
      }

      logger.info("Featured tracks with lyrics", {
        totalWithLyrics: tracksWithLyrics.length,
        requestedLimit: limit,
      });

      return {
        tracks: tracksWithLyrics,
        total: tracksWithLyrics.length,
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
