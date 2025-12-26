const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dheftu60e";
const apiKey = process.env.CLOUDINARY_API_KEY || "313146379662928";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "zkw_vaGdb4VOdWD8DmOz0IeMS9A";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log("\n☁️  ========== CLOUDINARY CONFIGURATION ==========");
console.log(`   Cloud Name: ${cloudName}`);
console.log(`   API Key: ${apiKey.substring(0, 8)}...`);
console.log(`   API Secret: ${apiSecret.substring(0, 8)}...`);
console.log("✅ Cloudinary configured");
console.log("==========================================\n");

module.exports = cloudinary;

