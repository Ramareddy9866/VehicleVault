import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VehicleList from './components/Vehicles/VehicleList';
import AddVehicle from './components/Vehicles/AddVehicle';
import EditVehicle from './components/Vehicles/EditVehicle';
import ServiceHistory from './components/Services/ServiceHistory';
import AddService from './components/Services/AddService';
import NearbyCenters from './components/Services/NearbyCenters';
import Profile from './components/Profile/Profile';
import ResetPassword from './components/Auth/ResetPassword';
import { SnackbarProvider } from './context/SnackbarContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile" element={<Profile />} />
                <Route path="vehicles" element={<VehicleList />} />
                <Route path="vehicles/add" element={<AddVehicle />} />
                <Route path="add-vehicle" element={<AddVehicle />} />
                <Route path="vehicles/:id/edit" element={<EditVehicle />} />
                <Route path="vehicles/:id/service-history" element={<ServiceHistory />} />
                <Route path="vehicles/:id/add-service" element={<AddService />} />
                <Route path="nearby-centers" element={<NearbyCenters />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
              </Route>
            </Routes>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;