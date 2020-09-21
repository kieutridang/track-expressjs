require("dotenv").config();
// MODELS
require("./models/User");
require("./models/Tracks");
const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/authRoute");
const trackRoute = require("./routes/trackRoute");
const bodyParser = require("body-parser");
const handleError = require("./middlewares/errorHandler");
const requireAuth = require("./middlewares/requireAuth");

const port = process.env.PORT || 3001;

const app = express();
app.use(bodyParser.json());
app.use(authRoute);
app.use(trackRoute);

app.get("/", requireAuth, (req, res) => {
  res.send("sup dude " + req.user.email);
});

app.use(handleError);

app.listen(port, () => {
  console.log("listening on port " + port);
});

const connectionString =
  "mongodb+srv://admin:admin@cluster0.7vtcj.mongodb.net/express-demo?retryWrites=true&w=majority";
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});

mongoose.connection.on("error", (err) => {
  console.error("error :>> ", err);
});
