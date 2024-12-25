const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", (req, res) => {
  const { name, email, message, phone } = req.body;

  // Nodemailer transporter setup
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@yarotravel.com",
      pass: "A1+Z5K:Yf",
    },
  });

  const mailOptions = {
    from: email,
    to: "admin@yarotravel.com",
    subject: `Contact Form Submission from ${name}`,
    text: message,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Phone:</strong> ${phone}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong>  ${message}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
});

module.exports = router; // Ensure this is at the end
