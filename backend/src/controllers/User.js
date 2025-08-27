import User from "../models/User.js";
import validator from "validator";

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  PRIVATE
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { username, email } = req.body;

    // Check if at least one field is provided
    if (!username && !email) {
      return res.status(400).json({
        message: "Please provide at least one field to update.",
      });
    }

    // Validate input if provided
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters.",
      });
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, and underscores.",
      });
    }

    // Trim whitespace from inputs
    const trimmedUsername = username?.trim();
    const trimmedEmail = email?.trim();

    // Check for conflicts and update fields
    if (trimmedUsername && trimmedUsername !== user.username) {
      const usernameExists = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });

      if (usernameExists) {
        return res.status(400).json({ message: "Username is already taken." });
      }

      user.username = trimmedUsername;
    }

    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: trimmedEmail.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email is already associated with another account.",
        });
      }

      user.email = trimmedEmail.toLowerCase();
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (err) {
    console.error("Profile update error:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `${field === "email" ? "Email" : "Username"} already exists.`,
      });
    }

    return res.status(500).json({ message: "Error updating profile." });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  PRIVATE
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching profile, please try again soon." });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  PRIVATE
 */
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete by setting active to false
    user.active = false;
    await user.save();

    // Clear the JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({ message: "Account deactivated successfully." });
  } catch (err) {
    console.error("Profile deletion error:", err);
    return res
      .status(500)
      .json({ message: "Error deleting profile, please try again soon." });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/password
 * @access  PRIVATE
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    return res
      .status(500)
      .json({ message: "Error changing password, please try again soon." });
  }
};
