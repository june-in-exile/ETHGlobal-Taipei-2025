import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Monthly rental price marker
const createPriceIcon = (price, isActive) => {
  // Adjust icon size based on the price length
  const priceLength = price.toString().length;
  const width = Math.max(80, 60 + (priceLength * 10)); // Base width + extra width per digit
  
  return L.divIcon({
    className: 'price-marker',
    html: `<div class="${isActive 
      ? 'bg-blue-600 text-white scale-105' 
      : 'bg-white text-gray-800'} rounded-md shadow-md py-1.5 px-3 text-sm font-semibold transition-all duration-300" 
      style="transform: translate(-50%, -50%); box-shadow: ${isActive ? '0 4px 10px -2px rgba(37, 99, 235, 0.3)' : '0 2px 4px -1px rgba(0, 0, 0, 0.1)'}">
      $${price.toLocaleString()}<span class="text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}">/mo</span>
      </div>`,
    iconSize: [width, 32],
    iconAnchor: [width/2, 16]
  });
};

// Property popup component
const PropertyPopup = ({ house }) => (
  <div className="p-1 min-w-[250px]">
    <div className="relative h-28 rounded-lg overflow-hidden mb-2">
      <img
        src={house.images[0]}
        alt={house.title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
      {/* Badges */}
      <div className="absolute top-2 left-2 flex space-x-1.5">
        {house.superhost && (
          <div className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-0.5">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
        {house.new && (
          <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
            New
          </div>
        )}
      </div>
    </div>
    <h3 className="font-bold text-base">{house.title}</h3>
    <div className="flex items-center text-sm text-gray-700 mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      {house.location}
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
        <span>{house.layout}</span>
      </div>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <span>{house.bedInfo.split('·')[0].trim()}</span>
      </div>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
        <span>{house.sqft || '800'} sq ft</span>
      </div>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span>Lease: {house.lease || '12 months'}</span>
      </div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold text-sm">${house.price}<span className="font-normal text-gray-600 text-xs">/mo</span></span>
      </div>
      <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-600 mr-0.5">
          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Available: {house.available || 'Now'}</span>
      </div>
    </div>
    <button className="w-full mt-3 bg-blue-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
      View Details
    </button>
  </div>
);

const Map = ({ houses, activeHouse, setActiveHouse, mapRef }) => {
  const [center] = useState(houses[0].position);

  useEffect(() => {
    if (activeHouse && mapRef.current) {
      const house = houses.find(h => h.id === activeHouse);
      if (house) {
        mapRef.current.flyTo(house.position, 13, {
          duration: 0.8,
          easeLinearity: 0.5
        });
      }
    } else if (mapRef.current && !activeHouse) {
      // If no house is active, zoom out to see all properties
      mapRef.current.flyTo(center, 10, {
        duration: 1,
        easeLinearity: 0.5
      });
    }
  }, [activeHouse, houses, mapRef, center]);

  return (
    <MapContainer 
      center={center} 
      zoom={10} 
      className="w-full h-full"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {houses.map((house) => (
        <Marker 
          key={house.id}
          position={house.position}
          icon={createPriceIcon(house.price, activeHouse === house.id)}
          eventHandlers={{
            mouseover: () => setActiveHouse(house.id),
            mouseout: () => setActiveHouse(null),
          }}
        >
          <Popup>
            <PropertyPopup house={house} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;