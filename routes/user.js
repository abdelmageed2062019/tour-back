const express = require("express");
const auth = require("../middleware/auth"); // Import the auth middleware
const admin = require("../middleware/admin"); // Import the admin middleware
const User = require("../models/User"); // Import the User model
const router = express.Router();
const bcrypt = require("bcryptjs");

// Get all users (admin only)
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from the response
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Get a specific user by ID (admin only)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user");
  }
});

// Add a new user (admin only)
router.post("/", auth, admin, async (req, res) => {
  const { firstName, lastName, displayName, address, email, password, role } =
    req.body;

  // Validation check
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Check if the email is already in use
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("Email already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new user
    user = new User({
      firstName,
      lastName,
      displayName,
      address,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: user._id });
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});

// Update an existing user by ID (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  const { firstName, lastName, displayName, address, email, password, role } =
    req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (displayName) user.displayName = displayName;
    if (address) user.address = address;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).send("Error updating user");
  }
});

// Delete a user by ID (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
});

module.exports = router;
