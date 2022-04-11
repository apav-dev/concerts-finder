import { useRef, useEffect, useContext } from 'react';
import mapboxgl, { Map } from '!mapbox-gl'; // eslint-disable-line
import {
  Matcher,
  SearchIntent,
  useAnswersActions,
  useAnswersState,
} from '@yext/answers-headless-react';
import { eventFieldMappings, isLinkedLocation, isTimeData } from './EventCard';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import { GeoJSONSource } from 'mapbox-gl';
import { FeatureCollection, Point } from 'geojson';
import { distanceInKmBetweenCoordinates } from '../utils/distanceUtils';
import ReactDOM from 'react-dom';
import { renderEventPopup } from '../utils/renderEventPopup';
import { MapActionTypes, MapContext } from './MapContext';
import { getUserLocation, updateLocationIfNeeded } from '@yext/answers-react-components';
import { OverlayState } from './TopOverlay';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as string;

const EventsMap = (): JSX.Element => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  const { state, dispatch } = useContext(MapContext);

  const queryInput = useAnswersState((state) => state.query.input);
  const userLocation = useAnswersState((state) => state.location.userLocation);
  const events = useAnswersState((state) => state.vertical.results);
  const answersActions = useAnswersActions();

  useEffect(() => {
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

      getUserLocation()
        .then((userLocation) => {
          answersActions.setUserLocation(userLocation.coords);
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log('Could not get user location...defaulting to NYC');
          answersActions.setUserLocation({ latitude: 40.73061, longitude: -73.935242 });
        });
    });

    currentMap.on('movestart', (_event) => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });
  }, []);

  useEffect(() => {
    dispatch({
      type: MapActionTypes.SetLastSearchInput,
      payload: { lastSearchInput: queryInput || '' },
    });

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
            padding: { top: 30, bottom: 30, left: 30 + state.sidePanelWidth, right: 30 },
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
      answersActions.setStaticFilters([]);

      dispatch({
        type: MapActionTypes.SetTopOverlayState,
        payload: { topOverlayState: OverlayState.None },
      });
    }
  }, [userLocation]);

  // const updateAnswersLocation = async () => {
  //   getUserLocation()
  //     .then((userLocation) => {
  //       answersActions.setUserLocation(userLocation.coords);
  //     })
  //     .catch(() => {
  //       // eslint-disable-next-line no-console
  //       console.log('Could not get user location...defaulting to NYC');
  //       answersActions.setUserLocation({ latitude: -73.935242, longitude: 40.73061 });
  //     });
  // };

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

  return (
    <div>
      <div ref={mapContainer} className="absolute top-0 bottom-0 w-full overflow-hidden"></div>
    </div>
  );
};

export default EventsMap;
