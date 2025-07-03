// Map showing user and service centers
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const centerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapSection = ({ activeLocation, serviceCenters, showCenters }) => (
  <MapContainer
    center={activeLocation ? [activeLocation.lat, activeLocation.lon] : [20.5937, 78.9629]}
    zoom={activeLocation ? 13 : 5}
    style={{ width: '100%', height: '100%', borderRadius: '8px' }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    
    {/* Marker for user's location */}
    {activeLocation && <Marker position={[activeLocation.lat, activeLocation.lon]} icon={userIcon}>
      <Popup>Your Location</Popup>
    </Marker>}

    {/* Markers for service centers if enabled */}
    {showCenters && serviceCenters.map(center => (
      <Marker key={center.id} position={[center.lat, center.lon]} icon={centerIcon}>
        <Popup>{center.name}</Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapSection;
