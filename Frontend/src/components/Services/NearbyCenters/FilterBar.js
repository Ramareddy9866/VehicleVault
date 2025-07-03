// Filter bar to reduce service center results
import React from 'react';
import { Grid, Button } from '@mui/material';
import SelectField from '../../common/SelectField';
import ManualLocationPicker from '../ManualLocationPicker';

const FilterBar = ({
  vehicles = [],
  selectedVehicleId,
  onVehicleChange,
  availableTags = [],
  selectedServiceTag,
  onServiceTagChange,
  radius,
  onRadiusChange,
  pickerOpen,
  setPickerOpen,
  onManualLocationSave
}) => (
  <Grid container spacing={2} alignItems="center" justifyContent="center">
    
    {/* Vehicle dropdown */}
    <Grid item xs={12} sm={4} md={4}>
      <SelectField
        label="Select Vehicle"
        value={selectedVehicleId}
        onChange={onVehicleChange}
        options={vehicles.map(vehicle => ({ value: vehicle._id, label: `${vehicle.vehicleName} (${vehicle.registrationNumber})` }))}
        size="small"
        sx={{ width: '100%' }}
      />
    </Grid>

    {/* Service type filter */}
    <Grid item xs={12} sm={4} md={4}>
      <SelectField
        label="Service Type"
        value={selectedServiceTag}
        onChange={onServiceTagChange}
        options={[{ value: 'All', label: 'All' }, ...availableTags.map(tag => ({ value: tag, label: tag }))]}
        size="small"
        sx={{ width: '100%' }}
      />
    </Grid>

    {/* Radius filter */}
    <Grid item xs={12} sm={4} md={4}>
      <SelectField
        label="Search Radius"
        value={radius}
        onChange={onRadiusChange}
        options={[
          { value: 10000, label: '10 km' },
          { value: 25000, label: '25 km' },
          { value: 50000, label: '50 km' },
          { value: 100000, label: '100 km' },
        ]}
        size="small"
        sx={{ width: '100%' }}
      />
    </Grid>

    {/* Manual location picker button */}
    <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
      <Button variant="outlined" onClick={() => setPickerOpen(true)}>
        📍   Set My Location
      </Button>
      <ManualLocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={onManualLocationSave}
      />
    </Grid>
    
  </Grid>
);

export default FilterBar;
