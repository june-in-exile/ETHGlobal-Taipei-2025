const houses = [
  {
    id: 1,
    tokenId: 1,
    title: 'Minimalist Studio in Downtown',
    location: 'San Francisco, CA',
    bedInfo: '1 bedroom · 1 bath',
    price: 2200,
    rating: 4.94,
    reviewsCount: 205,
    layout: 'Studio',
    amenities: ['Wifi', 'Workspace', 'Kitchen', 'Washer', 'Utilities Included', 'Air conditioning', 'Heating', 'Dedicated workspace', 'Elevator', 'Gym access'],
    position: [37.7749, -122.4194],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'],
    superhost: true,
    new: false,
    sqft: 550,
    lease: '12 months',
    available: 'Now',
    description: 'A beautiful minimalist studio apartment located in the heart of downtown San Francisco. This modern space offers contemporary living with all the essentials you need. The space features high ceilings, large windows providing ample natural light, and sleek finishes throughout.',
    depositInMonths: 2,
    petPolicy: 'Cats allowed, no dogs',
    utilityInfo: 'Water and trash included, tenant pays electricity and internet',
  },
  {
    id: 2,
    tokenId: 2,
    title: 'Modern Loft with Ocean View',
    location: 'Santa Monica, CA',
    bedInfo: '2 bedrooms · 1.5 baths',
    price: 3950,
    rating: 4.82,
    reviewsCount: 159,
    layout: '1 Bedroom',
    amenities: ['Ocean view', 'Wifi', 'Kitchen', 'Free parking', 'Air conditioning', 'Balcony', 'Pool', 'Hot tub', 'BBQ grill', 'Gym access'],
    position: [34.0195, -118.4912],
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2835&q=80'],
    superhost: false,
    new: true,
    sqft: 850,
    lease: '6 months',
    available: 'May 1',
    description: 'Enjoy breathtaking ocean views from this modern loft apartment in Santa Monica. The open floor plan creates a spacious feel enhanced by floor-to-ceiling windows that showcase the Pacific Ocean. Wake up to beautiful sunrises and end your day with spectacular sunsets.',
    depositInMonths: 2,
    petPolicy: 'Pet friendly, additional pet deposit required',
    utilityInfo: 'All utilities included except electricity',
  },
  {
    id: 3,
    tokenId: 3,
    title: 'Charming Victorian in Historic District',
    location: 'New Orleans, LA',
    bedInfo: '3 bedrooms · 2 baths',
    price: 2850,
    rating: 4.97,
    reviewsCount: 268,
    layout: '2 Bedrooms',
    amenities: ['Wifi', 'Self check-in', 'Washer', 'Garden', 'Dishwasher'],
    position: [29.9511, -90.0715],
    images: ['https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2850&q=80'],
    superhost: true,
    new: false,
    sqft: 1200,
    lease: '12 months',
    available: 'Now',
    depositInMonths: 3,
  },
  {
    id: 4,
    tokenId: 4,
    title: 'Designer Penthouse with Rooftop',
    location: 'New York, NY',
    bedInfo: '2 bedrooms · 2 baths',
    price: 5500,
    rating: 4.91,
    reviewsCount: 112,
    layout: '2 Bedrooms',
    amenities: ['Rooftop', 'Gym', 'Workspace', 'Doorman', 'Pet friendly'],
    position: [40.7128, -74.0060],
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2870&q=80'],
    superhost: true,
    new: false,
    sqft: 1450,
    lease: '24 months',
    available: 'Now',
    depositInMonths: 1,
  },
  {
    id: 5,
    tokenId: 5,
    title: 'Secluded Cabin Near Lake',
    location: 'Lake Tahoe, CA',
    bedInfo: '4 bedrooms · 2 baths',
    price: 3200,
    rating: 4.99,
    reviewsCount: 187,
    layout: '3 Bedrooms',
    amenities: ['Mountain view', 'Hot tub', 'Fireplace', 'BBQ grill', 'Snow removal'],
    position: [39.0968, -120.0324],
    images: ['https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'],
    superhost: false,
    new: false,
    sqft: 2100,
    lease: '12 months',
    available: 'June 15',
    depositInMonths: 2,
  },
  {
    id: 6,
    tokenId: 6,
    title: 'Beachfront Apartment with Balcony',
    location: 'Maui, HI',
    bedInfo: '1 bedroom · 1 bath',
    price: 4200,
    rating: 4.89,
    reviewsCount: 221,
    layout: '1 Bedroom',
    amenities: ['Beachfront', 'Pool', 'Kitchen', 'Free parking', 'Cable TV'],
    position: [20.7984, -156.3319],
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'],
    superhost: true,
    new: true,
    sqft: 780,
    lease: '6 months',
    available: 'Now',
    depositInMonths: 3,
  },
  {
    id: 7,
    tokenId: 7,
    title: 'Luxury Highrise with City View',
    location: 'Chicago, IL',
    bedInfo: '1 bedroom · 1 bath',
    price: 2650,
    rating: 4.86,
    reviewsCount: 109,
    layout: '1 Bedroom',
    amenities: ['City view', 'Gym', 'Doorman', 'Workspace', 'In-unit laundry'],
    position: [41.8781, -87.6298],
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'],
    superhost: false,
    new: false,
    sqft: 820,
    lease: '12 months',
    available: 'July 1',
    depositInMonths: 2,
  },
  {
    id: 8,
    tokenId: 8,
    title: 'Trendy Loft in Arts District',
    location: 'Los Angeles, CA',
    bedInfo: '2 bedrooms · 1 bath',
    price: 3100,
    rating: 4.92,
    reviewsCount: 174,
    layout: '1 Bedroom',
    amenities: ['Wifi', 'Kitchen', 'Self check-in', 'Free parking', 'Balcony'],
    position: [34.0407, -118.2468],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'],
    superhost: true,
    new: false,
    sqft: 950,
    lease: '12 months',
    available: 'Now',
    depositInMonths: 1,
  },
];

export default houses;