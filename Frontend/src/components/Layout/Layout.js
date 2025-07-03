// Main layout for the app.
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../context/AuthContext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MapIcon from '@mui/icons-material/Map';
import LogoutIcon from '@mui/icons-material/Logout';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Tooltip from '@mui/material/Tooltip';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Vehicles', icon: <DirectionsCarIcon />, path: '/vehicles' },
    { label: 'Nearby', icon: <MapIcon />, path: '/nearby-centers' },
    { label: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer', fontWeight: 700, ml: 4 }} onClick={() => navigate('/') }>
            <DirectionsCarFilledIcon sx={{ fontSize: 32, color: 'primary.contrastText', mr: 1 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              VehicleVault
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 'auto', width: 'auto' }}>
              <Button
                startIcon={<DirectionsCarIcon />}
                onClick={() => navigate('/vehicles')}
                sx={{
                  color: 'text.primary',
                  mx: 1,
                  fontWeight: 600,
                  '&:hover': { color: 'accent.main', bgcolor: 'primary.dark' },
                }}
              >
                Vehicles
              </Button>
              <Button
                startIcon={<MapIcon />}
                onClick={() => navigate('/nearby-centers')}
                sx={{
                  color: 'text.primary',
                  mx: 1,
                  fontWeight: 600,
                  '&:hover': { color: 'accent.main', bgcolor: 'primary.dark' },
                }}
              >
                Nearby
              </Button>
              <Box sx={{ width: 32 }} />
              <Tooltip title={user.email} arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontWeight: 600, mx: 1, ml: 5, cursor: 'pointer' }}>
                  <AccountCircle sx={{ mr: 1 }} />
                  <Typography>
                    {user.name}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: 'text.primary',
                    ml: 1,
                    mr: 0.5,
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
        {user && (
          <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <BottomNavigation
              showLabels
              sx={{ width: '100%', bgcolor: 'primary.main', position: 'sticky', bottom: 0 }}
            >
              <BottomNavigationAction
                label="Vehicles"
                icon={<DirectionsCarIcon />}
                onClick={() => navigate('/vehicles')}
                sx={{ color: 'text.primary', '&.Mui-selected': { color: 'accent.main' } }}
              />
              <BottomNavigationAction
                label="Nearby"
                icon={<MapIcon />}
                onClick={() => navigate('/nearby-centers')}
                sx={{ color: 'text.primary', '&.Mui-selected': { color: 'accent.main' } }}
              />
              <BottomNavigationAction
                label={user.name}
                icon={<Tooltip title={user.email} arrow><span><AccountCircle sx={{ color: 'text.primary' }} /></span></Tooltip>}
                sx={{ color: 'text.primary' }}
              />
              <BottomNavigationAction
                icon={<Tooltip title="Logout" arrow><LogoutIcon /></Tooltip>}
                onClick={handleLogout}
                sx={{ color: 'text.primary', '&:hover': { color: 'accent.main' } }}
              />
            </BottomNavigation>
          </Box>
        )}
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} VehicleVault. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
