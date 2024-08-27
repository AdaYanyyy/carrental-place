import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { logout } from '../../api/user';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { Divider, Menu, Select, InputLabel } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import userAvatar from '../../material/deer.png';
import lefticon from '../../material/left1.png';




export default function Header(props) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    const token = localStorage.getItem('Authorization');
    return token || null;
  });
  const isLogin = !!token && token !== 'undefined';

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleStorageChange = () => {
    const token = localStorage.getItem('Authorization');
    setToken(token);
  };

  const handleLogout = async () => {
    await logout();
    if (localStorage.getItem('Authorization')) {
      localStorage.removeItem('Authorization');
    }
    if (localStorage.getItem('email')) {
      localStorage.removeItem('email');
    }
    window.dispatchEvent(new Event('storage'));
    goToLink('/');
  };

  const goToLink = (url) => {
    navigate(url);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleMenu2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };



  return (
    <AppBar
      position='fixed'
      color='inherit'
      elevation={0}
      className='header'
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <img
          id="logo-title"
          className="header-title"
          src={lefticon} // Assuming lefticon is your imported image
          alt="CloseAI CarPark Co Logo"
          style={{
            cursor: 'pointer',
            height: '4em', // Adjust based on your design needs
            width: 'auto' // This will maintain the aspect ratio of the image
          }}
          onClick={() => goToLink('/')}
        />
        <Box sx={{ flexGrow: 1 }} />
        <div>
          <IconButton
            size="large"
            aria-label="account of current user 2"
            aria-controls="menu-appbar2"
            aria-haspopup="true"
            onClick={handleMenu2}
            color="inherit"
          >
            <Avatar src={userAvatar} style={{ width: 40, height: 40 }} />
          </IconButton>
          <Menu
            id="menu-appbar2"
            anchorEl={anchorEl2}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl2)}
            onClose={handleClose2}
          >
            <MenuItem onClick={() => goToLink('/customerservice')}>customerservice</MenuItem>
            <MenuItem onClick={() => goToLink('/AdminLogin')}>admin</MenuItem>
          </Menu>

          <IconButton
            size='large'
            aria-label='account of current user'
            aria-controls='menu-appbar'
            aria-haspopup='true'
            onClick={handleMenu}
            color='inherit'
          >
            <AccountCircle style={{ fontSize: '40px' }} />
          </IconButton>
          <>
            <Menu
              id='menu-appbar'
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {isLogin && (
                <div>
                  {localStorage.getItem('email') && (
                    <>
                      <MenuItem onClick={handleClose}>
                        <Avatar />
                        <span className='m-l-10'>
                          {localStorage.getItem('email')}
                        </span>
                      </MenuItem>
                      <MenuItem onClick={() => goToLink("/auth/history")}>My History</MenuItem>
                      <MenuItem onClick={() => goToLink('/auth/parking-list')}>My Spaces</MenuItem>
                      <MenuItem onClick={() => goToLink('/auth/user-coupons')}>My Coupons</MenuItem>
                      <MenuItem onClick={() => goToLink('/auth/user-profile')}>Update Info</MenuItem>
                      <MenuItem onClick={() => goToLink('/auth/user-current-order')}>Current Order</MenuItem>
                      <Divider /></>
                  )}
                  <MenuItem onClick={() => handleLogout()}>Logout</MenuItem>
                </div>
              )}

              {!isLogin && (
                <><MenuItem onClick={() => { handleClose(); goToLink('/login'); }}>Sign In</MenuItem><MenuItem onClick={() => { handleClose(); goToLink('/register'); }}>Sign Up</MenuItem></>
              )}
            </Menu>
          </>


        </div>
      </Toolbar>
    </AppBar>
  );
}
