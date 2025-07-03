// Shows one service center as a card
import React from 'react';
import { Card, CardContent, Typography, Box, Button, Divider, Tooltip } from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import HeartBroken from '@mui/icons-material/HeartBroken';
import Directions from '@mui/icons-material/Directions';
import AccessTime from '@mui/icons-material/AccessTime';
import LocationOn from '@mui/icons-material/LocationOn';
import LoadingButton from '@mui/lab/LoadingButton';

const ServiceCenterCard = ({
  center,
  isPreferred,
  address,
  addressLoading,
  onLoadAddress,
  onGetDirections,
  onMarkAsPreferred,
  selectedVehicleId
}) => (
  <Card
    sx={{
      mb: 2,
      bgcolor: 'background.paper',
      color: 'text.primary',
      border: isPreferred ? '2.5px solid' : '1px solid',
      borderColor: isPreferred ? '#bfa14a' : 'secondary.main',
      boxShadow: isPreferred ? 6 : 3,
      borderRadius: 2,
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: 8,
      },
    }}
  >
    <CardContent sx={{ p: 2 }}>
      {isPreferred && (
        <Typography variant="subtitle2" sx={{ color: '#bfa14a', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
          Preferred by you
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 'bold', color: isPreferred ? '#bfa14a' : 'primary.main', display: 'flex', alignItems: 'center' }}>
          {isPreferred && <Favorite sx={{ fontSize: 20, color: '#bfa14a', mr: 1 }} />}
          {center.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
        {center.isVirtual && center.address ? (
          <Typography variant="body2" color="text.secondary">
            {center.address}
          </Typography>
        ) :
        (!address && !addressLoading ? (
          <Button
            onClick={() => onLoadAddress(center)}
            size="small"
            variant="outlined"
            sx={{ width: '100%' }}
          >
            Load Address
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {addressLoading
              ? 'Loading address...'
              : address
              ? address
              : `${center.lat}, ${center.lon}`}
          </Typography>
        ))}
      </Box>
      {center.opening_hours && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
          <Typography
            variant="body2"
            color="success.main"
            sx={{ fontWeight: 'bold' }}
          >
            {center.opening_hours}
          </Typography>
        </Box>
      )}
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Directions />}
            onClick={() => onGetDirections(center)}
            fullWidth
            sx={{
              color: 'accent.main',
              backgroundColor: 'primary.main',
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'accent.main',
                color: '#fff',
                borderColor: 'accent.main',
              },
            }}
          >
            Directions
          </Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          {center.isVirtual ? (
            <LoadingButton
              variant="contained"
              size="small"
              onClick={() => onMarkAsPreferred(center)}
              color="primary"
              fullWidth
              sx={{
                color: 'accent.main',
                backgroundColor: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'accent.main',
                  color: '#fff',
                  borderColor: 'accent.main',
                },
              }}
              startIcon={<HeartBroken />}
            >
              Unprefer
            </LoadingButton>
          ) : (
            <Tooltip title={(!address) ? 'Wait for address to load' : ''}>
              <span>
                <LoadingButton
                  loading={addressLoading}
                  variant="contained"
                  size="small"
                  onClick={() => onMarkAsPreferred(center)}
                  color="primary"
                  fullWidth
                  sx={{
                    color: 'accent.main',
                    backgroundColor: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'accent.main',
                      color: '#fff',
                      borderColor: 'accent.main',
                    },
                  }}
                  disabled={!address || !selectedVehicleId}
                  startIcon={isPreferred ? <HeartBroken /> : <FavoriteBorder />}
                >
                  {isPreferred ? 'Unprefer' : 'Prefer'}
                </LoadingButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default ServiceCenterCard;
