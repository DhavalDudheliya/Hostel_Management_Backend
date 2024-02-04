// const instance = require("../config/server");

// const checkout = async (req, res) => {
//   const amount = req.body.amount;
//   // console.log(amount);

//   const options = {
//     amount: Number(amount * 100), // amount in the smallest currency unit
//     currency: "INR",
//   };
//   const order = await instance.orders.create(options);

//   // console.log(order);

//   return res.status(200).json({
//     success: true,
//     order,
//   });
// };

// const paymentVerification = async (req, res) => {
//   console.log(req.body);

//   res.status(200).json({
//     success: true,
//   });
// };

// module.exports = {
//   checkout,
//   paymentVerification,
// };
