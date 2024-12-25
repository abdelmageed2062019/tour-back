// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const tourRoutes = require("./routes/tours");
const packageRoutes = require("./routes/package");
const bookingRoutes = require("./routes/booking");
const reviewRoutes = require("./routes/review");
const vipRoutes = require("./routes/vip");
const nileRoutes = require("./routes/nile");

const path = require("path");

const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vip", vipRoutes);
app.use("/api/nile", nileRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
