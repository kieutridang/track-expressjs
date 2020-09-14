const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const appleSigninAuth = require("apple-signin-auth");
const crypto = require("crypto");
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
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_TOKEN
        );
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
      const token = jwt.sign(
        { userId: foundUser._id },
        process.env.JWT_SECRET_TOKEN
      );
      res.send({ token });
    } else {
      throw new Unauthorized("Wrong email or password");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/apple", async (req, res, next) => {
  try {
    const { appleId, nonce } = req.body;
    appleIdTokenClaims = await appleSigninAuth.verifyIdToken(appleId, {
      /** sha256 hex hash of raw nonce */
      nonce: nonce
        ? crypto.createHash("sha256").update(nonce).digest("hex")
        : undefined,
    });
    const { email, email_verified, sub: userAppleId } = appleIdTokenClaims;
    const foundUser = await User.findOne({ email, userAppleId });
    if (foundUser && email_verified) {
      const token = jwt.sign(
        { userId: foundUser._id },
        process.env.JWT_SECRET_TOKEN
      );
      return res.send({ token, email });
    } else {
      const user = new User({
        email,
        userAppleId,
      });
      user
        .save()
        .then((doc) => {
          console.log(doc);
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_TOKEN
          );
          return res.send({ token, email });
        })
        .catch((err) => {
          next(err);
        });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
