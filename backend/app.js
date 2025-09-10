const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const axios = require("axios");
const { connectDB } = require("./config/db");
const router = require("./routes/index.route");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Learn Sphere backend!");
});
app.use("/api", router);

//connecting with the db and starting server
connectDB().then(() => {
  const port = process.env.PORT || 3001;
  console.log("MongoDb setup done");
  app.listen(port, () => {
    console.log(
      `server has been succesfullly listening at http://localhost:${port}/`
    );
  });
});
