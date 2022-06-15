export interface YextTime {
  start: string;
  end: string;
}

export function isYextTime(data: unknown): data is YextTime {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['start', 'end'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}
