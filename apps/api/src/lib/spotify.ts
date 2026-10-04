import axios, { AxiosError } from "axios";
import { env } from "./env";
import { logger } from "./logger";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get a valid access token using Client Credentials flow
   * (for non-user-specific data like search and track info)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<SpotifyTokenResponse>(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry with 5 minute buffer
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      logger.info("Spotify access token refreshed");
      return this.accessToken;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get Spotify access token", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw new Error("Failed to authenticate with Spotify");
    }
  }

  /**
   * Search for tracks on Spotify
   */
  async searchTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();

    try {
      // Request more tracks than needed since we'll filter out those without previews
      const requestLimit = Math.min(limit * 3, 50);
      
      const response = await axios.get<SpotifySearchResponse>(
        "https://api.spotify.com/v1/search",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            q: query,
            type: "track",
            limit: requestLimit,
            market: "US", // Required for preview URLs
          },
        }
      );

      // Filter to only tracks with preview URLs and limit to requested amount
      const tracksWithPreviews = response.data.tracks.items
        .filter((track) => track.preview_url !== null)
        .slice(0, limit);

      return tracksWithPreviews;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Spotify search failed", {
          status: error.response?.status,
          data: error.response?.data,
        });

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
        }
      }
      throw new Error("Failed to search Spotify");
    }
  }

  /**
   * Get track details by Spotify ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get<SpotifyTrack>(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            market: "US",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get Spotify track", {
          trackId,
          status: error.response?.status,
        });
      }
      throw new Error("Failed to fetch track from Spotify");
    }
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(trackIds: string[]): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get<{ tracks: SpotifyTrack[] }>(
        "https://api.spotify.com/v1/tracks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ids: trackIds.join(","),
            market: "US",
          },
        }
      );

      return response.data.tracks.filter((track) => track !== null);
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error("Failed to get Spotify tracks", {
          status: error.response?.status,
        });
      }
      throw new Error("Failed to fetch tracks from Spotify");
    }
  }

  /**
   * Get popular tracks by genre or mood (using search with filters)
   */
  async getPopularTracks(genre?: string, limit = 20): Promise<SpotifyTrack[]> {
    const query = genre ? `genre:${genre}` : "year:2024";
    return this.searchTracks(query, limit);
  }
}

export const spotifyService = new SpotifyService();
export type { SpotifyTrack };
