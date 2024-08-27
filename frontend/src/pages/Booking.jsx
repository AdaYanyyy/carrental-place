import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import {
    Grid,
    Divider,
    Container,
    Rating,
    Button,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItemText
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useParams } from 'react-router-dom';
import { spaceInfo, timeinfo } from '../api/editspace';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { reviewlist } from '../api/booking';
import StarIcon from '@mui/icons-material/Star';
import { Toast } from '../components';
import { defaultImage } from '../image';
import PaymentModal from './payment';
import { getCoupons } from '../api/payment';

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function SpaceDetail() {
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [orderDetails, setOrderDetails] = useState({
    });
    const [spaceDetail, setSpaceDetail] = useState({
        description: "This is a car park",
        location: "Roseville",
        img_path: [],
        day_price: 100,
        hour_price: 25,
        rate: 4,
        car_type: "CAR",
        start_time: null,
        end_time: null
    });
    const [reviews, setReviews] = useState([])
    const [dateRange, setDateRange] = useState({});
    const { id } = useParams();
    const [bookedOrders, setBookedOrders] = useState([]);


    const handleClosePayment = () => {
        setPaymentOpen(false);
    };

    const doAsyn = async () => {
        let timeDetails = await timeinfo(id);
        console.log(timeDetails);
        setBookedOrders(timeDetails.booked_order);
    }
    const doAsync = async () => {
        let spaceDetails = await spaceInfo(id);
        if (spaceDetails.img_path) {
            spaceDetails.img_path = spaceDetails.img_path.startsWith("data:image/") ? [spaceDetails.img_path] : [defaultImage]
        } else {
            spaceDetails.img_path = [defaultImage];
        }

        setSpaceDetail(spaceDetails);
        const data = { parking_space_id: Number(id) };
        const spaceReviews = await reviewlist(id);
        if (!spaceReviews.error) {
            setReviews(spaceReviews);
        }

    };
    useEffect(() => {
        doAsyn();
        doAsync();
        const fetchCoupons = async () => {
            try {
                const couponsData = await getCoupons();
                setCoupons(couponsData);
            } catch (error) {
                console.error('Error fetching coupons:', error);
            }
        };
        fetchCoupons();
        if (dateRange.start) {
            const minDateForCheckout = dayjs(dateRange.start).add(2, 'hour').format('YYYY-MM-DD HH:mm');
        }
    }, [id, dateRange.start]);

    const checkDateValid = (date) => {
        const isBeforeToday = dayjs(date).isBefore(dayjs(), 'day');
        const isInBookedPeriod = bookedOrders.some(order =>
            dayjs(date).isAfter(dayjs(order.start_time)) && dayjs(date).isBefore(dayjs(order.end_time))
        );
        return isBeforeToday || isInBookedPeriod;
    };

    const bookSpace = async () => {
        setOpen(false);
        const start = dayjs(dateRange.start);
        const end = dayjs(dateRange.end);
        const diffInHours = end.diff(start, 'hour');
        const price = (diffInHours % 24) * spaceDetail.hour_price + Math.floor(diffInHours / 24) * spaceDetail.day_price;

        const orderDetails = {
            spaceId: id,
            startTime: dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
            endTime: dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
            targetStart: dayjs(start).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            targetEnd: dayjs(end).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            totalPrice: price
        };

        const activeCoupons = coupons.filter(coupon => {
            const startTime = new Date(coupon.start_time);
            const endTime = new Date(coupon.end_time);
            return startTime <= new Date(orderDetails.targetStart) && new Date(orderDetails.targetEnd) <= endTime && coupon.status === 'unused';
        });
        setActiveCoupons(activeCoupons)
        setOrderDetails(orderDetails);
        setPaymentOpen(true);
    };

    const handleClickOpen = () => {
        if (!dateRange.start && !dateRange.end) {
            Toast.warning('please choose date range');
        } else {
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const checkDateValidx = (date) => {
        const isBeforeToday = dayjs(date).isBefore(dayjs(), 'day');
        const nextStartTime = bookedOrders.reduce((nextStart, order) => {
            const start = dayjs(order.start_time);
            return start.isAfter(dayjs(dateRange.start), 'day') && (!nextStart || start.isBefore(nextStart)) ? start : nextStart;
        }, null);
        if (!nextStartTime) return isBeforeToday;
        const isInRange = dayjs(date).isSameOrAfter(dayjs(dateRange.start), 'day') && dayjs(date).isBefore(nextStartTime, 'day');
        return isBeforeToday || !isInRange;
    };


    return (
        <Container maxWidth='lg' style={{ marginTop: '30px' }}>
            <CssBaseline />
            <Typography
                variant='h4'
                gutterBottom
                component="div"
                sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    textAlign: 'center'
                }}
            >
                {spaceDetail.location}
            </Typography>

            {spaceDetail.img_path &&
                spaceDetail.img_path.map((img, index) => (
                    <img src={img} alt={`Space ${index}`} key={index} style={{ width: '100%', maxHeight: '700px', objectFit: 'cover' }}
                    />
                ))}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>Reserve</DialogTitle>
                <DialogContent>
                    Are you sure to reserve this space from {dateRange.start} to{' '}
                    {dateRange.end}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>No, thanks</Button>
                    <Button variant='contained' onClick={bookSpace} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={2}>
                <Grid item xs={7} sm={7}>
                    {spaceDetail && (
                        <div>
                            <Typography variant='h5' gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Description:
                            </Typography>
                            <Typography variant='h6' color='inherit' paragraph>
                                {spaceDetail.description}
                            </Typography>

                            <Divider />
                            <Typography variant='h5' gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Location:
                            </Typography>
                            <Typography variant='h6' color='inherit' paragraph>
                                {spaceDetail.location}
                            </Typography>
                            <Divider />

                            <Divider />

                        </div>
                    )}
                </Grid>
                <Grid item xs={5} sm={5}>
                    <Box className='reserve-box'>
                        <Typography variant='h5' gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Price:
                        </Typography>
                        <Typography variant='h6' color='inherit' paragraph>
                            ${spaceDetail.day_price} AUD Per Day
                        </Typography>
                        <Typography variant='h6' color='inherit' paragraph>
                            ${spaceDetail.hour_price} AUD Per Hour
                        </Typography>
                        <Divider />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DateTimePicker']}>
                                <DateTimePicker
                                    name='checkIn'
                                    label='check in'
                                    minDateTime={dayjs()}
                                    onChange={(value) =>
                                        setDateRange({
                                            ...dateRange,
                                            start: dayjs(value).format('YYYY-MM-DD HH:mm'),
                                        })
                                    }
                                    shouldDisableDate={checkDateValid}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DateTimePicker']}>
                                <DateTimePicker
                                    name='checkOut'
                                    label='check out'
                                    minDateTime={dateRange.start ? dayjs(dateRange.start).add(2, 'hour') : undefined}
                                    onChange={(value) =>
                                        setDateRange({
                                            ...dateRange,
                                            end: dayjs(value).format('YYYY-MM-DD HH:mm'),
                                        })
                                    }
                                    //shouldDisableDate={checkDateValid}
                                    shouldDisableDate={checkDateValidx}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <Divider />
                        <Button
                            className='m-t-20'
                            variant='contained'
                            fullWidth
                            onClick={() => handleClickOpen()}
                        >
                            Reserve
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Grid item xs={5} sm={5}>
                <Typography variant='h5' gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Reviews
                </Typography>
                <List>
                    {reviews &&
                        reviews.map((item, index) => (
                            <ListItem key={index} divider disablePadding>
                                <ListItemIcon>
                                    <AccountCircle />
                                </ListItemIcon>
                                <ListItemText
                                    secondary={<span className='wrap'>{item.comment}</span>}
                                    primary={
                                        <Rating
                                            size='small'
                                            value={item.rating || 0}
                                            precision={0.5}
                                            readOnly
                                            emptyIcon={
                                                <StarIcon
                                                    style={{ opacity: 0.55 }}
                                                    fontSize='inherit'
                                                />
                                            }
                                        />
                                    }
                                />
                            </ListItem>
                        ))}
                </List>
            </Grid>
            <div>
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={handleClosePayment}
                    orderDetails={orderDetails}
                    coupons={activeCoupons} />
            </div>
        </Container>
    );
}
