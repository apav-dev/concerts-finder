import { isImageData, YextPrimaryPhoto } from './EventCard';

export interface Artist {
  name: string;
  c_genres: string[];
  primaryPhoto: YextPrimaryPhoto;
}
// TODO: validate image in artist
export function isArtistData(data: unknown): data is Artist {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const expectedKeys = ['name', 'c_genres', 'primaryPhoto'];
  const containsExpectedKeys = expectedKeys.every((key) => {
    return key in data;
  });

  return containsExpectedKeys;
  // && isImageData((data as Artist).primaryPhoto);
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
          className="h-auto shadow-sm my-2 object-contain"
          style={{ maxWidth: '3rem' }}
          src="https://a.mktgcdn.com/p-sandbox/xY62xntuL3mgAB5uwDy8fJ1sHL0TEo18lRHbqJ7s-PE/196x147.jpg"
        />
      </div>
    </li>
  );
};

export default ArtistItem;
