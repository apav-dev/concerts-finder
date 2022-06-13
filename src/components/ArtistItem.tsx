import { FieldData } from '@yext/answers-react-components';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { isArray } from './EventCard';
import { BiPlayCircle } from 'react-icons/bi';
import { useContext } from 'react';
import { SpotifyActionTypes, SpotifyContext } from '../providers/SpotifyProvider';
import { OverlayActionTypes, OverlayContext, OverlayStatus } from '../providers/OverlayProvider';

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPhoto;
  c_spotifyId: string;
}

export interface YextImageData {
  url: string;
  height: number;
  width: number;
  thumbnails?: YextImageData[];
}

export interface YextPhoto {
  image: YextImageData;
}

export function isYextPrimaryPhoto(data: unknown): data is YextPhoto {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['image'];
  const containsExpectedKeys = expectedKeys.every((key) => {
    return key in data;
  });

  return containsExpectedKeys && isImageData((data as YextPhoto).image);
}

export function isImageData(data: unknown): data is YextImageData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['url', 'height', 'width'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export interface ArtistCardProps {
  artist: Record<string, unknown>;
}

export const eventFieldMappings: Record<string, FieldData> = {
  name: {
    mappingType: 'FIELD',
    apiName: 'name',
  },
  genres: {
    mappingType: 'FIELD',
    apiName: 'c_genres',
  },
  artistPhoto: {
    mappingType: 'FIELD',
    apiName: 'primaryPhoto',
  },
  spotifyId: {
    mappingType: 'FIELD',
    apiName: 'c_spotifyId',
  },
};

const ArtistItem = ({ artist }: ArtistCardProps): JSX.Element => {
  const transformedFieldData = applyFieldMappings(artist, eventFieldMappings);

  const spotifyContext = useContext(SpotifyContext);
  const overlayContext = useContext(OverlayContext);

  const artistData = validateData(transformedFieldData, {
    name: isString,
    genres: isArray,
    artistPhoto: isYextPrimaryPhoto,
    spotifyId: isString,
  });

  const handlePlayClick = () => {
    if (!spotifyContext.spotifyState.spotifyAccessToken) {
      overlayContext.dispatch({
        type: OverlayActionTypes.SetTopOverlayState,
        payload: { topOverlayState: OverlayStatus.Spotify },
      });
    }

    spotifyContext.dispatch({
      type: SpotifyActionTypes.SetArtistSpotifyId,
      payload: { artistSpotifyId: artistData.spotifyId || '' },
    });
  };

  return (
    <li className="bg-cardGray shadow-lg my-2 px-2 ">
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center">
          {artistData.artistPhoto?.image.url && (
            <img
              className="h-auto shadow-sm my-2 object-contain"
              style={{ maxWidth: '3rem' }}
              src={artistData.artistPhoto.image.url}
            />
          )}
          <span className="flex ml-2 text-xs ">{artistData.name}</span>
        </div>
        <div>
          {process.env.NODE_ENV === 'development' && artistData.spotifyId && (
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
