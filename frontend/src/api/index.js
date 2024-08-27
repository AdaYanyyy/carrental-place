import axios from 'axios';
import { Toast } from '../components';
const request = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});


request.interceptors.request.use(
  (config) => {
    // 注意：这里是'Content-Type'而不是setContentType
    config.headers['Content-Type'] = 'application/json';
    if (localStorage.getItem('Authorization')) {
      const token = localStorage.getItem('Authorization');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    console.warn(err);
    return Promise.reject(err);
  }
);

request.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    const {
      response: { data },
    } = err;
    if (data.error === 'No reviews found for this parking space.') {
      return Promise.resolve([]);
    }
    console.log(err);
    if (data.error) {
      Toast.error(data.error, 3000);
    }
    return data;
  }
);

export default request;
