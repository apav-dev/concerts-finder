import { BiPlayCircle } from 'react-icons/bi';
import { useContext } from 'react';
import { SpotifyActionTypes, SpotifyContext } from '../providers/SpotifyProvider';
import { OverlayActionTypes, OverlayContext, OverlayStatus } from '../providers/OverlayProvider';
import { artistDataForRender } from '../types/Artist';
export interface ArtistCardProps {
  artist: Record<string, unknown>;
}

const ArtistItem = ({ artist }: ArtistCardProps): JSX.Element => {
  const spotifyContext = useContext(SpotifyContext);
  const overlayContext = useContext(OverlayContext);

  const artistData = artistDataForRender(artist);

  const handlePlayClick = () => {
    if (!spotifyContext.spotifyState.spotifyAccessToken) {
      overlayContext.dispatch({
        type: OverlayActionTypes.SetTopOverlayState,
        payload: { topOverlayState: OverlayStatus.Spotify },
      });
    }

    spotifyContext.dispatch({
      type: SpotifyActionTypes.SetArtistSpotifyId,
      payload: { artistSpotifyId: artistData.c_spotifyId || '' },
    });
  };

  return (
    <li className="bg-cardGray shadow-lg my-2 px-2 ">
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center">
          {artistData.primaryPhoto?.image.url && (
            <img
              className="h-auto shadow-sm my-2 object-contain"
              style={{ maxWidth: '3rem' }}
              src={artistData.primaryPhoto?.image.url}
            />
          )}
          <span className="flex ml-2 text-xs ">{artistData.name}</span>
        </div>
        <div>
          {process.env.NODE_ENV === 'development' && artistData.c_spotifyId && (
            <button
              className="text-fontPink flex items-center hover:underline text-xs"
              onClick={() => handlePlayClick()}
            >
              Play Top Songs
              <BiPlayCircle className="ml-1" size={16} />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default ArtistItem;
