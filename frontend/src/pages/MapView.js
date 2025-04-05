import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import houses from '../data/houses';
import Header from '../components/Header';
import FiltersBar from '../components/FiltersBar';
import ListingsSection from '../components/ListingsSection';
import MapControls from '../components/MapControls';
import PropertyDetails from '../components/PropertyDetails';

// Import leaflet CSS
import "leaflet/dist/leaflet.css";

// Import map component dynamically to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('../components/Map.js'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

const MapViewHouses = () => {
  const [activeHouse, setActiveHouse] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const mapRef = useRef(null);

  const handleListingHover = (id) => {
    setActiveHouse(id);
  };

  const handleListingLeave = () => {
    setActiveHouse(null);
  };
  
  const handleCardClick = (house, view) => {
    // When a card is clicked, set active house and fly to its position
    setActiveHouse(house.id);
    
    if (view === 'details') {
      // Show property details modal
      setSelectedProperty(house);
      setShowPropertyDetails(true);
    } else if (mapRef.current) {
      // Fly to location on map
      mapRef.current.flyTo(house.position, 13, {
        duration: 0.8,
        easeLinearity: 0.5
      });
    }
  };
  
  const closePropertyDetails = () => {
    setShowPropertyDetails(false);
  };
  
  // Listen for custom event from map popup
  useEffect(() => {
    const handleViewPropertyDetails = (event) => {
      const { id } = event.detail;
      // Find the house object by ID
      const house = houses.find(h => h.id === id);
      if (house) {
        setSelectedProperty(house);
        setShowPropertyDetails(true);
      }
    };
    
    window.addEventListener('view-property-details', handleViewPropertyDetails);
    
    return () => {
      window.removeEventListener('view-property-details', handleViewPropertyDetails);
    };
  }, [houses]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <FiltersBar />
      <div className="flex flex-1 pb-4 overflow-hidden"> 
        {/* Listings section */}
        <ListingsSection 
          houses={houses} 
          activeHouse={activeHouse} 
          handleListingHover={handleListingHover} 
          handleListingLeave={handleListingLeave}
          handleCardClick={handleCardClick}
        />
        {/* Map section */}
        <div className="w-3/5 relative">
          {/* <MapControls /> */}
          <MapWithNoSSR 
            houses={houses} 
            activeHouse={activeHouse} 
            setActiveHouse={setActiveHouse} 
            mapRef={mapRef}
          />
        </div>
      </div>
      
      {/* Property Details Modal */}
      {showPropertyDetails && (
        <PropertyDetails 
          property={selectedProperty} 
          onClose={closePropertyDetails}
        />
      )}
    </div>
  );
};

export default MapViewHouses;