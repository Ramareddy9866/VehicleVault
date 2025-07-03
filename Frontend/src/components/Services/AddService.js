// Add service record for a vehicle
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  Divider,
  ListSubheader,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useSnackbar } from '../../context/SnackbarContext';
import API_URL from '../../config';
import SelectField from '../common/SelectField';
import AppAlert from '../common/AppAlert';

const serviceTypes = [
  'Oil Change',
  'Brake Service',
  'Tire Rotation',
  'Battery Replacement',
  'Engine Diagnostics',
  'General Maintenance',
  'Others'
];

const AddService = () => {
  const navigate = useNavigate();
  const { id: vehicleId } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [serviceCenterOptions, setServiceCenterOptions] = useState([]);
  const [selectedServiceCenter, setSelectedServiceCenter] = useState('');
  const [formData, setFormData] = useState({
    date: new Date(),
    type: '',
    description: '',
    cost: '',
    mileage: '',
    nextServiceDate: null,
    nextServiceMileage: '',
    serviceCenter: {
      name: '',
      address: ''
    }
  });
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Service Date & Type', 'Description & Cost', 'Service Center Details'];
  const showSnackbar = useSnackbar();
  const [stepError, setStepError] = useState('');
  const theme = useTheme();
  const [serviceHistory, setServiceHistory] = useState([]);

  // Fetch service history for the vehicle
  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${vehicleId}`);
        setServiceHistory(response.data);
      } catch (err) {
        console.error('Error fetching service history:', err);
      }
    };
    if (vehicleId) {
      fetchServiceHistory();
    }
  }, [vehicleId]);

  // Load vehicle and center details when page opens
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles/${vehicleId}`);
        setVehicle(response.data);
        const options = [];

        // Add preferred center first (only if present)
        let currentPreferredName = null;
        let currentPreferredAddress = null;
        if (response.data.preferredServiceCenter && response.data.preferredServiceCenter.name) {
          currentPreferredName = response.data.preferredServiceCenter.name;
          currentPreferredAddress = response.data.preferredServiceCenter.address;
          options.push({
            id: 'preferred',
            name: response.data.preferredServiceCenter.name,
            address: response.data.preferredServiceCenter.address,
            label: response.data.preferredServiceCenter.name,
            preferred: true
          });

          setFormData(prev => ({
            ...prev,
            serviceCenter: {
              name: response.data.preferredServiceCenter.name || '',
              address: response.data.preferredServiceCenter.address || ''
            }
          }));
        }

        // Add unique service centers from service history (actual services), skip current preferred
        const seenKeys = new Set();
        if (currentPreferredName) {
          seenKeys.add(currentPreferredName + '|' + (currentPreferredAddress || ''));
        }
        if (serviceHistory && serviceHistory.length > 0) {
          serviceHistory.forEach((service) => {
            const center = service.serviceCenter || {};
            const key = center.name + '|' + (center.address || '');
            if (
              center.name &&
              !seenKeys.has(key) &&
              !(center.name === currentPreferredName && center.address === currentPreferredAddress)
            ) {
              options.push({
                id: `history-${center.name}`,
                name: center.name,
                address: center.address,
                label: center.name,
                preferred: false
              });
              seenKeys.add(key);
            }
          });
        }

        // Always give custom option
        options.push({
          id: 'custom',
          name: '',
          address: '',
          label: 'Custom Entry',
          preferred: false
        });
        setServiceCenterOptions(options);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
      }
    };
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId, serviceHistory]);

  // Show error if no vehicle id found
  if (!vehicleId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <AppAlert severity="error">Invalid vehicle ID. Please try again.</AppAlert>
      </Container>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For updating service center fields
  const handleServiceCenterChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceCenter: {
        ...prev.serviceCenter,
        [field]: value
      }
    }));
  };

  // When a service center is selected
  const handleServiceCenterSelection = (optionId) => {
    setSelectedServiceCenter(optionId);
    if (optionId === 'custom') {
      setFormData(prev => ({
        ...prev,
        serviceCenter: {
          name: '',
          address: ''
        }
      }));
    } else {
      const selectedOption = serviceCenterOptions.find(option => option.id === optionId);
      if (selectedOption) {
        setFormData(prev => ({
          ...prev,
          serviceCenter: {
            name: selectedOption.name,
            address: selectedOption.address
          }
        }));
      }
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleNextServiceDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      nextServiceDate: date,
    }));
  };

  const handleNext = () => {
    setStepError('');
    if (activeStep === 0) {
      if (!formData.date || !formData.type) {
        setStepError('Please select both service date and service type.');
        setTimeout(() => setStepError(''), 5000);
        return;
      }
      const today = new Date();
      today.setHours(0,0,0,0);
      const serviceDate = new Date(formData.date);
      serviceDate.setHours(0,0,0,0);
      if (serviceDate > today) {
        setStepError('Service date cannot be in the future.');
        setTimeout(() => setStepError(''), 5000);
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.description || !formData.cost) {
        setStepError('Please enter both description and cost.');
        setTimeout(() => setStepError(''), 5000);
        return;
      }
    }
    if (activeStep === 2) {
      if (!selectedServiceCenter || selectedServiceCenter === '') {
        setStepError('Please select a service center.');
        setTimeout(() => setStepError(''), 5000);
        return;
      }
      if (selectedServiceCenter === 'custom' && (!formData.serviceCenter.name || !formData.serviceCenter.address)) {
        setStepError('Please enter both service center name and address.');
        setTimeout(() => setStepError(''), 5000);
        return;
      }
      if (formData.nextServiceDate) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const nextDate = new Date(formData.nextServiceDate);
        nextDate.setHours(0,0,0,0);
        if (nextDate <= today) {
          setStepError('Next service date must be after today.');
          setTimeout(() => setStepError(''), 5000);
          return;
        }
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedServiceCenter || selectedServiceCenter === '') {
      setError('Please select a service center.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    if (activeStep !== steps.length - 1) {
      return;
    }
    if (formData.date) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const serviceDate = new Date(formData.date);
      serviceDate.setHours(0,0,0,0);
      if (serviceDate > today) {
        setError('Service date cannot be in the future.');
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    if (formData.nextServiceDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const nextDate = new Date(formData.nextServiceDate);
      nextDate.setHours(0,0,0,0);
      if (nextDate <= today) {
        setError('Next service date must be after today.');
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    setError('');
    setLoading(true);
    try {
      const serviceData = {
        serviceType: formData.type,
        serviceDate: formData.date,
        cost: parseFloat(formData.cost),
        description: formData.description,
        mileage: parseInt(formData.mileage),
        nextServiceDate: formData.nextServiceDate,
        nextServiceMileage: formData.nextServiceMileage
          ? parseInt(formData.nextServiceMileage)
          : null,
        serviceCenter: formData.serviceCenter
      };
      await axios.post(
        `${API_URL}/services/${vehicleId}`,
        serviceData
      );
      showSnackbar('Service record added successfully!', 'success');
      navigate(`/vehicles/${vehicleId}/service-history`);
    } catch (err) {
      console.error('Error adding service:', err);
      showSnackbar(
        err.response?.data?.message ||
          'Failed to add service record. Please try again.',
        'error'
      );
      setError(
        err.response?.data?.message ||
          'Failed to add service record. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  // The UI for the Add Service page
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 1 }}>
          Add Service Record
        </Typography>
        {error && (
          <AppAlert severity="error" sx={{ mb: 2 }}>
            {error}
          </AppAlert>
        )}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box noValidate>
        {stepError && (
          <AppAlert severity="error" sx={{ mb: 2 }}>{stepError}</AppAlert>
        )}
        {/* Step 1: Date and Type */}
        {activeStep === 0 && (
  <Grid container spacing={3} sx={{ mt: 1 }}>
    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Service Date"
          value={formData.date}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              sx: {
                width: '100%',
                '& .MuiOutlinedInput-root': { minHeight: 40 },
              },
            },
          }}
        />
      </LocalizationProvider>
    </Grid>
    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
      <SelectField
        label="Service Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        options={serviceTypes.map(type => ({ value: type, label: type }))}
        required
        size="small"
        sx={{ width: '100%' }}
      />
    </Grid>
  </Grid>
)}

{/* Step 2: Description and Cost */}
{activeStep === 1 && (
  <Grid container spacing={3} sx={{ mt: 2, mx: 'auto', maxWidth: 800 }}>
    <Grid item xs={12}>
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        minRows={2}
        fullWidth
        size="small"
        required
        sx={{
          '& .MuiInputBase-input': { fontSize: '0.875rem', padding: '6px 10px', lineHeight: 1.4 },
          '& .MuiOutlinedInput-root': { minHeight: 64 },
        }}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        label="Cost"
        name="cost"
        type="number"
        value={formData.cost}
        onChange={handleChange}
        required
        InputProps={{ startAdornment: '₹' }}
        fullWidth
        size="small"
        sx={{ '& .MuiOutlinedInput-root': { minHeight: 40 } }}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        label="Mileage"
        name="mileage"
        type="number"
        value={formData.mileage}
        onChange={handleChange}
        InputProps={{ endAdornment: ' miles' }}
        fullWidth
        size="small"
        sx={{ '& .MuiOutlinedInput-root': { minHeight: 40 } }}
      />
    </Grid>
  </Grid>
)}

{/* Step 3: Service Center Details */}
{activeStep === 2 && (
  <Grid container spacing={3} sx={{ mt: 2, mx: 'auto', maxWidth: 800 }}>
    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
      <FormControl fullWidth size="small" sx={{ maxWidth: 220 }} required>
        <InputLabel id="service-center-label" required>Select Service Center</InputLabel>
        <Select
          labelId="service-center-label"
          value={selectedServiceCenter}
          label="Select Service Center"
          onChange={(e) => handleServiceCenterSelection(e.target.value)}
          required
        >
          <MenuItem value="" disabled>Select...</MenuItem>
          {/* Preferred Center */}
          {serviceCenterOptions.find(option => option.preferred) && (
            <ListSubheader>Preferred</ListSubheader>
          )}
          {serviceCenterOptions.filter(option => option.preferred).map(option => (
            <MenuItem key={option.id} value={option.id}>
              <span style={{ color: theme.palette.accent.main, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 6 }}>★</span> {option.label} <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 400 }}>(Preferred)</span>
              </span>
            </MenuItem>
          ))}
          {/* Divider between preferred and history */}
          {serviceCenterOptions.filter(option => !option.preferred && option.id !== 'custom').length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListSubheader>Visited Centers</ListSubheader>
            </>
          )}
          {/* Only show already visited centers (from history) */}
          {serviceCenterOptions.filter(option => !option.preferred && option.id !== 'custom').map(option => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
          {/* Divider before custom entry */}
          <Divider sx={{ my: 1 }} />
          <ListSubheader>Other</ListSubheader>
          {serviceCenterOptions.filter(option => option.id === 'custom').map(option => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    {(selectedServiceCenter === 'custom' || serviceCenterOptions.length === 0) && (
      <Grid container alignItems="center" sx={{ mt: 2}}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <TextField
            label="Service Center Name"
            name="serviceCenterName"
            value={formData.serviceCenter.name}
            onChange={(e) => handleServiceCenterChange('name', e.target.value)}
            placeholder="Enter service center name"
            required
            fullWidth
            size="small"
            sx={{ maxWidth: 220, minWidth: 180, '& .MuiOutlinedInput-root': { minHeight: 40 } }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            label="Service Center Address"
            name="serviceCenterAddress"
            value={formData.serviceCenter.address}
            onChange={(e) => handleServiceCenterChange('address', e.target.value)}
            placeholder="Enter service center address"
            multiline
            rows={2}
            required
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
    )}
    {selectedServiceCenter !== 'custom' && serviceCenterOptions.length > 0 && (
      <Grid item xs={12}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Selected:</strong> {formData.serviceCenter.name}
          </Typography>
          {formData.serviceCenter.address && (
            <Typography variant="body2" color="text.secondary">
              <strong>Address:</strong> {formData.serviceCenter.address}
            </Typography>
          )}
        </Box>
      </Grid>
    )}
    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 220, width: '100%' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Next Service(Optional)"
            value={formData.nextServiceDate}
            onChange={handleNextServiceDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
              />
            )}
          />
        </LocalizationProvider>
      </Box>
    </Grid>
  </Grid>
)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Add Service'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddService; 