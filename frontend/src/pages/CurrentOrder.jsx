import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Container,
  CssBaseline,
  Box
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listCurrentOrder } from "../api/history";
import { cancelOrder } from '../api/payment';
import '../index.css';


function CurrentOrder() {
  const navigate = useNavigate();

  const goToLink = (url) => {
    navigate(url);
  };
  const [orderId, setOrderId] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  const doAsync = async () => {
    const listings = await listCurrentOrder();
    setList(listings);
  };

  useEffect(() => {
    doAsync();
  }, []);

  const handleClickOpen = (row) => {
    setOrderId(row.id);
    setOpen(true);
  };

  const cancelSpace = async () => {
    if (!cancelOrder.error) {
      setOpen(false);
      setList(list.filter(item => item.id !== orderId));
    }

  }

  const handleClose = () => {
    setOpen(false);
  };

  const isOrderStarted = (startTime) => {

    const now = new Date();
    const startTimeDate = new Date(startTime);
    return now <= startTimeDate;
  };

  const columns = [
    {
      field: "start_time",
      headerName: "Start time",
      width: 200,
      renderCell: (params) => {
        return <span className="blueText">🕛{params.value}</span>;
      }
    },
    {
      field: "end_time",
      headerName: "End time",
      width: 200,
      renderCell: (params) => {
        return <span className="redText">🕓{params.value}</span>;
      }
    },
    {
      field: "car_code", headerName: "Plate number", width: 200,
      renderCell: (params) => {
        return <span className="blodText">🚗{params.value}</span>;
      }
    },
    {
      field: "car_type", headerName: "Car type", width: 150,
      renderCell: (params) => {
        return <span className="boldText">🚘{params.value}</span>;
      }
    },
    {
      field: "income", headerName: "Paid", width: 200,
      renderCell: (params) => {
        return <span className="greenText">💲{params.value}</span>;
      }
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        let className = "statusBooked";
        if (params.value === "Cancelled") {
          className = "statusCancelled";
        } else if (params.value === "Completed") {
          className = "statusCompleted";
        }
        return <span className={className}>{params.value}</span>;
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
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: ({ row }) => {
        const orderStarted = isOrderStarted(row.start_time);
        return (
          <>
            {orderStarted && < Button color="info" onClick={() => handleClickOpen(row)
            }>
              Refund
            </Button >}
            <Button color="info" onClick={() => goToLink(`/auth/booking/parking-space/${row.parking_space}`)}>
              View Space
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />

      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Current Order
        </Typography>
      </Box>
      <div className="booking-list">
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>Refund Confirmation</DialogTitle>
          <DialogContent>
            Are you sure to cancel this booked space?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>No, thanks</Button>
            <Button variant='contained' onClick={() => cancelSpace()} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>


        <DataGrid
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
      </div>
    </Container>
  );
}

export default CurrentOrder;