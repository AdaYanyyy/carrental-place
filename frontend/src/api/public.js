import request from "./index";

const listing = async () => {
  const data = request.get("/user/listing/");
  return data
  // return Promise.resolve({
  //   listings: [
  //     {
  //       id: "111",
  //       Location: "aaaaa aaa aa",
  //       img_path: "",
  //       day_price: 200,
  //     },
  //     {
  //       id: "111",
  //       Location: "aaaaa aaa aa",
  //       img_path: "",
  //       day_price: 200,
  //     },
  //   ],
  // });
};

export { listing };