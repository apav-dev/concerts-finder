import { FieldData } from '@yext/answers-react-components';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { isArray } from './EventCard';

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPhoto;
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
};

const ArtistItem = ({ artist }: ArtistCardProps): JSX.Element => {
  const transformedFieldData = applyFieldMappings(artist, eventFieldMappings);

  const artistData = validateData(transformedFieldData, {
    name: isString,
    genres: isArray,
    artistPhoto: isYextPrimaryPhoto,
  });

  return (
    <li className="bg-cardGray shadow-lg my-2 px-2">
      <div className="flex justify-between items-center">
        <span className="flex text-xs ">{artistData.name}</span>
        {artistData.artistPhoto?.image.url && (
          <img
            className="h-auto shadow-sm my-2 object-contain"
            style={{ maxWidth: '3rem' }}
            src={artistData.artistPhoto.image.url}
          />
        )}
      </div>
    </li>
  );
};

export default ArtistItem;
