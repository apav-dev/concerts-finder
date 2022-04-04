function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceInKmBetweenCoordinates(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  // returns 0 km if any params are missing
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
