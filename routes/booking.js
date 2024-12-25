const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin"); // Import the admin middleware
const { parse } = require("json2csv");
const axios = require("axios");
require("dotenv").config();
const getExchangeRate = require("./exchange-api");

// Create a new booking and process payment
router.post("/", auth, async (req, res) => {
  const {
    email,
    arrivalDate,
    departureDate,
    tripLocation,
    adults,
    children6To11,
    childrenUnder6,
    transportation,
    guide,
    car,
    additionalQueries,
    userId,
    tourName,
    date,
    time,
    cellPhone,
    paymentName,
    amount, // Amount is in USD
    apartment,
    floor,
    street,
    building,
    city,
    country,
    state,
  } = req.body;

  try {
    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch exchange rate from USD to EGP
    const exchangeRate = await getExchangeRate();
    if (!exchangeRate) {
      return res.status(500).json({ message: "Failed to fetch exchange rate" });
    }

    // Convert the amount to EGP
    const amountInEGP = amount * exchangeRate;

    // Create a new booking
    const newBooking = new Booking({
      user: userId,
      tourName,
      email,
      arrivalDate,
      departureDate,
      tripLocation,
      adults,
      children6To11,
      childrenUnder6,
      transportation,
      guide,
      car,
      additionalQueries,
      date,
      time,
      cellPhone,
      paymentName,
      amount: amountInEGP, // Store amount in EGP in your database
      status: "pending",
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Prepare billing data for Paymob
    const billingData = {
      apartment,
      first_name: user.firstName,
      last_name: user.lastName,
      street,
      building,
      phone_number: cellPhone,
      city,
      country,
      email,
      floor,
      state,
    };

    const amountInCents = amountInEGP * 100; // Paymob expects amount in cents

    const paymentRequest = {
      amount: amountInCents,
      currency: "EGP", // Now using EGP for Paymob
      payment_methods: [4888997],
      items: [],
      billing_data: billingData,
      extras: {},
      special_reference: `booking-${savedBooking._id}`,
      notification_url:
        "https://webhook.site/f60597f3-97b9-4992-90e1-6f98a63fc32d",
      redirection_url: "http://localhost:4200/",
    };

    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      paymentRequest,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMOB_SECRET_KEY_TEST}`,
        },
      }
    );

    const paymentUrl = response.data.redirect_url;

    console.log(response.data);

    savedBooking.paymentReference = response.data.id;
    await savedBooking.save();

    res.status(201).json({
      booking: savedBooking,
      client_secret: response.data.client_secret,
      paymentUrl: response.data.redirect_url,
    });
  } catch (error) {
    console.error("Error creating booking and payment intention:", error);
    res.status(500).json({
      message: "Error creating booking and payment intention",
      error: error.message,
    });
  }
});

// Get all bookings with pagination (admin only)
router.get("/", auth, admin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.max(1, parseInt(limit));

  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("user")
      .exec();

    const totalAmountResult = await Booking.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;
    const total = await Booking.countDocuments();

    res.json({
      bookings,
      meta: {
        total,
        totalAmount,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
});

// Get bookings for a specific month and download as CSV (admin only)
router.get("/download/:year/:month", auth, admin, async (req, res) => {
  const { year, month } = req.params;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await Booking.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("user");

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this period" });
    }

    // Prepare fields for CSV
    const fields = [
      { label: "Booking ID", value: "_id" },
      { label: "Full Name", value: "fullName" },
      { label: "User  Email", value: "email" },
      { label: "Tour Name", value: "tourName" },
      { label: "Arrival Date", value: "arrivalDate" },
      { label: "Departure Date", value: "departureDate" },
      { label: "Trip Location", value: "tripLocation" },
      { label: "Adults", value: "adults" },
      { label: "Children (6-11)", value: "children6To11" },
      { label: "Children (<6)", value: "childrenUnder6" },
      { label: "Transportation", value: "transportation" },
      { label: "Guide", value: "guide" },
      { label: "Car", value: "car" },
      { label: "Additional Queries", value: "additionalQueries" },
      { label: "Date", value: "date" },
      { label: "Time", value: "time" },
      { label: "Cell Phone", value: "cellPhone" },
      { label: "Payment Name", value: "paymentName" },
      { label: "Amount", value: "amount" },
      { label: "Status", value: "status" },
    ];

    // Format the bookings directly in the parse function
    const csvData = bookings.map((booking) => ({
      _id: booking._id,
      fullName: booking.user?.fullName || "",
      email: booking.user?.email || "",
      tourName: booking.tourName,
      arrivalDate: formatDate(booking.arrivalDate),
      departureDate: formatDate(booking.departureDate),
      tripLocation: booking.tripLocation,
      adults: booking.adults,
      children6To11: booking.children6To11,
      childrenUnder6: booking.childrenUnder6,
      transportation: booking.transportation,
      guide: booking.guide,
      car: booking.car,
      additionalQueries: booking.additionalQueries,
      date: formatDate(booking.date),
      time: booking.time,
      cellPhone: booking.cellPhone,
      paymentName: booking.paymentName,
      amount: booking.amount,
      status: booking.status,
    }));

    const csv = parse(csvData, { fields });

    res.header("Content-Type", "text/csv");
    res.attachment(`bookings_${year}_${month}.csv`);
    res.send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching or downloading bookings", error });
  }
});

// Helper function to format date
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get all bookings for a specific user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const bookings = await Booking.find({ user: user._id }).populate("tour");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's bookings", error });
  }
});

// Get a specific booking by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("user tour");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
});

// Update a specific booking by ID (update any field)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const allowedUpdates = ["time", "cellPhone", "status"];
    const updates = Object.keys(req.body);

    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ message: "Invalid fields in request body" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating booking",
      error: error.message || error,
    });
  }
});

// Delete a specific booking by ID
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error });
  }
});

module.exports = router;
