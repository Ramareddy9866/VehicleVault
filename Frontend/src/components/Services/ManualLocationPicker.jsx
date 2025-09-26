import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

// Handles map clicks: selects location + centers/zooms
const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const loc = { lat: e.latlng.lat, lon: e.latlng.lng }
      onSelect(loc)
    },
  })
  return null
}

const ManualLocationPicker = ({ open, onClose, onSave }) => {
  const [selected, setSelected] = React.useState(null)

  // Restore saved location when dialog opens
  React.useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('manualLocation')
      setSelected(saved ? JSON.parse(saved) : null)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Your Location</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Click on the map to select your location
        </Typography>
        <div style={{ height: '400px' }}>
          <MapContainer
            center={selected ? [selected.lat, selected.lon] : [20.5937, 78.9629]}
            zoom={selected ? 13 : 5}
            style={{ height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationSelector onSelect={setSelected} />
            {selected && <Marker position={[selected.lat, selected.lon]} />}
          </MapContainer>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => { 
            onSave(selected)
            onClose()
          }}
          disabled={!selected}
          variant="contained"
        >
          Set Location
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManualLocationPicker
