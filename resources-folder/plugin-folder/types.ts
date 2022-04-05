// deno-lint-ignore-file camelcase
export interface State {
  spotifyArtists: SpotifyArtist[];
  events: SeatGeekEvent[];
  spotifyAccessToken: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  followers: {
    total: number;
  };
}

export interface SpotifyArtists {
  items: SpotifyArtist[];
}

export interface KgPhoto {
  image: {
    url: string;
  };
}

export interface KgArtist {
  meta: KgMeta;
  name: string;
  primaryPhoto?: KgPhoto;
  c_genres?: string[];
  c_spotifyId?: string;
  c_spotifyFollowers?: string;
}

export interface SeatGeekPerformer {
  id: number;
  type: string;
  name: string;
  image: string;
  genres?: { name: string }[];
  links?: {
    id: string;
    url: string;
    provider: string;
  }[];
}

export interface SeatGeekPerfomers {
  performers: SeatGeekPerformer[];
}

export interface SeatGeekVenue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface SeatGeekEvent {
  id: string;
  type: string;
  title: string;
  datetime_local: string;
  venue: SeatGeekVenue;
  performers: SeatGeekPerformer[];
  stats: {
    lowest_price: number;
    average_price: number;
    highest_price: number;
  };
  url: string;
}

export interface SeatGeekEvents {
  events: SeatGeekEvent[];
}

export interface KgMeta {
  id: string;
}

export interface KgResponseEntity {
  response: {
    meta: KgMeta;
  };
}

export interface KgLocation {
  meta: KgMeta;
  name?: string;
  address?: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
  };
  c_usRegion?: string;
  photoGallery?: KgPhoto[];
}

export interface KgEvent {
  id: string;
  name?: string;
  linkedLocationId?: string;
  startDateTime?: string;
  endDateTime?: string;
  linkedArtistIds?: string[];
  lowestTicketPrice?: string;
  averageTicketPrice?: string;
  highestTicketPrice?: string;
  ticketUrl?: string;
}

export interface GooglePlaceResults {
  results: {
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    photos: {
      photo_reference: string;
    }[];
  }[];
}
