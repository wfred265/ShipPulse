// Expansive Worldwide Geocoding Database + OpenStreetMap Global Map Search API

export const WORLDWIDE_LOCATIONS_DB = [
  // North America - USA
  { country: "United States", town: "Plattsburgh, NY", city: "Plattsburgh", lat: 44.6997, lng: -73.4529 },
  { country: "United States", town: "Riverside, CA", city: "Riverside", lat: 33.9806, lng: -117.3755 },
  { country: "United States", town: "New York, NY", city: "New York City", lat: 40.7128, lng: -74.0060 },
  { country: "United States", town: "Los Angeles, CA", city: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { country: "United States", town: "Miami, FL", city: "Miami", lat: 25.7617, lng: -80.1918 },
  { country: "United States", town: "Chicago, IL", city: "Chicago", lat: 41.8781, lng: -87.6298 },
  { country: "United States", town: "Houston, TX", city: "Houston", lat: 29.7604, lng: -95.3698 },
  { country: "United States", town: "Seattle, WA", city: "Seattle", lat: 47.6062, lng: -122.3321 },
  { country: "United States", town: "San Francisco, CA", city: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { country: "United States", town: "Boston, MA", city: "Boston", lat: 42.3601, lng: -71.0589 },
  { country: "United States", town: "Atlanta, GA", city: "Atlanta", lat: 33.7490, lng: -84.3880 },
  { country: "United States", town: "Dallas, TX", city: "Dallas", lat: 32.7767, lng: -96.7970 },
  { country: "United States", town: "Denver, CO", city: "Denver", lat: 39.7392, lng: -104.9903 },
  { country: "United States", town: "Las Vegas, NV", city: "Las Vegas", lat: 36.1699, lng: -115.1398 },
  { country: "United States", town: "Washington, DC", city: "Washington", lat: 38.9072, lng: -77.0369 },
  { country: "United States", town: "Phoenix, AZ", city: "Phoenix", lat: 33.4484, lng: -112.0740 },
  { country: "United States", town: "Philadelphia, PA", city: "Philadelphia", lat: 39.9526, lng: -75.1652 },

  // Canada, UK, France, Germany, Netherlands, Japan, UAE, Australia...
  { country: "Canada", town: "Toronto, ON", city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { country: "Canada", town: "Montreal, QC", city: "Montreal", lat: 45.5017, lng: -73.5673 },
  { country: "Canada", town: "Vancouver, BC", city: "Vancouver", lat: 49.2827, lng: -123.1207 },
  { country: "United Kingdom", town: "London", city: "London", lat: 51.5074, lng: -0.1278 },
  { country: "United Kingdom", town: "Birmingham", city: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { country: "France", town: "Paris", city: "Paris", lat: 48.8566, lng: 2.3522 },
  { country: "France", town: "Marseille", city: "Marseille", lat: 43.2965, lng: 5.3698 },
  { country: "Germany", town: "Berlin", city: "Berlin", lat: 52.5200, lng: 13.4050 },
  { country: "Germany", town: "Frankfurt", city: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { country: "Netherlands", town: "Rotterdam", city: "Rotterdam", lat: 51.9244, lng: 4.4777 },
  { country: "Japan", town: "Tokyo", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { country: "United Arab Emirates", town: "Dubai", city: "Dubai", lat: 25.2048, lng: 55.2708 },
  { country: "Singapore", town: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198 },
  { country: "Australia", town: "Sydney", city: "Sydney", lat: -33.8688, lng: 151.2093 }
];

// Robust Coordinate Resolver: ALWAYS preserves exact lat/lng from location object!
export function resolveCoords(locObj, fallbackDefault = [40.7128, -74.0060]) {
  if (!locObj) return fallbackDefault;
  if (typeof locObj === 'object') {
    if (locObj.lat !== undefined && locObj.lng !== undefined && !isNaN(parseFloat(locObj.lat)) && !isNaN(parseFloat(locObj.lng))) {
      return [parseFloat(locObj.lat), parseFloat(locObj.lng)];
    }
  }
  if (typeof locObj === 'string') {
    const found = findWorldwideLocation(locObj);
    if (found) return [found.lat, found.lng];
  }
  return fallbackDefault;
}

// OpenStreetMap Global Nominatim API Search (100% Worldwide Coverage of all US States & International Towns)
export async function searchOpenStreetMapLocations(queryStr) {
  if (!queryStr || queryStr.trim().length < 2) return [];

  const q = queryStr.trim();
  
  // First match local database
  const localMatches = WORLDWIDE_LOCATIONS_DB.filter(l => 
    l.town.toLowerCase().includes(q.toLowerCase()) ||
    l.city.toLowerCase().includes(q.toLowerCase()) ||
    l.country.toLowerCase().includes(q.toLowerCase())
  );

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=8`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const apiResults = data.map(item => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.county || item.name;
        const stateName = addr.state_code || addr.state || "";
        const countryName = addr.country || "";

        let townFormatted = cityName;
        if (stateName && countryName === "United States") {
          townFormatted = `${cityName}, ${stateName}`;
        } else if (stateName && stateName !== cityName) {
          townFormatted = `${cityName}, ${stateName}`;
        } else if (countryName) {
          townFormatted = `${cityName}, ${countryName}`;
        }

        return {
          country: countryName || "International",
          town: townFormatted,
          city: cityName,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name
        };
      });

      // Combine local matches and API results, removing duplicate town names
      const combined = [...localMatches, ...apiResults];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.town.toLowerCase())) {
          uniqueMap.set(item.town.toLowerCase(), item);
        }
      });

      return Array.from(uniqueMap.values());
    }
  } catch (err) {
    console.warn("OpenStreetMap API search fallback to local DB:", err);
  }

  return localMatches;
}

export function findWorldwideLocation(queryStr) {
  if (!queryStr) return null;
  const q = queryStr.toLowerCase().trim();
  return WORLDWIDE_LOCATIONS_DB.find(
    l => l.town.toLowerCase() === q ||
         l.city.toLowerCase() === q ||
         `${l.town.toLowerCase()} (${l.country.toLowerCase()})` === q
  ) || null;
}

export function isValidWorldwideLocation(locObj) {
  if (!locObj) return false;
  if (typeof locObj === 'object') {
    if (locObj.town || locObj.city || locObj.displayName) return true;
    if (locObj.lat !== undefined && locObj.lng !== undefined) return true;
  }
  if (typeof locObj === 'string' && locObj.trim().length > 0) {
    return true;
  }
  return false;
}

export function getCountriesList() {
  const set = new Set(WORLDWIDE_LOCATIONS_DB.map(l => l.country));
  return Array.from(set);
}

export function getTownsForCountry(countryName) {
  const filtered = WORLDWIDE_LOCATIONS_DB.filter(l => l.country === countryName);
  const set = new Set(filtered.map(l => l.town));
  return Array.from(set);
}

export function getCitiesForTown(countryName, townName) {
  const filtered = WORLDWIDE_LOCATIONS_DB.filter(l => l.country === countryName && l.town === townName);
  return filtered.map(l => l.city);
}

export function getLocationCoords(country, town, city) {
  const found = WORLDWIDE_LOCATIONS_DB.find(
    l => (l.city && l.city.toLowerCase() === (city || '').toLowerCase()) ||
         (l.town && l.town.toLowerCase() === (town || '').toLowerCase())
  );
  if (found) {
    return [found.lat, found.lng];
  }
  return [40.7128, -74.0060];
}

export function getCityCoords(cityName) {
  const found = WORLDWIDE_LOCATIONS_DB.find(
    l => l.city.toLowerCase() === (cityName || '').toLowerCase() ||
         l.town.toLowerCase() === (cityName || '').toLowerCase()
  );
  if (found) return [found.lat, found.lng];
  return [40.7128, -74.0060];
}

export function formatTownLocationString(loc) {
  if (!loc) return "";
  if (typeof loc === 'string') return loc;
  
  if (loc.town) {
    return loc.town;
  }
  if (loc.city) {
    return `${loc.city}${loc.country ? ', ' + loc.country : ''}`;
  }
  return "";
}

export function formatLocationString(loc) {
  return formatTownLocationString(loc);
}

/**
 * Returns only the city portion of a location string (before the first comma).
 * e.g. "NICE, PROVENCE-ALPES-CÔTE D'AZUR" → "NICE"
 * e.g. "New York, NY" → "New York"
 * Used in invoices and PDFs to avoid verbose region/state suffixes.
 */
export function extractCityOnly(locationStr) {
  if (!locationStr) return '';
  const commaIdx = locationStr.indexOf(',');
  if (commaIdx === -1) return locationStr.trim();
  return locationStr.substring(0, commaIdx).trim();
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function interpolatePosition(startCoords, endCoords, ratio) {
  const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * ratio;
  const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * ratio;
  return [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))];
}

export function calculateRatioFromCoords(startCoords, endCoords, currentCoords) {
  const totalDLat = endCoords[0] - startCoords[0];
  const totalDLng = endCoords[1] - startCoords[1];
  
  if (Math.abs(totalDLat) > Math.abs(totalDLng)) {
    if (totalDLat === 0) return 0;
    return Math.max(0, Math.min(1, (currentCoords[0] - startCoords[0]) / totalDLat));
  } else {
    if (totalDLng === 0) return 0;
    return Math.max(0, Math.min(1, (currentCoords[1] - startCoords[1]) / totalDLng));
  }
}
