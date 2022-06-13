import ScaleLoader from 'react-spinners/ScaleLoader';
import { OverlayStatus } from '../providers/OverlayProvider';
import { SpotifyLoginModal } from './SpotifyLoginModal';

interface TopOverlayScreenProps {
  overlayType: OverlayStatus;
}

const TopOverlay = ({ overlayType }: TopOverlayScreenProps) => (
  <>
    {overlayType !== OverlayStatus.None && (
      <div className="absolute flex justify-center items-center bg-black opacity-90 top-0 right-0 left-0 bottom-0 z-20">
        <div className="flex flex-col items-center">
          {overlayType === OverlayStatus.Spotify && SpotifyLoginModal()}
          {overlayType === OverlayStatus.Loading && (
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
