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
2. Send off all the valid artists to be created. Need to check if each exist. If no, create. If yes, edit.
3. For each artist now added, send off all the seat geek ids to get every event.
4. For each event, gather the list of venues.
5. Send of each venue name to get the image for each venue.
6. Send off list of venues to be created.
7. Now that all the linked entities have been created, try to return a list of all the events. Might need to return 1 at a time.

* Check rate limiting for Spotify and SeatGeek - doesn't seem to be an issue for these APIs but mention that it could be for other APIs
* check if there are limits to Promise.all - doesn't seem like it will be an issue for this case
* add and test Google Places API and Edit entities API - DONE
* time each piece of this
*/

import {
  createKgEntity,
  checkIfKgEntityExists,
  fetchEventsByPerformerById,
  searchPerformersFromSeatGeek,
  searchForPlace,
} from "./api.ts";
import {
  fetchMyTopArtistsFromSpotify,
  fetchArtistFromSpotify,
  getAccessToken,
} from "./spotify_api.ts";
import {
  KgLocation,
  KgPhoto,
  SeatGeekEvent,
  SeatGeekPerformer,
  SpotifyArtist,
  State,
} from "./types.ts";
import { formatGoogleImageUrls, getRegionForState } from "./utils.ts";

const findEventsForFavoriteArtists = async (
  stateString: string
): Promise<string> => {
  let state: State;
  const eventArtistIds: string[] = [];
  let data;

  const inputJson = JSON.parse(stateString);

  // Initiate state the first time the function is called
  if (!inputJson.pageToken) {
    state = {
      spotifyArtists: [],
      events: [],
      spotifyAccessToken:
        "BQDCY3m2ddQ9lTtcnHEpdsM9v2Z8WNhVXY3-aCfgVV-QZ0jw_rG4uUMgGUqhIvtJrh5P8PkbrY4DC8LD1F8vipM-sHzpW9tNQxHDHDXxRSXR-ZB8sLxpVbw4yZ7VN0NfZfJAJlQy8Wm5T6Nb2OnU-en14hXjs5QTNnXZaAZ1nLQ-3GwVIHZghVPtsKSwvK913EZ4EmSVC1k9",
    };

    //fetch personal top 50 artists from Spotify the first time the function runs
    const [spotifyArtistsResp, spotifyAccessToken] =
      await fetchMyTopArtistsWithRetry(state.spotifyAccessToken);
    state.spotifyArtists = spotifyArtistsResp;

    state.spotifyArtists = state.spotifyArtists;

    if (spotifyAccessToken) {
      state.spotifyAccessToken = spotifyAccessToken;
    }
  } else {
    // Parse the page token string after the first run
    state = JSON.parse(inputJson.pageToken);
  }

  // Each time there are no events left in the state, fetch events for next artist in the list
  while (state.events.length === 0) {
    if (state.spotifyArtists.length === 0) {
      return JSON.stringify({ data: {} });
    }

    const artist = state.spotifyArtists.shift();

    if (artist) {
      const seatGeekPerformer = await fetchSeatGeekPerformerForSpotifyArtist(
        artist.name
      );

      if (seatGeekPerformer) {
        const artistEventsResp = await fetchEventsByPerformerById(
          seatGeekPerformer.id.toString()
        );

        const processedEvents = processEvents(artistEventsResp.events);

        if (processedEvents.length > 0) {
          state.events = processedEvents;
        }
      }
    }
  }

  const seatGeekEvent = state.events.shift();
  // TODO: is it valid to return blank data?
  if (seatGeekEvent) {
    const completedRequests = await Promise.allSettled(
      seatGeekEvent.performers.map((performer) =>
        createArtist(performer.name, state.spotifyAccessToken)
      )
    );

    for (const completedRequest of completedRequests) {
      if (completedRequest.status === "fulfilled") {
        const [artistId, spotifyAccessToken] = completedRequest.value;
        artistId && eventArtistIds.push(artistId);

        if (spotifyAccessToken) {
          state.spotifyAccessToken = spotifyAccessToken;
        }
      }
    }

    const locationId = await createVenue({
      meta: { id: `${seatGeekEvent.venue.id.toString()}_venue` },
      name: seatGeekEvent.venue.name,
      address: {
        line1: seatGeekEvent.venue.address,
        city: seatGeekEvent.venue.city,
        region: seatGeekEvent.venue.state,
        postalCode: seatGeekEvent.venue.postal_code,
      },
      c_usRegion: getRegionForState(seatGeekEvent.venue.state),
    });

    data = {
      id: seatGeekEvent.id,
      name: seatGeekEvent.title,
      linkedLocationId: locationId,
      startDateTime: seatGeekEvent.datetime_local,
      endDateTime: seatGeekEvent.datetime_local,
      linkedArtistIds: [...new Set(eventArtistIds)],
      lowestTicketPrice: seatGeekEvent.stats?.lowest_price?.toString(),
      averageTicketPrice: seatGeekEvent.stats?.average_price?.toString(),
      highestTicketPrice: seatGeekEvent.stats?.highest_price?.toString(),
      ticketUrl: seatGeekEvent.url,
    };
  }

  // Return the data as an object and strigify the state as the nextPageToken.
  return JSON.stringify({ data, nextPageToken: JSON.stringify(state) });
};

export const fetchSeatGeekPerformerForSpotifyArtist = async (
  artistName: string
): Promise<SeatGeekPerformer | undefined> => {
  const seatGeekResponse = await searchPerformersFromSeatGeek(artistName);

  const performer = seatGeekResponse.performers.find(
    (performer) =>
      performer.type === "band" &&
      performer.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("\t", "")
        .toLowerCase() ===
        artistName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace("\t", "")
          .toLowerCase()
  );

  return performer;
};

export const createArtist = async (
  artistName: string,
  spotifyAccessToken: string
): Promise<[string, string]> => {
  let spotifyArtist: SpotifyArtist | undefined;
  let artistImage: KgPhoto | undefined;

  console.log(
    `Checking if ${artistName} exists and has events...will create if not`
  );

  const seatGeekPerformer = await fetchSeatGeekPerformerForSpotifyArtist(
    artistName
  );

  if (seatGeekPerformer) {
    let artistId = await checkIfKgEntityExists(seatGeekPerformer.id.toString());

    // only create the artist entity in the KG if it doesn't exist yet
    if (!artistId) {
      // TODO: move to utils
      const spotifyArtistId = seatGeekPerformer.links
        ?.find((link) => link.provider === "spotify")
        ?.id.split(":")[2];

      if (spotifyArtistId) {
        let newToken = "";
        [spotifyArtist, newToken] = await fetchArtistWithRetry(
          spotifyAccessToken,
          spotifyArtistId
        );

        if (spotifyArtist.images[0]) {
          artistImage = { image: { url: spotifyArtist.images[0].url } };
        }

        if (newToken) {
          spotifyAccessToken = newToken;
        }
      }

      console.log("creating " + spotifyArtist?.name);
      artistId = await createKgEntity("ce_artist", {
        meta: {
          id: seatGeekPerformer.id.toString(),
        },
        name: spotifyArtist?.name || seatGeekPerformer.name,
        c_genres: spotifyArtist?.genres,
        primaryPhoto: artistImage,
        c_spotifyId: spotifyArtist?.id,
        c_spotifyFollowers: spotifyArtist?.followers.total.toString(),
      });
    }

    return [artistId, spotifyAccessToken];
  } else {
    return ["", ""];
  }
};

const createVenue = async (location: KgLocation): Promise<string> => {
  console.log("fetching venue with id: " + location.meta.id);
  let venueId = await checkIfKgEntityExists(location.meta.id);

  if (!venueId) {
    console.log(`creating location ${location.name}`);
    venueId = await createKgEntity("location", location);
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
    const artist = await fetchArtistFromSpotify(
      spotifyAccessToken,
      spotifyArtistId
    );
    return [artist, ""];
  } catch (_error) {
    console.log("fetching new token");
    spotifyAccessToken = await getAccessToken();
  }

  const artist = await fetchArtistFromSpotify(
    spotifyAccessToken,
    spotifyArtistId
  );

  return [artist, spotifyAccessToken];
};

const fetchMyTopArtistsWithRetry = async (
  spotifyAccessToken: string
): Promise<[SpotifyArtist[], string]> => {
  try {
    const artistsResp = await fetchMyTopArtistsFromSpotify(spotifyAccessToken);
    return [artistsResp.items, ""];
  } catch (_error) {
    console.log("fetching new token");
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
      if (event.type === "music_festival") {
        event.title = event.performers[0].name;
        musicFestivalNames.push(event.performers[0].name);
        event.performers.shift();
      }

      processedEvents.push(event);
    }
  }

  return processedEvents;
};

export const getGooglePlaceImageUrls = async (
  placeName: string
): Promise<string[]> => {
  const googlePlaceResults = await searchForPlace(placeName);

  if (
    googlePlaceResults.results.length > 0 &&
    googlePlaceResults.results[0].name.toLowerCase() === placeName
  ) {
    return formatGoogleImageUrls(
      "AIzaSyAqtI0LYwB9Wo0GXiZU4cH8cVpFFi3u8Ko",
      googlePlaceResults.results[0].photos.map((photo) => photo.photo_reference)
    );
  } else {
    return [];
  }
};

export default findEventsForFavoriteArtists;
