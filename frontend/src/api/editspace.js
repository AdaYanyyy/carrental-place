import request from "./index";
const spaceInfo = async (id) => {
    return request.get(`/user/parkingSpace/${id}/`);
};

const updateSpace = async (id, body) => {

    return request.patch(`/user/parkingSpace/${id}/`, body);
};

const createSpace = async (body) => {
    return request.post(`/user/parkingSpace/`, body);
};

const deleteSpace = async (id) => {
    return request.delete(`/user/parkingSpace/${id}/`);
};


const timeinfo = (id) => {
    return request.get(`/user/listing/${id}`);
};
export { spaceInfo, updateSpace, createSpace, deleteSpace, timeinfo };