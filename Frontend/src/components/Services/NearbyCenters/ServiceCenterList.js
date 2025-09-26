import { Card, CardContent, Typography, Box, Button, Divider, Tooltip } from '@mui/material'
import Favorite from '@mui/icons-material/Favorite'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import HeartBroken from '@mui/icons-material/HeartBroken'
import Directions from '@mui/icons-material/Directions'
import AccessTime from '@mui/icons-material/AccessTime'
import LocationOn from '@mui/icons-material/LocationOn'
import LoadingButton from '@mui/lab/LoadingButton'

const ServiceCenterList = ({
  sortedCenters = [],
  addressCache,
  addressLoading,
  onLoadAddress,
  onGetDirections,
  onMarkAsPreferred,
  selectedVehicleId,
}) => {
  if (sortedCenters.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No service centers found nearby.
      </Typography>
    )
  }

  return (
    <>
      {sortedCenters.map((center) => {
        const isPreferred = center.isPreferred
       // Determine address display content based on loading/cache state
        const addressContent = addressLoading[center.id]
          ? 'Loading address...'
          : addressCache[center.id]
            ? addressCache[center.id]
            : isPreferred && center.address
              ? center.address
              : `${center.lat}, ${center.lon}`

        return (
          <Card
            key={center.id}
            sx={{
              mb: { xs: 1.5, sm: 2 },
              flexShrink: 0,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: isPreferred ? '2.5px solid' : '1px solid',
              borderColor: isPreferred ? '#bfa14a' : 'secondary.main',
              boxShadow: isPreferred ? 6 : 3,
              borderRadius: 2,
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-4px) scale(1.02)' },
                boxShadow: { xs: isPreferred ? 6 : 3, sm: 8 },
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              {isPreferred && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#bfa14a',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Preferred by you
                </Typography>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: { xs: 0.5, sm: 1 },
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 'bold',
                    color: isPreferred ? '#bfa14a' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {isPreferred && (
                    <Favorite
                      sx={{
                        fontSize: { xs: 16, sm: 20 },
                        color: '#bfa14a',
                        mr: { xs: 0.5, sm: 1 },
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {center.name}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: { xs: 0.5, sm: 1 },
                  gap: 0.5,
                }}
              >
                <LocationOn
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    color: 'text.secondary',
                    mt: 0.1,
                    flexShrink: 0,
                  }}
                />
                {!addressCache[center.id] && !addressLoading[center.id] && !isPreferred ? (
                  <Button
                    onClick={() => onLoadAddress(center)}
                    size="small"
                    variant="outlined"
                    sx={{ width: '100%', minHeight: { xs: 32, sm: 36 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Load Address
                  </Button>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      flex: 1,
                    }}
                  >
                    {addressContent}
                  </Typography>
                )}
              </Box>
              {center.opening_hours && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 }, gap: 0.5 }}
                >
                  <AccessTime
                    sx={{ fontSize: { xs: 14, sm: 16 }, color: 'success.main', flexShrink: 0}}
                  />
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.3}}
                  >
                    {center.opening_hours}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: { xs: 0.5, sm: 1 } }} />
              {/* Action buttons for directions and preference management */}
              <Box
                sx={{ display: 'flex', gap: { xs: 1, sm: 1 }, flexDirection: { xs: 'column', sm: 'row' } }}
              >
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Directions sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    onClick={() => onGetDirections(center)}
                    fullWidth
                    sx={{
                      color: 'accent.main',
                      backgroundColor: 'primary.main',
                      borderColor: 'primary.main',
                      minHeight: { xs: 40, sm: 36 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': { bgcolor: 'accent.main', color: '#fff', borderColor: 'accent.main' }
                    }}
                  >
                    Directions
                  </Button>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Tooltip
                    title={ !isPreferred && !addressCache[center.id] ? 'Wait for address to load' : '' }
                  >
                    <span>
                      <LoadingButton
                        loading={addressLoading[center.id]}
                        variant="contained"
                        size="small"
                        onClick={() => onMarkAsPreferred(center)}
                        color="primary"
                        fullWidth
                        disabled={(!isPreferred && !addressCache[center.id]) || !selectedVehicleId}
                        startIcon={
                          isPreferred ? (
                            <HeartBroken sx={{ fontSize: { xs: 16, sm: 18 } }} />
                          ) : (
                            <FavoriteBorder sx={{ fontSize: { xs: 16, sm: 18 } }} />
                          )
                        }
                        sx={{ minHeight: { xs: 40, sm: 36 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {isPreferred ? 'Unprefer' : 'Prefer'}
                      </LoadingButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}

export default ServiceCenterList
