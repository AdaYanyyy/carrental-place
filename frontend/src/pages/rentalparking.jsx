import React from 'react';
import {
  Box, Container, CssBaseline, Typography, Paper, Grid
} from '@mui/material';
import Link from '@mui/material/Link';
export default function RentalParking() {
  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Rental Parking Management
        </Typography>
        <Paper elevation={2} sx={{ width: '100%', marginTop: 2, padding: 2 }}>
          <Typography variant="h6" align="center">
            Manage Your Parking Spaces
          </Typography>
          <Typography variant="body1" align="center" sx={{ marginTop: 2 }}>
            This page allows users to add, view, and delete their rental parking spaces.
            Users can manage their parking space listings by specifying the location and price of each space.
            Whether you're looking to manage a single space or multiple locations, this interface simplifies your rental process.
          </Typography>
        </Paper>
      </Box>
      <Grid item xs>
        <Link href='/' variant='body2'>
          Return to Home
        </Link>
      </Grid>
    </Container>

  );
}
