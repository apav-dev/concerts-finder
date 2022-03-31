import ScaleLoader from 'react-spinners/ScaleLoader';
import { SpotifyLoginModal } from '../utils/SpotifyLoginModal';

export enum OverlayState {
  None = 'none',
  Spotify = 'spotify',
  Loading = 'loading',
}

interface TopOverlayScreenProps {
  overlayType: OverlayState;
}

const TopOverlay = ({ overlayType }: TopOverlayScreenProps) => (
  <>
    {overlayType !== OverlayState.None && (
      <div className="absolute flex justify-center items-center bg-black opacity-90 top-0 right-0 left-0 bottom-0 z-20">
        <div className="flex flex-col items-center">
          {overlayType === OverlayState.Spotify && SpotifyLoginModal()}
          {overlayType === OverlayState.Loading && (
            <div className="flex flex-col items-center">
              <ScaleLoader color="#ee4c7c" width={15} height={120} />
              <span className="text-white text-xl font-extrabold">
                Finding Concerts Near You...
              </span>
            </div>
          )}
        </div>
      </div>
    )}
  </>
);

export default TopOverlay;
