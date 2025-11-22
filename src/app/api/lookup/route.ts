import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Major airports in the US and popular destinations
const MAJOR_AIRPORTS = [
  // Texas
  { code: "IAH", name: "Houston (IAH)", lat: 29.9844, lon: -95.3414 },
  { code: "HOU", name: "Houston Hobby", lat: 29.6454, lon: -95.2789 },
  { code: "AUS", name: "Austin", lat: 30.1975, lon: -97.6664 },
  { code: "DFW", name: "Dallas/Fort Worth", lat: 32.8998, lon: -97.0403 },
  { code: "SAT", name: "San Antonio", lat: 29.5337, lon: -98.4698 },
  { code: "ELP", name: "El Paso", lat: 31.8072, lon: -106.3777 },

  // Major US Cities - East Coast
  { code: "JFK", name: "New York JFK", lat: 40.6413, lon: -73.7781 },
  { code: "EWR", name: "Newark", lat: 40.6895, lon: -74.1745 },
  { code: "LGA", name: "New York LaGuardia", lat: 40.7769, lon: -73.8740 },
  { code: "BOS", name: "Boston", lat: 42.3656, lon: -71.0096 },
  { code: "PHL", name: "Philadelphia", lat: 39.8729, lon: -75.2437 },
  { code: "DCA", name: "Washington DC (Reagan)", lat: 38.8521, lon: -77.0377 },
  { code: "IAD", name: "Washington Dulles", lat: 38.9531, lon: -77.4565 },
  { code: "BWI", name: "Baltimore", lat: 39.1774, lon: -76.6684 },
  { code: "CLT", name: "Charlotte", lat: 35.2144, lon: -80.9473 },
  { code: "ATL", name: "Atlanta", lat: 33.6407, lon: -84.4277 },
  { code: "RDU", name: "Raleigh-Durham", lat: 35.8776, lon: -78.7875 },

  // Major US Cities - Midwest
  { code: "ORD", name: "Chicago O'Hare", lat: 41.9742, lon: -87.9073 },
  { code: "MDW", name: "Chicago Midway", lat: 41.7868, lon: -87.7522 },
  { code: "DTW", name: "Detroit", lat: 42.2162, lon: -83.3554 },
  { code: "MSP", name: "Minneapolis", lat: 44.8820, lon: -93.2218 },
  { code: "STL", name: "St. Louis", lat: 38.7487, lon: -90.3700 },
  { code: "CLE", name: "Cleveland", lat: 41.4117, lon: -81.8498 },
  { code: "CVG", name: "Cincinnati", lat: 39.0469, lon: -84.6678 },
  { code: "IND", name: "Indianapolis", lat: 39.7173, lon: -86.2944 },
  { code: "MCI", name: "Kansas City", lat: 39.2976, lon: -94.7139 },

  // Major US Cities - West Coast
  { code: "LAX", name: "Los Angeles", lat: 33.9416, lon: -118.4085 },
  { code: "SFO", name: "San Francisco", lat: 37.6213, lon: -122.3790 },
  { code: "SJC", name: "San Jose", lat: 37.3639, lon: -121.9289 },
  { code: "SEA", name: "Seattle", lat: 47.4502, lon: -122.3088 },
  { code: "PDX", name: "Portland", lat: 45.5887, lon: -122.5975 },
  { code: "SAN", name: "San Diego", lat: 32.7338, lon: -117.1933 },
  { code: "SNA", name: "Orange County", lat: 33.6762, lon: -117.8681 },
  { code: "SMF", name: "Sacramento", lat: 38.6954, lon: -121.5901 },

  // Mountain States
  { code: "DEN", name: "Denver", lat: 39.8561, lon: -104.6737 },
  { code: "SLC", name: "Salt Lake City", lat: 40.7899, lon: -111.9791 },
  { code: "PHX", name: "Phoenix", lat: 33.4352, lon: -112.0101 },
  { code: "TUS", name: "Tucson", lat: 32.1161, lon: -110.9410 },
  { code: "ABQ", name: "Albuquerque", lat: 35.0402, lon: -106.6090 },
  { code: "BOI", name: "Boise", lat: 43.5644, lon: -116.2228 },

  // South & Southeast
  { code: "MIA", name: "Miami", lat: 25.7959, lon: -80.2870 },
  { code: "FLL", name: "Fort Lauderdale", lat: 26.0742, lon: -80.1506 },
  { code: "MCO", name: "Orlando", lat: 28.4294, lon: -81.3089 },
  { code: "TPA", name: "Tampa", lat: 27.9755, lon: -82.5332 },
  { code: "RSW", name: "Fort Myers", lat: 26.5362, lon: -81.7552 },
  { code: "JAX", name: "Jacksonville", lat: 30.4941, lon: -81.6879 },
  { code: "PBI", name: "West Palm Beach", lat: 26.6832, lon: -80.0956 },
  { code: "MSY", name: "New Orleans", lat: 29.9934, lon: -90.2580 },
  { code: "BNA", name: "Nashville", lat: 36.1263, lon: -86.6774 },
  { code: "MEM", name: "Memphis", lat: 35.0424, lon: -89.9767 },

  // Leisure Destinations - US
  { code: "LAS", name: "Las Vegas", lat: 36.0840, lon: -115.1537 },
  { code: "HNL", name: "Honolulu", lat: 21.3187, lon: -157.9225 },
  { code: "OGG", name: "Maui", lat: 20.8986, lon: -156.4306 },
  { code: "KOA", name: "Kona (Big Island)", lat: 19.7388, lon: -156.0456 },
  { code: "LIH", name: "Kauai", lat: 21.9760, lon: -159.3390 },
  { code: "ANC", name: "Anchorage", lat: 61.1743, lon: -149.9963 },

  // Mexico - Caribbean Coast
  { code: "CUN", name: "Cancun", lat: 21.0365, lon: -86.8771 },
  { code: "CZM", name: "Cozumel", lat: 20.5224, lon: -86.9256 },
  { code: "TUL", name: "Tulum (Playa del Carmen)", lat: 20.2114, lon: -87.4654 },

  // Mexico - Pacific Coast
  { code: "SJD", name: "Cabo San Lucas", lat: 23.1518, lon: -109.7207 },
  { code: "PVR", name: "Puerto Vallarta", lat: 20.6801, lon: -105.2544 },
  { code: "ZIH", name: "Ixtapa/Zihuatanejo", lat: 17.6016, lon: -101.4609 },
  { code: "HUX", name: "Huatulco", lat: 15.7753, lon: -96.2626 },
  { code: "MZT", name: "Mazatlan", lat: 23.1614, lon: -106.2664 },
  { code: "PXM", name: "Puerto Escondido", lat: 15.8769, lon: -97.0891 },

  // Mexico - Other
  { code: "GDL", name: "Guadalajara", lat: 20.5218, lon: -103.3119 },
  { code: "MEX", name: "Mexico City", lat: 19.4363, lon: -99.0721 },
  { code: "MTY", name: "Monterrey", lat: 25.7785, lon: -100.1069 },

  // Caribbean Islands
  { code: "MBJ", name: "Montego Bay, Jamaica", lat: 18.5037, lon: -77.9134 },
  { code: "KIN", name: "Kingston, Jamaica", lat: 17.9357, lon: -76.7875 },
  { code: "NAS", name: "Nassau, Bahamas", lat: 25.0390, lon: -77.4662 },
  { code: "PUJ", name: "Punta Cana, Dominican Republic", lat: 18.5674, lon: -68.3634 },
  { code: "SDQ", name: "Santo Domingo, Dominican Republic", lat: 18.4297, lon: -69.6689 },
  { code: "SJU", name: "San Juan, Puerto Rico", lat: 18.4394, lon: -66.0018 },
  { code: "STT", name: "St. Thomas, USVI", lat: 18.3373, lon: -64.9733 },
  { code: "STX", name: "St. Croix, USVI", lat: 17.7019, lon: -64.7986 },
  { code: "AUA", name: "Aruba", lat: 12.5014, lon: -70.0152 },
  { code: "CUR", name: "Curacao", lat: 12.1889, lon: -68.9598 },
  { code: "GND", name: "Grenada", lat: 12.0042, lon: -61.7862 },
  { code: "BGI", name: "Barbados", lat: 13.0746, lon: -59.4925 },

  // Central America
  { code: "LIR", name: "Liberia, Costa Rica", lat: 10.5933, lon: -85.5444 },
  { code: "SJO", name: "San Jose, Costa Rica", lat: 9.9939, lon: -84.2088 },
  { code: "PTY", name: "Panama City, Panama", lat: 9.0714, lon: -79.3834 },
  { code: "BZE", name: "Belize City, Belize", lat: 17.5391, lon: -88.3081 },
  { code: "RTB", name: "Roatan, Honduras", lat: 16.3168, lon: -86.5230 },

  // South America
  { code: "BOG", name: "Bogota, Colombia", lat: 4.7016, lon: -74.1469 },
  { code: "CTG", name: "Cartagena, Colombia", lat: 10.4424, lon: -75.5130 },
  { code: "LIM", name: "Lima, Peru", lat: -12.0219, lon: -77.1143 },
  { code: "CUZ", name: "Cusco, Peru", lat: -13.5357, lon: -71.9388 },
  { code: "UIO", name: "Quito, Ecuador", lat: -0.1292, lon: -78.3575 },
  { code: "GYE", name: "Guayaquil, Ecuador", lat: -2.1574, lon: -79.8839 },

  // Canada
  { code: "YYC", name: "Calgary", lat: 51.1315, lon: -114.0108 },
  { code: "YVR", name: "Vancouver", lat: 49.1967, lon: -123.1815 },
  { code: "YYZ", name: "Toronto", lat: 43.6777, lon: -79.6248 },
  { code: "YUL", name: "Montreal", lat: 45.4657, lon: -73.7455 },
];

const HOUSTON_LAT = 29.7604;
const HOUSTON_LON = -95.3698;

const BOSTON_LAT = 42.3601;
const BOSTON_LON = -71.0589;

// Calculate distance between two coordinates in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest airport
function findNearestAirport(lat: number, lon: number) {
  let nearest = MAJOR_AIRPORTS[0];
  let minDistance = calculateDistance(lat, lon, nearest.lat, nearest.lon);

  for (const airport of MAJOR_AIRPORTS) {
    const distance = calculateDistance(lat, lon, airport.lat, airport.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = airport;
    }
  }

  return { airport: nearest, distance: minDistance };
}

// Estimate drive time based on distance (rough average of 45 mph)
function estimateDriveTime(miles: number): number {
  return Math.round(miles / 45 * 60); // Convert to minutes
}

// Estimate flight duration based on distance (rough average of 500 mph)
function estimateFlightDuration(miles: number): number {
  return miles / 500; // Return in hours
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 }
      );
    }

    // 1. Geocode the address using Nominatim (OpenStreetMap)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;

    const geocodeRes = await fetch(geocodeUrl, {
      headers: {
        "User-Agent": "TripPlanner/1.0",
      },
    });

    if (!geocodeRes.ok) {
      return NextResponse.json(
        { error: "Failed to geocode address." },
        { status: 500 }
      );
    }

    const geocodeData = await geocodeRes.json();

    if (!geocodeData || geocodeData.length === 0) {
      return NextResponse.json(
        { error: "Address not found. Please try a different address." },
        { status: 404 }
      );
    }

    const lat = parseFloat(geocodeData[0].lat);
    const lon = parseFloat(geocodeData[0].lon);

    // 2. Find nearest airport
    const { airport, distance: distanceFromAirport } = findNearestAirport(lat, lon);
    const driveTimeFromAirport = estimateDriveTime(distanceFromAirport);

    // 3. Calculate distance from Houston and Boston
    const distanceFromHouston = calculateDistance(HOUSTON_LAT, HOUSTON_LON, lat, lon);
    const flightDuration = estimateFlightDuration(distanceFromHouston);

    const distanceFromBoston = calculateDistance(BOSTON_LAT, BOSTON_LON, lat, lon);
    const flightDurationFromBoston = estimateFlightDuration(distanceFromBoston);

    // 4. Get weather data for early August using Open-Meteo Archive API
    // Query historical data from August 1-10 for recent years (2023 and 2024)
    const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2023-08-01&end_date=2024-08-10&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    let avgHighTempF = null;
    let avgLowTempF = null;
    let weatherSummary = null;

    if (weatherRes.ok) {
      const weatherData = await weatherRes.json();
      if (weatherData.daily && weatherData.daily.temperature_2m_max.length > 0) {
        // Calculate average high and low temperatures across early August from multiple years
        const highs = weatherData.daily.temperature_2m_max.filter((temp: number | null) => temp !== null);
        const lows = weatherData.daily.temperature_2m_min.filter((temp: number | null) => temp !== null);

        if (highs.length > 0) {
          avgHighTempF = Math.round(highs.reduce((sum: number, temp: number) => sum + temp, 0) / highs.length);
        }
        if (lows.length > 0) {
          avgLowTempF = Math.round(lows.reduce((sum: number, temp: number) => sum + temp, 0) / lows.length);
        }

        // Generate a simple weather summary based on early August climate
        if (avgHighTempF && avgHighTempF > 85) {
          weatherSummary = "Hot and sunny in early August, typical of warm climate destinations.";
        } else if (avgHighTempF && avgHighTempF > 70) {
          weatherSummary = "Warm and pleasant in early August, ideal for outdoor activities.";
        } else if (avgHighTempF && avgHighTempF > 50) {
          weatherSummary = "Mild temperatures in early August, comfortable climate.";
        } else if (avgHighTempF) {
          weatherSummary = "Cool climate in early August, bring layers for comfort.";
        }
      }
    }

    return NextResponse.json({
      airportCode: airport.code,
      distanceFromAirportMiles: Math.round(distanceFromAirport),
      driveTimeFromAirportMin: driveTimeFromAirport,
      avgHighTempF,
      avgLowTempF,
      weatherSummary,
      distanceFromHoustonMiles: Math.round(distanceFromHouston),
      flightDurationHours: Math.round(flightDuration * 10) / 10, // Round to 1 decimal
      distanceFromBostonMiles: Math.round(distanceFromBoston),
      flightDurationFromBostonHours: Math.round(flightDurationFromBoston * 10) / 10, // Round to 1 decimal
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to lookup location details." },
      { status: 500 }
    );
  }
}
