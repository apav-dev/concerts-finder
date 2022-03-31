import { useContext, useEffect, useState } from 'react';
import { MapContext } from './MapContext';

export const SpotifyPlayer = () => {
  const { state, dispatch } = useContext(MapContext);

  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);

  useEffect(() => {
    if (state.spotifyAccessToken) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: (cb) => {
            cb(state.spotifyAccessToken);
          },
          volume: 0.5,
        });

        setPlayer(player);

        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.connect();
      };
    }
  }, [state.spotifyAccessToken]);
  return <div></div>;
};
