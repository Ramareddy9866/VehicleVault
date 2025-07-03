import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', mb: 2 }}>
          Profile
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Name</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountCircleIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              {user?.name}
            </Typography>
          </Box>
          
          <Typography variant="h6">Email</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {user?.email}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 