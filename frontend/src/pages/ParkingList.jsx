import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { rentalList } from '../api/rentalparking';
import { deleteSpace } from '../api/editspace';
import { Toast } from "../components"
import {
  Box, Container, CssBaseline, Typography, Grid
} from '@mui/material';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import '../index.css';
import Link from '@mui/material/Link';


export default function RentalParking() {

  const [list, setList] = useState([]);
  const [spaceId, setSpaceId] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const goToLink = (url) => {
    navigate(url);
  };
  const doAsync = async () => {
    const data = await rentalList();
    const dataArray = Object.values(data);
    setList(dataArray);
  };

  useEffect(() => {
    doAsync();
  }, []);

  const deletePark = async () => {
    const deleteResponse = await deleteSpace(spaceId);
    if (!deleteResponse.error) {
      Toast.success("delete success!");
      setList(list.filter(item => item.id !== spaceId));
      setOpen(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  const editSpace = (row) => {
    navigate(`/auth/edit/parking-space/${row.id}`);
  }

  const columns = [
    {
      field: 'location',
      headerName: 'location',
      width: 350,
      renderCell: (params) => {
        return <span className="boldText">🗺️{params.value}</span>;
      }
    },
    {
      field: 'day_price', headerName: 'Day Price',
      width: 150,
      renderCell: (params) => {
        return <span className="greenText">💲{params.value}</span>;
      }
    },
    {
      field: 'hour_price', headerName: 'Hour Price', width: 150,
      renderCell: (params) => {
        return <span className="greenText">💲{params.value}</span>;
      }
    },
    {
      field: 'rate', headerName: 'Rate', width: 150,
      renderCell: (params) => {
        return <span className="boldText">{params.value}</span>;
      }
    },
    {
      field: 'car_type', headerName: 'Car Type', width: 150,
      renderCell: (params) => {
        return <span className="boldText">🚘{params.value}</span>;
      }
    },
    {
      field: 'income', headerName: 'Income', width: 200,
      renderCell: (params) => {
        return <span className="greenText">💲{params.value}</span>;
      }
    },
    {
      field: "spacer",
      headerName: "",
      flex: 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: ({ row }) => {
        return (
          <>
            <Button color='error' onClick={() => { setOpen(true); setSpaceId(row.id); }}>
              Delete
            </Button>
            <Button color='info' onClick={() => editSpace(row)}>
              Edit
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Delete Confirmation</DialogTitle>
        <DialogContent>
          Are you sure to delete this space?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No, thanks</Button>
          <Button variant='contained' onClick={() => deletePark()} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Rental Parking Management
        </Typography>
      </Box>
      <Grid item xs>
        <Button onClick={() => goToLink('/auth/edit/parking-space/create')} color="primary" variant="contained">
          Create Parking Space
        </Button>
      </Grid>

      <div className='booking-list'>
        {
          <DataGrid
            width="100%"
            rows={list}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 12,
                },
              },
            }}
            pageSizeOptions={[12, 20]}
            getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'evenRow' : 'oddRow')}
            disableRowSelectionOnClick />
        }
      </div>
      {/* <Grid item xs>
        <Link href='/' variant='body2'>
          Return to Home
        </Link>
      </Grid> */}

    </Container >


  );
}
