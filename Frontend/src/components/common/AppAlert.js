// Show alert messages.
import React from 'react';
import { Alert } from '@mui/material';

const AppAlert = ({ severity = 'info', children, sx = {}, ...props }) => (
  <Alert severity={severity} sx={{ width: '100%', mt: 2, ...sx }} {...props}>
    {children}
  </Alert>
);

export default AppAlert; 