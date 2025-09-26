import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import VehicleList from './components/Vehicles/VehicleList'
import AddVehicle from './components/Vehicles/AddVehicle'
import EditVehicle from './components/Vehicles/EditVehicle'
import ServiceHistory from './components/Services/ServiceHistory'
import AddService from './components/Services/AddService'
import NearbyCenters from './components/Services/NearbyCenters'
import ResetPassword from './components/Auth/ResetPassword'
import { SnackbarProvider } from './context/SnackbarContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <></>
  }
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />

  return children
}

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
                <Route path="reset-password/:token" element={<ResetPassword />} />
                <Route
                  path="vehicles"
                  element={
                    <ProtectedRoute>
                      <VehicleList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vehicles/add"
                  element={
                    <ProtectedRoute>
                      <AddVehicle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="add-vehicle"
                  element={
                    <ProtectedRoute>
                      <AddVehicle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vehicles/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditVehicle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vehicles/:id/service-history"
                  element={
                    <ProtectedRoute>
                      <ServiceHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vehicles/:id/add-service"
                  element={
                    <ProtectedRoute>
                      <AddService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="nearby-centers"
                  element={
                    <ProtectedRoute>
                      <NearbyCenters />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
