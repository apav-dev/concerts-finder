import { useRef, useEffect, useState, useContext } from 'react';
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line
import {
  Matcher,
  SearchIntent,
  useAnswersActions,
  useAnswersState,
} from '@yext/answers-headless-react';
import {
  Filters,
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
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';

import { BiCaretLeft } from 'react-icons/bi';
import { distanceInKmBetweenCoordinates } from '../utils/distanceUtils';
import { MapFilterCollapsibleLabel } from './MapFilterCollapsibleLabel';
import ReactDOM from 'react-dom';
import { renderEventPopup } from '../utils/renderEventPopup';
import { MapContext } from './MapContext';
import { stat } from 'fs';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXBhdmxpY2siLCJhIjoiY2wwdHB6ZHh2MG4yZTNjcnAwa200cTRwNCJ9.p0t0lKsS4NDMZWvSIKyWbA';

const EventsMap = (): JSX.Element => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const resultsContainer = useRef<HTMLDivElement>(null);
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  const [scrollAtTop, setScrollAtTop] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [lastSearchInput, setLastSearchInput] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state, dispatch } = useContext(MapContext);

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

          const data: FeatureCollection<Point> = {
            type: 'FeatureCollection',
            features: [],
          };

          // Add a GeoJSON source
          currentMap.addSource('eventLocations', {
            type: 'geojson',
            data,
          });

          currentMap.addLayer({
            id: 'eventLocations',
            type: 'symbol',
            source: 'eventLocations',
            layout: {
              'icon-image': 'custom-marker',
            },
          });
        }
      );

      currentMap.on('click', (event) => {
        /* Determine if a feature in the "locations" layer exists at that point. */
        const features = currentMap.queryRenderedFeatures(event.point, {
          layers: ['eventLocations'],
        });

        /* If it does not exist, return */
        if (!features.length) return;

        handleEventClick(features[0]);
      });
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
          id: isString,
          title: isString,
          venueName: isString,
          dateTime: isTimeData,
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
          id: event.id,
          // type: 'Position',
          geometry: {
            // type: 'Point',
            coordinates: [lng as number, lat as number],
          },
          properties: {
            id: event.id,
            venueName: event.linkedLocation?.name,
            venueLine1: event.linkedLocation?.address.line1,
            venueCity: event.linkedLocation?.address.city,
            venueRegion: event.linkedLocation?.address.region,
            venuePostalCode: event.linkedLocation?.address.postalCode,
            venuePhotoUrl: event.linkedLocation?.photoGallery?.[0].image.url,
          },
        };
      });

      const pointsSource: GeoJSONSource = map.current.getSource('eventLocations') as GeoJSONSource;
      if (pointsSource) {
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
    }
  }, [events]);

  useEffect(() => {
    if (!map.current) return;
    const currentMap = map.current;

    if (state.selectedLocationId) {
      const eventLocationFeatures = currentMap.querySourceFeatures('eventLocations');
      const feature = eventLocationFeatures.find(
        (feature) => feature.id?.toString() === state.selectedLocationId
      );

      feature && handleEventClick(feature);
    }
  }, [state.selectedLocationId]);

  const handleEventClick = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    if (!map.current) return;
    const currentMap = map.current;

    if (feature.geometry.type === 'Point') {
      const [lng, lat] = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];

      flyToEvent([lng, lat]);

      const popupNode = document.createElement('div');
      const element = renderEventPopup(feature.properties);
      ReactDOM.render(element, popupNode);
      popupRef.current.setLngLat([lng, lat]).setDOMContent(popupNode).addTo(currentMap);
    }

    // cleanup function to remove map on unmount
    return () => currentMap.remove();
  };

  const flyToEvent = (lngLat: [number, number]) => {
    if (!map.current) return;

    map.current.flyTo({
      center: [lngLat[0], lngLat[1]],
      zoom: map.current.getZoom(),
    });
  };

  const handleResultsScroll = () =>
    resultsContainer.current?.scrollTop === 0 ? setScrollAtTop(true) : setScrollAtTop(false);

  return (
    <div>
      {!setupDone && <MapLoadingScreen />}
      <div ref={mapContainer} className="absolute top-0 bottom-0 w-full overflow-hidden">
        <div
          className={classNames(
            'absolute w-96 h-full bg-backgroundGray z-10',
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
                container: 'h-14 w-full font-primary text-sm',
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
        <div
          className={classNames(
            'absolute top-0',
            { 'left-96': showSearchPanel },
            { '-left-0': !showSearchPanel }
          )}
          style={{ transition: 'left 0.1s linear' }}
        >
          <Filters.Facets
            searchOnChange={true}
            className={classNames(
              'absolute top-0 h-px bg-gray-200 flex mt-2 ml-8 z-10 font-primary'
            )}
          >
            {(facets) =>
              facets.map((f, i) => {
                if (f.options.length === 0) {
                  return null;
                }

                return (
                  <div key={f.fieldId} className="md:w-40 mr-4 ">
                    <Filters.FilterGroup>
                      <MapFilterCollapsibleLabel
                        label={f.fieldId === 'c_artists.c_genres' ? 'Genres' : 'US Region'}
                      />
                      <Filters.CollapsibleSection className="flex flex-col space-y-3 max-h-56 overflow-y-auto bg-cardGray shadow-xl">
                        {f.options.map((o) => (
                          <Filters.CheckboxOption
                            key={o.displayName}
                            value={(o.value as string)
                              .toLowerCase()
                              .split(' ')
                              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                              .join(' ')}
                            fieldId={f.fieldId}
                            customCssClasses={{
                              container: 'flex items-center space-x-3 ml-2',
                              label: 'text-sm font-normal cursor-pointer',
                              input:
                                'w-3.5 h-3.5 form-checkbox cursor-pointer border border-gray-300 rounded-sm text-fontPink focus:ring-fontPink',
                            }}
                            cssCompositionMethod={'assign'}
                          />
                        ))}
                      </Filters.CollapsibleSection>
                    </Filters.FilterGroup>
                  </div>
                );
              })
            }
          </Filters.Facets>
        </div>
      </div>
    </div>
  );
};

export default EventsMap;
