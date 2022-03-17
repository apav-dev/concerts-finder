import { FieldData, StandardCardProps } from '@yext/answers-react-components';
import { applyFieldMappings } from '@yext/answers-react-components/lib/components/utils/applyFieldMappings';
import {
  isString,
  validateData,
} from '@yext/answers-react-components/lib/components/utils/validateData';
import { useState } from 'react';
import { BiCaretUpCircle } from 'react-icons/bi';
import classNames from 'classnames';

export interface YextTimeData {
  start: string;
  end: string;
}

export interface YextImageData {
  url: string;
  height: number;
  width: number;
  thumbnails?: YextImageData[];
}

export interface YextPrimaryPhoto {
  photo: YextImageData;
}

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPrimaryPhoto;
}

function isArtistData(data: unknown): data is Artist {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['name', 'c_genres', 'primaryPhoto'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

function isImageData(data: unknown): data is YextImageData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['url', 'height', 'width'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

function isTimeData(data: unknown): data is YextTimeData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['start', 'end'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

const eventFieldMappings: Record<string, FieldData> = {
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
};

type DrawerState = 'none' | 'open' | 'closed';

const EventCard = (props: StandardCardProps): JSX.Element => {
  const [drawerState, setDrawerState] = useState<DrawerState>('none');

  const transformedFieldData = applyFieldMappings(props.result.rawData, eventFieldMappings);

  const data = validateData(transformedFieldData, {
    title: isString,
    venueName: isString,
    dateTime: isTimeData,
    lowestPrice: isString,
    // TODO: validate artists
    // artists: () => true,
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

  const renderArtistCard = () => {
    return (
      <div className="flex justify-between items-center">
        <span className="flex text-xs ">Red Hot Chili Peppers</span>
        <img
          className="h-auto shadow-sm"
          style={{ maxWidth: '3rem' }}
          src="https://a.mktgcdn.com/p-sandbox/xY62xntuL3mgAB5uwDy8fJ1sHL0TEo18lRHbqJ7s-PE/280x210.jpg"
        />
      </div>
    );
  };

  return (
    <div className="border-b rounded-sm p-2 shadow-sm px-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex text-md font-black " style={{ color: '#ee4c7c' }}>
            {data.title?.toUpperCase()}
          </div>
          <div>
            <div className="flex text-xs">{`${formatDate(data.dateTime?.start)}${
              data.venueName
            }`}</div>
            <div className="flex text-xs ">{`From $${data.lowestPrice}`}</div>
          </div>
        </div>
      </div>
      {/* <div className="max-h-32 overflow-y-auto">
        {renderArtistCard()}
        {renderArtistCard()}
        {renderArtistCard()}
        {renderArtistCard()}
      </div> */}
      <div className="w-full flex justify-center">
        <button
          className="flex justify-center items-center space-x-1 text-sm group"
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
