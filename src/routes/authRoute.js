const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { BadRequest, NotFound, Unauthorized } = require("../utils/errors");

const router = express.Router();

const User = mongoose.model("User");

router.post("/signup", (req, res, next) => {
  console.log("req.body :>> ", req.body);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new BadRequest("Missing email or password");
    }
    const user = new User({ email, password });
    user
      .save()
      .then((doc) => {
        console.log(doc);
        const token = jwt.sign({ userId: user._id }, "SECRET-KEY");
        res.send({ token });
      })
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new BadRequest("Missing email or password");
    }

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      throw new NotFound("Email not found");
    }

    const passwordResult = await foundUser.comparePassword(password);
    if (passwordResult) {
      const token = jwt.sign({ userId: foundUser._id }, "SECRET-KEY");
      res.send({ token });
    } else {
      throw new Unauthorized("Wrong email or password");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
