import { Result } from '@yext/answers-headless-react';
import { isString, validateData } from '@yext/answers-react-components';
import { isArray, isLinkedLocation, LinkedLocation } from './LinkedLocation';
import { YextTime, isYextTime } from './YextTime';

export interface Event {
  id: string;
  title: string;
  venueName: string;
  dateTime: YextTime;
  lowestPrice: string;
  artists: Record<string, unknown>[];
  linkedLocation: LinkedLocation;
}

export const eventDataForRender = (result: Result | undefined): Partial<Event> => {
  if (!result) return {};

  const data = {
    id: result.id,
    title: result.rawData.name,
    venueName: result.rawData.venueName,
    dateTime: result.rawData.time,
    lowestPrice: result.rawData.c_lowestPrice,
    artists: result.rawData.c_artists,
    linkedLocation: result.rawData.linkedLocation,
  };

  return validateData(data, {
    id: isString,
    title: isString,
    venueName: isString,
    dateTime: isYextTime,
    lowestPrice: isString,
    artists: isArray,
    linkedLocation: isLinkedLocation,
  });
};
