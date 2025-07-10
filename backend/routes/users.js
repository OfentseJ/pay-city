import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../data/database.js";
import { authenticateToken, loginRateLimit } from "../middleware/auth.js";

const router = express.Router();

//Register new User
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      date_of_birth,
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userExists = await db.getUserByEmail(email);

    if (userExists) {
      return res
        .status(409)
        .json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone_number,
      date_of_birth,
      is_active: true,
      last_login: null,
    };

    await db.createUser(newUser);
    const { password: _, ...userResponse } = newUser;
    res.status(201).json({
      message: "User Created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Login user
router.post("/login", loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.getUserByEmail(email);

    if (!user) {
      req.incrementLoginAttempts();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      req.incrementLoginAttempts();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.last_login = new Date().toISOString();
    await db.updateUser(user.user_id, user);

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userResponse } = user;
    res.json({
      message: "Login Successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password: _, ...userResponse } = user;
    res.json({
      message: "Profile retrieved successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_number, address } = req.body;

    const user = await db.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = {
      ...user,
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      phone_number: phone_number || user.phone_number,
      address,
      updated_at: new Date().toISOString(),
    };

    await db.updateUser(req.user.userId, updatedUser);

    const { password: _, ...userResponse } = updatedUser;
    res.json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
