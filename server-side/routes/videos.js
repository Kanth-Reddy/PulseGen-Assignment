const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Video = require("../models/Video");
const { authenticate, authorize } = require("../middleware/auth");
const { extractFrames, cleanupFrames } = require("../utils/frameExtractor");
const { analyzeFrames, isPythonServiceAvailable } = require("../utils/yoloService");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`📄 File filter check: ${file.originalname}, MIME type: ${file.mimetype}`);
    if (file.mimetype.startsWith("video/")) {
      console.log("✅ File type accepted");
      cb(null, true);
    } else {
      console.error(`❌ File type rejected: ${file.mimetype}`);
      cb(new Error("Only video files are allowed"), false);
    }
  }
});

/**
 * Upload video (Editor and Admin only)
 */
router.post("/upload", authenticate, authorize(["editor", "admin"]), (req, res, next) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        console.error("\n❌ MULTER ERROR:");
        console.error("   Error code:", err.code);
        console.error("   Error message:", err.message);
        console.error("   Error field:", err.field);
        console.log("===========================================\n");
        
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size is 500MB" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        console.error("\n❌ UPLOAD MIDDLEWARE ERROR:");
        console.error("   Error message:", err.message);
        console.log("===========================================\n");
        return res.status(400).json({ message: err.message });
      }
    }
    next();
  });
}, async (req, res) => {
  console.log("\n📹 ========== VIDEO UPLOAD REQUEST ==========");
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`User: ${req.user?.username} (${req.user?.role})`);
  console.log(`User ID: ${req.user?.userId}`);
  
  try {
    if (!req.file) {
      console.error("❌ ERROR: No video file provided in request");
      console.log("Request body keys:", Object.keys(req.body || {}));
      console.log("Request files:", req.files);
      return res.status(400).json({ message: "No video file provided" });
    }

    console.log(`✅ File received: ${req.file.originalname}`);
    console.log(`   Size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   MIME type: ${req.file.mimetype}`);

    const user = req.user;
    
    console.log("🔄 Starting Cloudinary upload...");
    
    // Upload to Cloudinary (without moderation - we'll use YOLO)
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "pulsegen-videos",
        format: "mp4",
        eager: [
          { quality: "auto", fetch_format: "auto" }
        ]
      },
      async (error, result) => {
        if (error) {
          console.error("❌ CLOUDINARY UPLOAD ERROR:");
          console.error("   Error message:", error.message);
          console.error("   Error details:", JSON.stringify(error, null, 2));
          return res.status(500).json({ message: "Upload failed", error: error.message });
        }

        console.log("✅ Cloudinary upload successful!");
        console.log(`   Public ID: ${result.public_id}`);
        console.log(`   URL: ${result.secure_url}`);
        console.log(`   Format: ${result.format}`);
        console.log(`   Duration: ${result.duration || "N/A"} seconds`);

        try {
          console.log("💾 Saving video record to database...");
          // Create video record with pending status
          const video = await Video.create({
            publicId: result.public_id,
            videoUrl: result.secure_url,
            originalName: req.file.originalname,
            format: result.format,
            duration: result.duration || 0,
            uploadedBy: user.userId,
            uploaderRole: user.role,
            uploadStatus: "processing",
            sensitivityStatus: "pending",
            sensitivityMethod: "yolo",
            isVisible: true
          });

          console.log(`✅ Video saved to database with ID: ${video._id}`);
          console.log("🔍 Starting YOLO content analysis...");

          // Return response immediately, process in background
          res.json({
            message: "Video uploaded successfully. Content analysis in progress...",
            video: {
              _id: video._id,
              videoUrl: video.videoUrl,
              uploadStatus: video.uploadStatus,
              sensitivityStatus: video.sensitivityStatus
            }
          });

          // Start YOLO analysis in background
          setTimeout(async () => {
            let framePaths = [];
            try {
              // Check if Python service is available
              if (!isPythonServiceAvailable()) {
                console.error("❌ YOLO service not available. Marking video as safe.");
                video.uploadStatus = "completed";
                video.sensitivityStatus = "safe";
                video.sensitivityReason = "YOLO service not configured";
                await video.save();
                return;
              }

              console.log(`📸 Extracting frames from video ${video._id}...`);
              // Extract frames based on video duration
              const videoDuration = result.duration || 30; // Default to 30s if duration not available
              framePaths = await extractFrames(result.secure_url, videoDuration);

              if (framePaths.length === 0) {
                console.error("❌ No frames extracted. Marking as safe.");
                video.uploadStatus = "completed";
                video.sensitivityStatus = "safe";
                video.sensitivityReason = "Frame extraction failed";
                await video.save();
                return;
              }

              console.log(`🔍 Analyzing ${framePaths.length} frames with YOLO...`);
              // Analyze frames with YOLO
              const analysis = await analyzeFrames(framePaths);

              // Update video with analysis results
              video.uploadStatus = "completed";
              video.sensitivityStatus = analysis.status;
              video.sensitivityScore = analysis.score;
              video.sensitivityReason = analysis.reason;
              video.detectedObjects = analysis.detectedObjects;
              video.isVisible = analysis.status === "safe" || analysis.status === "review";

              await video.save();

              console.log(`✅ YOLO analysis completed for video ${video._id}:`);
              console.log(`   Status: ${analysis.status}`);
              console.log(`   Score: ${(analysis.score * 100).toFixed(1)}%`);
              console.log(`   Detected Objects: ${analysis.detectedObjects.join(", ") || "None"}`);
              console.log(`   Sensitive Frames: ${analysis.sensitiveFrameCount}/${analysis.totalFrames}`);
              if (analysis.reason) {
                console.log(`   Reason: ${analysis.reason}`);
              }
            } catch (analysisError) {
              console.error("❌ YOLO ANALYSIS ERROR:");
              console.error("   Error message:", analysisError.message);
              console.error("   Error stack:", analysisError.stack);
              
              // Mark as safe if analysis fails
              video.uploadStatus = "completed";
              video.sensitivityStatus = "safe";
              video.sensitivityReason = `Analysis error: ${analysisError.message}`;
              await video.save();
            } finally {
              // Clean up temporary frame files
              if (framePaths.length > 0) {
                console.log("🧹 Cleaning up temporary frame files...");
                cleanupFrames(framePaths);
              }
            }
          }, 3000); // Wait 3 seconds for video to be fully processed by Cloudinary

          console.log("✅ Upload process initiated successfully");
          console.log("===========================================\n");
        } catch (dbError) {
          console.error("❌ DATABASE ERROR:");
          console.error("   Error message:", dbError.message);
          console.error("   Error code:", dbError.code);
          console.error("   Error name:", dbError.name);
          if (dbError.errors) {
            console.error("   Validation errors:", JSON.stringify(dbError.errors, null, 2));
          }
          console.error("   Error stack:", dbError.stack);
          console.error("   Full error:", JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
          console.log("===========================================\n");
          return res.status(500).json({ message: "Database error", error: dbError.message });
        }
      }
    );

    console.log("📤 Sending file buffer to Cloudinary upload stream...");
    uploadStream.end(req.file.buffer);
    console.log("✅ File buffer sent to upload stream");
  } catch (error) {
    console.error("\n❌ GENERAL UPLOAD ERROR:");
    console.error("   Error message:", error.message);
    console.error("   Error name:", error.name);
    console.error("   Error stack:", error.stack);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    console.log("===========================================\n");
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

/**
 * Get all videos (role-based visibility)
 */
router.get("/all", authenticate, async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // Viewers can only see safe videos
    if (user.role === "viewer") {
      query = {
        isVisible: true,
        sensitivityStatus: { $in: ["safe", "review"] }
      };
    }
    // Editors and Admins can see all videos
    // (no query filter needed)

    const videos = await Video.find(query)
      .populate("uploadedBy", "username")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Error fetching videos" });
  }
});

/**
 * Get single video by ID
 */
router.get("/:videoId", authenticate, async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = req.user;

    const video = await Video.findById(videoId).populate("uploadedBy", "username");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Viewers can only see safe videos
    if (user.role === "viewer" && (!video.isVisible || video.sensitivityStatus === "flagged")) {
      return res.status(403).json({ message: "Video not available" });
    }

    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Error fetching video" });
  }
});

/**
 * Delete video (Editor can delete own, Admin can delete any)
 */
router.delete("/:videoId", authenticate, authorize(["editor", "admin"]), async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = req.user;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Editors can only delete their own videos
    if (user.role === "editor" && video.uploadedBy.toString() !== user.userId) {
      return res.status(403).json({ message: "You can only delete your own videos" });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await Video.findByIdAndDelete(videoId);

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Error deleting video" });
  }
});

/**
 * Get upload status
 */
router.get("/status/:videoId", authenticate, async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId).select("uploadStatus sensitivityStatus sensitivityReason");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      uploadStatus: video.uploadStatus,
      sensitivityStatus: video.sensitivityStatus,
      sensitivityReason: video.sensitivityReason
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ message: "Error fetching status" });
  }
});

module.exports = router;

