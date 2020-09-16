const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const appleSigninAuth = require("apple-signin-auth");
const crypto = require("crypto");
const { BadRequest, NotFound, Unauthorized } = require("../utils/errors");
const fs = require("fs");
const AppleAuth = require("apple-auth");
const bodyparser = require("body-parser");
const queryString = require("querystring");

const config = fs.readFileSync("./src/config/config.json");
const auth = new AppleAuth(
  config,
  fs.readFileSync("./src/config/authkey.p8").toString(),
  "text"
);

const router = express.Router();

const User = mongoose.model("User");

router.post("/signup", (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new BadRequest("Missing email or password");
    }
    const user = new User({ email, password });
    user
      .save()
      .then((doc) => {
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

router.get("/apple-oauth", (req, res) => {
  return res.redirect(auth.loginURL());
});

router.post("/appleauth", bodyparser(), async (req, res, next) => {
  try {
    const response = await auth.accessToken(req.body.code);
    const idToken = jwt.decode(response.id_token);
    const user = {};
    user.id = idToken.sub;

    if (idToken.email) user.email = idToken.email;
    if (req.body.user) {
      const { name } = JSON.parse(req.body.user);
      user.name = name;
    }
    let query = "";
    const foundUser = await User.findOne({
      email: user.email,
      userAppleId: user.id,
    });
    if (foundUser) {
      const token = jwt.sign(
        { userId: foundUser._id },
        process.env.JWT_SECRET_TOKEN
      );
      query = queryString.stringify({ token, email: foundUser.email });
    } else {
      const user = new User({
        email: user.email,
        userAppleId: user.id,
      });
      user
        .save()
        .then((doc) => {
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_TOKEN
          );
          query = queryString.stringify({ token, email: user.email });
        })
        .catch((err) => {
          next(err);
        });
    }
    return res.redirect(`playground://${query}`);
  } catch (ex) {
    console.error(ex);
    res.send("An error occurred!");
    next(ex);
  }
});

module.exports = router;
