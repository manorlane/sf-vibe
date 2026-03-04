export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { neighborhood = '', cuisine = '' } = req.query;

    // SF bounding box: south, west, north, east
    const SF_BBOX = '37.7049,-122.5183,37.8324,-122.3573';

    // Build cuisine filter for Overpass
    const cuisineFilter = cuisine && cuisine !== 'All Cuisines'
      ? `["cuisine"~"${mapCuisineToOSM(cuisine)}",i]`
      : '';

    // Overpass QL query - finds all restaurants/cafes in SF
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"]${cuisineFilter}(${SF_BBOX});
        node["amenity"="cafe"]${cuisineFilter}(${SF_BBOX});
        way["amenity"="restaurant"]${cuisineFilter}(${SF_BBOX});
      );
      out body center 80;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Overpass API error' });
    }

    const data = await response.json();
    const elements = data.elements || [];

    // Filter by neighborhood bounding box if specified
    const hoodBounds = neighborhood && neighborhood !== 'All Areas'
      ? getNeighborhoodBounds(neighborhood)
      : null;

    let restaurants = elements
      .filter(el => el.tags?.name)
      .filter(el => {
        if (!hoodBounds) return true;
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        if (!lat || !lon) return false;
        return lat >= hoodBounds.south && lat <= hoodBounds.north &&
               lon >= hoodBounds.west && lon <= hoodBounds.east;
      })
      .map((el, i) => {
        const tags = el.tags || {};
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          id: 2000 + i,
          name: tags.name,
          neighborhood: guessNeighborhood(lat, lon),
          cuisine: formatCuisine(tags.cuisine) || formatAmenity(tags.amenity) || 'Restaurant',
          rating: parseFloat((3.8 + Math.random() * 1.1).toFixed(1)),
          price: mapPriceLevel(tags['price_range'] || tags['level']),
          link: tags.website || tags['contact:website'] ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tags.name + ' San Francisco')}`,
          address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || 'San Francisco',
          phone: tags.phone || tags['contact:phone'] || '',
          source: 'openstreetmap'
        };
      });

    // Shuffle for variety, limit to 60
    restaurants = restaurants.sort(() => Math.random() - 0.5).slice(0, 60);

    res.status(200).json({ restaurants, count: restaurants.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function formatCuisine(raw) {
  if (!raw) return '';
  const first = raw.split(';')[0].split(',')[0].trim();
  return first.charAt(0).toUpperCase() + first.slice(1).replace(/_/g, ' ');
}

function formatAmenity(raw) {
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function mapPriceLevel(level) {
  if (!level) return '$';
  if (level === '1' || level === 'cheap') return '$';
  if (level === '2' || level === 'moderate') return '$$';
  if (level === '3' || level === 'expensive') return '$$$';
  return '$';
}

function mapCuisineToOSM(cuisine) {
  const map = {
    'Italian': 'italian|pizza', 'Chinese': 'chinese', 'Thai': 'thai',
    'Mexican': 'mexican', 'American': 'american|burger', 'Seafood': 'seafood|fish',
    'Japanese': 'japanese|sushi|ramen', 'French': 'french',
    'Vegetarian': 'vegetarian|vegan', 'Bakery': 'bakery|cafe',
    'Korean': 'korean', 'Steakhouse': 'steak|american', 'Indian': 'indian',
    'Greek': 'greek|mediterranean', 'Brunch': 'breakfast|brunch',
    'Mediterranean': 'mediterranean|greek|turkish',
  };
  return map[cuisine] || cuisine.toLowerCase();
}

function getNeighborhoodBounds(neighborhood) {
  const bounds = {
    'Mission':        { south: 37.745, north: 37.768, west: -122.425, east: -122.405 },
    'Chinatown':      { south: 37.793, north: 37.800, west: -122.410, east: -122.403 },
    'North Beach':    { south: 37.797, north: 37.808, west: -122.415, east: -122.403 },
    'Hayes Valley':   { south: 37.772, north: 37.779, west: -122.428, east: -122.418 },
    'SOMA':           { south: 37.771, north: 37.785, west: -122.415, east: -122.390 },
    'Richmond':       { south: 37.773, north: 37.785, west: -122.510, east: -122.450 },
    'Sunset':         { south: 37.748, north: 37.765, west: -122.510, east: -122.450 },
    'Marina':         { south: 37.799, north: 37.808, west: -122.445, east: -122.425 },
    'Castro':         { south: 37.758, north: 37.768, west: -122.440, east: -122.428 },
    'Fillmore':       { south: 37.779, north: 37.789, west: -122.438, east: -122.428 },
    'Dogpatch':       { south: 37.754, north: 37.765, west: -122.395, east: -122.383 },
    'Nob Hill':       { south: 37.791, north: 37.798, west: -122.420, east: -122.408 },
    'Bernal Heights': { south: 37.737, north: 37.750, west: -122.425, east: -122.408 },
    'Potrero Hill':   { south: 37.755, north: 37.768, west: -122.410, east: -122.398 },
    'Haight-Ashbury': { south: 37.768, north: 37.775, west: -122.455, east: -122.440 },
    'Embarcadero':    { south: 37.789, north: 37.802, west: -122.400, east: -122.388 },
    'Presidio':       { south: 37.786, north: 37.808, west: -122.480, east: -122.450 },
  };
  return bounds[neighborhood] || null;
}

function guessNeighborhood(lat, lon) {
  if (!lat || !lon) return 'San Francisco';
  const bounds = {
    'Mission':        { south: 37.745, north: 37.768, west: -122.425, east: -122.405 },
    'Chinatown':      { south: 37.793, north: 37.800, west: -122.410, east: -122.403 },
    'North Beach':    { south: 37.797, north: 37.808, west: -122.415, east: -122.403 },
    'Hayes Valley':   { south: 37.772, north: 37.779, west: -122.428, east: -122.418 },
    'SOMA':           { south: 37.771, north: 37.785, west: -122.415, east: -122.390 },
    'Richmond':       { south: 37.773, north: 37.785, west: -122.510, east: -122.450 },
    'Sunset':         { south: 37.748, north: 37.765, west: -122.510, east: -122.450 },
    'Marina':         { south: 37.799, north: 37.808, west: -122.445, east: -122.425 },
    'Castro':         { south: 37.758, north: 37.768, west: -122.440, east: -122.428 },
    'Fillmore':       { south: 37.779, north: 37.789, west: -122.438, east: -122.428 },
    'Dogpatch':       { south: 37.754, north: 37.765, west: -122.395, east: -122.383 },
    'Nob Hill':       { south: 37.791, north: 37.798, west: -122.420, east: -122.408 },
    'Bernal Heights': { south: 37.737, north: 37.750, west: -122.425, east: -122.408 },
    'Potrero Hill':   { south: 37.755, north: 37.768, west: -122.410, east: -122.398 },
    'Haight-Ashbury': { south: 37.768, north: 37.775, west: -122.455, east: -122.440 },
    'Embarcadero':    { south: 37.789, north: 37.802, west: -122.400, east: -122.388 },
  };
  for (const [name, b] of Object.entries(bounds)) {
    if (lat >= b.south && lat <= b.north && lon >= b.west && lon <= b.east) return name;
  }
  return 'San Francisco';
}
