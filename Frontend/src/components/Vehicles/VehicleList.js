import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BuildIcon from '@mui/icons-material/Build';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import { useSnackbar } from '../../context/SnackbarContext';
import API_URL from '../../config';
import { formatDateDDMMYY, getServiceStatus } from '../../utils';
import DeleteDialog from '../common/DeleteDialog';

// Helper to get icon by vehicle type
const getVehicleIcon = (type) => {
  return <DirectionsCarIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />;
};

// Subcomponent for each vehicle card
function VehicleCard({ vehicle, services, onEdit, onDelete, onMenuOpen }) {
  // Calculate previous and next service dates
  let previousServiceDate = null;
  if (services.length > 0) {
    previousServiceDate = services
      .map(s => s.serviceDate)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];
  }
  let nextServiceDate = null;
  const today = new Date();
  const futureNextDates = services
    .map(s => s.nextServiceDate)
    .filter(d => d && new Date(d) > today)
    .sort((a, b) => new Date(a) - new Date(b));
  if (futureNextDates.length > 0) {
    nextServiceDate = futureNextDates[0];
  }
  let serviceStatus = getServiceStatus(nextServiceDate);

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 3,
        borderRadius: 2,
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: 6,
        },
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getVehicleIcon(vehicle.vehicleType)}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
              {vehicle.vehicleName}
              {vehicle.modelYear ? ` (${vehicle.modelYear})` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.registrationNumber}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, vehicle._id)}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Previous Service Date:
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {formatDateDDMMYY(previousServiceDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Next Service Date:
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {formatDateDDMMYY(nextServiceDate)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Box>
            {serviceStatus.label !== 'N/A' && (
              <Chip
                label={serviceStatus.label}
                color={serviceStatus.color}
                size="small"
                sx={{ fontWeight: 600, bgcolor: serviceStatus.isPlaceholder ? 'grey.200' : undefined, color: serviceStatus.isPlaceholder ? 'text.secondary' : undefined }}
                variant={serviceStatus.isPlaceholder ? 'outlined' : 'filled'}
              />
            )}
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: 'secondary.main' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: 'accent.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Subcomponent for the service menu
function ServiceMenu({ anchorEl, open, onClose, onAddService, onHistory }) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        onClick={onAddService}
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' },
        }}
      >
        <BuildIcon sx={{ mr: 1 }} /> Add Service
      </MenuItem>
      <MenuItem
        onClick={onHistory}
        sx={{
          color: 'secondary.main',
          fontWeight: 500,
          '&:hover': { bgcolor: 'secondary.light', color: 'secondary.dark' },
        }}
      >
        <HistoryIcon sx={{ mr: 1 }} /> Service History
      </MenuItem>
    </Menu>
  );
}

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [servicesByVehicle, setServicesByVehicle] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehicleId: null });
  const [menuAnchor, setMenuAnchor] = useState({ open: false, vehicleId: null, element: null });
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const location = useLocation();
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Get vehicles from server
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      setVehicles(response.data);
      const servicesObj = {};
      await Promise.all(
        response.data.map(async (vehicle) => {
          try {
            const res = await axios.get(`${API_URL}/services/${vehicle._id}`);
            servicesObj[vehicle._id] = res.data;
          } catch (err) {
            servicesObj[vehicle._id] = [];
          }
        })
      );
      setServicesByVehicle(servicesObj);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (location.state && location.state.vehicleAdded) {
      setShowAddSuccess(true);
      const timer = setTimeout(() => setShowAddSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Delete a vehicle
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/vehicles/${deleteDialog.vehicleId}`);
      setDeleteDialog({ open: false, vehicleId: null });
      fetchVehicles();
      showSnackbar('Vehicle deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showSnackbar('Failed to delete vehicle. Please try again.', 'error');
    }
  };

  const handleMenuOpen = (event, vehicleId) => {
    setMenuAnchor({ open: true, vehicleId, element: event.currentTarget });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ open: false, vehicleId: null, element: null });
  };

  const handleServiceAction = (action) => {
    handleMenuClose();
    if (action === 'add') {
      navigate(`/vehicles/${menuAnchor.vehicleId}/add-service`);
    } else if (action === 'history') {
      navigate(`/vehicles/${menuAnchor.vehicleId}/service-history`);
    }
  };

  return (
    <Container>
      {showAddSuccess && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography sx={{ bgcolor: 'success.main', color: 'success.contrastText', p: 2, borderRadius: 1, textAlign: 'center', fontWeight: 600 }}>
            Vehicle added successfully!
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1, textTransform: 'uppercase' }}>
          Vehicle Collection
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-vehicle')}
          >
            Add Vehicle
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {vehicles.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4, mt: 8 }}>
              <Typography>No vehicles found. Please add a vehicle.</Typography>
            </Box>
          </Grid>
        )}
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
            <VehicleCard
              vehicle={vehicle}
              services={servicesByVehicle[vehicle._id] || []}
              onEdit={() => navigate(`/vehicles/${vehicle._id}/edit`)}
              onDelete={() => setDeleteDialog({ open: true, vehicleId: vehicle._id })}
              onMenuOpen={handleMenuOpen}
            />
          </Grid>
        ))}
      </Grid>
      <ServiceMenu
        anchorEl={menuAnchor.element}
        open={menuAnchor.open}
        onClose={handleMenuClose}
        onAddService={() => handleServiceAction('add')}
        onHistory={() => handleServiceAction('history')}
      />
      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, vehicleId: null })}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
      />
    </Container>
  );
};

export default VehicleList;
