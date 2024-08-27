import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { register, sendCode } from '../api/user';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import backImage from '../material/login.png';

export default function SignUp() {
  const [carType, setCarType] = useState('');
  const [emailAddress, setEamil] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const handleBoxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  const handleChange = (event) => {
    setCarType(event.target.value);
  }
  const handleEmailChange = (event) => {
    setEamil(event.target.value);
  }
  const handleTermsClick = (event) => {
    event.preventDefault();
    navigate('/terms');
  };


  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isChecked) {
      Toast.error('You need to agree terms');
      return;
    }
    const data = new FormData(event.currentTarget);
    if (data.get('password') === data.get('confirmedPassword')) {
      const user = {
        username: data.get('name'),
        phone: data.get('phone') || '',
        email: data.get('email'),
        carType: carType,
        carCode: data.get('plate'),
        password: data.get('password'),
        verification_code: data.get('verifiction_code')
      };
      console.log('user_info', user);
      try {
        const res = await register(user);
        if (res && res.user) {
          console.log(res);
          Toast.success('Sign up success, will jump to login page');

          window.dispatchEvent(new Event('storage'));
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else if (res && res.error) {
          console.log(res);
          Toast.error(res.error);
        } else {
          console.log(res);
          Toast.error('Sign up failed. Please check your details.');
        }
      } catch (error) {

        console.error('Sign up error:', error);
        Toast.error('An error occurred during sign up. Please try again.');
      }
    } else {
      Toast.error('The passwords do not match. Please try again.');
    }
  };
  //const goToLink = (url) => {
  //navigate(url);
  //};
  const getCode = async () => {
    console.log('getCode')
    const res = await sendCode({ email: emailAddress, action: "register" });
  }
  const backgroundImageStyle = {
    // backgroundImage: `url(${backImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    position: 'relative',

  };
  const containerStyle = {
    backgroundColor: 'white',
    border: '0px solid #ccc',
    borderRadius: '5px',
    padding: '20px',
    width: '30%',
    height: '70%',
  };
  return (
    <Box sx={backgroundImageStyle}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />

        <Box
          sx={{
            ...containerStyle,
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography id='signup-title' component='h1' variant='h5'>
            Sign up
          </Typography>
          <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}></Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id='name'
                  name='name'
                  fullWidth
                  label='Name'
                  type='text'
                  autoComplete='name'
                  autoFocus
                />
              </Grid>
              <Grid item xs={8} >
                <TextField
                  required
                  fullWidth
                  id='email'
                  label='Email'
                  name='email'
                  autoComplete='email'
                  onChange={handleEmailChange}
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  className='smscode'
                  type='button'
                  fullWidth
                  variant='contained'
                  onClick={getCode}
                  sx={{ mt: 3, mb: 2 }}
                >
                  code
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name='verification_code'
                  id='verification_code'
                  label='verification code'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name='password'
                  id='password'
                  label='password'
                  type='password'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name='confirmedPassword'
                  id='confirmedPassword'
                  label='confirmed Password'
                  type='password'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name='phone'
                  id='phone'
                  label='phone number'

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id='plate'
                  label='plate number'
                  name='plate'
                  autoComplete='plate number'
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="carTypeSelector">Car Type</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={carType}
                    label="Car Type"
                    onChange={handleChange}
                  >
                    <MenuItem value={'SUV'}>SUV</MenuItem>
                    <MenuItem value={'MPV'}>MPV</MenuItem>
                    <MenuItem value={'CAR'}>CAR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
            <Button
              id='registerBtn'
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="space-between" spacing={2}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleBoxChange}
                      value="agree"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to <Link href="#" onClick={handleTermsClick} style={{ marginLeft: '4px' }}>terms</Link>
                    </Typography>
                  }
                />
              </Grid>
              <Grid item>
                <Link href='/login' variant='body2'>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs>
                <Link href='/' variant='body2'>
                  Return to Home
                </Link>
              </Grid>


            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
