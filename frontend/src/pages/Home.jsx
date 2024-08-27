import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import backgroundImage from '../material/car1.png';
import Image1 from '../material/1.png';
import Image2 from '../material/2.png';
import Image3 from '../material/3.png';
import Image4 from '../material/4.png';
import Image5 from '../material/5.png';
import Image6 from '../material/6.png';
import Image7 from '../material/7.png';
import Image8 from '../material/8.png';
import Image9 from '../material/9.png';
import Image10 from '../material/10.png';

import { Box, Button, Dialog, Typography, DialogTitle, DialogContent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import GarageIcon from '@mui/icons-material/Garage';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TextField from '@mui/material/TextField';
import { readmeemail, getrecommend, getrerate } from '../api/user';
import { Toast } from '../components';
import { listHistoryOrder } from "../api/history";
import { SpaceCard } from "../components";
import Link from '@mui/material/Link';
import Carousel from 'react-material-ui-carousel';
function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendationTitle, setRecommendationTitle] = useState('');
  const [recommendedList, setRecommendedList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [token, setToken] = useState(() => {
    const token = localStorage.getItem('Authorization');
    return token || null;
  });
  const images = [
    { imgPath: Image1, label: 'Image 1' },
    { imgPath: Image2, label: 'Image 2' },
    { imgPath: Image3, label: 'Image 3' },
    { imgPath: Image4, label: 'Image 4' },
    { imgPath: Image5, label: 'Image 5' },
    { imgPath: Image6, label: 'Image 6' },
    { imgPath: Image7, label: 'Image 7' },
    { imgPath: Image8, label: 'Image 8' },
    { imgPath: Image9, label: 'Image 9' },
    { imgPath: Image10, label: 'Image 10' }
  ];
  const isLogin = !!token && token !== 'undefined';


  const [email, setEmail] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSendClick = async () => {
    const emailData = {
      email: email
    };

    console.log(emailData);

    try {
      const response = await readmeemail(emailData);
      if (response.message) {
        setEmail('');
        Toast.success(response.message);
      } else {
        Toast.error(response.error || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      Toast.error('An error occurred.');
    }
  };

  const getreinfo = async () => {

    try {
      const response = await getrecommend();
      if (response) {
        console.log(response);
        setRecommendedList(response);
      } else {
        Toast.error(response.error || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      Toast.error('An error occurred.');
    }
  };
  const getreinforate = async () => {

    try {
      const response = await getrerate();
      if (response) {
        console.log(response);
        setRecommendedList(response);
      } else {
        Toast.error(response.error || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      Toast.error('An error occurred.');
    }
  };


  const goToLink = (url) => {
    navigate(url);
  };

  const iconsData = [
    {
      IconComponent: AccessTimeIcon,
      title: "Scheduled Time",
      description: "View and manage your bookings",
    },
    {
      IconComponent: AutoDeleteIcon,
      title: "Auto Delete",
      description: "Automatically clean up expired reservations",
    },
    {
      IconComponent: GarageIcon,
      title: "Garage",
      description: "Manage your garage information",
    },
  ];

  const doAsync = async () => {
    try {
      setLoading(true);
      const listings = await listHistoryOrder();
      console.log('listing:', listings);

      if (isLogin && listings && listings.length > 0) {
        await getreinfo();
        setRecommendationTitle("Recommended Based on Order History");
      } else {
        await getreinforate();
        setRecommendationTitle("Recommended Based on Ratings");
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    doAsync();
  }, [isLogin]);



  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  return (
    <div className="layout">

      <Box
        sx={{
          height: '95vh',
          width: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >

        <Box
          sx={{
            position: 'absolute',
            top: '85%',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <Box sx={{ width: { xs: '150px', sm: '200px', md: '250px' } }}>
            <Button
              variant="contained"
              sx={{
                width: '100%',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                padding: { xs: '6px 12px', sm: '8px 24px', md: '10px 36px' },
                backgroundColor: '#333333',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#555555',
                },
              }}
              onClick={() => goToLink('/listing')}
            >
              get started
            </Button>
          </Box>
          <Box sx={{ width: { xs: '150px', sm: '200px', md: '250px' } }}>
            <Button
              onClick={handleOpenModal}
              variant="outlined"
              sx={{
                width: '100%',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                padding: { xs: '6px 12px', sm: '8px 24px', md: '10px 36px' },
                color: '#FFFFFF',
                borderColor: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#FFFFFF',
                },
              }}
            >
              About us
            </Button>

            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="xl">
              <DialogTitle sx={{ textAlign: 'center' }}>{"About Us"}</DialogTitle>
              <DialogContent>
                <Carousel>
                  {images.map((item, i) => (
                    <Box key={i} sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 750,
                      width: '100%'
                    }}>
                      <img src={item.imgPath} alt={item.label} style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        height: 'auto',
                        width: 'auto'
                      }} />
                    </Box>
                  ))}
                </Carousel>
              </DialogContent>
            </Dialog>

          </Box>
        </Box>


      </Box>
      <Box sx={{ height: '70vh', width: '100%', padding: 3, marginTop: 5, marginBottom: 20 }}>
        <Typography variant="h3" sx={{
          marginBottom: 10,
          textAlign: 'center',
          color: 'primary.main',

        }}>
          {recommendationTitle}
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (

          <Grid container spacing={3}>

            {recommendedList.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} onClick={() =>
                goToLink(`/auth/booking/parking-space/${item.id}`)
              }>
                <SpaceCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box
        sx={{
          height: '45vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 0px',
        }}
      >
        {iconsData.map((data, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '12px',
            }}
          >

            <Box sx={{ marginRight: 2 }}>
              <data.IconComponent sx={{ fontSize: 80 }} />
            </Box>


            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1 }}>{data.title}</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>{data.description}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          height: '50vh',
          width: '100%',

          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex',
          padding: '0 0px',
        }}
      >
        <Card sx={{ width: '50%' }}>
          <CardContent>
            <Typography sx={{ fontSize: 16, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
              Quick Response, Easy Consultation
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Parking Space Rental Support Center
            </Typography>
            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom >
              Welcome to our Parking Space Rental Help Center. Quickly find solutions to your rental queries with our FAQ, or get personalized assistance by consulting our administrators. We're dedicated to making your rental experience seamless and stress-free.
            </Typography>
          </CardContent>
          <CardActions>
            <Link href='/customerservice' variant='body2'>
              learn more
            </Link>
          </CardActions>
        </Card>


        <Card sx={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <CardContent sx={{ mb: 2 }}>
            <ReceiptIcon sx={{ fontSize: 45 }} />
            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
              Sending email for more information about us!
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Discover Our Service!
            </Typography>
            <TextField
              label="Enter your email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={handleEmailChange}
            />
            <Button size="large" onClick={handleSendClick}>Send</Button>
          </CardContent>
          <CardActions>

          </CardActions>
        </Card>

      </Box>
      <Box
        sx={{
          height: '30vh',
          width: '100%',

        }}
      >
      </Box>
    </div>
  );
}

export default Home;