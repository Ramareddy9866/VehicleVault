// Add service record for a vehicle
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Grid, Container, Paper, Typography, TextField, Button, Box, MenuItem, FormControl,
  InputLabel, Select, useTheme, ListSubheader } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { useSnackbar } from '../../context/SnackbarContext'
import API_URL from '../../config'
import SelectField from '../common/SelectField'
import {
  buildServiceCenterOptions, isBlank, validateStep0, validateStep1, validateStep2,
} from '../../utils'

const serviceTypes = ['Oil Change','Brake Service','Tire Rotation','Battery Replacement','Engine Diagnostics','General Maintenance','Others']
const CUSTOM_ID = 'custom'

const AddService = () => {
    // Navigation and form state management
  const navigate = useNavigate()
  const { id: vehicleId } = useParams()
  const [loading, setLoading] = useState(false)
  const [serviceCenterOptions, setServiceCenterOptions] = useState([])
  const [selectedServiceCenter, setSelectedServiceCenter] = useState('')
  const [formData, setFormData] = useState({
    date: new Date(),
    type: '',
    description: '',
    cost: '',
    mileage: '',
    nextServiceDate: null,
    serviceCenter: {
      name: '',
      address: '',
    },
  })
  const [activeStep, setActiveStep] = useState(0)
  const steps = ['Service Date & Type', 'Description & Cost', 'Service Center Details']
  const showSnackbar = useSnackbar()
  const [stepError, setStepError] = useState('')
  const theme = useTheme()
  const [serviceHistory, setServiceHistory] = useState([])

  const showErrorLocal = (message) => {
    setStepError(message)
    setTimeout(() => setStepError(''), 5000)
  }

  const applySelectedCenter = (optionId, options) => {
    setSelectedServiceCenter(optionId)
    if (optionId === CUSTOM_ID) {
      setFormData((prev) => ({ ...prev, serviceCenter: { name: '', address: '' } }))
    } else {
      const selectedOption = options.find((option) => option.id === optionId)
      if (selectedOption) {
        setFormData((prev) => ({
          ...prev,
          serviceCenter: { name: selectedOption.name, address: selectedOption.address },
        }))
      }
    }
  }

  const buildServicePayload = (data) => {
    const parsedCost = isBlank(data.cost) ? undefined : parseFloat(data.cost)
    const parsedMileage = isBlank(data.mileage) ? undefined : parseInt(data.mileage)
    const validDate = data.date ? new Date(data.date) : null
    const validNext = data.nextServiceDate ? new Date(data.nextServiceDate) : null
    return {
      serviceType: data.type,
      serviceDate: validDate,
      cost: parsedCost,
      description: data.description,
      mileage: parsedMileage,
      nextServiceDate: validNext,
      serviceCenter: data.serviceCenter,
    }
  }

  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${vehicleId}`)
        setServiceHistory(response.data)
      } catch (err) {
        console.error('Error fetching service history:', err)
      }
    }
    if (vehicleId) {
      fetchServiceHistory()
    }
  }, [vehicleId])

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles/${vehicleId}`)
        const { options, preferredCenter } = buildServiceCenterOptions( response.data, serviceHistory )
        setServiceCenterOptions(options)
        if (preferredCenter) {
          setFormData((prev) => ({ ...prev, serviceCenter: preferredCenter }))
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err)
      }
    }
    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId, serviceHistory])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value}))
  }

  const handleServiceCenterChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceCenter: { ...prev.serviceCenter, [field]: value},
    }))
  }

  const handleServiceCenterSelection = (optionId) => {
    applySelectedCenter(optionId, serviceCenterOptions)
  }

  const handleDateChange = (field) => (date) => {
    setFormData((prev) => ({ ...prev, [field]: date }))
  }

    // Form validation and navigation handlers
  const validators = [
    () => validateStep0(formData),
    () => validateStep1(formData),
    () => validateStep2(formData, selectedServiceCenter, CUSTOM_ID),
  ]

  const handleNext = () => {
    setStepError('')
    const result = validators[activeStep]()
    if (!result.ok) {
      showErrorLocal(result.message)
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

    // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (activeStep !== steps.length - 1) return
    setLoading(true)
    try {
      const serviceData = buildServicePayload(formData)
      await axios.post(`${API_URL}/services/${vehicleId}`, serviceData)
      showSnackbar('Service record added successfully!', 'success')
      navigate(`/vehicles/${vehicleId}/service-history`)
    } catch (err) {
      console.error('Error adding service:', err)
      showSnackbar(err.response?.data?.message || 'Failed to add service record. Please try again.','error')
      setStepError(err.response?.data?.message || 'Failed to add service record. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Container
      maxWidth="md"
      sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
    >
      <Paper
        elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mx: { xs: 0, sm: 'auto' } }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'uppercase',
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Add Service Record
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: { xs: 3, sm: 4 },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box noValidate>
          {stepError && (
            <Typography
              color="error"
              sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'center' }}
            >
              {stepError}
            </Typography>
          )}

          {/* Step 1: Date and Type */}
          {activeStep === 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Service Date"
                    value={formData.date}
                    onChange={handleDateChange('date')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { width: '100%', '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Service Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={serviceTypes.map((type) => ({ value: type, label: type }))}
                  required
                  size="small"
                  sx={{ width: '100%', '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Description and Cost */}
          {activeStep === 1 && (
            <Grid
              container
              spacing={{ xs: 2, sm: 3 }}
              sx={{ mt: 2, mx: 'auto', maxWidth: { xs: '100%', md: 800 } }}
            >
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  minRows={{ xs: 3, sm: 2 }}
                  fullWidth
                  size="small"
                  required
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem',
                      padding: { xs: '8px 12px', sm: '6px 10px' },
                      lineHeight: 1.4,
                    },
                    '& .MuiOutlinedInput-root': { minHeight: { xs: 80, sm: 64 } },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: '₹' }}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  InputProps={{ endAdornment: ' miles' }}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Service Center Details */}
          {activeStep === 2 && (
            <Grid
              container
              spacing={{ xs: 2, sm: 3 }}
              sx={{ mt: 2, mx: 'auto', maxWidth: { xs: '100%', md: 800 } }}
            >
              {/* Service Center Selector */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="service-center-label">Select Service Center</InputLabel>
                  <Select
                    labelId="service-center-label"
                    value={selectedServiceCenter}
                    label="Select Service Center"
                    onChange={(e) => handleServiceCenterSelection(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                    renderValue={(selected) => {
                      if (!selected) return 'Select...'
                      const selectedOption = serviceCenterOptions.find((opt) => opt.id === selected)
                      if (!selectedOption) return 'Select...'
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedOption.preferred && (
                            <span style={{ color: theme.palette.warning.main, marginRight: 6 }}>
                              ★
                            </span>
                          )}
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: selectedOption.preferred ? 600 : 400, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {selectedOption.label}
                          </Typography>
                        </Box>
                      )
                    }}
                  >
                    <MenuItem value="" disabled> Select... </MenuItem>

                    {serviceCenterOptions.find((option) => option.preferred) && (
                      <ListSubheader
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          lineHeight: 1.8,
                        }}
                      >
                        PREFERRED
                      </ListSubheader>
                    )}
                    {serviceCenterOptions
                      .filter((option) => option.preferred)
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: theme.palette.warning.main, marginRight: 6 }}>
                              ★
                            </span>
                            <Typography
                              variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} >
                              {option.label}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}

                    {serviceCenterOptions.filter(
                      (option) => !option.preferred && option.id !== 'custom'
                    ).length > 0 && (
                      <ListSubheader
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          lineHeight: 1.8,
                        }}
                      >
                        VISITED CENTERS
                      </ListSubheader>
                    )}
                    {serviceCenterOptions
                      .filter((option) => !option.preferred && option.id !== 'custom')
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} >
                            {option.label}
                          </Typography>
                        </MenuItem>
                      ))}

                    <ListSubheader
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        lineHeight: 1.8,
                      }}
                    >
                      OTHER
                    </ListSubheader>
                    {serviceCenterOptions
                      .filter((option) => option.id === 'custom')
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} >
                            {option.label}
                          </Typography>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Custom Service Center Fields */}
              {(selectedServiceCenter === 'custom' || serviceCenterOptions.length === 0) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Service Center Name"
                      value={formData.serviceCenter.name}
                      onChange={(e) => handleServiceCenterChange('name', e.target.value)}
                      placeholder="Enter service center name"
                      required
                      fullWidth
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Service Center Address"
                      value={formData.serviceCenter.address}
                      onChange={(e) => handleServiceCenterChange('address', e.target.value)}
                      placeholder="Enter service center address"
                      multiline
                      rows={{ xs: 2, sm: 2 }}
                      required
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          padding: { xs: '8px 12px', sm: '6px 10px' },
                        },
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Selected Service Center Card */}
              {selectedServiceCenter !== 'custom' && serviceCenterOptions.length > 0 && (
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 0.5, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      Selected Service Center
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      <strong>Name:</strong> {formData.serviceCenter.name}
                    </Typography>
                    {formData.serviceCenter.address && (
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }} >
                        <strong>Address:</strong> {formData.serviceCenter.address}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Next Service Date */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ maxWidth: { xs: '100%', sm: 220 }, width: '100%' }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Next Service (Optional)"
                      value={formData.nextServiceDate}
                      onChange={handleDateChange('nextServiceDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          sx: { '& .MuiOutlinedInput-root': { minHeight: { xs: 48, sm: 40 } } },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: { xs: 3, sm: 4 },
              gap: { xs: 2, sm: 0 },
              flexDirection: { xs: 'column-reverse', sm: 'row' },
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ minHeight: { xs: 44, sm: 36 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ minHeight: { xs: 44, sm: 36 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ minHeight: { xs: 44, sm: 36 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {loading ? 'Saving...' : 'Add Service'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default AddService
