import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CssBaseline,
  Typography,
  Grid,
  CircularProgress,
  Button,
  InputLabel,
  Slider,
  MenuItem,
  Pagination,
  Select,
  TextField
} from "@mui/material";
import { SpaceCard } from "../components";
import { useNavigate } from "react-router-dom";
import { listing } from "../api/public";

const _DefaultSearch = {
  maxPrice: 50,
  minPrice: 1,
  remarkOrder: 0,
};

const selectOption = [
  {
    value: 'day',
    label: 'DAY PRICE',
  },
  {
    value: 'hour',
    label: 'HOUR PRICE',
  }
];


export default function Listing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchParam, setSearchParam] = useState(_DefaultSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);


  useEffect(() => {
    const doAsync = async () => {
      try {
        setLoading(true);
        setList([]);
        const data = await listing();
        setList(data);
        setFilteredList(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    doAsync();
  }, []);

  const handleClear = () => {
    setSearchParam(_DefaultSearch);
    setCurrentPage(1);
    setFilteredList(list);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    const { maxPrice, minPrice, remarkOrder } = searchParam;
    const priceKey = searchParam.option === 'day' ? 'day_price' : 'hour_price';
    let _list = searchParam.option ?
      list.filter(item => item[priceKey] >= minPrice && item[priceKey] <= maxPrice)
      : list;

    _list = _list.sort((a, b) =>
      remarkOrder === 0 ? a.rate - b.rate : b.rate - a.rate
    );
    if (searchParam.searchKeyWord)
      _list = list.filter(
        (item) => item.location.includes(searchParam.searchKeyWord)
      );

    setFilteredList(_list);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToLink = (url) => {
    navigate(url);
  };
  return (
    <>
      <Container component="header" maxWidth="lg">
        <Box sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <Typography component="h1" variant="h5">
            Find Your Parking Space
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={submitSearch}
          noValidate
          sx={{ mt: 4 }}
        >

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={2}>
              <InputLabel id="remark-label">Price option</InputLabel>
              <TextField
                id="outlined-select-price-option"
                select
                label="Select"
                defaultValue=""
                helperText="         "
                onChange={(e) =>
                  setSearchParam({ ...searchParam, option: e.target.value })
                }
                sx={{ mb: 2, width: '100%' }}
              >
                {selectOption.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

            </Grid>
            <Grid item xs={12} sm={1}>
              <InputLabel id="min-price">min price</InputLabel>
              <Slider
                name="minPrice"
                labelid="min-price"
                defaultValue={_DefaultSearch.minPrice}
                step={1}
                marks
                min={0}
                max={50}
                valueLabelDisplay="auto"
                value={searchParam.minPrice}
                onChange={(e, newValue) =>
                  setSearchParam({ ...searchParam, minPrice: newValue })
                }
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <InputLabel id="max-price">max price</InputLabel>
              <Slider
                name="maxPrice"
                labelid="max-price"
                defaultValue={_DefaultSearch.maxPrice}
                step={1}
                marks
                min={50}
                max={100}
                valueLabelDisplay="auto"
                value={searchParam.maxPrice}
                onChange={(e, newValue) =>
                  setSearchParam({ ...searchParam, maxPrice: newValue })
                }
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <InputLabel id="remark-label">Remark class</InputLabel>
              <Select
                name="remarkOrder"
                defaultValue={_DefaultSearch.remarkOrder}
                value={searchParam.remarkOrder}
                onChange={e => {
                  setSearchParam({ ...searchParam, remarkOrder: e.target.value })
                }
                }
                labelid="remark-label"
                id="remark-select"
                label="remark class"
                sx={{ mb: 2, width: '100%' }}
              >
                <MenuItem value={0}>Low to High</MenuItem>
                <MenuItem value={1}>High to Low</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                id="search-bar"
                label="search by location"
                variant="standard"
                sx={{ mb: 2, width: '100%' }}
                onChange={e => {
                  setSearchParam({ ...searchParam, searchKeyWord: e.target.value })
                }
                } />

            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <Button
                  className="m-r-20"
                  sx={{ mt: 3, mb: 2 }}
                  type="submit"
                  variant="contained"
                >
                  Search
                </Button>
                <Button
                  sx={{ mt: 3, mb: 2 }}
                  variant="outlined"
                  onClick={() => handleClear()}
                >
                  Clear
                </Button>
              </Box>

            </Grid>
          </Grid>
        </Box>

      </Container>
      <Container component="main" maxWidth="xl">
        <CssBaseline />

        <div className="home outlet">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 6, sm: 9, md: 12, lg: 12 }}
            >
              {currentItems.map((item, index) => (
                <Grid
                  item
                  xs={3}
                  sm={3}
                  md={3}
                  lg={3}
                  key={index}
                  onClick={() =>
                    goToLink(`/auth/booking/parking-space/${item.id}`)
                  }
                >
                  <SpaceCard
                    item={item}
                    image={item.img_path || "default-image-url.jpg"}
                  ></SpaceCard>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      </Container >
    </>


  );
}