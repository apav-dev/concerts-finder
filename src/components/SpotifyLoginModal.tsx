import { useContext } from 'react';
import { OverlayActionTypes, OverlayContext, OverlayStatus } from '../providers/OverlayProvider';

export const SpotifyLoginModal = () => {
  const overlayContext = useContext(OverlayContext);

  const handleCloseTopOverlay = () => {
    overlayContext.dispatch({
      type: OverlayActionTypes.SetTopOverlayState,
      payload: { topOverlayState: OverlayStatus.None },
    });
  };

  return (
    <div className="bg-backgroundGray p-20 flex flex-col items-center">
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
