import { FieldData, StandardCardProps } from '@yext/answers-react-components';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { useContext, useState } from 'react';
import { BiCaretUpCircle } from 'react-icons/bi';
import classNames from 'classnames';
import ArtistItem, { YextPhoto } from './ArtistItem';
import { MapActionTypes, MapContext } from './MapContext';

export interface LinkedLocation {
  name: string;
  yextDisplayCoordinate: YextDisplayCoordinate;
  address: Address;
  photoGallery?: YextPhoto[];
}

export interface YextDisplayCoordinate {
  longitude: number;
  latitude: number;
}

export interface YextTimeData {
  start: string;
  end: string;
}

export interface Address {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
}

export function isTimeData(data: unknown): data is YextTimeData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['start', 'end'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export function isArray(data: unknown): data is [] {
  if (!Array.isArray(data) || data === null) {
    return false;
  }

  return true;
}

function isCoordinateData(data: unknown): data is YextDisplayCoordinate {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['longitude', 'latitude'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

function isAddress(data: unknown): data is Address {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['line1', 'city', 'region', 'postalCode'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export function isLinkedLocation(data: unknown): data is LinkedLocation {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['name', 'yextDisplayCoordinate', 'address'];
  const containsExpectedKeys = expectedKeys.every((key) => {
    return key in data;
  });

  return (
    containsExpectedKeys &&
    isCoordinateData((data as LinkedLocation).yextDisplayCoordinate) &&
    isAddress((data as LinkedLocation).address)
  );
}

export const eventFieldMappings: Record<string, FieldData> = {
  id: {
    mappingType: 'FIELD',
    apiName: 'id',
  },
  title: {
    mappingType: 'FIELD',
    apiName: 'name',
  },
  venueName: {
    mappingType: 'FIELD',
    apiName: 'venueName',
  },
  dateTime: {
    mappingType: 'FIELD',
    apiName: 'time',
  },
  artists: {
    mappingType: 'FIELD',
    apiName: 'c_artists',
  },
  lowestPrice: {
    mappingType: 'FIELD',
    apiName: 'c_lowestPrice',
  },
  linkedLocation: {
    mappingType: 'FIELD',
    apiName: 'linkedLocation',
  },
};

type DrawerState = 'none' | 'open' | 'closed';

const EventCard = (props: StandardCardProps): JSX.Element => {
  const [drawerState, setDrawerState] = useState<DrawerState>('none');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state, dispatch } = useContext(MapContext);

  const transformedFieldData = applyFieldMappings(props.result.rawData, eventFieldMappings);

  const data = validateData(transformedFieldData, {
    id: isString,
    title: isString,
    venueName: isString,
    dateTime: isTimeData,
    lowestPrice: isString,
    artists: isArray,
    linkedLocation: isLinkedLocation,
  });

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
    if (data.linkedLocation?.yextDisplayCoordinate) {
      dispatch({
        type: MapActionTypes.SetSelectedLocation,
        payload: { selectedLocationId: data.id || '' },
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
          <div className="flex text-sm" style={{ color: '#ee4c7c' }}>
            {data.title?.toUpperCase()}
          </div>
          <div>
            <div className="flex text-xs">{`${formatDate(data.dateTime?.start)}${
              data.venueName
            }`}</div>
            {data.lowestPrice && <div className="flex text-xs ">{`From $${data.lowestPrice}`}</div>}
          </div>
        </div>
      </div>
      <ul
        className={classNames(
          { 'max-h-80 overflow-hidden': drawerState === 'open' },
          { 'max-h-0 overflow-hidden': drawerState === 'closed' || drawerState === 'none' }
        )}
        //TODO: remove inline style
        style={{ transition: 'max-height 0.2s linear' }}
      >
        {/* TODO: paginate artists */}
        {data.artists?.slice(0, 4).map((artist, i) => (
          <ArtistItem key={i} artist={artist} />
        ))}
      </ul>
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
