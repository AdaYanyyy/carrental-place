import request from "./index";

const listHistoryOrder = async () => {
  return request.get("/user/userHistoryOrder/");
};

const listCurrentOrder = async () => {
  return request.get("/user/userCurrentOrder/");
};

const postReview = async (body) => {
  console.log('body', body)
  return request.post("/reviews/create-review/", body);
};

const getReview = async (body) => {
  return request.get("/reviews/create-review/", body);
};

export { listHistoryOrder, listCurrentOrder, postReview };