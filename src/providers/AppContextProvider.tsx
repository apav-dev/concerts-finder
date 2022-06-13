import { OverlayProvider } from './OverlayProvider';
import { combineComponents } from '../utils/combineComponents';
import { MapProvider } from './MapProvider';
import { SpotifyProvider } from './SpotifyProvider';

const providers = [OverlayProvider, MapProvider, SpotifyProvider];

// From: https://medium.com/front-end-weekly/how-to-combine-context-providers-for-cleaner-react-code-9ed24f20225e
export const AppContextProvider = combineComponents(...providers);
