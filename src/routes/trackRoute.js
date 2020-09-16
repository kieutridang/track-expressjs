const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
const { BadRequest } = require("../utils/errors");

const router = express.Router();
// router.use(requireAuth);

const Track = mongoose.model("Track");

router.get("/tracks", async (req, res) => {
  const userId = req.user._id;
  const tracks = await Track.find({ userId });
  res.send(tracks);
});

router.post("/tracks", (req, res, next) => {
  const userId = req.user._id;
  const { name, locations } = req.body;

  if (!name || !locations) {
    return next(new BadRequest("Invalid track !"));
  }

  const track = new Track({
    userId,
    name,
    locations,
  });

  track
    .save()
    .then((response) => res.send(response))
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
