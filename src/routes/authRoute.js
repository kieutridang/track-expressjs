const express = require("express");
const mongoose = require("mongoose");

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
      res.send(doc);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;
