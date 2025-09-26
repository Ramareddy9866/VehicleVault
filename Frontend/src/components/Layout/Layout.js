import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import MapIcon from '@mui/icons-material/Map'
import LogoutIcon from '@mui/icons-material/Logout'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import { useAuth } from '../../context/AuthContext'

const Layout = () => {
  // Authentication state and navigation
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* navigation header */}
      <AppBar position="sticky" sx={{ zIndex: 1201 }}>
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 0 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              flexGrow: user ? 0 : 1,
              justifyContent: user ? 'flex-start' : 'center',
              mb: { xs: user ? 1.5 : 0, sm: 0 },
            }}
          >
            <DirectionsCarFilledIcon
              sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.contrastText', mr: 1.5 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              VehicleVault
            </Typography>
          </Box>

          {user && (
            <>
              <Box
                sx={{
                  width: '100%',
                  display: { xs: 'flex', sm: 'none' },
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <Tooltip title={user.email} arrow>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 13,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'primary.dark' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <AccountCircle sx={{ mr: 0.5, fontSize: 22 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.name}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Logout" arrow>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      color: 'text.primary',
                      p: 0.5,
                      '&:hover': { bgcolor: 'primary.dark' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Mobile nav buttons */}
              <Box
                sx={{
                  width: '100%',
                  display: { xs: 'flex', sm: 'none' },
                  justifyContent: 'center',
                  gap: 4,
                  minHeight: 44,
                  alignItems: 'center',
                }}
              >
                <Button
                  startIcon={<DirectionsCarIcon />}
                  onClick={() => navigate('/vehicles')}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: 14,
                    minWidth: 120,
                    borderRadius: 2,
                  }}
                >
                  Vehicles
                </Button>
                <Button
                  startIcon={<MapIcon />}
                  onClick={() => navigate('/nearby-centers')}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: 14,
                    minWidth: 120,
                    borderRadius: 2,
                  }}
                >
                  Nearby
                </Button>
              </Box>
              {/* Desktop navbar */}
              <Box
                sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', width: '100%' }}
              >
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Button
                    startIcon={<DirectionsCarIcon />}
                    onClick={() => navigate('/vehicles')}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: 16,
                      minWidth: 130,
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
                      fontWeight: 600,
                      fontSize: 16,
                      minWidth: 130,
                      '&:hover': { color: 'accent.main', bgcolor: 'primary.dark' },
                    }}
                  >
                    Nearby
                  </Button>
                  <Tooltip title={user.email} arrow>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        px: 2,
                        py: 1,
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <AccountCircle sx={{ mr: 1, fontSize: 28 }} />
                      <Typography sx={{ fontSize: 16 }}>{user.name}</Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Logout" arrow>
                    <IconButton onClick={handleLogout} sx={{ color: 'text.primary' }}>
                      <LogoutIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, flex: 1 }}>
        <Outlet />
      </Container>

     {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: { xs: 11, sm: 14 } }}
          >
            © {new Date().getFullYear()} VehicleVault. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
