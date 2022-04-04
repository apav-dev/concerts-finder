import { createContext, Dispatch, useReducer } from 'react';
import { OverlayState } from './TopOverlay';

type MapStateType = {
  selectedLocationId: string;
  lastSearchInput: string;
  topOverlayState: OverlayState;
  spotifyAccessToken: string;
  artistSpotifyId: string;
  sidePanelWidth: number;
};

const mapState = {
  selectedLocationId: '',
  spotifyAccessToken: '',
  lastSearchInput: '',
  topOverlayState: OverlayState.Loading,
  artistSpotifyId: '',
  sidePanelWidth: 0,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum MapActionTypes {
  SetSelectedLocation = 'SET_SELECTED_LOCATION',
  ClearSelectedLocation = 'CLEAR_SELECTED_LOCATION',
  SetSpotifyAccessToken = 'SET_SPOTIFY_ACCESS_TOKEN',
  SetLastSearchInput = 'SET_LAST_SEARCH_INPUT',
  SetTopOverlayState = 'SET_TOP_OVERLAY_STATE',
  SetArtistSpotifyId = 'SET_ARTIST_SPOTIFY_ID',
  ClearArtistSpotifyId = 'CLEAR_ARTIST_SPOTIFY_ID',
  SetSidePanelWidth = 'SET_SIDE_PANEL_WIDTH',
}

type MapPayload = {
  [MapActionTypes.SetSelectedLocation]: {
    selectedLocationId: string;
  };
  [MapActionTypes.ClearSelectedLocation]: {
    selectedLocationId: string;
  };
  [MapActionTypes.SetSpotifyAccessToken]: {
    spotifyAccessToken: string;
  };
  [MapActionTypes.SetLastSearchInput]: {
    lastSearchInput: string;
  };
  [MapActionTypes.SetTopOverlayState]: {
    topOverlayState: OverlayState;
  };
  [MapActionTypes.SetArtistSpotifyId]: {
    artistSpotifyId: string;
  };
  [MapActionTypes.ClearArtistSpotifyId]: void;
  [MapActionTypes.SetSidePanelWidth]: {
    sidePanelWidth: number;
  };
};

export type MapActions = ActionMap<MapPayload>[keyof ActionMap<MapPayload>];

export const selectedLocationReducer = (state: string, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetSelectedLocation:
      return action.payload.selectedLocationId;
    case MapActionTypes.ClearSelectedLocation:
      return '';
    default:
      return state;
  }
};

export const spotifyActionReducer = (state: string, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetSpotifyAccessToken:
      return action.payload.spotifyAccessToken;
    default:
      return state;
  }
};

export const lastSearchInputReducer = (state: string, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetLastSearchInput:
      return action.payload.lastSearchInput;
    default:
      return state;
  }
};

export const topOverlayStateReducer = (state: OverlayState, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetTopOverlayState:
      return action.payload.topOverlayState;
    default:
      return state;
  }
};

export const artistSpotifyIdReducer = (state: string, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetArtistSpotifyId:
      return action.payload.artistSpotifyId;
    case MapActionTypes.ClearArtistSpotifyId:
      return '';
    default:
      return state;
  }
};

export const sidePanelWidthReducer = (state: number, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetSidePanelWidth:
      return action.payload.sidePanelWidth;
    default:
      return state;
  }
};

export const MapContext = createContext<{ state: MapStateType; dispatch: Dispatch<MapActions> }>({
  state: mapState,
  dispatch: () => null,
});

const mainReducer = (
  {
    selectedLocationId,
    spotifyAccessToken,
    lastSearchInput,
    topOverlayState,
    artistSpotifyId,
    sidePanelWidth,
  }: MapStateType,
  action: MapActions
): MapStateType => {
  const newState = {
    selectedLocationId: selectedLocationReducer(selectedLocationId, action),
    spotifyAccessToken: spotifyActionReducer(spotifyAccessToken, action),
    lastSearchInput: lastSearchInputReducer(lastSearchInput, action),
    topOverlayState: topOverlayStateReducer(topOverlayState, action),
    artistSpotifyId: artistSpotifyIdReducer(artistSpotifyId, action),
    sidePanelWidth: sidePanelWidthReducer(sidePanelWidth, action),
  };
  return newState;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MapProvider: React.FC = ({ children }: any) => {
  const [state, dispatch] = useReducer(mainReducer, mapState);
  return <MapContext.Provider value={{ state, dispatch }}>{children}</MapContext.Provider>;
};
