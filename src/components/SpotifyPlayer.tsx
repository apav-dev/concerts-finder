import { useContext, useEffect, useState } from 'react';
import { getTopTracksForArtist, playTrack } from '../utils/spotifyApiUtils';
import { MapContext } from './MapContext';

const track = {
  name: '',
  album: {
    images: [{ url: '' }],
  },
  artists: [{ name: '' }],
  uri: '',
};

interface SpotifyPlayerProps {
  accessToken: string;
  artistId: string;
}

export const SpotifyPlayer = ({ accessToken, artistId }: SpotifyPlayerProps) => {
  const [isPaused, setPaused] = useState(true);
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [currentTrack, setCurrentTrack] = useState(track);
  const [deviceId, setDeviceId] = useState('');
  const [tracks, setTracks] = useState<Spotify.Track[]>([]);

  useEffect(() => {
    // Fetch the top 10 tracks for the given artist
    const fetchTracks = async () => {
      const tracksResponse = await getTopTracksForArtist(accessToken, artistId);
      setTracks(tracksResponse);
    };

    fetchTracks();

    // Setup Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId('');
      });

      player.addListener('player_state_changed', (state) => {
        console.log('Player State Changed');
        if (!state) {
          return;
        }

        setCurrentTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => (!state ? setActive(false) : setActive(true)));
      });

      player.connect().then((success) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      });
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-debugger
    debugger;
    if (tracks && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  }, [tracks]);

  const handlePlayPauseClick = () => {
    isPaused
      ? playTrack(accessToken, deviceId, currentTrack.uri)
      : player?.pause().then(() => console.log('paused!'));
  };

  return (
    <div className="absolute right-0 bottom-0 bg-backgroundGray w-40 min-h-40 mb-8 mr-6">
      <div className="flex flex-col text-center">
        <div className="text-base text-fontPink">{currentTrack.name}</div>
        {/* TODO: handle songs with multiple artists */}
        <div className="text-sm">{currentTrack.artists[0].name}</div>
      </div>
      <div>
        <button onClick={() => handlePlayPauseClick()}>{isPaused ? 'Play' : 'Pause'}</button>
      </div>
    </div>
  );
};
