/*
Known issues
- weird characters in artist names (Kanye West/Ye, RUFUS DU SOL)
- Gap in artists with events that causes time out
- removal of past events
- grouping of spotify genres

- add edit entity API
- hide API keys
- fetch venue images with Google Places API
- clean up tests
- clean up logging 

Need to refactor to make everything run in parallel and return sheets of events at once
*/

/*
New Process:
1. Send all the Spotify Artists off to function to get associated Seat Geek Artists. Return object containing Spotify Artist and optional Seat Geek Artist
2. For each artist now added, send off to get all the seat geek ids to get every event.
3. Go through each event and add redo step 1 for all the event artists
4. Send off all the valid artists to be created. Need to check if each exist. If no, create. If yes, edit.
5. For each event, gather the list of venues.
6. Send of each venue name to get the image for each venue.
7. Send off list of venues to be created.
8. Now that all the linked entities have been created, try to return a list of all the events. Might need to return 1 at a time.

* Check rate limiting for Spotify and SeatGeek - doesn't seem to be an issue for these APIs but mention that it could be for other APIs
* check if there are limits to Promise.all - doesn't seem like it will be an issue for this case
* add and test Google Places API and Edit entities API - DONE
* time each piece of this
* Kanye West
*/

import {
  createKgEntity,
  checkIfKgEntityExists,
  fetchEventsByPerformerById,
  searchPerformersFromSeatGeek,
  searchForPlace,
} from './api.ts';
import {
  fetchMyTopArtistsFromSpotify,
  fetchArtistFromSpotify,
  getAccessToken,
} from './spotify_api.ts';
import {
  KgLocation,
  KgPhoto,
  SeatGeekEvent,
  SeatGeekPerformer,
  SpotifyArtist,
  State,
} from './types.ts';
import { formatGoogleImageUrls, getRegionForState } from './utils.ts';

//TODO: id checking
const findEventsForFavoriteArtists = async (stateString: string): Promise<string> => {
  let spotifyAccessToken =
    'BQB8WK5KLAcYp2QuFS6lfbHPYVGzIYSEiqZuGIbnFN0ofWPVIWv3HwMeMfyaP2UEWwjbYkznixpjp0PcwXLvoho-6mMhX2aiKZGZIhjJh-1phoJNtS8GggJa_QkIp4xOv9Fk7PSHyInBauj2z_9YJbJ0kA';

  const [favoriteSpotifyArtists, newToken] = await fetchMyTopArtistsWithRetry(spotifyAccessToken);

  if (newToken) {
    spotifyAccessToken = newToken;
  }

  const uniqueArtistIds = [];

  // Find which of my personal top 50 artists have events listed on SeatGeek. Not all artists have events.
  const artistsWithEventsPromises = await Promise.allSettled(
    favoriteSpotifyArtists.map((artist) => fetchSeatGeekPerformerForSpotifyArtist(artist))
  );

  const artistsWithEvents: {
    spotifyArtist: SpotifyArtist;
    seatGeekPerformer: SeatGeekPerformer;
  }[] = [];

  for (const artistWithEventPromise of artistsWithEventsPromises) {
    if (artistWithEventPromise.status === 'fulfilled') {
      const artist = artistWithEventPromise.value;
      if (artist.seatGeekPerformer) {
        artistsWithEvents.push({
          spotifyArtist: artistWithEventPromise.value.spotifyArtist,
          seatGeekPerformer: artistWithEventPromise.value.seatGeekPerformer,
        });
        uniqueArtistIds.push(artistWithEventPromise.value.seatGeekPerformer.id);
      }
    }
  }

  // Fetch all of the events that my top 50 artists are performing at
  const eventsPromises = await Promise.allSettled(
    artistsWithEvents.map((artistWithEvent) =>
      fetchEventsByPerformerById(artistWithEvent.seatGeekPerformer.id.toString())
    )
  );

  const listedEvents: SeatGeekEvent[] = [];
  const uniqueMusicFestivalNames: string[] = [];

  for (const eventsPromise of eventsPromises) {
    if (eventsPromise.status === 'fulfilled') {
      const seatGeekEventsResp = eventsPromise.value;

      //filter out duplicate festivals and use performer name
      for (const event of seatGeekEventsResp.events) {
        if (!uniqueMusicFestivalNames.includes(event.performers[0]?.name)) {
          if (event.type === 'music_festival') {
            event.title = event.performers[0].name;
            uniqueMusicFestivalNames.push(event.performers[0].name);
            event.performers.shift();
          }
          listedEvents.push(event);
        }
      }
    }
  }

  /// Aggregate all the locations that need created.
  const locations = listedEvents.map((listedEvent) => ({
    ...listedEvent.venue,
    id: listedEvent.venue.id + '_venue',
    c_usRegion: getRegionForState(listedEvent.venue.state),
  }));

  // Use Google Places API to get photos for each location

  // Add the other artists performing at the events to the artistsWithEventsList.
  const otherEventArtists: {
    spotifyArtist?: SpotifyArtist;
    seatGeekPerformer: SeatGeekPerformer;
  }[] = [];

  const eventPerformers = listedEvents.flatMap((listedEvent) => listedEvent.performers);
  const otherEventArtistPromises = await Promise.allSettled(
    eventPerformers.map((eventPerformer) =>
      fetchSpotifyArtistForSeatGeekPerformer(spotifyAccessToken, eventPerformer)
    )
  );

  for (const otherEventArtistPromise of otherEventArtistPromises) {
    if (otherEventArtistPromise.status === 'fulfilled') {
      const otherEventArtist = otherEventArtistPromise.value;

      if (!uniqueArtistIds.includes(otherEventArtist.seatGeekPerformer.id)) {
        otherEventArtists.push(otherEventArtist);
        uniqueArtistIds.push(otherEventArtist.seatGeekPerformer.id);
      }
    }
  }

  return listedEvents.length.toString();
  // Return the data as an object and strigify the state as the nextPageToken.
  // return JSON.stringify({ data, nextPageToken: JSON.stringify(state) });
};

export const fetchSeatGeekPerformerForSpotifyArtist = async (
  spotifyArtist: SpotifyArtist
): Promise<{ spotifyArtist: SpotifyArtist; seatGeekPerformer: SeatGeekPerformer }> => {
  const seatGeekResponse = await searchPerformersFromSeatGeek(spotifyArtist.name);

  const seatGeekPerformer = seatGeekResponse.performers.find(
    (performer) =>
      performer.type === 'band' &&
      performer.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace('\t', '')
        .toLowerCase() ===
        spotifyArtist.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace('\t', '')
          .toLowerCase()
  );

  if (seatGeekPerformer) {
    return { spotifyArtist, seatGeekPerformer };
  } else {
    // eslint-disable-next-line no-console
    console.error(`Artist ${spotifyArtist.name} does not exist in Seat Geek database`);
    throw new Error();
  }
};

const fetchSpotifyArtistForSeatGeekPerformer = async (
  spotifyAccessToken: string,
  seatGeekPerformer: SeatGeekPerformer
): Promise<{ spotifyArtist?: SpotifyArtist; seatGeekPerformer: SeatGeekPerformer }> => {
  const spotifyArtistId = seatGeekPerformer.links
    ?.find((link) => link.provider === 'spotify')
    ?.id.split(':')[2];

  if (spotifyArtistId) {
    const [spotifyArtist, newToken] = await fetchArtistWithRetry(
      spotifyAccessToken,
      spotifyArtistId
    );

    return { spotifyArtist, seatGeekPerformer };
  } else {
    return { seatGeekPerformer };
  }
};

// export const createArtist = async (
//   artistName: string,
//   spotifyAccessToken: string
// ): Promise<[string, string]> => {
//   let spotifyArtist: SpotifyArtist | undefined;
//   let artistImage: KgPhoto | undefined;

//   console.log(`Checking if ${artistName} exists and has events...will create if not`);

//   const seatGeekPerformer = await fetchSeatGeekPerformerForSpotifyArtist(artistName);

//   if (seatGeekPerformer) {
//     let artistId = await checkIfKgEntityExists(seatGeekPerformer.id.toString());

//     // only create the artist entity in the KG if it doesn't exist yet
//     if (!artistId) {
//       // TODO: move to utils
//       const spotifyArtistId = seatGeekPerformer.links
//         ?.find((link) => link.provider === 'spotify')
//         ?.id.split(':')[2];

//       if (spotifyArtistId) {
//         let newToken = '';
//         [spotifyArtist, newToken] = await fetchArtistWithRetry(spotifyAccessToken, spotifyArtistId);

//         if (spotifyArtist.images[0]) {
//           artistImage = { image: { url: spotifyArtist.images[0].url } };
//         }

//         if (newToken) {
//           spotifyAccessToken = newToken;
//         }
//       }

//       console.log('creating ' + spotifyArtist?.name);
//       artistId = await createKgEntity('ce_artist', {
//         meta: {
//           id: seatGeekPerformer.id.toString(),
//         },
//         name: spotifyArtist?.name || seatGeekPerformer.name,
//         c_genres: spotifyArtist?.genres,
//         primaryPhoto: artistImage,
//         c_spotifyId: spotifyArtist?.id,
//         c_spotifyFollowers: spotifyArtist?.followers.total.toString(),
//       });
//     }

//     return [artistId, spotifyAccessToken];
//   } else {
//     return ['', ''];
//   }
// };

const createVenue = async (location: KgLocation): Promise<string> => {
  console.log('fetching venue with id: ' + location.meta.id);
  let venueId = await checkIfKgEntityExists(location.meta.id);

  if (!venueId) {
    console.log(`creating location ${location.name}`);
    venueId = await createKgEntity('location', location);
  } else {
    console.log(`location ${location.name} already exists`);
  }

  return venueId;
};

/**
 *
 *
 * TODO: is it possible to keep retry logic in spotify_api.ts?
 * @param spotifyAccessToken
 * @param spotifyArtistId
 * @returns
 */
const fetchArtistWithRetry = async (
  spotifyAccessToken: string,
  spotifyArtistId: string
): Promise<[SpotifyArtist, string]> => {
  try {
    const artist = await fetchArtistFromSpotify(spotifyAccessToken, spotifyArtistId);
    return [artist, ''];
  } catch (_error) {
    console.log('fetching new token');
    spotifyAccessToken = await getAccessToken();
  }

  const artist = await fetchArtistFromSpotify(spotifyAccessToken, spotifyArtistId);

  return [artist, spotifyAccessToken];
};

const fetchMyTopArtistsWithRetry = async (
  spotifyAccessToken: string
): Promise<[SpotifyArtist[], string]> => {
  try {
    const artistsResp = await fetchMyTopArtistsFromSpotify(spotifyAccessToken);
    return [artistsResp.items, ''];
  } catch (_error) {
    console.log('fetching new token');
    spotifyAccessToken = await getAccessToken();
  }

  const artistsResp = await fetchMyTopArtistsFromSpotify(spotifyAccessToken);

  return [artistsResp.items, spotifyAccessToken];
};

export const processEvents = (events: SeatGeekEvent[]): SeatGeekEvent[] => {
  const processedEvents: SeatGeekEvent[] = [];
  const musicFestivalNames: string[] = [];

  for (const event of events) {
    if (!musicFestivalNames.includes(event.performers[0]?.name)) {
      if (event.type === 'music_festival') {
        event.title = event.performers[0].name;
        musicFestivalNames.push(event.performers[0].name);
        event.performers.shift();
      }

      processedEvents.push(event);
    }
  }

  return processedEvents;
};

export const getGooglePlaceImageUrls = async (placeName: string): Promise<string[]> => {
  const googlePlaceResults = await searchForPlace(placeName);

  if (
    googlePlaceResults.results.length > 0 &&
    googlePlaceResults.results[0].name.toLowerCase() === placeName
  ) {
    return formatGoogleImageUrls(
      'AIzaSyAqtI0LYwB9Wo0GXiZU4cH8cVpFFi3u8Ko',
      googlePlaceResults.results[0].photos.map((photo) => photo.photo_reference)
    );
  } else {
    return [];
  }
};

export default findEventsForFavoriteArtists;
