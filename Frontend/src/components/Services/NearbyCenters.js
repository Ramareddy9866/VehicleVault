import { useEffect, useCallback, useState, useMemo } from 'react'
import { Container, Paper, Typography, Box, Button, CircularProgress, Grid } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'
import API_URL from '../../config'
import ServiceCenterList from './NearbyCenters/ServiceCenterList'
import MapSection from './NearbyCenters/MapSection'
import ManualLocationPicker from './ManualLocationPicker'
import SelectField from '../common/SelectField'

// Set default marker icon for the map
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// OSM tags for car service centers
const availableTags = ['car_repair','car_parts','car_wash','tyres','vehicle_inspection','mechanic']

// Builds an Overpass Query for nearby service centers
function buildOverpassQuery(center, radius = 1000, selectedServiceTag = 'All') {
  const { lat, lon } = center
  const tags = selectedServiceTag !== 'All' ? [selectedServiceTag] : availableTags

  const filters = tags.flatMap((tag) => [
    `nwr["shop"="${tag}"](around:${radius},${lat},${lon});`,
    `nwr["amenity"="${tag}"](around:${radius},${lat},${lon});`,
    `nwr["craft"="${tag}"](around:${radius},${lat},${lon});`,
    `nwr["office"="${tag}"](around:${radius},${lat},${lon});`,
  ])

  return `[out:json][timeout:25];\n(\n${filters.join('\n')}\n);\nout center;`
}

const getNominatimUrl = (lat, lon) =>
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`

const NearbyCenters = () => {
  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preferredCenter, setPreferredCenter] = useState(null)
  const [addressCache, setAddressCache] = useState({})
  const [addressLoading, setAddressLoading] = useState({})
  const [manualLocation, setManualLocation] = useState(() => {
    const saved = localStorage.getItem('manualLocation')
    return saved ? JSON.parse(saved) : null
  })
  const [pickerOpen, setPickerOpen] = useState(false)
  const hasPickedLocation = !!manualLocation
  const activeLocation = manualLocation
  const [vehicles, setVehicles] = useState([])
  const showSnackbar = useSnackbar()
  const [showCenters, setShowCenters] = useState(false)

  const [filters, setFilters] = useState({
    vehicleId: '',
    serviceTag: 'All',
    radius: 10000,
  })

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setShowCenters(false)
  }

    // Fetch all user vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles`)
        const fetchedVehicles = response.data || []
        setVehicles(fetchedVehicles)

        if (fetchedVehicles.length > 0) {
          setFilters((prev) => ({ ...prev, vehicleId: prev.vehicleId || fetchedVehicles[0]._id }))
        }
      } catch {
        setVehicles([])
      }
    }
    fetchVehicles()
  }, [])

    // Fetch preferred service center for the selected vehicle
  useEffect(() => {
    if (!filters.vehicleId) {
      setPreferredCenter(null)
      return
    }
    const fetchPreferred = async () => {
      try {
        const preferredRes = await axios.get(`${API_URL}/vehicles/${filters.vehicleId}`)
        setPreferredCenter(preferredRes.data.preferredServiceCenter || null)
      } catch {
        setPreferredCenter(null)
      }
    }
    fetchPreferred()
  }, [filters.vehicleId])

  // Fetch service centers from Overpass API when location/filters/showCenters changes
  useEffect(() => {
    if (!activeLocation || !filters.radius || !showCenters) return
    setLoading(true)
    setError('')

    const fetchCenters = async () => {
      try {
        const query = buildOverpassQuery(activeLocation, filters.radius, filters.serviceTag)
        const overpassUrl = 'https://overpass-api.de/api/interpreter'
        const response = await fetch(overpassUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query,
        })

        if (!response.ok) {
          throw new Error(`Overpass API error: ${response.status} - ${await response.text()}`)
        }
        const data = await response.json()
        if (data.remark || data.error) {
          throw new Error(`Overpass error: ${data.remark || data.error}`)
        }
        if (!data.elements || data.elements.length === 0) {
          setServiceCenters([])
          return
        }

        const centers = data.elements
          .filter((el) => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
          .map((el) => {
            const lat = el.lat || el.center?.lat
            const lon = el.lon || el.center?.lon
            return {
              id: `${el.type}-${el.id}`,
              name: el.tags?.name || 'Car Repair Shop',
              lat,
              lon,
              opening_hours: el.tags?.opening_hours,
              phone: el.tags?.phone,
              website: el.tags?.website,
            }
          })
        setServiceCenters(centers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCenters()
  }, [filters, activeLocation, showCenters])

    // Save manual location to state and local storage
  const handleSetManualLocation = (loc) => {
    setManualLocation(loc)
    localStorage.setItem('manualLocation', JSON.stringify(loc))
    setShowCenters(false)
  }

    // Fetches address for a service center using Nominatim reverse geocoding
  const fetchAddressForCenter = useCallback(
    async (center) => {
      if (addressCache[center.id] || addressLoading[center.id]) return
      setAddressLoading((prev) => ({ ...prev, [center.id]: true }))
      try {
        const url = getNominatimUrl(center.lat, center.lon)
        const response = await axios.get(url)
        const address = response.data.display_name || `${center.lat}, ${center.lon}`
        setAddressCache((prev) => ({ ...prev, [center.id]: address }))
      } catch {
        setAddressCache((prev) => ({ ...prev, [center.id]: `${center.lat}, ${center.lon}` }))
      } finally {
        setAddressLoading((prev) => ({ ...prev, [center.id]: false }))
      }
    },
    [addressCache, addressLoading]
  )

    // Opens Google Maps for directions
  const handleGetDirections = (center) => {
    const address = addressCache[center.id] || `${center.lat},${center.lon}`
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank'
    )
  }

    // Sets or unsets a service center as preferred for the selected vehicle
  const handleMarkAsPreferred = async (center) => {
    if (!filters.vehicleId) return
    const isAlreadyPreferred = isPreferred(center)
    try {
      if (isAlreadyPreferred) {
        await axios.post(`${API_URL}/vehicles/set-preferred-center`, {
          vehicleId: filters.vehicleId,
          name: '',
          address: '',
        })
        setPreferredCenter(null)
        showSnackbar('Preferred center removed!', 'info')
      } else {
        const address = addressCache[center.id] || `${center.lat}, ${center.lon}`
        await axios.post(`${API_URL}/vehicles/set-preferred-center`, {
          vehicleId: filters.vehicleId,
          name: center.name,
          address: address,
        })
        setPreferredCenter({ name: center.name, address: address })
        showSnackbar('Preferred center updated!', 'success')
      }
    } catch (err) {
      showSnackbar('Failed to update preferred center', 'error')
    }
  }

    // Checks if a center is the preferred one
  const isPreferred = (center) => {
    if (!preferredCenter) return false
    const address = addressCache[center.id] || `${center.lat}, ${center.lon}`
    return preferredCenter.name === center.name && preferredCenter.address === address
  }

    // Sorts centers to show the preferred one first
  const sortedCenters = useMemo(() => {
    if (!preferredCenter) return serviceCenters

    const centersWithFlags = serviceCenters.map((center) => {
      const currentAddress = addressCache[center.id] || `${center.lat}, ${center.lon}`
      const isPreferredMatch =
        preferredCenter.name === center.name && preferredCenter.address === currentAddress
      return { ...center, isPreferred: isPreferredMatch }
    })

    const preferredInList = centersWithFlags.find((center) => center.isPreferred)

    if (preferredInList) {
      const others = centersWithFlags.filter((center) => !center.isPreferred)
      return [preferredInList, ...others]
    } else {
      const preferredCard = {
        id: 'virtual-preferred',
        name: preferredCenter.name,
        lat: preferredCenter.lat,
        lon: preferredCenter.lon,
        address: preferredCenter.address,
        isPreferred: true,
      }
      return [preferredCard, ...centersWithFlags]
    }
  }, [serviceCenters, preferredCenter, addressCache])

    // Fetch addresses for the top 8 visible centers
  useEffect(() => {
    sortedCenters.slice(0, 8).forEach((center) => {
      if (
        center &&
        typeof center.lat === 'number' &&
        typeof center.lon === 'number' &&
        !isNaN(center.lat) &&
        !isNaN(center.lon)
      ) {
        fetchAddressForCenter(center)
      }
    })
  }, [sortedCenters, fetchAddressForCenter])

  return (
    <>
      <ManualLocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={handleSetManualLocation}
      />
      <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 1 }, mb: 4, px: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            mt: 0,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Nearby Service Centers
          </Typography>
        </Box>

        {!hasPickedLocation ? (
          <>
            <Typography
              variant="h5"
              align="center"
              sx={{
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
                px: { xs: 1, sm: 0 },
              }}
            >
              Please pick your location to find nearby service centers
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setPickerOpen(true)}
                sx={{
                  minHeight: { xs: 48, sm: 36 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 3, sm: 2 },
                }}
              >
                Pick My Location
              </Button>
            </Box>
          </>
        ) : loading && showCenters ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        ) : error && showCenters ? (
          <Typography
            color="error"
            align="center"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {error}
          </Typography>
        ) : (
          <>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
              <Grid container spacing={{ xs: 2, sm: 2 }} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <SelectField
                    label="Select Vehicle"
                    value={filters.vehicleId}
                    onChange={(e) => updateFilter('vehicleId', e.target.value)}
                    options={vehicles.map((vehicle) => ({
                      value: vehicle._id,
                      label: `${vehicle.vehicleName} (${vehicle.registrationNumber})`,
                    }))}
                    size="small"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <SelectField
                    label="Service Type"
                    value={filters.serviceTag}
                    onChange={(e) => updateFilter('serviceTag', e.target.value)}
                    options={[
                      { value: 'All', label: 'All' },
                      ...availableTags.map((tag) => ({ value: tag, label: tag })),
                    ]}
                    size="small"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <SelectField
                    label="Search Radius"
                    value={filters.radius}
                    onChange={(e) => updateFilter('radius', Number(e.target.value))}
                    options={[
                      { value: 10000, label: '10 km' },
                      { value: 25000, label: '25 km' },
                      { value: 50000, label: '50 km' },
                      { value: 100000, label: '100 km' },
                    ]}
                    size="small"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } }}}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setPickerOpen(true)}
                    sx={{
                      fontWeight: 600,
                      minHeight: { xs: 48, sm: 40 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                    fullWidth
                  >
                    📍 SET MY LOCATION
                  </Button>
                </Grid>
              </Grid>
              <Grid container sx={{ mt: { xs: 1, sm: 2 } }}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setShowCenters(true)}
                    sx={{
                      minWidth: { xs: '100%', sm: 250 },
                      fontWeight: 600,
                      minHeight: { xs: 48, sm: 40 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    SHOW SERVICE CENTERS
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {filters.vehicleId && preferredCenter && (
              <Box sx={{ mb: { xs: 2, sm: 2 } }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 1,
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                  }}
                >
                  <Typography
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, lineHeight: 1.4 }}
                  >
                    Preferred Center for this Vehicle: <b>{preferredCenter.name}</b>
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, mt: 0.5, lineHeight: 1.3 }}
                  >
                    {preferredCenter.address}
                  </Typography>
                </Box>
              </Box>
            )}

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={8}>
                <Paper
                  sx={{ p: { xs: 1.5, sm: 2 }, height: { xs: '300px', sm: '400px', md: '500px' } }}
                >
                  <MapSection
                    activeLocation={activeLocation}
                    serviceCenters={showCenters ? serviceCenters : []}
                    showCenters={showCenters}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    maxHeight: { xs: '400px', sm: '400px', md: '500px' },
                    height: { xs: 'auto', md: '500px' },
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: showCenters ? 'flex-start' : 'center',
                    alignItems: showCenters ? 'stretch' : 'center',
                  }}
                >
                  {!showCenters ? (
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      align="center"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 1, sm: 0 }, lineHeight: 1.4 }}
                    >
                      Pick filters and click 'Show Service Centers' to view nearby centers on the
                      map and in the list.
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 400,
                          textAlign: 'center',
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Showing the nearest ones
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          textAlign: 'center',
                          mb: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                      >
                        🛠️ Service Centers ({sortedCenters.length})
                      </Typography>
                      <ServiceCenterList
                        sortedCenters={sortedCenters}
                        addressCache={addressCache}
                        addressLoading={addressLoading}
                        onLoadAddress={fetchAddressForCenter}
                        onGetDirections={handleGetDirections}
                        onMarkAsPreferred={handleMarkAsPreferred}
                        selectedVehicleId={filters.vehicleId}
                      />
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  )
}
export default NearbyCenters
