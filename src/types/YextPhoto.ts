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
