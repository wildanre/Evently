"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Loader2, Coffee, Building, Camera, TreePine, Car, ShoppingBag } from 'lucide-react';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

// Location interface
interface Location {
  lat: number;
  lng: number;
  address?: string;
  displayName?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
}

// Search result interface for Nominatim API
interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// Reverse geocoding result interface
interface ReverseGeocodingResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// POI (Point of Interest) interface
interface POI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  amenity?: string;
  cuisine?: string;
  description?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = ""
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [nearbyPlaces, setNearbyPlaces] = useState<POI[]>([]);

  // Place categories for quick filtering
  const placeCategories = [
    { id: 'all', name: 'All Places', icon: MapPin, query: '' },
    { id: 'food', name: 'Food & Drink', icon: Coffee, query: 'restaurant|cafe|bar|pub|fast_food' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, query: 'supermarket|mall|shop|market' },
    { id: 'entertainment', name: 'Entertainment', icon: Camera, query: 'cinema|theatre|museum|gallery|attraction' },
    { id: 'accommodation', name: 'Hotels', icon: Building, query: 'hotel|hostel|guest_house' },
    { id: 'nature', name: 'Nature & Parks', icon: TreePine, query: 'park|garden|beach|mountain' },
    { id: 'transport', name: 'Transport', icon: Car, query: 'gas_station|parking|airport|train_station' }
  ];

  // Default center (Jakarta, Indonesia)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  // Fetch POIs (Points of Interest) around a location with category filtering
  const fetchPOIs = useCallback(async (lat: number, lon: number, radius = 1000, category = 'all') => {
    setIsLoadingPois(true);
    try {
      const selectedCat = placeCategories.find(cat => cat.id === category);
      let queryFilter = '';
      
      if (category === 'all') {
        queryFilter = `
          node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|food_court|cinema|theatre|museum|gallery|hotel|bank|hospital|pharmacy|gym|sports_centre|stadium|park)$"](around:${radius},${lat},${lon});
          node["shop"~"^(supermarket|mall|department_store|bookshop|clothes|electronics|hardware|jewelry|shoes|sports|toys)$"](around:${radius},${lat},${lon});
          node["tourism"~"^(attraction|museum|gallery|hotel|hostel|viewpoint|information)$"](around:${radius},${lat},${lon});
          node["historic"~"^(monument|memorial|castle|fort|ruins)$"](around:${radius},${lat},${lon});
          node["natural"~"^(waterfall|peak|mountain_range|bay|beach)$"](around:${radius},${lat},${lon});
          node["leisure"~"^(park|garden|playground|sports_centre|fitness_centre|swimming_pool|golf_course|marina|stadium)$"](around:${radius},${lat},${lon});
        `;
      } else if (selectedCat?.query) {
        const tags = selectedCat.query.split('|');
        queryFilter = tags.map(tag => {
          return `node["amenity"="${tag}"](around:${radius},${lat},${lon});
                  node["shop"="${tag}"](around:${radius},${lat},${lon});
                  node["tourism"="${tag}"](around:${radius},${lat},${lon});
                  node["leisure"="${tag}"](around:${radius},${lat},${lon});`;
        }).join('\n');
      }

      const query = `
        [out:json][timeout:25];
        (
          ${queryFilter}
        );
        out tags geom qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (response.ok) {
        const data = await response.json();
        const poisData: POI[] = data.elements.map((element: any) => ({
          id: element.id,
          lat: element.lat,
          lon: element.lon,
          name: element.tags.name || element.tags.brand || element.tags.operator || 'Unnamed Place',
          type: element.tags.amenity || element.tags.shop || element.tags.tourism || element.tags.leisure || element.tags.historic || element.tags.natural || 'place',
          amenity: element.tags.amenity,
          cuisine: element.tags.cuisine,
          description: element.tags.description || element.tags.wikipedia || element.tags.website
        })).filter((poi: POI) => poi.name !== 'Unnamed Place' && poi.name.length > 2); // Filter out unnamed and very short names
        
        setPois(poisData);
        if (category === 'all') {
          setNearbyPlaces(poisData.slice(0, 10)); // Show top 10 nearby places
        }
      }
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setIsLoadingPois(false);
    }
  }, [placeCategories]);

  // Search locations using Nominatim API
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );
      
      if (response.ok) {
        const results: SearchResult[] = await response.json();
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  // Handle search result selection
  const handleResultSelect = (result: SearchResult) => {
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
      displayName: result.display_name
    };
    
    setSelectedLocation(location);
    setSearchQuery('');
    setShowResults(false);
    onLocationSelect(location);
    
    // Fetch POIs around the selected location
    fetchPOIs(location.lat, location.lng, 1000, selectedCategory);
  };

  // Handle POI selection
  const handlePOISelect = (poi: POI) => {
    const location: Location = {
      lat: poi.lat,
      lng: poi.lon,
      address: poi.name,
      displayName: `${poi.name} (${poi.type})`
    };
    
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  // Format address for display
const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    const data: ReverseGeocodingResult = await response.json();
    return data;
  };
  
  const formatAddress = (address: SearchResult['address']) => {
    if (!address) return '';
    
    const parts = [];
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }    
    if (address.suburb) parts.push(address.suburb);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.join(', ');
  };

// Map click handler component using useMapEvents
  const MapClickHandler = () => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;

        try {
          const data = await fetchAddressFromCoordinates(lat, lng);
          const location: Location = {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
            address: data.display_name,
            displayName: data.display_name
          };
          setSelectedLocation(location);
          onLocationSelect(location);
          
          // Fetch POIs around the clicked location
          fetchPOIs(lat, lng, 1000, selectedCategory);
        } catch (error) {
          console.error('Error fetching address:', error);
          // Fallback to clicked coordinates if reverse geocoding fails
          const location: Location = {
            lat,
            lng,
            address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            displayName: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          };
          setSelectedLocation(location);
          onLocationSelect(location);
          
          // Still fetch POIs around the clicked location
          fetchPOIs(lat, lng, 1000, selectedCategory);
        }
      },
      moveend: (e) => {
        const center = e.target.getCenter();
        // Fetch POIs when map is moved
        fetchPOIs(center.lat, center.lng, 2000, selectedCategory);
      }
    });

    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="location-search" className="text-white">
          Search Location
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <Input
            id="location-search"
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1a2e] border-gray-700 text-white"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-[#1a1a2e] border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                onClick={() => handleResultSelect(result)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {formatAddress(result.address) || result.display_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {result.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Place Categories */}
      <div className="space-y-2">
        <Label className="text-white">Place Categories</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {placeCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                type="button"
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className={`w-full justify-start text-xs ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  if (selectedLocation) {
                    fetchPOIs(selectedLocation.lat, selectedLocation.lng, 1000, category.id);
                  }
                }}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Nearby Places List */}
      {nearbyPlaces.length > 0 && (
        <div className="space-y-2">
          <Label className="text-white">Nearby Places</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {nearbyPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-2 bg-[#1a1a2e] border border-gray-700 rounded-md hover:bg-gray-800 cursor-pointer"
                onClick={() => handlePOISelect(place)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{place.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{place.type}</p>
                </div>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Select
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-700">
        {typeof window !== 'undefined' && (
          <MapContainer
            center={
              selectedLocation 
                ? [selectedLocation.lat, selectedLocation.lng] 
                : defaultCenter
            }
            zoom={selectedLocation ? 15 : 11}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{selectedLocation.displayName}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Lat: {selectedLocation.lat.toFixed(6)}, 
                      Lng: {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* POI Markers */}
            {pois.map((poi) => (
              <Marker 
                key={poi.id} 
                position={[poi.lat, poi.lon]}
                eventHandlers={{
                  click: () => handlePOISelect(poi)
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{poi.name}</p>
                    <p className="text-xs text-gray-600 mt-1 capitalize">
                      {poi.type} {poi.cuisine && `• ${poi.cuisine}`}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            <MapClickHandler />
          </MapContainer>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-[#1a1a2e] border border-gray-700 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Selected Location</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedLocation.displayName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Get Current Location Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                  // Get the actual address name using reverse geocoding
                  const data = await fetchAddressFromCoordinates(latitude, longitude);
                  const location: Location = {
                    lat: parseFloat(data.lat),
                    lng: parseFloat(data.lon),
                    address: data.display_name,
                    displayName: data.display_name
                  };
                  setSelectedLocation(location);
                  onLocationSelect(location);
                  
                  // Fetch POIs around current location
                  fetchPOIs(latitude, longitude, 1000, selectedCategory);
                } catch (error) {
                  console.error('Error fetching address for current location:', error);
                  // Fallback to coordinates if reverse geocoding fails
                  const location: Location = {
                    lat: latitude,
                    lng: longitude,
                    address: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
                    displayName: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
                  };
                  setSelectedLocation(location);
                  onLocationSelect(location);
                }
              },
              (error) => {
                console.error('Geolocation error:', error);
              }
            );
          }
        }}
      >
        <MapPin className="h-4 w-4 mr-2" />
        Use Current Location
      </Button>
    </div>
  );
};

export default MapLocationPicker;
