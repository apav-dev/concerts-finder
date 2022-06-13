import { createContext, Dispatch, useReducer } from 'react';

type SpotifyState = {
  spotifyAccessToken: string;
  artistSpotifyId: string;
};

export enum SpotifyActionTypes {
  SetSpotifyAccessToken,
  SetArtistSpotifyId,
  ClearArtistSpotifyId,
}

export interface SetSpotifyAccessToken {
  type: SpotifyActionTypes.SetSpotifyAccessToken;
  payload: { spotifyAccessToken: string };
}

export interface SetArtistSpotifyId {
  type: SpotifyActionTypes.SetArtistSpotifyId;
  payload: { artistSpotifyId: string };
}

export interface ClearArtistSpotifyId {
  type: SpotifyActionTypes.ClearArtistSpotifyId;
}

export type SpotifyActions = SetSpotifyAccessToken | SetArtistSpotifyId | ClearArtistSpotifyId;

const initialState: SpotifyState = {
  spotifyAccessToken: '',
  artistSpotifyId: '',
};

const SpotifyReducer = (state = initialState, action: SpotifyActions) => {
  switch (action.type) {
    case SpotifyActionTypes.SetSpotifyAccessToken:
      return {
        ...state,
        spotifyAccessToken: action.payload.spotifyAccessToken,
      };
    case SpotifyActionTypes.SetArtistSpotifyId:
      return {
        ...state,
        artistSpotifyId: action.payload.artistSpotifyId,
      };
    case SpotifyActionTypes.ClearArtistSpotifyId:
      return {
        ...state,
        artistSpotifyId: '',
      };
    default:
      return state;
  }
};

const SpotifyContext = createContext<{
  spotifyState: SpotifyState;
  dispatch: Dispatch<SpotifyActions>;
}>({
  spotifyState: initialState,
  dispatch: () => null,
});

const SpotifyProvider: React.FC = ({ children }) => {
  const [spotifyState, dispatch] = useReducer(SpotifyReducer, initialState);
  return (
    <SpotifyContext.Provider value={{ spotifyState, dispatch }}>{children}</SpotifyContext.Provider>
  );
};

export { SpotifyProvider, SpotifyContext };
