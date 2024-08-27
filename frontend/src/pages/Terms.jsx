import React from 'react';
import {
  Box, Container, CssBaseline, Typography, Paper, Grid
} from '@mui/material';
import Link from '@mui/material/Link';
export default function Terms() {
  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Rental Parking Management
        </Typography>
        <Paper elevation={2} sx={{ width: '100%', marginTop: 2, padding: 2 }}>
          <Typography variant="h6" align="center">
            Terms you need to agree
          </Typography>
          <Typography variant="body1" align="center" sx={{ marginTop: 2 }}>
            1. You must be a unsw student

          </Typography>
        </Paper>
      </Box>
      <Grid item xs>
        <Link href='/Login' variant='body2'>
          Return to Login
        </Link>
      </Grid>
    </Container>

  );
}
