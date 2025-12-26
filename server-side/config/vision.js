const vision = require("@google-cloud/vision");
const path = require("path");

// Initialize Google Vision API client
const serviceAccountPath = path.join(__dirname, "../positive-winter-482405-b1-d53becbaeb7d.json");
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: serviceAccountPath
});

console.log("\n👁️  ========== GOOGLE VISION API CONFIGURATION ==========");
console.log(`   Service Account: positive-winter-482405-b1-d53becbaeb7d.json`);
console.log(`   Project ID: positive-winter-482405-b1`);
console.log(`   Service Account Email: pulsegen-vision-sa@positive-winter-482405-b1.iam.gserviceaccount.com`);
console.log("\n📋 IMPORTANT: Make sure billing is enabled for project 'positive-winter-482405-b1'");
console.log("   Enable billing: https://console.developers.google.com/billing/enable?project=positive-winter-482405-b1");
console.log("   Enable Vision API: https://console.developers.google.com/apis/library/vision.googleapis.com?project=positive-winter-482405-b1");
console.log("✅ Google Vision API client initialized");
console.log("==========================================\n");

module.exports = visionClient;

