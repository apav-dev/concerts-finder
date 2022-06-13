import { createContext, Dispatch, useReducer } from 'react';

type OverlayState = {
  topOverlayStatus: OverlayStatus;
  sidePanelWidth: number;
};

export enum OverlayStatus {
  None = 'none',
  Spotify = 'spotify',
  Loading = 'loading',
}

enum OverlayActionTypes {
  SetTopOverlayState,
  SetSidePanelWidth,
}

interface SetTopOverlayState {
  type: OverlayActionTypes.SetTopOverlayState;
  payload: { topOverlayState: OverlayStatus };
}

interface SetSidePanelWidth {
  type: OverlayActionTypes.SetSidePanelWidth;
  payload: { sidePanelWidth: number };
}

type OverlayActions = SetTopOverlayState | SetSidePanelWidth;

const initialState: OverlayState = {
  topOverlayStatus: OverlayStatus.Loading,
  sidePanelWidth: 0,
};

const OverlayReducer = (state = initialState, action: OverlayActions) => {
  switch (action.type) {
    case OverlayActionTypes.SetTopOverlayState:
      return {
        ...state,
        topOverlayStatus: action.payload.topOverlayState,
      };
    case OverlayActionTypes.SetSidePanelWidth:
      return {
        ...state,
        sidePanelWidth: action.payload.sidePanelWidth,
      };
    default:
      return state;
  }
};

const OverlayContext = createContext<{
  overlayState: OverlayState;
  dispatch: Dispatch<OverlayActions>;
}>({
  overlayState: initialState,
  dispatch: () => null,
});

const OverlayProvider: React.FC = ({ children }) => {
  const [overlayState, dispatch] = useReducer(OverlayReducer, initialState);
  return (
    <OverlayContext.Provider value={{ overlayState, dispatch }}>{children}</OverlayContext.Provider>
  );
};

export { OverlayProvider, OverlayContext, OverlayActionTypes };
