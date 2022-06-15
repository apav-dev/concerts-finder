import { validateData } from '@yext/answers-react-components';
import { isArray, isString } from 'lodash';
import { isYextPrimaryPhoto, YextPhoto } from './YextPhoto';

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPhoto;
  c_spotifyId: string;
}

export const artistDataForRender = (result: Record<string, unknown>): Partial<Artist> => {
  if (!result) return {};

  const data = {
    name: result.name,
    c_genres: result.c_genres,
    primaryPhoto: result.primaryPhoto,
    c_spotifyId: result.c_spotifyId,
  };

  return validateData(data, {
    name: isString,
    c_genres: isArray,
    primaryPhoto: isYextPrimaryPhoto,
    c_spotifyId: isString,
  });
};
