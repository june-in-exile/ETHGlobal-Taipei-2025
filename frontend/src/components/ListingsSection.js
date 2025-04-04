import ListingCard from './ListingCard';

const ListingsSection = ({ houses, activeHouse, handleListingHover, handleListingLeave }) => {
  return (
    <div className="w-2/5 overflow-y-auto bg-gray-50 p-6 border-r border-gray-200">
      <div className="pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Available Rentals</h2>
          <p className="text-gray-600">Found <span className="font-semibold text-blue-600">{houses.length}</span> properties matching your criteria</p>
        </div>
        <div className="flex items-center">
          <div className="mr-3">
            <select className="bg-white border border-gray-200 rounded-md py-1.5 px-3 text-sm font-medium text-gray-700 shadow-sm">
              <option>Sort: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <button className="p-2 rounded-md bg-blue-600 shadow-sm border border-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {houses.map((house) => (
          <ListingCard 
            key={house.id} 
            house={house} 
            isActive={activeHouse === house.id}
            onMouseEnter={handleListingHover}
            onMouseLeave={handleListingLeave}
          />
        ))}
      </div>
      
      <div className="mt-6 pt-4 flex flex-col items-center">
        <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          View More Properties
        </button>
        <div className="mt-3 text-xs text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span>Showing {houses.length} of 143 properties in this area</span>
        </div>
      </div>
      
      <div className="mt-8 text-center border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-500">
          © 2025 HomeSeeker Inc. · <span className="hover:text-blue-600 cursor-pointer">Terms</span> · <span className="hover:text-blue-600 cursor-pointer">Privacy</span>
        </p>
      </div>
    </div>
  );
};

export default ListingsSection;