const FiltersBar = () => {
  const filters = ['All Properties', 'Apartments', 'Houses', 'Studios', '1 Bedroom', '2+ Bedrooms', 'Furnished', 'Pet Friendly'];
  
  return (
    <div className="bg-white px-6 py-3 shadow-sm overflow-x-auto flex space-x-3 border-b border-gray-200">
      {filters.map(filter => (
        <button 
          key={filter} 
          className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'All Properties' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FiltersBar;