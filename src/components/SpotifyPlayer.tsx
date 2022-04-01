import { useEffect, useState } from 'react';
import { getTopTracksForArtist, playTrack } from '../utils/spotifyApiUtils';
import { BiPlay, BiPause, BiSkipNext, BiSkipPrevious, BiX } from 'react-icons/bi';

interface SpotifyPlayerProps {
  accessToken: string;
  artistId: string;
  onClosePlayerClick: () => void;
}

export const SpotifyPlayer = ({
  accessToken,
  artistId,
  onClosePlayerClick,
}: SpotifyPlayerProps) => {
  const [isPaused, setPaused] = useState(true);
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [trackIndex, setTrackIndex] = useState(0);
  const [deviceId, setDeviceId] = useState('');
  const [tracks, setTracks] = useState<Spotify.Track[]>([]);

  useEffect(() => {
    // Setup Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Yext Concerts Finder',
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

        // setCurrentTrack(state.track_window.current_track);
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
    // Fetch the top 10 tracks for the given artist
    const fetchTracks = async () => {
      const tracksResponse = await getTopTracksForArtist(accessToken, artistId);
      setTracks(tracksResponse);
    };

    fetchTracks();
  }, [artistId]);

  const handlePrevTrackClick = () => {
    if (trackIndex === 0) {
      setTrackIndex(tracks.length - 1);
    } else {
      setTrackIndex(trackIndex - 1);
    }
  };

  const handlePlayPauseClick = () => {
    if (tracks[trackIndex]) {
      isPaused ? playTrack(accessToken, deviceId, tracks[trackIndex].uri) : player?.pause();
    }
  };

  const handleNextTrackClick = () => {
    if (trackIndex === tracks.length - 1) {
      setTrackIndex(0);
    } else {
      setTrackIndex(trackIndex + 1);
    }
  };

  return (
    <div className="absolute right-0 bottom-0 w-40 min-h-40 mb-8 mr-6">
      <div>
        <button onClick={() => onClosePlayerClick()}>
          <BiX />
        </button>
      </div>
      <div>
        <img src={tracks[trackIndex]?.album.images[0].url} />
      </div>
      <div className="bg-backgroundGray">
        <div className="flex flex-col text-center">
          <div className="text-base text-fontPink">{tracks[trackIndex]?.name}</div>
          <div className="text-sm">
            {tracks[trackIndex]?.artists.map((artist) => artist.name).join(', ')}
          </div>
        </div>
        <div className="flex justify-center py-2 items-center">
          <button
            className="w-7 h-7 bg-fontPink rounded-full mr-2"
            onClick={() => handlePrevTrackClick()}
          >
            <BiSkipPrevious className="ml-1" size={20} />
          </button>
          <button
            className="rounded-full h-10 w-10 bg-fontPink flex justify-center items-center"
            onClick={() => handlePlayPauseClick()}
          >
            {isPaused ? <BiPlay size={30} /> : <BiPause size={30} />}
          </button>
          <button
            className="w-7 h-7 bg-fontPink rounded-full ml-2"
            onClick={() => handleNextTrackClick()}
          >
            <BiSkipNext className="ml-1" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
