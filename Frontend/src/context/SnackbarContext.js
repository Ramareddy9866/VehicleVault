import React, { createContext, useContext, useState, useCallback } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const SnackbarContext = createContext(null)

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  })

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (context === null) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
