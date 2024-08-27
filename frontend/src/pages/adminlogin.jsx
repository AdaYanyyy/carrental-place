import React, { useState } from 'react';
import {
  Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container
} from '@mui/material';
import { adminLogin } from '../api/user';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components';
import AuthImage from '../material/auth-image.jpg';
import AuthDecoration from '../material/auth-decoration.png';
import userAvatar from '../material/deer.png';
export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loginData = {
      username: username,
      password: password
    };

    const response = await adminLogin(loginData);

    if (response && response.token) {
      localStorage.setItem('admin_email', username);
      localStorage.setItem('Authorization', response.token);
      Toast.success("Successful Admin Login");
      navigate('/auth/admindashboard');
    } else {
      Toast.error(response.error || "Invalid username or password");
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      {/* Admin login form */}
      <Grid item xs={12} sm={6} md={6} component={Box} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }} src={userAvatar} />
          <Typography component="h1" variant="h5">
            Welcome back, Admin! ✨
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/" variant="body2">
                  Return to Home
                </Link>
              </Grid>
              <Grid item>
                <Link href="/login" variant="body2">
                  {"Not an Admin? Use user account to sign in."}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
      {/* Background image */}
      <Grid item xs={false} sm={6} md={6} sx={{
        backgroundImage: `url(${AuthImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      {/* Decoration image */}
      <Box
        component="img"
        src={AuthDecoration}
        sx={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10%',
          maxWidth: '100%',
          maxHeight: '100vh',
          objectFit: 'contain'
        }}
      />
    </Grid>
  );
}