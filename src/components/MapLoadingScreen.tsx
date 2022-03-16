import ScaleLoader from 'react-spinners/ScaleLoader';

const MapLoadingScreen = () => (
  <div className="absolute flex justify-center items-center bg-black opacity-90 top-0 right-0 left-0 bottom-0 z-20">
    <div className="flex flex-col items-center">
      <ScaleLoader color="red" width={15} height={120} />
      <span className="text-white text-xl font-extrabold">Finding Concerts Near You...</span>
    </div>
  </div>
);

export default MapLoadingScreen;
