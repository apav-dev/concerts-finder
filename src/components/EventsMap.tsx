import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line
import { SearchIntent, useAnswersActions, useAnswersState } from '@yext/answers-headless-react';
import { SearchBar, updateLocationIfNeeded } from '@yext/answers-react-components';
import MapLoadingScreen from './MapLoadingScreen';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXBhdmxpY2siLCJhIjoiY2wwdHB6ZHh2MG4yZTNjcnAwa200cTRwNCJ9.p0t0lKsS4NDMZWvSIKyWbA';

const EventsMap = (): JSX.Element => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);

  const userLocation = useAnswersState((state) => state.location.userLocation);
  const answersActions = useAnswersActions();

  useEffect(() => {
    updateLocationIfNeeded(answersActions, [SearchIntent.NearMe]);
  }, []);

  useEffect(() => {
    if (initialLoading && map.current && userLocation) {
      map.current.setCenter([userLocation.longitude, userLocation.latitude]);
      setInitialLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || '',
      style: 'mapbox://styles/mapbox/streets-v11',
      interactive: true,
      zoom: 9,
      center: [-73.935242, 40.73061], // center is initally set to NYC
    });
  }, []);

  return (
    <div className="relative h-screen w-screen">
      {initialLoading && <MapLoadingScreen />}
      <div ref={mapContainer} className="relative h-full w-full">
        <SearchBar customCssClasses={{ container: 'absolute m-4 w-96' }} />
      </div>
    </div>
  );
};

export default EventsMap;
