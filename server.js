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
const contactRoutes = require("./routes/contact");
const path = require("path");

const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://dashboard.yarotravel.com",
  "https://another-frontend-url.com", // Add your second frontend URL here
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vip", vipRoutes);
app.use("/api/nile", nileRoutes);
app.use("/api/contact", contactRoutes);

app.use("/uploads", express.static(uploadsDir));

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
