// Add a new vehicle.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
} from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import { useSnackbar } from '../../context/SnackbarContext';
import API_URL from '../../config';
import AppAlert from '../common/AppAlert';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    modelYear: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Only require vehicleName and registrationNumber
    if (!formData.vehicleName || !formData.registrationNumber) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      await axios.post(`${API_URL}/vehicles`, formData);
      showSnackbar('Vehicle added successfully!', 'success');
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle.');
    }
  };

  const sharedFieldSx = {
    minWidth: 180,
    maxWidth: '220px',
    '& .MuiOutlinedInput-root': {
      minHeight: 40,
    },
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <DirectionsCarFilledIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Add Vehicle
          </Typography>
        </Box>

        {error && <AppAlert severity="error">{error}</AppAlert>}

        <Grid container spacing={1.5} component="form" onSubmit={handleSubmit}>
          {/* Vehicle Name */}
          <Grid item xs={12}>
            <TextField
              label="Vehicle Name"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              sx={{ minWidth: 300, maxWidth: '100%', '& .MuiOutlinedInput-root': { minHeight: 40 } }}
            />
          </Grid>

          {/* Registration Number */}
          <Grid item xs={12}>
            <TextField
              label="Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              sx={{ minWidth: 300, maxWidth: '100%', '& .MuiOutlinedInput-root': { minHeight: 40 } }}
            />
          </Grid>

          {/* Model Year */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              label="Model Year"
              name="modelYear"
              type="number"
              value={formData.modelYear}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={sharedFieldSx}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1.5 }}>
            <Button variant="outlined" onClick={() => navigate('/vehicles')} sx={{ minWidth: 100 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
              Add Vehicle
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AddVehicle;
