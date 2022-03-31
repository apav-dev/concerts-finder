import { useContext, useEffect } from 'react';
import { MapContext } from './MapContext';

export const SpotifyPlayer = (): JSX.Element => {
  const { state, dispatch } = useContext(MapContext);

  // useEffect(() => {

  // }, [state.spotifyAccessToken]);
  return <div></div>;
};
