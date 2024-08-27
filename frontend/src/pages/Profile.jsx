import React from 'react';
import { useEffect, useState } from 'react';
import { userInfo, updateUserInfo } from '../api/user';
import { Toast } from '../components';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  MenuItem,
  TextField,
  Box,
  CssBaseline,
  Button,
  Avatar,
  Container
} from '@mui/material';
import Link from '@mui/material/Link';


const TYPES = [
  {
    value: 'CAR',
    label: 'CAR',
  },
  {
    value: 'MPV',
    label: 'MPV',
  },
  {
    value: 'SUV',
    label: 'SUV',
  }
];

export default function UserProfile() {

  const getInitials = (name) => {
    return name ? name[0].toUpperCase() : '';
  };
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nickName: "",
    fullName: "",
    mobilePhone: "",
    email: "",
    password: '',
    confirmedPassowrd: '',
    carType: "CAR",
    plateNumber: ""

  });
  useEffect(() => {
    const doAsync = async () => {
      const res = await userInfo();
      setProfile({ ...res });
    };
    doAsync();
  }, [])



  const goToLink = (url) => {
    navigate(url);
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    const formJson = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );
    let { mobilePhone, password, confirmedPassowrd, carType, plateNumber } = formJson;


    if (confirmedPassowrd != "") {
      console.log('post password:', confirmedPassowrd);
      if (password !== confirmedPassowrd) {
        Toast.error('Two password are not same!');
        return;
      }
    }

    const data = {
      ...profile,
      password,
      phone: mobilePhone,
      confirmedPassowrd,
      carType,
      carCode: plateNumber
    }

    const res = await updateUserInfo(data);
    if (!res.error) {
      Toast.success('update success!!');
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '15vh'
      }} component='main' maxWidth='md'>
      <CssBaseline />

      <Box

        component='form'
        onSubmit={handleSubmit}
        noValidate
      >

        <Grid container alignItems="center" rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

          <Grid item xs={6}>
            {
              <Avatar sx={{ width: 56, height: 56 }}>{getInitials(profile.username)}</Avatar>
            }
          </Grid>


          <Grid item xs={6}>
            <TextField
              margin='normal'
              fullWidth
              name='username'
              label='user Name'
              variant='outlined'
              id='username'
              value={profile.username === undefined ? "" : profile.username}
              disabled
            />
          </Grid>
        </Grid>


        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <TextField
              margin='normal'
              id='mobilePhone'
              name='mobilePhone'
              variant='outlined'
              value={profile.mobilePhone === undefined ? "" : profile.mobilePhone}
              label='Mobile Phone'
              fullWidth
              onChange={(e) =>
                setProfile({ ...profile, mobilePhone: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              margin='normal'
              id='email'
              name='email'
              variant='outlined'
              label='Email'
              disabled
              value={profile.email === undefined ? "" : profile.email}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              margin='normal'
              id='password'
              name='password'
              type='password'
              variant='outlined'
              value={profile.password === undefined ? "" : profile.password}
              label='Password'
              fullWidth
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              margin='normal'
              id='confirmedPassowrd'
              value={profile.confirmedPassowrd === undefined ? "" : profile.confirmedPassowrd}
              name='confirmedPassowrd'
              type='password'
              variant='outlined'
              label='Confirmed Password'
              fullWidth
              onChange={(e) =>
                setProfile({ ...profile, confirmedPassowrd: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              name='carType'
              id='carType'
              fullWidth
              select
              label='Select Vehicle Type'
              value={profile.carType === undefined ? "CAR" : profile.carType}
              onChange={(e) => {
                setProfile({ ...profile, carType: e.target.value });
              }}
            >
              {TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              margin='normal'
              id='plateNumber'
              name='plateNumber'
              variant='outlined'
              label='Plate Number'
              value={profile.plateNumber === undefined ? "" : profile.plateNumber}
              onChange={(e) =>
                setProfile({ ...profile, plateNumber: e.target.value })
              }
              fullWidth
            />
          </Grid>
        </Grid>



        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Update
            </Button>
          </Grid>
        </Grid>
        {/* <Grid item xs>
          <Link href='/' variant='body2'>
            Return to Home
          </Link>
        </Grid> */}
      </Box>


    </Container>
  );
}
