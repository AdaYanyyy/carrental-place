import * as React from 'react';
import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import { login } from '../api/user';
import { sendCode } from '../api/user';
import { resetpassword } from '../api/user';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components';
import backImage from '../material/login.png';
export default function Login() {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
  const goToLink = (url) => {
    navigate(url);
  };

  const handleBoxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isChecked) {
      Toast.error('You need to agree terms');
      return;
    }
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
    const response = await login({
      username,
      password,
    });
    if (response && response.token) {
      localStorage.setItem('email', username);
      localStorage.setItem('Authorization', response.token);
      Toast.success("SUCCESSFUL Login");
      window.dispatchEvent(new Event('storage'));
      goToLink('/');
    } else {
      Toast.error(response.error);
    }
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [openSecondModal, setOpenSecondModal] = useState(false);
  const [email, setEamil] = useState('');
  const [username, setUserName] = useState('');


  const handleSendResetLink = async (event) => {
    event.preventDefault();
    console.log('event')

    const formData = new FormData(event.currentTarget);
    console.log('formData:', formData);
    const username = formData.get('rusername');
    const email = formData.get('remail');
    console.log('formData:', username, email);


    if (!username || !email) {
      Toast.error('Username and email cannot be empty.');
      return;
    }

    try {
      setUserName(username);
      setEamil(email);
      const response = await sendCode({ email: email, action: "reset_password" });
      if (response.message) {
        Toast.success(response.message);
        setOpen(false);
        setOpenSecondModal(true);
      } else {
        Toast.error(response.error || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      Toast.error('An error occurred.');
    }
  };
  const handleTermsClick = (event) => {
    event.preventDefault();
    navigate('/terms');
  };

  const handleCloseAndSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const verification_code = formData.get('vertificatecode');
    const new_password = formData.get('new-password');
    const confirm_password = formData.get('confirm-new-password');

    if (new_password !== confirm_password) {
      Toast.error("New passwords do not match.");
      return;
    }

    try {
      const response = await resetpassword({ new_password, confirm_password, verification_code, email: email, username: username });

      if (response.message) {
        Toast.success("Password has been reset successfully.");
        setOpenSecondModal(false);
      } else {
        Toast.error(response.error || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Toast.error('An error occurred.');
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const backgroundImageStyle = {
    // backgroundImage: `url(${backImage})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    position: 'relative',

  };
  return (
    <Box sx={backgroundImageStyle}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            // ...containerStyle, //、
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{

              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockPersonIcon />
            </Avatar>
            <Typography component='h1' variant='h5'>
              Sign in
            </Typography>
            <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >
              <TextField
                margin='normal'
                required
                fullWidth
                id='username'
                label='username'
                name='username'
                autoComplete='username'
                autoFocus
              />
              <TextField
                margin='normal'
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                autoComplete='current-password'
              />
              <Grid container>
                <Grid item xs>
                  <Link variant="body2" onClick={handleOpen}>
                    Forgot password?
                  </Link>
                </Grid>
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
              </Grid>
              <Button
                type='submit'
                fullWidth
                id='loginBtn'
                variant='contained'
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href='/' variant='body2'>
                    Return to Home
                  </Link>
                </Grid>
                <Grid item xs></Grid>
                <Grid item>
                  <Link href='/register' variant='body2'>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>


          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box
              sx={modalStyle}
              component="form"
              noValidate
              onSubmit={handleSendResetLink}
            >
              <Typography id="modal-title" variant="h6" component="h2">
                Reset Password
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="rusername"
                label="username"
                name="rusername"
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="remail"
                label="Email Address"
                name="remail"
                autoComplete="email"
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send Reset Link
              </Button>
            </Box>
          </Modal>


          <Modal
            open={openSecondModal}
            onClose={() => setOpenSecondModal(false)}
            aria-labelledby="second-modal-title"
            aria-describedby="second-modal-description"
          >
            <Box
              sx={modalStyle}
              component="form"
              noValidate
              onSubmit={handleCloseAndSubmit}
            >
              <Typography id="second-modal-title" variant="h6" component="h2">
                Reset Link Sent
              </Typography>
              <Typography id="second-modal-description" sx={{ mt: 2 }}>
                A password reset link has been sent to your email address.
              </Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                id="verification_code"
                label="Verification Code"
                name="vertificatecode"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="new-password"
                label="New Password"
                type="password"
                id="new-password"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm-new-password"
                label="Confirm New Password"
                type="password"
                id="confirm-new-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Close and Submit
              </Button>
            </Box>
          </Modal>
        </Box>
      </Container>
    </Box>
  );
}
