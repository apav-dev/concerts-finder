import axiod from "https://deno.land/x/axiod/mod.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import { SpotifyArtist, SpotifyArtists } from "./types.ts";

// ############################################ Spotify APIs ############################################
const spotifyAccessToken =
  "BQD8xFNiaTXmFkHaFS7eLzqXP41bJo5Z1m9q7GDVY-dRK9QbaUHmK7D2fduukHDLLoOmw3ExMb-0-N2_BPf89HPFPT43fQ6Xs8simf7Qa8X6EmHUJbyKxWBP_TiTjhGIyAB5EzEKqj_xbOEnuiPQgc4LaBWJd-yH8hx7yzoXkxLB2P9aZoXrptnN0a6Db5sHruKi3v1hN4tK";
const spotifyRefreshToken =
  "AQCKO0FkdWz0zb2GmUW0WGTAyY47PEg5w2XSURN-sahJD_x5dK_hH-BlGDpJnM8R7C8l8OYAtCGI08s6rLg1Ae5ZvtiYigATfJ6IVG6LREl9NBS8Vyh-be8rnhNq2hiWOlM";

export const getAccessToken = async (): Promise<string> => {
  const res = await axiod.post(
    "https://accounts.spotify.com/api/token",
    queryString.stringify({
      grant_type: "refresh_token",
      refresh_token: spotifyRefreshToken,
    }),
    {
      headers: {
        Authorization:
          "Basic Yzk4OGFjZWIxYTNmNDk2MzllMjY2ZjMyODBhMGYxNzg6MWI0NGQ3ODJjNDgwNGYyYjkwOTM5NjU1MWI5YTYyY2E=",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token;
};

export const fetchMyTopArtistsFromSpotify = async (
  accessToken: string
): Promise<SpotifyArtists> => {
  const res = await axiod.get(
    "https://api.spotify.com/v1/me/top/artists?limit=50",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export const fetchArtistFromSpotify = async (
  accessToken: string,
  artistId: string
): Promise<SpotifyArtist> => {
  try {
    const res = await axiod.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
