const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = mongoose.model("User");

router.post("/signup", (req, res, next) => {
  console.log("req.body :>> ", req.body);
  const { email, password } = req.body;
  const user = new User({ email, password });
  user
    .save()
    .then((doc) => {
      console.log(doc);
      const token = jwt.sign({ userId: user._id }, "SECRET-KEY");
      res.send({ token });
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;
