import request from './index';

export const bookinglist = async () => {
  return request.get('/bookings');
};

export const createBooking = async (id, body) => {
  return request.post(`/bookings/new/${id}`, body);
};

export const reviewlist = async (id) => {
  const reviews = request.get(`/reviews/ReviewViewparking/?parking_space_id=${id}`);
  return reviews;
};