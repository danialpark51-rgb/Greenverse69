import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { searchAddress, reverseGeocode, GeocodingResult } from '../../services/geocodingService';
import { Search, MapPin, Loader2, Crosshair, X, Layers } from 'lucide-react';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  score?: number;
  badge?: string;
  variant?: 'emerald' | 'forest' | 'amber' | 'rose' | 'blue';
  data?: any;
}

export interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (loc: { lat: number; lng: number; address: string }) => void;
  markers?: MapMarkerItem[];
  onMarkerClick?: (marker: MapMarkerItem) => void;
  enableSearch?: boolean;
  enableClickToPick?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

// Helpers for styled Leaflet divIcons
const createPinIcon = (color: string, pulse: boolean = false) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
        ${pulse ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <div style="width: 28px; height: 28px; border-radius: 50% 50% 50% 0; background: ${color}; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const pinColors: Record<string, string> = {
  emerald: '#059669',
  forest: '#1b4d36',
  amber: '#d97706',
  rose: '#e11d48',
  blue: '#2563eb',
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [44.9778, -93.2650], // Default: Twin Cities / Upper Mississippi
  zoom = 12,
  height = '420px',
  selectedLocation,
  onLocationSelect,
  markers = [],
  onMarkerClick,
  enableSearch = true,
  enableClickToPick = true,
  searchPlaceholder = 'Search city, address or coordinates...',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker Layer Group
    const layerGroup = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = layerGroup;

    mapInstanceRef.current = map;

    // Invalidate size after layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click to pick location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !enableClickToPick) return;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setIsReverseGeocoding(true);
      const address = await reverseGeocode(lat, lng);
      setIsReverseGeocoding(false);

      if (onLocationSelect) {
        onLocationSelect({ lat, lng, address });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [enableClickToPick, onLocationSelect]);

  // Update selected location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedLocation) {
      const { lat, lng } = selectedLocation;
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon('#2563eb', true),
          zIndexOffset: 1000,
        }).addTo(map);
        selectedMarkerRef.current = marker;
      }
    } else if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }
  }, [selectedLocation]);

  // Update markers
  useEffect(() => {
    const layerGroup = markerLayerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    markers.forEach((item) => {
      const color = pinColors[item.variant || 'forest'] || '#1b4d36';
      const marker = L.marker([item.lat, item.lng], {
        icon: createPinIcon(color, false),
      });

      // HTML popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 140px; padding: 2px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${item.title}</div>
          ${item.subtitle ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${item.subtitle}</div>` : ''}
          ${item.score !== undefined ? `<div style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #065f46; font-weight: 600; font-size: 10px;">Score: ${item.score}%</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(item);
        }
      });

      layerGroup.addLayer(marker);
    });
  }, [markers, onMarkerClick]);

  // Search Address Debounced
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      const results = await searchAddress(val);
      setSearchResults(results);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  };

  const handleSelectSearchResult = (res: GeocodingResult) => {
    setShowDropdown(false);
    setSearchQuery(res.displayName);

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([res.lat, res.lng], 15, { duration: 1.2 });
    }

    if (onLocationSelect) {
      onLocationSelect({
        lat: res.lat,
        lng: res.lng,
        address: res.displayName,
      });
    }
  };

  const handleCenterOnUser = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setTimeout(() => setGeoError(null), 4000);
      return;
    }
    if (mapInstanceRef.current) {
      setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapInstanceRef.current?.flyTo([lat, lng], 15);
          const address = await reverseGeocode(lat, lng);
          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address });
          }
        },
        (err) => {
          console.warn('[Greenverse Map] Geolocation failed:', err.message);
          let message = 'Unable to access your current location.';
          if (err.code === 1) {
            message = 'Location access denied. Please enable location permissions.';
          } else if (err.code === 2) {
            message = 'Location position is currently unavailable.';
          } else if (err.code === 3) {
            message = 'Location request timed out. Please try again.';
          }
          setGeoError(message);
          setTimeout(() => setGeoError(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-sage-200 shadow-xs ${className}`}>
      {/* Geolocation feedback banner */}
      {geoError && (
        <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-sm z-[1001] bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3 py-2 rounded-xl shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <span>{geoError}</span>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold shrink-0"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Search & Location Bar */}
      {enableSearch && (
        <div className="absolute top-3 left-3 z-[1000] max-w-sm w-full">
          <div className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-sage-300 shadow-md px-3 py-1.5 gap-2">
              <Search className="w-4 h-4 text-forest-700 shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-forest-600 animate-spin shrink-0" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleCenterOnUser}
                title="Locate my position"
                aria-label="Locate my position"
                className="p-1 rounded-md text-slate-500 hover:text-forest-700 hover:bg-forest-50 transition-colors shrink-0"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-sage-200 shadow-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 z-[1001]">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-2.5 text-xs text-slate-700 hover:bg-forest-50 hover:text-forest-900 cursor-pointer flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                    <span className="truncate">{item.displayName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Click Instructions Overlay Pill */}
      {enableClickToPick && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-sage-200 shadow-xs text-[11px] text-slate-700 flex items-center gap-2 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {isReverseGeocoding
              ? 'Locating address...'
              : selectedLocation
              ? `${selectedLocation.lat.toFixed(4)}°, ${selectedLocation.lng.toFixed(4)}° (Selected)`
              : 'Click map to place planting site marker'}
          </span>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0 bg-[#e4ece0]" />
    </div>
  );
};
