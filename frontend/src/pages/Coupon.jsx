import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  CssBaseline,
  Box
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getCoupons } from "../api/payment";
import '../index.css';

function Coupons() {
  const navigate = useNavigate();


  const [list, setList] = useState([]);

  const doAsync = async () => {
    const listings = await getCoupons();
    setList(listings);
  };

  useEffect(() => {
    doAsync();
  }, []);


  const columns = [
    {
      field: "start_time",
      headerName: "Start time",
      width: 250,
      renderCell: (params) => {
        return <span className="blueText">🕛{params.value}</span>;
      }
    },
    {
      field: "end_time",
      headerName: "End time",
      width: 250,
      renderCell: (params) => {
        return <span className="redText">🕓{params.value}</span>;
      }
    },
    {
      field: "discount", headerName: "Discount rate", width: 200,
      renderCell: (params) => {
        return <span className="greenText">{params.value}</span>;
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
      field: "status", headerName: "Status", width: 250,
      renderCell: (params) => {
        return <span className="boldText">{params.value}</span>;
      }
    },
  ];

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          My Coupons
        </Typography>
      </Box>
      <div className="coupon-list">

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

export default Coupons;