import React, { createContext, Dispatch, useReducer } from 'react';

type MapState = {
  selectedLocationId: string;
};

export enum MapActionTypes {
  SetSelectedLocation,
  ClearSelectedLocation,
}

export interface SetSelectedLocation {
  type: MapActionTypes.SetSelectedLocation;
  payload: { selectedLocationId: string };
}

export interface ClearSelectedLocation {
  type: MapActionTypes.ClearSelectedLocation;
}

export type MapActions = SetSelectedLocation | ClearSelectedLocation;

const initialState: MapState = { selectedLocationId: '' };

export const MapReducer = (state = initialState, action: MapActions) => {
  switch (action.type) {
    case MapActionTypes.SetSelectedLocation:
      return {
        ...state,
        selectedLocationId: action.payload.selectedLocationId,
      };
    case MapActionTypes.ClearSelectedLocation:
      return {
        ...state,
        selectedLocationId: '',
      };
    default:
      return state;
  }
};

const MapContext = createContext<{ mapState: MapState; dispatch: Dispatch<MapActions> }>({
  mapState: initialState,
  dispatch: () => null,
});

const MapProvider: React.FC = ({ children }) => {
  const [mapState, dispatch] = useReducer(MapReducer, initialState);
  return <MapContext.Provider value={{ mapState, dispatch }}>{children}</MapContext.Provider>;
};

export { MapProvider, MapContext };
