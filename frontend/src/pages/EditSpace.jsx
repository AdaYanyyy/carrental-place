import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Grid,
  MenuItem,
  TextField,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createSpace, spaceInfo, updateSpace } from '../api/editspace';
import { Toast } from '../components';

const Input = styled('input')({
  display: 'none',
});

const _DefaultData = {
  location: '',
  address: '',
  state: '',
  postcode: '',
  day_price: '',
  hour_price: '',
  car_type: 'CAR',
}
const TYPES = [
  {
    value: 'CAR',
    label: 'CAR',
  },
  {
    value: 'SUV',
    label: 'SUV',
  },
  {
    value: 'MPV',
    label: 'MPV',
  }
];

export default function EditSpace() {
  const [propertyImages, setPropertyImages] = useState([]);
  const [formData, setFormData] = useState(_DefaultData);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    const doAsync = async () => {
      const spaceDetail = await spaceInfo(id);
      setFormData({
        ...spaceDetail,
        address: spaceDetail.location.split(',')[0] || '',
        state: spaceDetail.location.split(',')[1] || '',
        postcode: spaceDetail.location.split(',')[2] || ''
      });

      setPropertyImages([spaceDetail.img_path]);
    };
    if (id !== 'create') {
      doAsync();
    }
    else {

    }
  }, [id]);

  const goToLink = (url) => {
    navigate(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formJson = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );
    const { address, state, postcode, description, day_price, hour_price, car_type } = formJson
    console.log('description:', description);
    if (id === 'create') {
      const res = await createSpace({
        location: address + ',' + state + ',' + postcode,
        day_price,
        hour_price,
        car_type,
        description,
        img_path: propertyImages[0]
      });
      if (!res.error) {
        Toast.success('create success!!');
        goToLink('/auth/parking-list');
      }
    } else {
      const res = await updateSpace(id, {
        location: address + ',' + state + ',' + postcode,
        day_price,
        hour_price,
        car_type,
        description,
        img_path: propertyImages[0]
      });
      if (!res.error) {
        Toast.success('edit success!!');
      }
    }
  };

  const fileToDataURL = (file) => {
    const reader = new FileReader();
    return new Promise(function (resolve) {
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const onImagesChange = async (e) => {
    const images = await Promise.all([...e.target.files].map(fileToDataURL));
    const obj = {};
    images.forEach((image, index) => {
      obj[index] = image;
    });
    setPropertyImages(images);
  };


  const delteImage = (index) => {
    const _images = propertyImages
      .slice(0, index)
      .concat(propertyImages.slice(index + 1));
    setPropertyImages(_images);
  };


  return (
    <Container component='main' maxWidth='md'>
      <CssBaseline />
      <Typography component='h1' variant='h5'>
        <p className='m-b-20'>
          {id === 'create' ? 'Create Space' : `Edit Space(${id})`}
        </p>
      </Typography>

      <Box component='form' onSubmit={handleSubmit}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {(
            <Grid item xs={12}>
              <Typography gutterBottom>List of space images</Typography>
              <div>
                <label htmlFor='contained-button-images'>
                  <Input
                    accept='image/*'
                    id='contained-button-images'
                    multiple
                    type='file'
                    onChange={onImagesChange}
                  />
                  <Button variant='outlined' component='span'>
                    Upload property images
                    <PhotoCamera />
                  </Button>
                </label>
              </div>

              {propertyImages.map((item, index) => (
                <div className='image-box' key={index}>
                  <div className='del-box'>
                    <Button
                      color='error'
                      variant='contained'
                      onClick={() => delteImage(index)}
                    >
                      Delete
                    </Button>
                  </div>
                  <img
                    key={index}
                    className='space-images'
                    width={200}
                    height={200}
                    src={item}
                  />
                </div>
              ))}
            </Grid>
          )}
          <Grid item xs={6}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='address'
              label='address'
              name='address'
              variant='outlined'
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              value={formData.address}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='state'
              label='state'
              name='state'
              variant='outlined'
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              value={formData.state}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='postcode'
              label='postcode'
              name='postcode'
              variant='outlined'
              onChange={(e) =>
                setFormData({ ...formData, postcode: e.target.value })
              }
              value={formData.postcode}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin='normal'
              type='number'
              required
              fullWidth
              name='day_price'
              label='day price'
              variant='outlined'
              value={formData.day_price || ''}
              onChange={(e) =>
                setFormData({ ...formData, day_price: e.target.value })
              }
              id='day_price'
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              name='car_type'
              required
              id='car_type'
              fullWidth
              select
              label='Select Car Type'
              value={formData.car_type || ''}
              onChange={(e) => {

                setFormData({
                  ...formData,
                  car_type: e.target.value,
                });
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
              type='number'
              required
              fullWidth
              name='hour_price'
              label='hour price'
              variant='outlined'
              value={formData.hour_price || ''}
              onChange={(e) =>
                setFormData({ ...formData, hour_price: e.target.value })
              }
              id='hour_price'
            />
          </Grid>

        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='description'
            label='description'
            name='description'
            variant='outlined'
            multiline
            rows={3}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            value={formData.description || ''}
          />
        </Grid>

        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            {id === 'create'
              ? (
                <Button
                  id='createRoomBtn'
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, mb: 2 }}
                >
                  Create
                </Button>
              )
              : (
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, mb: 2 }}
                >
                  Update
                </Button>
              )}
          </Grid>
          <Grid item xs={6}>
            <Button
              variant='outlined'
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={() => goToLink('/auth/parking-list')}
            >
              Back to Rent Out Space
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
