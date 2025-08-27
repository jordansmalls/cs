import User from "../models/User.js";
import validator from "validator";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Create user
 * @route   POST /api/auth/register
 * @access  PUBLIC
 */
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (username.length < 3 || username.length > 20) {
    return res
      .status(400)
      .json({ message: "Username must be between 3 and 20 characters" });
  }

  // Check for valid username characters
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res
      .status(400)
      .json({
        message: "Username can only contain letters, numbers, and underscores",
      });
  }

  try {
    // Check if username is available
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Check if email is already in use
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res
        .status(400)
        .json({ message: "Email is already associated with another account." });
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    if (!user) {
      return res.status(500).json({ message: "Invalid user data." });
    }

    generateToken(res, user._id);
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Registration error:", err);

    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `${field === "email" ? "Email" : "Username"} already exists`,
      });
    }

    return res.status(500).json({
      message:
        "We're having trouble creating your account. Please try again soon.",
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  PUBLIC
 */
export const login = async (req, res) => {
  // login with username or email credentials
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // find by username or email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    }).select("+password"); // Explicitly include password if it's set to select: false

    if (user && user.active && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "We're having trouble logging you in, please try again soon.",
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  PUBLIC
 */
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
  return res.status(200).json({ message: "Logged out successfully." });
};
