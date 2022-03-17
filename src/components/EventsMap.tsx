import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line
import { SearchIntent, useAnswersActions, useAnswersState } from '@yext/answers-headless-react';
import { SearchBar, updateLocationIfNeeded, VerticalResults } from '@yext/answers-react-components';
import MapLoadingScreen from './MapLoadingScreen';
import EventCard from './EventCard';
import classNames from 'classnames';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXBhdmxpY2siLCJhIjoiY2wwdHB6ZHh2MG4yZTNjcnAwa200cTRwNCJ9.p0t0lKsS4NDMZWvSIKyWbA';

const EventsMap = (): JSX.Element => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const resultsContainer = useRef<HTMLDivElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [scrollAtTop, setScrollAtTop] = useState(true);

  const userLocation = useAnswersState((state) => state.location.userLocation);
  const eventsCount = useAnswersState((state) => state.vertical.resultsCount) || 0;
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

  const handleResultsScroll = () =>
    resultsContainer.current?.scrollTop === 0 ? setScrollAtTop(true) : setScrollAtTop(false);

  return (
    <div className="relative h-screen w-screen">
      {initialLoading && <MapLoadingScreen />}
      <div ref={mapContainer} className="relative h-full w-full">
        <div
          className={classNames('absolute w-96 h-full bg-backgroundGray', {
            'bg-transparent': eventsCount === 0,
          })}
        >
          <div
            className={classNames('h-16 flex items-center px-4', { 'shadow-bottom': !scrollAtTop })}
          >
            <SearchBar
              // TODO: ask about vertical divider
              customCssClasses={{
                container: 'h-14 w-full ',
                inputDropdownContainer:
                  'relative z-10 border rounded-lg border-gray-200 w-full overflow-hidden shadow-lg bg-cardGray',
                inputElement: 'outline-none flex-grow border-none h-full pl-0.5 pr-2 bg-cardGray',
              }}
              cssCompositionMethod="assign"
            />
          </div>
          <div
            ref={resultsContainer}
            className="overflow-y-auto h-full"
            onScroll={handleResultsScroll}
          >
            {eventsCount > 0 && (
              <VerticalResults CardComponent={EventCard} customCssClasses={{ container: 'p-4' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsMap;
