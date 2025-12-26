const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  // Cloudinary
  publicId: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  uploaderRole: {
    type: String,
    enum: ["editor", "admin"],
    required: true
  },
  // Processing
  uploadStatus: {
    type: String,
    enum: ["uploaded", "processing", "completed", "failed"],
    default: "uploaded"
  },
  // Sensitivity
  sensitivityStatus: {
    type: String,
    enum: ["pending", "safe", "flagged", "review"],
    default: "pending"
  },
  sensitivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  sensitivityReason: {
    type: String,
    default: ""
  },
  sensitivityMethod: {
    type: String,
    enum: ["yolo", "aws_rek", "manual"],
    default: "yolo"
  },
  detectedObjects: {
    type: [String],
    default: []
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
VideoSchema.pre("save", function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Video", VideoSchema);

