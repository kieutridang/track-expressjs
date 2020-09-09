const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Unauthorized } = require("../utils/errors");

const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    next(new Unauthorized("Require token !"));
  }

  const token = authorization.split("Bearer ")[1];
  jwt.verify(token, "SECRET-KEY", async (err, payload) => {
    try {
      if (err) {
        throw new Unauthorized("Invalid token !");
      }

      const { userId } = payload;
      const user = await User.findById(userId);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });
};
