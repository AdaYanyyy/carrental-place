import request from "./index";

const register = async (data) => {
  return request.post("/auth/api/register/", data);
};

const sendCode = async (data) => {
  return request.post("/auth/api/verify/", data);
};

const login = async (data) => {
  return request.post("/auth/api/login/", data);
};

const userInfo = async () => {
  const data = await request.get(`/user/profile/`)
  const { username, phone, email, carCode, carType } = data
  return {
    ...data,
    mobilePhone: phone,
    plateNumber: carCode
  }
};
// const updateUserInfo = async (id, data)
const updateUserInfo = async (data) => {
  return request.put(`/user/profile/`, data)

  // return Promise.resolve({ status: 200 });
};
const logout = async () => {
  console.log("proceed logout operation!");
  // return request.post("/user/api/logout/");
};

const resetpassword = async (data) => {
  console.log('data:', data);
  console.log("email send!");
  const res = request.post("/auth/api/reset_password/", data);
  console.log('res:', res);
  return res;
};

// const submitreset = async (data) => {
//   console.log("reset password successfully!");
//   return request.put("/auth/api/reset_password/", data);
// };

const readmeemail = async (data) => {
  console.log("email sending!");
  return request.post("/auth/api/ReadmeView/", data);
};


const sendreview = async (data) => {
  console.log("question sending!");
  return request.post("/serviceuser/inquiries/", data);
};

const getsinglereview = async (data) => {
  console.log("inquiry sending!");
  return request.get("/serviceuser/inquiries/", data);
};


const adminLogin = async (data) => {
  return request.post("/adminparking/loginauth/", data);
};
const getadminusers = async (data) => {
  return request.get("/adminparking/accounts/", data);
};
const adminaddusers = async (data) => {
  return request.post("/adminparking/accounts/", data);
};


const admingethelp = async (data) => {
  return request.get("/adminparking/AllInquiriesView", data);
};


const getadminparking = async (data) => {
  return request.get("/adminparking/parking-spaces/", data);
};


const getadminorders = async (data) => {
  return request.get("/adminparking/orders/", data);
};
const getrecommend = async (data) => {
  return request.get("/recommendation/ UserOrdersRecommendView/", data);
};

const getrerate = async (data) => {
  return request.get("/recommendation/api/top-rated-parkings/", data);
};


export {
  login,
  register,
  logout,
  userInfo,
  updateUserInfo,
  resetpassword,
  readmeemail,
  sendreview,
  getsinglereview,
  adminLogin,
  getadminusers,
  adminaddusers,
  admingethelp,
  getadminparking,
  getadminorders,
  sendCode,
  getrecommend,
  getrerate,
};
