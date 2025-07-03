import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Grid
} from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Favorite } from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';
import API_URL from '../../config';
import AppAlert from '../common/AppAlert';
import ServiceCenterList from './NearbyCenters/ServiceCenterList';
import MapSection from './NearbyCenters/MapSection';
import ManualLocationPicker from './ManualLocationPicker';
import SelectField from '../common/SelectField';

// Set default marker icon for the map
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Most common OSM tags for car service centers
const availableTags = [
  'car_repair',
  'car_parts',
  'car_wash',
  'tyres',
  'vehicle_inspection',
  'mechanic'
];

function buildOverpassQuery(_, __, center, radius = 1000, selectedServiceTag = 'All') {
  const lat = center.lat;
  const lon = center.lon;
  let filters = [];

  if (selectedServiceTag && selectedServiceTag !== 'All') {
    filters = [
      `nwr["shop"="${selectedServiceTag}"](around:${radius},${lat},${lon});`,
      `nwr["amenity"="${selectedServiceTag}"](around:${radius},${lat},${lon});`,
      `nwr["craft"="${selectedServiceTag}"](around:${radius},${lat},${lon});`,
      `nwr["office"="${selectedServiceTag}"](around:${radius},${lat},${lon});`
    ];
  } else {
    filters = [
      `nwr["shop"="car_repair"](around:${radius},${lat},${lon});`,
      `nwr["shop"="car_parts"](around:${radius},${lat},${lon});`,
      `nwr["shop"="car_wash"](around:${radius},${lat},${lon});`,
      `nwr["shop"="tyres"](around:${radius},${lat},${lon});`,
      `nwr["shop"="vehicle_inspection"](around:${radius},${lat},${lon});`,
      `nwr["amenity"="car_repair"](around:${radius},${lat},${lon});`,
      `nwr["craft"="mechanic"](around:${radius},${lat},${lon});`,
      `nwr["office"="repair"](around:${radius},${lat},${lon});`
    ];
  }

  return `[out:json][timeout:25];\n(\n${filters.join('\n')}\n);\nout center;`;
}

const getNominatimUrl = (lat, lon) =>
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

const NearbyCenters = () => {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferredCenter, setPreferredCenter] = useState(null);
  const [addressCache, setAddressCache] = useState({});
  const [addressLoading, setAddressLoading] = useState({});
  const [radius, setRadius] = useState(10000); // default 10km
  const [debouncedRadius, setDebouncedRadius] = useState(radius);
  const debounceTimeout = useRef();
  const [manualLocation, setManualLocation] = useState(() => {
    const saved = localStorage.getItem('manualLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hasPickedLocation, setHasPickedLocation] = useState(() => !!localStorage.getItem('manualLocation'));
  const activeLocation = hasPickedLocation ? manualLocation : null;
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const showSnackbar = useSnackbar();
  const [selectedServiceTag, setSelectedServiceTag] = useState('All');
  const [showCenters, setShowCenters] = useState(false);

  // Helper function to calculate distance from user location
  const calculateDistance = (center) => {
    if (!activeLocation) return Infinity;
    const R = 6371; 
    const lat1 = activeLocation.lat * Math.PI / 180;
    const lat2 = center.lat * Math.PI / 180;
    const deltaLat = (center.lat - activeLocation.lat) * Math.PI / 180;
    const deltaLon = (center.lon - activeLocation.lon) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch vehicles for selector
  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
        if (response.data.length > 0) {
          setSelectedVehicleId(response.data[0]._id);
        }
      } catch (err) {
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch preferred center for selected vehicle
  useEffect(() => {
    if (!selectedVehicleId) {
      setPreferredCenter(null);
      return;
    }
    const fetchPreferred = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/vehicles/${selectedVehicleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPreferredCenter(response.data.preferredServiceCenter || null);
      } catch (err) {
        setPreferredCenter(null);
      }
    };
    fetchPreferred();
  }, [selectedVehicleId]);

  // Wait before updating radius
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedRadius(radius);
    }, 1000);
    return () => clearTimeout(debounceTimeout.current);
  }, [radius]);

  // Get centers only if location, radius, and showCenters are set
  useEffect(() => {
    if (!activeLocation || !debouncedRadius || !showCenters) return;
    let normalizedLat = activeLocation.lat;
    let normalizedLon = activeLocation.lon;
    while (normalizedLon > 180) normalizedLon -= 360;
    while (normalizedLon < -180) normalizedLon += 360;
    if (normalizedLat > 90) normalizedLat = 90;
    if (normalizedLat < -90) normalizedLat = -90;
    setLoading(true);
    const fetchCenters = async () => {
      try {
        const query = buildOverpassQuery(null, null, { lat: normalizedLat, lon: normalizedLon }, debouncedRadius, selectedServiceTag);
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const response = await fetch(overpassUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query,
        });
        if (!response.ok) {
          const errorText = await response.text();
          setError(`Overpass API error: ${response.status} - ${errorText}`);
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (data.remark || data.error) {
          setError(`Overpass error: ${data.remark || data.error}`);
          setLoading(false);
          return;
        }
        if (!data.elements || data.elements.length === 0) {
          setServiceCenters([]);
          setLoading(false);
          return;
        }
        const centers = data.elements
          .filter(el => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
          .map((el) => {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          return {
            id: `${el.type}-${el.id}`,
            name: el.tags?.name || 'Car Repair Shop',
            lat,
            lon,
            opening_hours: el.tags?.opening_hours,
            phone: el.tags?.phone,
            website: el.tags?.website,
          };
        });
        setServiceCenters(centers);
      } catch (err) {
        setError(`Failed to fetch nearby service centers: ${err.message}`);
      }
      setLoading(false);
    };
    fetchCenters();
  }, [debouncedRadius, activeLocation, showCenters, vehicles, selectedVehicleId, selectedServiceTag]);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (manualLocation) {
      localStorage.setItem('manualLocation', JSON.stringify(manualLocation));
      setHasPickedLocation(true);
    } else {
      localStorage.removeItem('manualLocation');
      setHasPickedLocation(false);
    }
  }, [manualLocation]);

  // Reset showCenters when filters change
  useEffect(() => {
    setShowCenters(false);
  }, [manualLocation, selectedVehicleId, selectedServiceTag, radius]);

  // Fetch address for a center using Nominatim
  const fetchAddressForCenter = async (center) => {
    setAddressLoading((prev) => ({ ...prev, [center.id]: true }));
    try {
      const url = getNominatimUrl(center.lat, center.lon);
      const response = await axios.get(url);
      const address = response.data.display_name || `${center.lat}, ${center.lon}`;
      setAddressCache((prev) => ({ ...prev, [center.id]: address }));
    } catch (err) {
      setAddressCache((prev) => ({ ...prev, [center.id]: `${center.lat}, ${center.lon}` }));
    } finally {
      setAddressLoading((prev) => ({ ...prev, [center.id]: false }));
    }
  };

  // Open Google Maps directions for the center
  const handleGetDirections = (center) => {
    const address = addressCache[center.id] || `${center.lat},${center.lon}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  // Mark a center as preferred for the selected vehicle
  const handleMarkAsPreferred = async (center) => {
    if (!selectedVehicleId) return;
    const isAlreadyPreferred = center && center.isVirtual ? true : isPreferred(center);
    try {
      const token = localStorage.getItem('token');
      if (isAlreadyPreferred) {
        // Unset preferred center
        setPreferredCenter(null); 
        await axios.post(`${API_URL}/vehicles/set-preferred-center`, {
          vehicleId: selectedVehicleId,
          name: '',
          address: '',
          placeId: ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Preferred center removed!', 'info');
      } else {
        // Set as preferred center
        await axios.post(`${API_URL}/vehicles/set-preferred-center`, {
          vehicleId: selectedVehicleId,
          name: center.name,
          address: addressCache[center.id] || `${center.lat}, ${center.lon}`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreferredCenter({ name: center.name, address: addressCache[center.id] || `${center.lat}, ${center.lon}` });
        showSnackbar('Preferred center updated!', 'success');
      }
    } catch (err) {
      showSnackbar('Failed to update preferred center', 'error');
    }
  };

  // Check if this center is preferred
  const isPreferred = (center) => {
    if (!preferredCenter) return false;
    if (center && center.isVirtual) return true;
    const address = addressCache[center.id] || `${center.lat}, ${center.lon}`;
    return (
      preferredCenter.name === center.name &&
      preferredCenter.address === address
    );
  };

  // Sort service centers so preferred is at the top
  const sortedCenters = useMemo(() => {
    if (!preferredCenter) return serviceCenters;
    const addressOf = (center) => addressCache[center.id] || `${center.lat}, ${center.lon}`;
    const isPreferredMatch = (center) => {
      if (!preferredCenter) return false;
      if (preferredCenter.address && addressOf(center)) {
        return preferredCenter.name === center.name && preferredCenter.address === addressOf(center);
      }
      return preferredCenter.name === center.name;
    };
    const preferredInList = serviceCenters.find(isPreferredMatch);
    if (preferredInList) {
      // Remove duplicate center from the list
      const others = serviceCenters.filter(center => !isPreferredMatch(center));
      return [preferredInList, ...others];
    } else if (preferredCenter) {
      // Show virtual card if preferredCenter exists
      const preferredCard = {
        id: 'virtual-preferred',
        name: preferredCenter.name,
        lat: preferredCenter.lat,
        lon: preferredCenter.lon,
        opening_hours: preferredCenter.opening_hours,
        phone: preferredCenter.phone,
        website: preferredCenter.website,
        address: preferredCenter.address,
        isVirtual: true
      };
      return [preferredCard, ...serviceCenters];
    } else {
      return serviceCenters;
    }
  }, [serviceCenters, preferredCenter, addressCache]);

  // Automatically fetch address for the first 8 centers and the preferred one
  useEffect(() => {
    const centersToFetch = [];
    if (sortedCenters.length > 0) {
      const preferred = sortedCenters[0];
      if (preferred && !addressCache[preferred.id] && !addressLoading[preferred.id]) {
        centersToFetch.push(preferred);
      }
    }
    sortedCenters.slice(0, 8).forEach(center => {
      if (center && !addressCache[center.id] && !addressLoading[center.id]) {
        centersToFetch.push(center);
      }
    });
    centersToFetch.forEach(center => {
      if (
        typeof center.lat === 'number' &&
        !isNaN(center.lat) &&
        typeof center.lon === 'number' &&
        !isNaN(center.lon)
      ) {
        fetchAddressForCenter(center);
      }
    });
  }, [sortedCenters, addressCache, addressLoading]);

  // Mark centers with address load error
  useEffect(() => {
    // Mark as failed if loading stopped but no address found
    sortedCenters.slice(0, 8).forEach(center => {
      if (
        center &&
        !addressCache[center.id] &&
        !addressLoading[center.id] &&
        !center.addressFailed &&
        center._triedLoadAddress
      ) {
        center.addressFailed = true;
      }
    });
  }, [sortedCenters, addressCache, addressLoading]);

  // Mark that address was tried to load
  const originalFetchAddressForCenter = fetchAddressForCenter;
  function fetchAddressForCenterWithFlag(center) {
    center._triedLoadAddress = true;
    return originalFetchAddressForCenter(center);
  }

    return (
    <>
      <ManualLocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={loc => {
          setManualLocation(loc);
          setShowCenters(true);
        }}
      />
      {!hasPickedLocation ? (
      <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, mt: 0 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 1 }}>
            Nearby Service Centers
          </Typography>
        </Box>
        <Typography variant="h5" align="center" sx={{ mb: 3 }}>
          Please pick your location to find nearby service centers
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => setPickerOpen(true)}>
            Pick My Location
          </Button>
        </Box>
      </Container>
      ) : !showCenters ? (
      <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, mt: 0 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 1 }}>
            Nearby Service Centers
          </Typography>
        </Box>
        {hasPickedLocation && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <SelectField
                      label="Select Vehicle"
                      value={selectedVehicleId}
                      onChange={e => setSelectedVehicleId(e.target.value)}
                      options={vehicles.map(vehicle => ({ value: vehicle._id, label: `${vehicle.vehicleName} (${vehicle.registrationNumber})` }))}
                      size="small"
                      sx={{ minWidth: 240 }}
                    />
                  </Grid>
                  <Grid item>
                    <SelectField
                      label="Service Type"
                      value={selectedServiceTag}
                      onChange={e => setSelectedServiceTag(e.target.value)}
                      options={[{ value: 'All', label: 'All' }, ...availableTags.map(tag => ({ value: tag, label: tag }))]}
                      size="small"
                      sx={{ minWidth: 240 }}
                    />
                  </Grid>
                  <Grid item>
                    <SelectField
                      label="Search Radius"
                      value={radius}
                      onChange={e => setRadius(Number(e.target.value))}
                      options={[
                        { value: 10000, label: '10 km' },
                        { value: 25000, label: '25 km' },
                        { value: 50000, label: '50 km' },
                        { value: 100000, label: '100 km' },
                      ]}
                      size="small"
                      sx={{ minWidth: 240 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button variant="contained" color="inherit" onClick={() => setPickerOpen(true)} sx={{ minWidth: 170, fontWeight: 600 }}>
                  <span role="img" aria-label="location">📍</span> &nbsp;SET MY LOCATION
                </Button>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" color="inherit" onClick={() => setShowCenters(true)} sx={{ minWidth: 250, fontWeight: 600 }}>
                  SHOW SERVICE CENTERS
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '500px' }}>
              <MapSection
                activeLocation={activeLocation}
                serviceCenters={[]}
                showCenters={false}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, maxHeight: '500px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Pick filters and click 'Show Service Centers' to view nearby centers on the map and in the list.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      ) : loading ? (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
      ) : error ? (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <AppAlert severity="error">{error}</AppAlert>
      </Container>
      ) : (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, mt: 0 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 1 }}>
          Nearby Service Centers
        </Typography>
      </Box>
      {hasPickedLocation && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <SelectField
                    label="Select Vehicle"
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    options={vehicles.map(vehicle => ({ value: vehicle._id, label: `${vehicle.vehicleName} (${vehicle.registrationNumber})` }))}
                    size="small"
                    sx={{ minWidth: 240 }}
                  />
                </Grid>
                <Grid item>
                  <SelectField
                    label="Service Type"
                    value={selectedServiceTag}
                    onChange={e => setSelectedServiceTag(e.target.value)}
                    options={[{ value: 'All', label: 'All' }, ...availableTags.map(tag => ({ value: tag, label: tag }))]}
                    size="small"
                    sx={{ minWidth: 240 }}
                  />
                </Grid>
                <Grid item>
                  <SelectField
                    label="Search Radius"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    options={[
                      { value: 10000, label: '10 km' },
                      { value: 25000, label: '25 km' },
                      { value: 50000, label: '50 km' },
                      { value: 100000, label: '100 km' },
                    ]}
                    size="small"
                    sx={{ minWidth: 240 }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" color="inherit" onClick={() => setPickerOpen(true)} sx={{ minWidth: 170, fontWeight: 600 }}>
                <span role="img" aria-label="location">📍</span> &nbsp;SET MY LOCATION
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="contained" color="inherit" onClick={() => setShowCenters(true)} sx={{ minWidth: 250, fontWeight: 600 }}>
                SHOW SERVICE CENTERS
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      {/* Preferred Center Summary */}
      {selectedVehicleId && preferredCenter && (
        <Box sx={{ mb: 2 }}>
              <AppAlert severity="info" icon={<Favorite color="primary" />}>
            Preferred Center for this Vehicle: <b>{preferredCenter.name}</b>
            <br />
            <span style={{ fontSize: 13 }}>{preferredCenter.address}</span>
              </AppAlert>
        </Box>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '500px' }}>
            <MapSection
              activeLocation={activeLocation}
              serviceCenters={serviceCenters}
              showCenters={showCenters}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: '500px', overflow: 'auto', height: '100%' }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 400, textAlign: 'center', mb: 0.5 }}>
              Showing the nearest ones
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
              🛠️ Service Centers ({sortedCenters.length})
            </Typography>
            <ServiceCenterList
              sortedCenters={sortedCenters}
              preferredCenter={preferredCenter}
              addressCache={addressCache}
              addressLoading={addressLoading}
              onLoadAddress={fetchAddressForCenter}
              onGetDirections={handleGetDirections}
              onMarkAsPreferred={handleMarkAsPreferred}
              selectedVehicleId={selectedVehicleId}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
      )}
    </>
  );
};

export default NearbyCenters; 