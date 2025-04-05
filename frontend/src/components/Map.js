import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Rental price marker with details button
const createPriceIcon = (price, isActive, houseId) => {
  // Adjust icon size based on price length
  const priceLength = price.toString().length;
  const width = Math.max(90, 40 + (priceLength * 10));
  
  const randomId = `marker-${houseId}-${Math.random().toString(36).substr(2, 9)}`;
  
  // No need for a global click handler since we're using the Marker's click event
  
  return L.divIcon({
    className: 'price-marker',
    html: `
      <div id="${randomId}" class="${isActive 
        ? 'bg-blue-600 text-white scale-105' 
        : 'bg-white text-gray-800'} rounded-md shadow-md py-1.5 px-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center cursor-pointer"
        style="transform: translate(-50%, -50%); box-shadow: ${isActive ? '0 4px 10px -2px rgba(37, 99, 235, 0.3)' : '0 2px 4px -1px rgba(0, 0, 0, 0.1)'}">
        <div>
          $${price.toLocaleString()}<span class="text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}">/mo</span>
        </div>
      </div>`,
    iconSize: [width, 40],
    iconAnchor: [width / 2, 20]
  });
};

const Map = ({ houses, activeHouse, setActiveHouse, mapRef }) => {
  const [center] = useState(houses[0].position);

  return (
    <MapContainer 
      center={center} 
      zoom={10} 
      className="w-full h-full relative z-0"
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
          icon={createPriceIcon(house.price, activeHouse === house.id, house.id)}
          eventHandlers={{
            mouseover: () => setActiveHouse(house.id),
            mouseout: () => setActiveHouse(null),
            click: () => {
              setActiveHouse(house.id);
              if (mapRef.current) {
                mapRef.current.flyTo(house.position, 13, {
                  duration: 0.8,
                  easeLinearity: 0.5
                });
              }
              
              // Scroll to the matching card
              const listingElement = document.getElementById(`listing-${house.id}`);
              if (listingElement) {
                listingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              
            }
          }}
        />
      ))}
    </MapContainer>
  );
};

export default Map;