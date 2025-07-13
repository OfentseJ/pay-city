import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const router = express.Router();

//Register new User
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, idNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      idNumber,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, idNumber: user.idNumber },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        idNumber: user.idNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

//Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

//Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, idNumber } = req.body;

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (idNumber) user.idNumber = idNumber;

    await user.save();

    const { password: _, ...userResponse } = user.toObject();
    res.json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const sendOtpEmail = async (to, otp) => {
      try {
        const response = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to,
          subject: "Your OTP Code",
          text: `Your One-Time Password is: ${otp}`,
        });

        console.log("Email sent:", response);
      } catch (error) {
        console.error("Email failed:", error);
      }
    };

    sendOtpEmail(user.email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error", error);
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error", error);
  }
});

export default router;
