const express = require("express");
const User = require("../models/User");
const AccessRequest = require("../models/AccessRequest");
const sendMail = require("../utils/mailer");
const emailTemplates = require("../utils/emailTemplates");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Admin gets all users
 */
router.get("/all", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

/**
 * Admin removes admin access from a user
 */
router.post("/remove-admin/:userId", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent removing admin from yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ message: "You cannot remove admin access from yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    // Change role to editor
    user.role = "editor";
    await user.save();

    // Send email notification
    await sendMail(
      user.email,
      "Admin Access Removed - MediaX",
      `Your admin access has been removed. Your role has been changed to editor.`,
      emailTemplates.adminAccessRemovedEmail(user.username)
    );

    res.json({ message: "Admin access removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing admin access" });
  }
});

/**
 * Admin updates user role
 */
router.post("/update-role/:userId", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent removing admin from yourself
    if (userId === req.user.userId && role !== "admin") {
      return res.status(400).json({ message: "You cannot change your own admin role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // If user was downgraded from editor/admin to viewer, invalidate old approved requests
    if ((oldRole === "editor" || oldRole === "admin") && role === "viewer") {
      // Delete or mark as invalid old approved requests
      await AccessRequest.deleteMany({
        userId: user._id,
        status: "approved"
      });
    }

    // Send email if role was downgraded from admin
    if (oldRole === "admin" && role !== "admin") {
      await sendMail(
        user.email,
        "Admin Access Removed - MediaX",
        `Your admin access has been removed. Your role has been changed to ${role}.`,
        emailTemplates.adminAccessRemovedEmail(user.username)
      );
    }

    // Send email if role was downgraded from editor to viewer
    if (oldRole === "editor" && role === "viewer") {
      await sendMail(
        user.email,
        "Editor Access Removed - MediaX",
        `Your editor access has been removed. Your role has been changed to viewer.`,
        emailTemplates.editorAccessRemovedEmail(user.username)
      );
    }

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user role" });
  }
});

module.exports = router;

