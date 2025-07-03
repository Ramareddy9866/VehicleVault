// Edit vehicle details.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useSnackbar } from '../../context/SnackbarContext';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import API_URL from '../../config';
import AppAlert from '../common/AppAlert';

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    modelYear: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`${API_URL}/vehicles/${id}`);
        const v = res.data;
        setFormData({
          vehicleName: v.vehicleName || '',
          registrationNumber: v.registrationNumber || '',
          modelYear: v.modelYear || '',
        });
      } catch {
        setError('Failed to fetch vehicle data.');
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [id]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDateChange = date => setFormData({ ...formData, nextServiceDate: date });

  // Update vehicle info
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Only require vehicleName and registrationNumber (modelYear is optional)
    if (!formData.vehicleName || !formData.registrationNumber) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      await axios.put(`${API_URL}/vehicles/${id}`, {
        vehicleName: formData.vehicleName,
        registrationNumber: formData.registrationNumber,
        modelYear: formData.modelYear,
      });
      showSnackbar('Vehicle updated successfully!', 'success');
      navigate('/vehicles');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update vehicle. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            Edit Vehicle
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
              sx={{ minWidth: 300, maxWidth: '100%' }}
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
              sx={{ minWidth: 300, maxWidth: '100%' }}
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
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditVehicle;
