import request from './index';



const payOrder = async (body) => {
    return request.post(`/user/payment/`, body);
};

const cancelOrder = async (id) => {
    return request.post(`/user/cancelOrder/${id}/`);
};

const getCoupons = async () => {
    return request.get(`/user/payment/`);
};

export { payOrder, cancelOrder, getCoupons }