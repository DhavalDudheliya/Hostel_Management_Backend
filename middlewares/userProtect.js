const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protectUser = async (req, res, next, role) => {
  try {
    const _token = req.cookies._token;
    // console.log(req.cookies);
    if (!_token) {
      return res.status(401).json({ message: "Token does not exists" });
    }
    const verifiedUser = jwt.verify(_token, process.env.JWT_SECRET);

    root_user = await User.findOne({
      _id: verifiedUser._id,
      
    });

    if (role === undefined) {
      // Open for all 3
      req.user = root_user;

      // // Set the secure cookie here
      // res.cookie("_token", _token, { secure: true, sameSite: "None" });

      next();
    } else if (role && root_user.role === role) {
      // Open for specific
      req.user = root_user;

      // Set the secure cookie here
      // res.cookie("_token", _token, { secure: true, sameSite: "None" });

      next();
    } else if (
      role == "Both" &&
      (root_user.role === "Manager" ||
        root_user.role === "Accountant" ||
        root_user.role === "Admin")
    ) {
      // Open for both Manager and Accountant
      req.user = root_user;

      // Set the secure cookie here
      // res.cookie("_token", _token, { secure: true, sameSite: "None" });

      next();
    } else {
      // Else
      // Open for all will not have any protection
      res.status(401).json({ message: "Authorization failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Authorization failed" });
  }
};

module.exports = { protectUser };
