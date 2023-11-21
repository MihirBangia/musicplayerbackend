const express = require("express");
const app = express();
const dotenv = require("dotenv");
const User = require("./models/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const corsOptions = {
    origin: 'http://localhost:3000', // Adjust this to your frontend origin
    credentials: true,
  };
  

dotenv.config();
app.use(cors(corsOptions));
const secret = process.env.JWT_WEB_TOKEN;

app.use(express.json());
app.use(cookieParser());

app.listen(4001, () => {
  console.log("running");
});

app.get("/", (req, res) => {
  res.send("Hello from musicapi");
});

//connection to db
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("connected to db"));

app.post("/user", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    res.send(user);
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user === null) {
      res.send("No user found");
    } else {
      if (user.password == req.body.password) {
        const token = jwt.sign(
          {
            email: user.email,
          },
          secret
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
        });
        res.send("login success");
      } else {
        res.send("login failure");
      }
    }
  } catch (error) {
    res.send(error.message);
  }
});

