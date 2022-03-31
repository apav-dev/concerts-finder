export const playTrack = (accessToken: string, deviceId: string, trackUri: string) => {
  fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({ uris: [trackUri] }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getTopTracksForArtist = (
  accessToken: string,
  artistId: string
): Promise<Spotify.Track[]> => {
  return fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=us`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => data.tracks as Spotify.Track[]);
};
