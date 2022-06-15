import { YextPhoto } from './YextPhoto';

export interface LinkedLocation {
  name: string;
  yextDisplayCoordinate: YextDisplayCoordinate;
  address: Address;
  photoGallery?: YextPhoto[];
}

export function isLinkedLocation(data: unknown): data is LinkedLocation {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['name', 'yextDisplayCoordinate', 'address'];
  const containsExpectedKeys = expectedKeys.every((key) => {
    return key in data;
  });

  return (
    containsExpectedKeys &&
    isCoordinateData((data as LinkedLocation).yextDisplayCoordinate) &&
    isAddress((data as LinkedLocation).address)
  );
}

export interface YextDisplayCoordinate {
  longitude: number;
  latitude: number;
}

function isCoordinateData(data: unknown): data is YextDisplayCoordinate {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['longitude', 'latitude'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export interface Address {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
}

function isAddress(data: unknown): data is Address {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['line1', 'city', 'region', 'postalCode'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export function isArray(data: unknown): data is [] {
  if (!Array.isArray(data) || data === null) {
    return false;
  }

  return true;
}
