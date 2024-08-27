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
import { listHistoryOrder } from "../api/history";
import { ReviewForm, Toast } from "../components";
import { postReview } from "../api/history";
import '../index.css';

function HistoryOrder() {
  const navigate = useNavigate();
  const goToLink = (url) => {
    navigate(url);
  };
  const [orderId, setOrderId] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  const doAsync = async () => {
    const listings = await listHistoryOrder();
    setList(listings);
  };

  useEffect(() => {
    doAsync();
  }, []);

  const handleClickOpen = (row) => {
    setOrderId(row.id);
    setOpen(true);
  };

  const confirmReview = async (data) => {
    const res = await postReview(data);

    if (!res.error) {
      Toast.success("comment success!");
    }
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
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
        return <span className="boldText">🚗{params.value}</span>;
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
      align: 'left',
      headerAlign: 'left',
      renderCell: ({ row }) => {
        return (
          <>
            <Button color="info" onClick={() => handleClickOpen(row)}>
              review order
            </Button>
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
          Order History
        </Typography>
      </Box>
      <div className="booking-list">
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Review</DialogTitle>
          <DialogContent>
            <Typography variant="h6" color="inherit" paragraph>
              Leave up your Review
            </Typography>
            <ReviewForm
              submitReview={(review) => {
                const { rate, comment } = review;
                confirmReview({ order_id: orderId, rating: rate, comment });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>
              Close
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

export default HistoryOrder;