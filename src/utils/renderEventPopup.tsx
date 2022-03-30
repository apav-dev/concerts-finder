import { GeoJsonProperties } from 'geojson';

export const renderEventPopup = (properties: GeoJsonProperties) => {
  return (
    <div className="" id={properties?.id}>
      {properties?.venuePhotoUrl && (
        <img
          className="shadow-sm mb-2 object-cover w-full rounded-t-md max-h-16"
          alt="venue-image"
          src={properties.venuePhotoUrl}
        />
      )}
      <div>
        <div className="text-primary p-1">
          {properties?.venueName && (
            <div className="text-primary text-fontPink text-base">{properties?.venueName}</div>
          )}
          {properties?.venueLine1 && <div>{properties.venueLine1}</div>}
          {properties?.venueCity && properties?.venueRegion && properties?.venuePostalCode && (
            <div>{`${properties.venueCity}, ${properties.venueRegion} ${properties.venuePostalCode}`}</div>
          )}
        </div>
      </div>
    </div>
  );
};
