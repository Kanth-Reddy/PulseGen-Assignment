// This file is kept for backward compatibility but is no longer used
// Content moderation is now handled directly by Cloudinary using AWS Rekognition
// during the upload process in routes/videos.js

module.exports = {
  // Legacy function - no longer used
  analyzeVideoSensitivity: async () => {
    return {
      status: "safe",
      score: 0,
      reason: "Using Cloudinary moderation"
    };
  }
};
