import { useContext } from 'react';
import { MapActionTypes, MapContext } from '../components/MapContext';
import { OverlayState } from '../components/TopOverlay';

export const SpotifyLoginModal = () => {
  const { state, dispatch } = useContext(MapContext);

  const handleCloseTopOverlay = () => {
    dispatch({
      type: MapActionTypes.SetTopOverlayState,
      payload: { topOverlayState: OverlayState.None },
    });
  };

  return (
    <div className="bg-backgroundGray p-20  flex flex-col items-center">
      <div className="bg-spotifyGreen rounded-3xl p-4">
        <a className="text-white " href="/auth/login" onClick={() => handleCloseTopOverlay()}>
          Login with Spotify
        </a>
      </div>
      <div
        className="mt-4 text-red hover:underline cursor-pointer"
        onClick={() => handleCloseTopOverlay()}
      >
        Cancel
      </div>
    </div>
  );
};
