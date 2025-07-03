// Shows list of service centers
import React from 'react';
import { Divider, Typography } from '@mui/material';
import ServiceCenterCard from './ServiceCenterCard';

const ServiceCenterList = ({
  sortedCenters,
  preferredCenter,
  addressCache,
  addressLoading,
  onLoadAddress,
  onGetDirections,
  onMarkAsPreferred,
  selectedVehicleId
}) => {
  // Find the preferred center in the list by name only
  const preferred = preferredCenter && sortedCenters.find(
    c => c.name === preferredCenter.name
  );
  const others = preferred ? sortedCenters.filter(c => c !== preferred) : sortedCenters;

  return (
    <>
      {/* Show preferred center if available */}
      {preferred && (
        <>
          <ServiceCenterCard
            center={preferred}
            isPreferred={true}
            address={addressCache[preferred.id]}
            addressLoading={addressLoading[preferred.id]}
            onLoadAddress={onLoadAddress}
            onGetDirections={onGetDirections}
            onMarkAsPreferred={onMarkAsPreferred}
            selectedVehicleId={selectedVehicleId}
          />
          {others.length > 0 && (
            <Divider sx={{ my: 2, borderColor: '#bfa14a', borderBottomWidth: 2 }} />
          )}
        </>
      )}
      {/* Show all other centers */}
      {others.map((center) => (
        <ServiceCenterCard
          key={center.id}
          center={center}
          isPreferred={false}
          address={addressCache[center.id]}
          addressLoading={addressLoading[center.id]}
          onLoadAddress={onLoadAddress}
          onGetDirections={onGetDirections}
          onMarkAsPreferred={onMarkAsPreferred}
          selectedVehicleId={selectedVehicleId}
        />
      ))}
      {/* Show message if no centers */}
      {sortedCenters.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No service centers found nearby.
        </Typography>
      )}
    </>
  );
};

export default ServiceCenterList;
