import { useAnswersState } from '@yext/answers-headless-react';
import { Filters, SearchBar, SpellCheck, VerticalResults } from '@yext/answers-react-components';
import classNames from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import { BiCaretLeft } from 'react-icons/bi';
import EventCard from './EventCard';
import { MapActionTypes, MapContext } from './MapContext';
import { MapFilterCollapsibleLabel } from './MapFilterCollapsibleLabel';
import { SpotifyPlayer } from './SpotifyPlayer';
import TopOverlay, { OverlayState } from './TopOverlay';

export const EventsOverlay = (): JSX.Element => {
  const resultsContainer = useRef<HTMLDivElement>(null);

  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [scrollAtTop, setScrollAtTop] = useState(true);

  const { state, dispatch } = useContext(MapContext);

  const eventsCount = useAnswersState((state) => state.vertical.resultsCount) || 0;

  useEffect(() => {
    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();

      if (json.access_token) {
        dispatch({
          type: MapActionTypes.SetSpotifyAccessToken,
          payload: { spotifyAccessToken: json.access_token },
        });
      }
    }

    getToken();
  }, []);

  const handleResultsScroll = () =>
    resultsContainer.current?.scrollTop === 0 ? setScrollAtTop(true) : setScrollAtTop(false);

  return (
    <div>
      <TopOverlay overlayType={state.topOverlayState} />
      <div
        className={classNames(
          'absolute w-96 top-0 bottom-0 bg-backgroundGray z-10',
          {
            'bg-transparent': state.topOverlayState === OverlayState.Loading,
          },
          { 'left-0': showSearchPanel },
          { '-left-96': !showSearchPanel }
        )}
        style={{ transition: 'left 0.1s linear' }}
      >
        <div className={classNames(' flex items-center px-4', { 'shadow-bottom': !scrollAtTop })}>
          <SearchBar
            // TODO: ask about vertical divider
            customCssClasses={{
              container: 'my-2 w-full font-primary text-sm',
              inputDropdownContainer:
                'relative z-10 border rounded-lg border-gray-200 w-full overflow-hidden shadow-lg bg-cardGray',
              inputElement: 'outline-none flex-grow border-none h-full pl-0.5 pr-2 bg-cardGray',
            }}
            cssCompositionMethod="assign"
          />
        </div>
        <div
          ref={resultsContainer}
          className="overflow-y-scroll flex flex-col"
          // TODO: see if there's a better way of doing this
          style={{ maxHeight: '79.1875rem' }}
          onScroll={handleResultsScroll}
        >
          {eventsCount > 0 && (
            <VerticalResults
              CardComponent={EventCard}
              customCssClasses={{ container: 'p-4' }}
              allowPagination={true}
            />
          )}
          {eventsCount === 0 && state.topOverlayState !== OverlayState.Loading && (
            <span className="px-4">{`No search results found for ${state.lastSearchInput}`}</span>
          )}
          <SpellCheck
            customCssClasses={{
              container: 'text-md',
              helpText: '',
              link: 'text-fontPink font-bold hover:underline focus:underline',
            }}
            cssCompositionMethod="assign"
          />
        </div>
        {state.topOverlayState !== OverlayState.Loading && (
          <div className={'left-96 absolute top-0 bottom-0 flex flex-col justify-center '}>
            <button
              className="w-5 h-11 bg-backgroundGray rounded-r-md"
              onClick={() => setShowSearchPanel(!showSearchPanel)}
            >
              <BiCaretLeft
                className={classNames({ 'transform rotate-180': !showSearchPanel })}
                size={16}
              />
            </button>
          </div>
        )}
      </div>
      <div
        className={classNames(
          'absolute top-0',
          { 'left-96': showSearchPanel },
          { '-left-0': !showSearchPanel }
        )}
        style={{ transition: 'left 0.1s linear' }}
      >
        <Filters.Facets
          searchOnChange={true}
          className={classNames('absolute top-0 h-px bg-gray-200 flex mt-2 ml-8 z-10 font-primary')}
        >
          {(facets) =>
            facets.map((f, i) => {
              if (f.options.length === 0) {
                return null;
              }

              return (
                <div key={f.fieldId} className="md:w-40 mr-4 ">
                  <Filters.FilterGroup>
                    <MapFilterCollapsibleLabel
                      label={f.fieldId === 'c_artists.c_genres' ? 'Genres' : 'US Region'}
                    />
                    <Filters.CollapsibleSection className="flex flex-col space-y-3 max-h-56 overflow-y-auto bg-cardGray shadow-xl">
                      {f.options.map((o) => (
                        <Filters.CheckboxOption
                          key={o.displayName}
                          value={(o.value as string)
                            .toLowerCase()
                            .split(' ')
                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                            .join(' ')}
                          fieldId={f.fieldId}
                          customCssClasses={{
                            container: 'flex items-center space-x-3 ml-2',
                            label: 'text-sm font-normal cursor-pointer',
                            input:
                              'w-3.5 h-3.5 form-checkbox cursor-pointer border border-gray-300 rounded-sm text-fontPink focus:ring-fontPink',
                          }}
                          cssCompositionMethod={'assign'}
                        />
                      ))}
                    </Filters.CollapsibleSection>
                  </Filters.FilterGroup>
                </div>
              );
            })
          }
        </Filters.Facets>
      </div>
      {state.spotifyAccessToken && state.artistSpotifyId && (
        <SpotifyPlayer
          accessToken={state.spotifyAccessToken}
          artistId={state.artistSpotifyId}
          onClosePlayerClick={() =>
            dispatch({ type: MapActionTypes.ClearArtistSpotifyId, payload: undefined })
          }
        />
      )}
    </div>
  );
};
