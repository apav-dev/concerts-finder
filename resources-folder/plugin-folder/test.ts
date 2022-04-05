import {
  searchPerformersFromSeatGeek,
  fetchEventsByPerformerById,
  checkIfKgEntityExists,
  editKgEntity,
  searchForPlace,
} from "./api.ts";
import { fetchMyTopArtistsFromSpotify, getAccessToken } from "./spotify_api.ts";
import { SeatGeekPerformer } from "./types.ts";
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.114.0/testing/asserts.ts";
import findEventsForFavoriteArtists, {
  createArtist,
  getGooglePlaceImageUrls,
} from "./mod.ts";

// Deno.test("findEventsForFavoriteArtists", async () => {
//   const resp = await findEventsForFavoriteArtists("dummy token");

//   console.log(resp);
// });

// Deno.test("fetchMyArtistsFromSpotify", async () => {
//   const resp = await fetchMyTopArtistsFromSpotify();

//   assertExists(resp.items);
// });

// Deno.test("searchPerformersFromSeatGeek", async () => {
//   const resp = await searchPerformersFromSeatGeek("rufus du sol");

//   assertExists(resp.performers);
// });

// Deno.test("fetchEventsByPerformerId", async () => {
//   const resp = await fetchEventsByPerformerById(267482);

//   assertExists(resp.events);
//   assertExists(resp.events[0].performers);
//   assertExists(resp.events[0].venue);
// });

// Deno.test("fetchKgEntityThatExists", async () => {
//   const resp = await fetchKgEntity("6296");

//   assertExists(resp?.response.meta.id);
//   assertEquals(resp?.response.meta.id, "6296");
// });

// Deno.test("fetchKgEntityThatDoesNotExist", async () => {
//   const resp = await fetchKgEntity("dummyId");

//   assertEquals(resp, undefined);
// });

// Deno.test("createArtistThatDoesNotExist", async () => {
//   const resp = await createArtist(
//     seatGeekPerformer,
//     "BQCdp8Egq7PyfkMrbcnbBqUxe3K3-s8LjhtHF_9PJwRnrukt8OVtqVMtrbHOL3QqMr6NxNJwIIeCmDzNliBz6JBDqExgQVv9sfE2e1d4l0TkeE4eDWRdNl4FeX9AVziiWux8cX57ytKJJ4HjU4GdN_jfXJi0aS5fj2pVHqvE1NeUll9oZzMtpMHK-CV9VLQBVaUnjr4ii3AB"
//   );

//   assertEquals(resp[0], "149447");
// });

// Deno.test("getAccessToken", async () => {
//   const resp = await getAccessToken();

//   console.log(resp);
// });

// Deno.test("findEventsForFavoriteArtists", async () => {
//   const nextPageToken = { pageToken: "" };
//   const events = [];
//   const data = {};

//   do {
//     const respStr = await findEventsForFavoriteArtists(
//       JSON.stringify(nextPageToken)
//     );
//     const respObj = JSON.parse(respStr);

//     events.push(respObj.data);
//     console.log("Finished with " + respObj.data.name);

//     nextPageToken.pageToken = respObj.nextPageToken;

//     if (JSON.parse(nextPageToken.pageToken).spotifyArtists.length === 1) {
//       console.log(
//         "last artist: " + JSON.parse(nextPageToken.pageToken).spotifyArtists[0]
//       );
//     }
//   } while (data !== {});

//   console.log(events[events.length - 2]);
//   console.log(events[events.length - 1]);
// });

// Deno.test("findSeatGeekPerformer", async () => {
//   const performer = await searchPerformersFromSeatGeek("H.E.R");

//   console.log(performer);
// });
// const seatGeekPerformer: SeatGeekPerformer = {
//   name: "Leisure",
//   image:
//     "https://seatgeek.com/images/performers-landscape/leisure-400fec/149447/huge.jpg",
//   id: 149447,

//   links: [
//     {
//       id: "spotify:artist:7b04D0yLktCUpvxQBhmG7R",
//       url: "http://open.spotify.com/artist/7b04D0yLktCUpvxQBhmG7R",
//       provider: "spotify",
//     },
//   ],
// };

// Deno.test("editEntity", async () => {
//   const resp = await editKgEntity("8102_venue", { meta: { id: "8102_venue" } });

//   console.log(resp);
// });

Deno.test("getGooglePlaceImageUrls", async () => {
  const resp = await getGooglePlaceImageUrls("barclays center");

  console.log(resp.length);
  console.log(resp[0]);
});
