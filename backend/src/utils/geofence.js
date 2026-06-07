// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const isWithinGeofence = (lat, lng) => {
  const companyLat = parseFloat(process.env.COMPANY_LAT);
  const companyLng = parseFloat(process.env.COMPANY_LNG);
  const radius = parseFloat(process.env.GEOFENCE_RADIUS_METERS);
  
  const distance = calculateDistance(companyLat, companyLng, lat, lng);
  return { within: distance <= radius, distance };
};

module.exports = { isWithinGeofence, calculateDistance };
