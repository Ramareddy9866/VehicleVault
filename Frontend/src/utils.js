// Format a date as DD/MM/YY
export const formatDateDDMMYY = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d)) return 'N/A'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

// Check service status by next date
export const getServiceStatus = (nextServiceDate) => {
  if (!nextServiceDate) {
    return { label: 'N/A', color: 'default' }
  }

  const today = new Date()
  const serviceDate = new Date(nextServiceDate)

  if (isNaN(serviceDate.getTime()) || serviceDate < today) {
    return { label: 'N/A', color: 'default' }
  }

  const daysUntilService = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24))

  if (daysUntilService === 0) {
    return { label: 'Due Today', color: 'error' }
  } else if (daysUntilService <= 7) {
    return { label: 'Due Soon', color: 'warning' }
  }
  return { label: 'Scheduled', color: 'success' }
}

// Build service center options from vehicle + history
export const buildServiceCenterOptions = (vehicleData, history) => {
  const PREFERRED_ID = 'preferred'
  const CUSTOM_ID = 'custom'
  const options = []
  let preferredCenter = null

  if (vehicleData?.preferredServiceCenter?.name) {
    preferredCenter = {
      name: vehicleData.preferredServiceCenter.name || '',
      address: vehicleData.preferredServiceCenter.address || '',
    }
    options.push({
      id: PREFERRED_ID,
      name: preferredCenter.name,
      address: preferredCenter.address,
      label: preferredCenter.name,
      preferred: true,
    })
  }

  const seenKeys = new Set()
  if (preferredCenter?.name) {
    seenKeys.add(preferredCenter.name + '|' + (preferredCenter.address || ''))
  }
  if (Array.isArray(history)) {
    history.forEach((service) => {
      const center = service?.serviceCenter || {}
      const key = (center.name || '') + '|' + (center.address || '')
      if (center.name && !seenKeys.has(key)) {
        options.push({
          id: `history-${center.name}`,
          name: center.name,
          address: center.address,
          label: center.name,
          preferred: false,
        })
        seenKeys.add(key)
      }
    })
  }

  options.push({ id: CUSTOM_ID, name: '', address: '', label: 'Custom Entry', preferred: false })
  return { options, preferredCenter }
}

// Utility validators
export const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === ''
export const isFuture = (date) => {
  if (!date) return false
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d > today
}
export const isNotAfterToday = (date) => {
  if (!date) return true
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d <= today
}

// Step validators for AddService
export const validateStep0 = (formData) => {
  if (!formData.date || isBlank(formData.type))
    return { ok: false, message: 'Please select both service date and service type.' }
  if (isFuture(formData.date))
    return { ok: false, message: 'Service date cannot be in the future.' }
  return { ok: true }
}
export const validateStep1 = (formData) => {
  if (isBlank(formData.description) || isBlank(formData.cost))
    return { ok: false, message: 'Please enter both description and cost.' }
  return { ok: true }
}
export const validateStep2 = (formData, selectedServiceCenter, CUSTOM_ID) => {
  if (isBlank(selectedServiceCenter))
    return { ok: false, message: 'Please select a service center.' }
  if (selectedServiceCenter === CUSTOM_ID) {
    if (isBlank(formData.serviceCenter.name) || isBlank(formData.serviceCenter.address)) {
      return { ok: false, message: 'Please enter both service center name and address.' }
    }
  }
  if (formData.nextServiceDate && isNotAfterToday(formData.nextServiceDate)) {
    return { ok: false, message: 'Next service date must be after today.' }
  }
  return { ok: true }
}
