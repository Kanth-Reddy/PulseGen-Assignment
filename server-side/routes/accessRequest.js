const express = require("express");
const AccessRequest = require("../models/AccessRequest");
const User = require("../models/User");
const sendMail = require("../utils/mailer");
const emailTemplates = require("../utils/emailTemplates");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Viewer sends request
 */
router.post("/request", authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId);

  // Check current role from database (not from JWT token)
  if (user.role !== "viewer") {
    return res.status(403).json({ 
      message: "Access denied. Only viewers can request editor access." 
    });
  }

  // Check if there's a pending request
  const existing = await AccessRequest.findOne({
    userId: user._id,
    status: "pending"
  });

  if (existing) {
    return res.status(400).json({ message: "Request already pending" });
  }

  // Check if there's a rejected request within last 10 minutes
  const rejectedRequest = await AccessRequest.findOne({
    userId: user._id,
    status: "rejected"
  }).sort({ reviewedAt: -1 }); // Get the most recent rejection

  if (rejectedRequest && rejectedRequest.reviewedAt) {
    const timeSinceRejection = Date.now() - new Date(rejectedRequest.reviewedAt).getTime();
    const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
    const remainingTime = tenMinutesInMs - timeSinceRejection;

    if (remainingTime > 0) {
      const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
      return res.status(400).json({ 
        message: `You can request again after ${remainingMinutes} minute(s)`,
        canRequestAfter: new Date(Date.now() + remainingTime).toISOString()
      });
    }
  }

  const request = await AccessRequest.create({
    userId: user._id,
    username: user.username,
    email: user.email
  });

  // Send email to user confirming request submission
  await sendMail(
    user.email,
    "Editor Access Request Submitted - MediaX",
    `Your request for editor access has been submitted.`,
    emailTemplates.requestSubmittedEmail(user.username)
  );

  // Notify admin
  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    await sendMail(
      admin.email,
      "New Editor Access Request - MediaX",
      `User ${user.username} (${user.email}) has requested editor access.`,
      emailTemplates.requestNotificationEmail(user.username, user.email)
    );
  }

  res.json({ message: "Request sent to admin" });
});

/**
 * Admin gets all requests
 */
router.get("/all", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const requests = await AccessRequest.find()
      .sort({ requestedAt: -1 })
      .populate("userId", "username email");
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

/**
 * Admin approves request
 */
router.post("/approve/:requestId", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await AccessRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Update user role to editor
    await User.findByIdAndUpdate(request.userId, { role: "editor" });

    // Update request status
    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    // Send approval email to user
    await sendMail(
      request.email,
      "Editor Access Approved - MediaX",
      `Dear ${request.username},\n\nYour request for editor access has been approved. You can now access editor features.\n\nThank you!`,
      emailTemplates.requestApprovedEmail(request.username)
    );

    res.json({ message: "Request approved and user notified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving request" });
  }
});

/**
 * Admin rejects request
 */
router.post("/reject/:requestId", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await AccessRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Update request status
    request.status = "rejected";
    request.reviewedAt = new Date();
    await request.save();

    // Send rejection email to user
    await sendMail(
      request.email,
      "Editor Access Request Rejected - MediaX",
      `Dear ${request.username},\n\nUnfortunately, your request for editor access has been rejected.\n\nYou can continue using the platform as a viewer.\n\nThank you!`,
      emailTemplates.requestRejectedEmail(request.username)
    );

    res.json({ message: "Request rejected and user notified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting request" });
  }
});

/**
 * Viewer checks their request status
 */
router.get("/my-request", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Only viewers can check their request status
    if (user.role !== "viewer") {
      return res.json({ 
        message: "No request found",
        currentRole: user.role 
      });
    }

    const request = await AccessRequest.findOne({
      userId: req.user.userId
    }).sort({ requestedAt: -1 });
    
    if (!request) {
      return res.json({ message: "No request found" });
    }

    // If request was approved but user is still a viewer, it means they were demoted
    // Don't show approved status if user is currently a viewer
    if (request.status === "approved" && user.role === "viewer") {
      // This shouldn't happen, but if it does, return no request
      return res.json({ message: "No request found" });
    }

    // If rejected, calculate when they can request again
    let canRequestAfter = null;
    if (request.status === "rejected" && request.reviewedAt) {
      const timeSinceRejection = Date.now() - new Date(request.reviewedAt).getTime();
      const tenMinutesInMs = 10 * 60 * 1000;
      const remainingTime = tenMinutesInMs - timeSinceRejection;
      
      if (remainingTime > 0) {
        canRequestAfter = new Date(Date.now() + remainingTime).toISOString();
      }
    }

    res.json({
      ...request.toObject(),
      canRequestAfter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching request" });
  }
});

module.exports = router;