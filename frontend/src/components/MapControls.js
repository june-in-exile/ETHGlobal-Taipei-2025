const MapControls = () => {
  return (
    <>
      <div className="absolute top-4 right-4 z-10 bg-white rounded-md shadow-md p-2 flex space-x-2">
        <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </button>
        <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
      </div>
      
      <div className="absolute top-4 left-4 z-10 bg-white rounded-md py-2 px-3 shadow-md">
        <div className="flex items-center text-sm font-medium text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span>Map Filters</span>
        </div>
        <div className="mt-2 flex space-x-2">
          <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
            Price
          </button>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Bedrooms
          </button>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            More
          </button>
        </div>
      </div>
    </>
  );
};

export default MapControls;