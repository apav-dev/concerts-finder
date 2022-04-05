import axiod from 'https://deno.land/x/axiod/mod.ts';
import * as queryString from 'https://deno.land/x/querystring@v1.0.2/mod.js';
import { SpotifyArtist, SpotifyArtists } from './types.ts';

// ############################################ Spotify APIs ############################################
const spotifyAccessToken =
  'BQB8WK5KLAcYp2QuFS6lfbHPYVGzIYSEiqZuGIbnFN0ofWPVIWv3HwMeMfyaP2UEWwjbYkznixpjp0PcwXLvoho-6mMhX2aiKZGZIhjJh-1phoJNtS8GggJa_QkIp4xOv9Fk7PSHyInBauj2z_9YJbJ0kA';
const spotifyRefreshToken =
  'AQALYAjqmoRnwQG1SZAagUFWfS6Bjp3rOzJltDOkHlBEjFocTN_CW-0weE-YxDhW0e6iImbx5fIVW0RjYCeIPfTJb_hi1NBMJJJ9YHPOKxjXBW6VQdrwmSFtEL17PrYTxGI';

export const getAccessToken = async (): Promise<string> => {
  const res = await axiod.post(
    'https://accounts.spotify.com/api/token',
    queryString.stringify({
      grant_type: 'refresh_token',
      refresh_token: spotifyRefreshToken,
    }),
    {
      headers: {
        Authorization:
          'Basic Yzk4OGFjZWIxYTNmNDk2MzllMjY2ZjMyODBhMGYxNzg6MWI0NGQ3ODJjNDgwNGYyYjkwOTM5NjU1MWI5YTYyY2E=',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return res.data.access_token;
};

export const fetchMyTopArtistsFromSpotify = async (
  accessToken: string
): Promise<SpotifyArtists> => {
  const res = await axiod.get('https://api.spotify.com/v1/me/top/artists?limit=50', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data;
};

export const fetchArtistFromSpotify = async (
  accessToken: string,
  artistId: string
): Promise<SpotifyArtist> => {
  try {
    const res = await axiod.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
