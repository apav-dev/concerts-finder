import { CardProps } from '@yext/answers-react-components';
import { useContext, useEffect, useState } from 'react';
import { BiCaretUpCircle, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import classNames from 'classnames';
import { MapActionTypes, MapContext } from '../providers/MapProvider';
import { eventDataForRender } from '../types/Event';
import ArtistItem from './ArtistItem';

type DrawerState = 'none' | 'open' | 'closed';

const EventCard = (props: CardProps): JSX.Element => {
  const [drawerState, setDrawerState] = useState<DrawerState>('none');
  const [artistPageCount, setArtistPageCount] = useState(0);
  const [artistPageNum, setArtistPageNum] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mapContext = useContext(MapContext);

  const event = eventDataForRender(props.result);

  useEffect(() => {
    event.artists && setArtistPageCount(Math.ceil(event.artists.length / 4));
  }, []);

  const formatDate = (dateTime?: string) => {
    if (!dateTime) return;

    let [month, date] = dateTime.split('T')[0].split('-').slice(1, 3);

    switch (month) {
      case '01':
        month = 'Jan';
        break;
      case '02':
        month = 'Feb';
        break;
      case '03':
        month = 'Mar';
        break;
      case '04':
        month = 'Apr';
        break;
      case '05':
        month = 'May';
        break;
      case '06':
        month = 'Jun';
        break;
      case '07':
        month = 'Jul';
        break;
      case '08':
        month = 'Aug';
        break;
      case '09':
        month = 'Sep';
        break;
      case '10':
        month = 'Oct';
        break;
      case '11':
        month = 'Nov';
        break;
      case '12':
        month = 'Dec';
        break;
    }

    if (date[0] === '0') {
      date = date.substring(1);
    }

    return `${month} ${date} · `;
  };

  const handleCardClick = () => {
    if (event.linkedLocation?.yextDisplayCoordinate) {
      mapContext.dispatch({
        type: MapActionTypes.SetSelectedLocation,
        payload: { selectedLocationId: event.id || '' },
      });
    }
  };

  return (
    <div
      className="border-b rounded-sm p-2 shadow-sm px-4 w-96 font-primary hover:bg-hoverBackgroundGray"
      onClick={() => handleCardClick()}
    >
      <div className="flex justify-between items-center ">
        <div>
          <div className="flex text-sm text-fontPink">{event.title?.toUpperCase()}</div>
          <div>
            <div className="flex text-xs">{`${formatDate(event.dateTime?.start)}${
              event.venueName
            }`}</div>
            {event.lowestPrice && (
              <div className="flex text-xs ">{`From $${event.lowestPrice}`}</div>
            )}
          </div>
        </div>
      </div>
      <ul
        className={classNames(
          { 'max-h-80 overflow-hidden': drawerState === 'open' },
          { 'max-h-0 overflow-hidden': drawerState === 'closed' || drawerState === 'none' }
        )}
        //TODO:  remove inline style
        style={{ transition: 'max-height 0.2s linear' }}
      >
        {event.artists?.slice((artistPageNum - 1) * 4, artistPageNum * 4).map((artist, i) => (
          <ArtistItem key={i} artist={artist} />
        ))}
      </ul>
      {artistPageCount > 1 && drawerState === 'open' && (
        <div className="flex justify-center">
          <button
            className={classNames({ 'text-fontPink': artistPageNum > 1 })}
            disabled={artistPageNum === 1}
            onClick={() => setArtistPageNum(artistPageNum - 1)}
          >
            <BiChevronLeft size={24} />
          </button>
          <button
            className={classNames({ 'text-fontPink': artistPageNum < artistPageCount })}
            disabled={artistPageNum === artistPageCount}
            onClick={() => setArtistPageNum(artistPageNum + 1)}
          >
            <BiChevronRight size={24} />
          </button>
        </div>
      )}
      <div className="w-full flex justify-center">
        <button
          className="flex justify-center items-center space-x-1 text-sm group"
          //TODO: remove inline style
          style={{ color: '#ee4c7c' }}
          onClick={() => {
            if (drawerState === 'none' || drawerState === 'closed') {
              setDrawerState('open');
            } else {
              setDrawerState('closed');
            }
          }}
        >
          <span>View Artists</span>
          <BiCaretUpCircle
            className={classNames(
              { 'transition duration-700 transform rotate-180': drawerState === 'open' },
              { 'transition duration-700 transform rotate-360': drawerState === 'closed' }
            )}
            size={16}
          />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
