import { useAnswersState } from '@yext/answers-headless-react';
import { Filters, SearchBar, SpellCheck, VerticalResults } from '@yext/answers-react-components';
import classNames from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import { BiCaretLeft } from 'react-icons/bi';
import { OverlayActionTypes, OverlayContext, OverlayStatus } from '../providers/OverlayProvider';
import { SpotifyActionTypes, SpotifyContext } from '../providers/SpotifyProvider';
import EventCard from './EventCard';
import { MapFilterCollapsibleLabel } from './MapFilterCollapsibleLabel';
import { SpotifyPlayer } from './SpotifyPlayer';
import TopOverlay from './TopOverlay';

export const EventsOverlay = (): JSX.Element => {
  const resultsContainer = useRef<HTMLDivElement>(null);
  const sidePanel = useRef<HTMLDivElement>(null);

  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [scrollAtTop, setScrollAtTop] = useState(true);

  const spotifyContext = useContext(SpotifyContext);
  const overlayContext = useContext(OverlayContext);

  const eventsCount = useAnswersState((state) => state.vertical.resultsCount) || 0;
  const mostRecentSearch = useAnswersState((state) => state.query.mostRecentSearch);

  useEffect(() => {
    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();

      if (json.access_token) {
        spotifyContext.dispatch({
          type: SpotifyActionTypes.SetSpotifyAccessToken,
          payload: { spotifyAccessToken: json.access_token },
        });
      }
    }

    process.env.NODE_ENV === 'development' && getToken();
  }, []);

  useEffect(() => {
    if (sidePanel.current) {
      const sidePanelWidth = showSearchPanel ? sidePanel.current.clientWidth : 0;
      overlayContext.dispatch({
        type: OverlayActionTypes.SetSidePanelWidth,
        payload: { sidePanelWidth },
      });
    }
  }, [showSearchPanel]);

  const handleResultsScroll = () =>
    resultsContainer.current?.scrollTop === 0 ? setScrollAtTop(true) : setScrollAtTop(false);

  return (
    <div>
      <TopOverlay overlayType={overlayContext.overlayState.topOverlayStatus} />
      <div
        ref={sidePanel}
        className={classNames(
          'absolute w-96 top-0 bottom-0 bg-backgroundGray z-10',
          {
            'bg-transparent':
              overlayContext.overlayState.topOverlayStatus === OverlayStatus.Loading,
          },
          { 'left-0': showSearchPanel },
          { '-left-96': !showSearchPanel }
        )}
        style={{ transition: 'left 0.1s linear' }}
      >
        <div
          className={classNames(' absolute w-96  flex items-center px-4', {
            'shadow-bottom': !scrollAtTop,
          })}
        >
          <SearchBar
            // TODO: ask about vertical divider
            customCssClasses={{
              container: 'my-2 w-full font-primary text-sm',
              dropdownContainer: 'bg-cardGray  pb-3 z-10',
              inputDropdownContainer:
                'relative z-10 border rounded-lg border-gray-200 w-full overflow-hidden shadow-lg bg-cardGray',
              inputElement: 'outline-none flex-grow border-none h-full pl-0.5 pr-2 bg-cardGray',
            }}
            cssCompositionMethod="assign"
          />
        </div>
        <div
          ref={resultsContainer}
          className="overflow-y-scroll flex flex-col absolute top-16"
          // TODO: see if there's a better way of doing this
          style={{
            maxHeight: sidePanel.current?.clientHeight
              ? sidePanel.current?.clientHeight - 16 * 3.875
              : 0,
          }}
          onScroll={handleResultsScroll}
        >
          {eventsCount > 0 && (
            <VerticalResults
              CardComponent={EventCard}
              customCssClasses={{
                container:
                  'flex justify-center absolute top-0  bg-backgroundGray w-full shadow-top mb-0',
                labelContainer: 'inline-flex shadow-sm -space-x-px py-2',
              }}
              cssCompositionMethod="assign"
              allowPagination={false}
            />
          )}
          {eventsCount === 0 &&
            overlayContext.overlayState.topOverlayStatus !== OverlayStatus.Loading && (
              <span className="px-4">{`No search results found for ${mostRecentSearch}`}</span>
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
        {overlayContext.overlayState.topOverlayStatus !== OverlayStatus.Loading && (
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
            facets.map((f, _i) => {
              if (f.options.length === 0) {
                return null;
              }

              return (
                <div key={f.fieldId} className="md:w-40 mr-4 ">
                  <Filters.FilterGroup defaultExpanded={false}>
                    <MapFilterCollapsibleLabel
                      label={f.fieldId === 'c_artists.c_genres' ? 'Genres' : 'US Region'}
                    />
                    <Filters.CollapsibleSection className="flex flex-col space-y-3 max-h-56 overflow-y-auto bg-cardGray shadow-xl">
                      {f.options.map((o) => (
                        <Filters.CheckboxOption
                          key={o.displayName}
                          label={(o.value as string)
                            .toLowerCase()
                            .split(' ')
                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                            .join(' ')}
                          // TODO: maybe ask dev team about this
                          value={o.value as string}
                          fieldId={f.fieldId}
                          customCssClasses={{
                            container: 'flex items-center space-x-3 ml-2 ',
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
      {spotifyContext.spotifyState.spotifyAccessToken &&
        spotifyContext.spotifyState.artistSpotifyId && (
          <SpotifyPlayer
            accessToken={spotifyContext.spotifyState.spotifyAccessToken}
            artistId={spotifyContext.spotifyState.artistSpotifyId}
            onClosePlayerClick={() =>
              spotifyContext.dispatch({ type: SpotifyActionTypes.ClearArtistSpotifyId })
            }
          />
        )}
    </div>
  );
};
