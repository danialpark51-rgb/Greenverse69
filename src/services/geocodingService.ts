// Greenverse Geocoding Service (OpenStreetMap / Nominatim & Photon)

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

// Simple in-memory cache for recent queries to avoid redundant network hits
const cache = new Map<string, GeocodingResult[]>();
let lastRequestTime = 0;

/**
 * Searches locations using OpenStreetMap geocoding with debounce/rate-limiting
 */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cacheKey = q.toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Throttle to respect OpenStreetMap usage policies (minimum 600ms between calls)
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 600) {
    await new Promise((resolve) => setTimeout(resolve, 600 - timeSinceLast));
  }
  lastRequestTime = Date.now();

  try {
    // Primary: Nominatim with bounded lightweight query
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const results: GeocodingResult[] = data.map((item: any) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
        }));
        cache.set(cacheKey, results);
        return results;
      }
    }
  } catch (err) {
    console.warn('[Greenverse Geocoding] Nominatim query error:', err);
  }

  // Fallback: Photon (Komoot OSM Geocoder)
  try {
    const fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`;
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData && fbData.features && fbData.features.length > 0) {
        const results: GeocodingResult[] = fbData.features.map((f: any) => {
          const props = f.properties || {};
          const nameParts = [props.name, props.city || props.town, props.state, props.country].filter(Boolean);
          return {
            displayName: nameParts.join(', ') || props.name || q,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            type: props.type,
          };
        });
        cache.set(cacheKey, results);
        return results;
      }
    }
  } catch (err) {
    console.warn('[Greenverse Geocoding] Photon fallback error:', err);
  }

  return [];
}

/**
 * Reverse geocodes coordinates into an approximate readable place name
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        // Build concise label
        const addr = data.address || {};
        const concise = [
          addr.suburb || addr.neighbourhood || addr.road,
          addr.city || addr.town || addr.village,
          addr.state || addr.country,
        ].filter(Boolean).join(', ');

        return concise || data.display_name;
      }
    }
  } catch (err) {
    console.warn('[Greenverse Geocoding] Reverse geocode error:', err);
  }

  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
