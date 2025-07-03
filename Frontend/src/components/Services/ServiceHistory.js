import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
  useTheme,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from '../../context/SnackbarContext';
import API_URL from '../../config';
import { formatDateDDMMYY } from '../../utils';
import DeleteDialog from '../common/DeleteDialog';
import SelectField from '../common/SelectField';
import AppAlert from '../common/AppAlert';

// Show service history for a vehicle.
const ServiceHistory = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    if (!vehicleId) {
      setError('Invalid vehicle ID. Please try again.');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [vehicleRes, servicesRes] = await Promise.all([
          axios.get(`${API_URL}/vehicles/${vehicleId}`, { headers }),
          axios.get(`${API_URL}/services/${vehicleId}`, { headers }),
        ]);

        setVehicle(vehicleRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message ||
            'Failed to fetch service history. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/vehicles`, { headers });
        setVehicles(response.data);
      } catch (err) {
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, []);

  // Delete a service record
  const handleDelete = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_URL}/services/${serviceId}`, { headers });
      setServices(prev => prev.filter(s => s._id !== serviceId));
      showSnackbar('Service deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete service:', error);
      showSnackbar('Failed to delete service.', 'error');
    }
  };

  const handleDeleteClick = (serviceId) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      handleDelete(serviceToDelete);
    }
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <AppAlert severity="error">{error}</AppAlert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 0 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 3 }}>
          Service History
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <SelectField
            label="Select Vehicle"
            value={vehicleId || ''}
            onChange={e => navigate(`/vehicles/${e.target.value}/service-history`)}
            options={vehicles.map(v => ({ value: v._id, label: `${v.vehicleName} (${v.registrationNumber})` }))}
            size="small"
            sx={{ width: 240, height: 36 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/vehicles/${vehicleId}/add-service`)}
            sx={{ height: 36, width: 200, minWidth: 0, fontSize: '1rem', p: 0 }}
            size="small"
            startIcon={<AddIcon />}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {services.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
              <Typography>No service records found</Typography>
            </Box>
          </Grid>
        )}
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service._id}>
            <Paper
              elevation={3}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: 6,
                },
              }}
            >
              <IconButton
                size="small"
                sx={{ position: 'absolute', bottom: 8, right: 8 }}
                onClick={() => handleDeleteClick(service._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              <Box sx={{ mb: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDateDDMMYY(service.serviceDate)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'accent.main', mt: 0.5 }}>
                  {service.serviceType || 'Service Type'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Description:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description || 'No description provided.'}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Cost:</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.success.main, mr: 2 }}>
                  {typeof service.cost === 'number' && !isNaN(service.cost)
                    ? `₹${service.cost.toFixed(2)}`
                    : 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: '#bbb', height: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Mileage:</Typography>
                <Typography variant="body2">
                  {typeof service.mileage === 'number' && !isNaN(service.mileage)
                    ? `${service.mileage.toLocaleString()} miles`
                    : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1px dashed #ccc', my: 2 }} />

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Service Center:
                </Typography>
                {service.serviceCenter?.name ? (
                  <Box sx={{ lineHeight: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'accent.main', lineHeight: 1, m: 0, textAlign: 'center' }}>
                      {service.serviceCenter.name}
                    </Typography>
                    {service.serviceCenter.address && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1, m: 0, mt: 1 }}>
                        {service.serviceCenter.address}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not specified
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Next Service:
                </Typography>
                {service.nextServiceDate ? (
                  <Typography variant="body2">
                    {formatDateDDMMYY(service.nextServiceDate)}
                    {typeof service.nextServiceMileage === 'number' &&
                      !isNaN(service.nextServiceMileage) &&
                      ` at ${service.nextServiceMileage.toLocaleString()} miles`}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    N/A
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this service record? This action cannot be undone."
      />
    </Container>
  );
};

export default ServiceHistory;
