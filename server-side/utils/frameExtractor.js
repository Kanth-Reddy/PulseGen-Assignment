/**
 * Frame Extraction Utility
 * Extracts frames from Cloudinary videos for YOLO analysis
 */

const cloudinary = require("../config/cloudinary");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

/**
 * Extract public_id from Cloudinary URL
 */
function extractPublicId(videoUrl) {
  const urlParts = videoUrl.split("/");
  const uploadIndex = urlParts.findIndex(part => part === "upload");
  
  if (uploadIndex === -1) {
    const filename = urlParts[urlParts.length - 1];
    return filename.split(".")[0];
  }
  
  const partsAfterUpload = urlParts.slice(uploadIndex + 1);
  // Remove version if it's a number
  if (partsAfterUpload.length > 0 && /^\d+$/.test(partsAfterUpload[0])) {
    partsAfterUpload.shift();
  }
  
  const publicIdWithExt = partsAfterUpload.join("/");
  return publicIdWithExt.split(".")[0];
}

/**
 * Download image from URL to temporary file
 */
function downloadImageToFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on("finish", () => {
        file.close();
        resolve(outputPath);
      });
    }).on("error", (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

/**
 * Extract frames from Cloudinary video based on video duration
 * @param {string} videoUrl - Cloudinary video URL
 * @param {number} videoDuration - Video duration in seconds
 * @returns {Promise<Array<string>>} Array of temporary file paths
 */
async function extractFrames(videoUrl, videoDuration) {
  const publicId = extractPublicId(videoUrl);
  
  if (!publicId) {
    throw new Error("Could not extract public_id from video URL");
  }
  
  // Create temp directory for frames at project root
  const tempDir = path.join(__dirname, "../../temp_frames");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const framePaths = [];
  const timestamps = [];
  
  // Calculate frame extraction strategy based on video duration
  let numFrames;
  let intervalSeconds;
  
  if (videoDuration <= 10) {
    // Very short videos: extract every 2 seconds, max 5 frames
    intervalSeconds = 2;
    numFrames = Math.min(5, Math.floor(videoDuration / intervalSeconds) + 1);
  } else if (videoDuration <= 30) {
    // Short videos: extract every 3 seconds, max 10 frames
    intervalSeconds = 3;
    numFrames = Math.min(10, Math.floor(videoDuration / intervalSeconds) + 1);
  } else if (videoDuration <= 60) {
    // Medium videos: extract every 5 seconds, max 12 frames
    intervalSeconds = 5;
    numFrames = Math.min(12, Math.floor(videoDuration / intervalSeconds) + 1);
  } else if (videoDuration <= 180) {
    // Long videos: extract every 10 seconds, max 18 frames
    intervalSeconds = 10;
    numFrames = Math.min(18, Math.floor(videoDuration / intervalSeconds) + 1);
  } else {
    // Very long videos: extract every 15 seconds, max 20 frames
    intervalSeconds = 15;
    numFrames = Math.min(20, Math.floor(videoDuration / intervalSeconds) + 1);
  }
  
  // Generate timestamps evenly distributed across video
  for (let i = 0; i < numFrames; i++) {
    const timestamp = Math.min(i * intervalSeconds, videoDuration - 1);
    timestamps.push(Math.max(0, timestamp));
  }
  
  console.log(`📸 Extracting ${timestamps.length} frames from ${videoDuration.toFixed(1)}s video (every ${intervalSeconds}s)...`);
  
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    try {
      // Generate Cloudinary frame URL using transformation
      const frameUrl = cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        transformation: [
          { start_offset: timestamp },
          { width: 640, height: 360, crop: "limit", quality: "auto" }
        ]
      });
      
      const framePath = path.join(tempDir, `frame_${timestamp}s_${Date.now()}_${i}.jpg`);
      
      await downloadImageToFile(frameUrl, framePath);
      framePaths.push(framePath);
      
      console.log(`   ✅ Frame ${i + 1}/${timestamps.length} extracted (${timestamp.toFixed(1)}s)`);
    } catch (error) {
      console.error(`   ⚠️  Failed to extract frame at ${timestamp}s:`, error.message);
      // Continue with other frames
    }
  }
  
  return framePaths;
}

/**
 * Clean up temporary frame files
 */
function cleanupFrames(framePaths) {
  framePaths.forEach(framePath => {
    try {
      if (fs.existsSync(framePath)) {
        fs.unlinkSync(framePath);
      }
    } catch (error) {
      console.error(`Failed to delete ${framePath}:`, error.message);
    }
  });
}

module.exports = {
  extractFrames,
  cleanupFrames,
  extractPublicId
};

