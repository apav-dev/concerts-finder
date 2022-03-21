import { YextPrimaryPhoto } from './EventCard';

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPrimaryPhoto;
}

// TODO: validate artist image
export function isArtistData(data: unknown): data is Artist {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['name', 'c_genres', 'primaryPhoto'];
  return expectedKeys.every((key) => {
    return key in data;
  });
}

export interface ArtistCardProps {
  artist: Artist;
}

const ArtistItem = ({ artist }: ArtistCardProps): JSX.Element => {
  return (
    <li className="bg-cardGray shadow-lg my-2 px-2">
      <div className="flex justify-between items-center">
        <span className="flex text-xs ">{artist.name}</span>
        <img
          className="h-auto shadow-sm my-2"
          style={{ maxWidth: '3rem' }}
          src="https://a.mktgcdn.com/p-sandbox/xY62xntuL3mgAB5uwDy8fJ1sHL0TEo18lRHbqJ7s-PE/280x210.jpg"
        />
      </div>
    </li>
  );
};

export default ArtistItem;
