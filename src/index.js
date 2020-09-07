// MODELS
require("./models/User");
const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/authRoute");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(authRoute);

app.get("/", (req, res) => {
  res.send("yo dude");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});

const connectionString =
  "mongodb+srv://admin:admin@cluster0.7vtcj.mongodb.net/<dbname>?retryWrites=true&w=majority";
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
