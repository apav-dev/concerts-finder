import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line
import {
  Matcher,
  SearchIntent,
  useAnswersActions,
  useAnswersState,
} from '@yext/answers-headless-react';
import {
  SearchBar,
  SpellCheck,
  updateLocationIfNeeded,
  VerticalResults,
} from '@yext/answers-react-components';
import MapLoadingScreen from './MapLoadingScreen';
import EventCard, { eventFieldMappings, isLinkedLocation, isTimeData } from './EventCard';
import classNames from 'classnames';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import { GeoJSONSource } from 'mapbox-gl';
import { BiCaretLeft } from 'react-icons/bi';
import { distanceInKmBetweenCoordinates } from '../utils/utils';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXBhdmxpY2siLCJhIjoiY2wwdHB6ZHh2MG4yZTNjcnAwa200cTRwNCJ9.p0t0lKsS4NDMZWvSIKyWbA';

const EventsMap = (): JSX.Element => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const resultsContainer = useRef<HTMLDivElement>(null);

  const [scrollAtTop, setScrollAtTop] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [lastSearchInput, setLastSearchInput] = useState('');

  const queryInput = useAnswersState((state) => state.query.input);
  const userLocation = useAnswersState((state) => state.location.userLocation);
  const eventsCount = useAnswersState((state) => state.vertical.resultsCount) || 0;
  const events = useAnswersState((state) => state.vertical.results);
  const answersActions = useAnswersActions();

  useEffect(() => {
    updateLocationIfNeeded(answersActions, [SearchIntent.NearMe]);

    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || '',
      style: 'mapbox://styles/apavlick/cl16myhmu000814rrpfrdisj2',
      interactive: true,
      zoom: 9,
      center: [-73.935242, 40.73061], // center is initally set to NYC
    });
    const currentMap = map.current;

    // disable map rotation using right click + drag
    currentMap.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    currentMap.touchZoomRotate.disableRotation();

    // Add zoom and rotation controls to the map.
    currentMap.addControl(new mapboxgl.NavigationControl());

    currentMap.on('load', () => {
      currentMap.loadImage(
        'https://res.cloudinary.com/yext/image/upload/c_scale,h_36/v1648158437/pin_csc5sn.png',
        (error, image) => {
          if (error) throw error;
          if (image) {
            currentMap.addImage('custom-marker', image);
          }

          // Add a GeoJSON source
          currentMap.addSource('points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          currentMap.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: { 'icon-image': 'custom-marker' },
          });
        }
      );
    });
  }, []);

  useEffect(() => {
    if (map.current && userLocation) {
      map.current.setCenter([userLocation.longitude, userLocation.latitude]);
      answersActions.setStaticFilters([
        {
          fieldId: 'builtin.location',
          selected: true,
          matcher: Matcher.Near,
          value: {
            radius:
              1000 *
              distanceInKmBetweenCoordinates(
                map.current.getCenter().lat,
                map.current.getCenter().lng,
                map.current.getBounds().getNorthEast().lat,
                map.current.getCenter().lng
              ),
            lat: map.current.getCenter().lat as number,
            lng: map.current.getCenter().lng as number,
          },
        },
      ]);
      answersActions.executeVerticalQuery();
      setSetupDone(true);
      answersActions.setStaticFilters([]);
    }
  }, [userLocation]);

  useEffect(() => {
    setLastSearchInput(queryInput || '');

    if (map.current && events) {
      const validatedEvents = events.map((event) => {
        const transformedFieldData = applyFieldMappings(event.rawData, eventFieldMappings);
        return validateData(transformedFieldData, {
          title: isString,
          venueName: isString,
          dateTime: isTimeData,
          lowestPrice: isString,
          linkedLocation: isLinkedLocation,
        });
      });

      const bounds = new mapboxgl.LngLatBounds();

      // TODO: is there a TS expert I can ask about how to handle this weirdness???
      const mapFeatures = validatedEvents.map((event) => {
        const lng = event.linkedLocation?.yextDisplayCoordinate.longitude;
        const lat = event.linkedLocation?.yextDisplayCoordinate.latitude;
        const coordinates: [number, number] = [lng as number, lat as number];
        coordinates && bounds.extend(coordinates);

        return {
          // type: 'Position',
          geometry: {
            // type: 'Point',
            coordinates: [lng as number, lat as number],
          },
          properties: {
            title: event.title as string,
          },
        };
      });

      const pointsSource: GeoJSONSource = map.current.getSource('points') as GeoJSONSource;
      pointsSource.setData({
        type: 'FeatureCollection',
        features: mapFeatures.map((feature) => ({
          ...feature,
          type: 'Feature',
          geometry: { ...feature.geometry, type: 'Point' },
        })),
      });

      if (!bounds.isEmpty()) {
        map.current.setCenter(bounds.getCenter());
        map.current.fitBounds(bounds, {
          padding: { top: 20, bottom: 20, left: 20, right: 20 },
          maxZoom: 15,
        });
      }
    }
  }, [events]);

  const handleResultsScroll = () =>
    resultsContainer.current?.scrollTop === 0 ? setScrollAtTop(true) : setScrollAtTop(false);

  return (
    <div className="relative h-screen w-screen">
      {!setupDone && <MapLoadingScreen />}
      <div ref={mapContainer} className="absolute top-0 bottom-0 w-full overflow-hidden">
        <div
          className={classNames(
            'absolute w-96  h-full bg-backgroundGray left-0',
            {
              'bg-transparent': !setupDone,
            },
            { 'left-0': showSearchPanel },
            { '-left-96': !showSearchPanel }
          )}
          style={{ transition: 'left 0.1s linear' }}
        >
          <div
            className={classNames('h-16 flex items-center px-4', { 'shadow-bottom': !scrollAtTop })}
          >
            <SearchBar
              // TODO: ask about vertical divider
              customCssClasses={{
                container: 'h-14 w-full',
                inputDropdownContainer:
                  'relative z-10 border rounded-lg border-gray-200 w-full overflow-hidden shadow-lg bg-cardGray',
                inputElement: 'outline-none flex-grow border-none h-full pl-0.5 pr-2 bg-cardGray',
              }}
              cssCompositionMethod="assign"
            />
          </div>
          <div
            ref={resultsContainer}
            className="overflow-y-scroll h-full flex flex-col items-center"
            onScroll={handleResultsScroll}
          >
            {eventsCount > 0 && (
              <VerticalResults
                CardComponent={EventCard}
                customCssClasses={{ container: 'p-4' }}
                allowPagination={true}
              />
            )}
            {eventsCount === 0 && setupDone && (
              <span className="px-4">{`No search results found for ${lastSearchInput}`}</span>
            )}
            <SpellCheck
              customCssClasses={{
                container: 'text-md',
                helpText: '',
                link: 'text-fontPink font-bold hover:underline focus:underline',
              }}
              cssCompositionMethod="assign"
            />
          </div>
          {setupDone && (
            <div className={'left-96 absolute top-0 bottom-0 flex flex-col justify-center '}>
              <button
                className="w-5 h-11 bg-backgroundGray rounded-r-md"
                onClick={() => setShowSearchPanel(!showSearchPanel)}
              >
                <BiCaretLeft
                  className={classNames({ 'transform rotate-180': !showSearchPanel })}
                  size={16}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsMap;
