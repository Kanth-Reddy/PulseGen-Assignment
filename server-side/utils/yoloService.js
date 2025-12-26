/**
 * YOLO Service Integration
 * Communicates with Python YOLO service to analyze frames
 */

const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Path to Python YOLO service
const YOLO_SERVICE_PATH = path.join(__dirname, "../../yolo_service/app.py");
// Default to 'python' for Windows compatibility, fallback to 'python3' for Linux/Mac
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || (process.platform === "win32" ? "python" : "python3");

// Sensitive labels that trigger flagging (weapons only - no person, no bottle)
const SENSITIVE_LABELS = ["knife", "gun", "pistol", "rifle"];

/**
 * Check if Python service is available
 */
function isPythonServiceAvailable() {
  return fs.existsSync(YOLO_SERVICE_PATH);
}

/**
 * Analyze a single frame using YOLO
 * @param {string} framePath - Path to frame image file
 * @param {string} pythonCmd - Python command to use (defaults to PYTHON_COMMAND)
 * @returns {Promise<Object>} Detection results
 */
function analyzeFrame(framePath, pythonCmd = PYTHON_COMMAND) {
  return new Promise((resolve, reject) => {
    if (!isPythonServiceAvailable()) {
      return reject(new Error("YOLO service not found. Please ensure yolo_service/app.py exists."));
    }
    
    if (!fs.existsSync(framePath)) {
      return reject(new Error(`Frame file not found: ${framePath}`));
    }
    
    console.log(`🔍 Analyzing frame: ${path.basename(framePath)}`);
    
    // On Windows with paths containing spaces, use exec with properly quoted command
    if (process.platform === "win32") {
      // Quote paths to handle spaces properly
      const quotedScriptPath = `"${YOLO_SERVICE_PATH}"`;
      const quotedFramePath = `"${framePath}"`;
      const command = `${pythonCmd} ${quotedScriptPath} ${quotedFramePath}`;
      
      execAsync(command, {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for output
      }).then(({ stdout, stderr }) => {
        if (stderr && !stdout) {
          // If python3 failed and we're on Windows, try 'python' as fallback
          if (pythonCmd === "python3" && stderr.includes("not found")) {
            console.log(`   ⚠️  python3 not found, trying 'python' instead...`);
            return analyzeFrame(framePath, "python").then(resolve).catch(reject);
          }
          return reject(new Error(`YOLO analysis failed: ${stderr}`));
        }
        
        try {
          // Filter out download progress messages and extract JSON
          // The JSON might be on the same line as download progress or on separate lines
          let jsonLine = '';
          
          // Remove download progress lines (they start with "Downloading" or contain progress bars)
          const cleanedOutput = stdout
            .split('\n')
            .filter(line => {
              const trimmed = line.trim();
              return !trimmed.startsWith('Downloading') && 
                     !trimmed.includes('|') && 
                     !trimmed.match(/^\d+%/) &&
                     trimmed.length > 0;
            })
            .join('\n');
          
          // First, try to find JSON object with "detections" key (most reliable)
          const jsonMatch = cleanedOutput.match(/\{[^{}]*(?:"detections"|"error")[\s\S]*?\}/);
          if (jsonMatch) {
            jsonLine = jsonMatch[0];
          } else {
            // Fallback: find any JSON object (balanced braces)
            let braceCount = 0;
            let startIdx = -1;
            for (let i = 0; i < cleanedOutput.length; i++) {
              if (cleanedOutput[i] === '{') {
                if (startIdx === -1) startIdx = i;
                braceCount++;
              } else if (cleanedOutput[i] === '}') {
                braceCount--;
                if (braceCount === 0 && startIdx !== -1) {
                  jsonLine = cleanedOutput.substring(startIdx, i + 1);
                  break;
                }
              }
            }
          }
          
          if (!jsonLine) {
            throw new Error("No JSON found in output");
          }
          
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (parseError) {
          console.error(`❌ Failed to parse YOLO output. First 300 chars: ${stdout.substring(0, 300)}...`);
          reject(new Error(`Failed to parse YOLO results: ${parseError.message}`));
        }
      }).catch((error) => {
        // If python3 not found on Windows, try 'python' as fallback
        if (error.code === "ENOENT" && pythonCmd === "python3" && process.platform === "win32") {
          console.log(`   ⚠️  python3 not found, trying 'python' instead...`);
          return analyzeFrame(framePath, "python").then(resolve).catch(reject);
        }
        
        if (error.stderr) {
          console.error(`❌ YOLO process error: ${error.stderr}`);
        }
        reject(new Error(`YOLO analysis failed: ${error.message || error.stderr || "Unknown error"}`));
      });
    } else {
      // On Linux/Mac, use spawn (handles paths better)
      const pythonProcess = spawn(pythonCmd, [YOLO_SERVICE_PATH, framePath]);
      
      let stdout = "";
      let stderr = "";
      
      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`❌ YOLO process exited with code ${code}`);
          if (stderr) {
            console.error(`   stderr: ${stderr}`);
          }
          return reject(new Error(`YOLO analysis failed: ${stderr || `Exit code ${code}`}`));
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error(`❌ Failed to parse YOLO output: ${stdout}`);
          reject(new Error(`Failed to parse YOLO results: ${parseError.message}`));
        }
      });
      
      pythonProcess.on("error", (error) => {
        if (error.code === "ENOENT") {
          reject(new Error(
            `Python command '${pythonCmd}' not found. ` +
            `Please install Python 3 and ensure it's in your PATH, ` +
            `or set PYTHON_COMMAND environment variable.`
          ));
        } else {
          reject(error);
        }
      });
    }
  });
}

/**
 * Analyze multiple frames and aggregate results
 * @param {Array<string>} framePaths - Array of frame file paths
 * @returns {Promise<Object>} Aggregated analysis results
 */
async function analyzeFrames(framePaths) {
  if (framePaths.length === 0) {
    return {
      status: "safe",
      score: 0,
      reason: "",
      detectedObjects: [],
      sensitiveFrameCount: 0,
      totalFrames: 0
    };
  }
  
  console.log(`🔍 Analyzing ${framePaths.length} frames with YOLO...`);
  
  const allDetections = [];
  const sensitiveDetections = [];
  let sensitiveFrameCount = 0;
  
  // Analyze each frame
  for (let i = 0; i < framePaths.length; i++) {
    try {
      const result = await analyzeFrame(framePaths[i]);
      
      if (result.error) {
        console.error(`   ⚠️  Frame ${i + 1} analysis error:`, result.error);
        continue;
      }
      
      if (result.detections) {
        allDetections.push(...result.detections);
      }
      
      if (result.sensitive_detections && result.sensitive_detections.length > 0) {
        sensitiveDetections.push(...result.sensitive_detections);
        sensitiveFrameCount++;
      }
      
      console.log(`   ✅ Frame ${i + 1}/${framePaths.length} analyzed`);
    } catch (error) {
      console.error(`   ⚠️  Frame ${i + 1} failed:`, error.message);
      // Continue with other frames
    }
  }
  
  // Aggregate results
  const uniqueObjects = [...new Set(sensitiveDetections.map(d => d.label))];
  const sensitiveRatio = sensitiveFrameCount / framePaths.length;
  
  // Determine status
  let status = "safe";
  let score = 0;
  let reason = "";
  
  // Check for high-confidence weapon detections
  const weaponDetections = sensitiveDetections.filter(
    d => SENSITIVE_LABELS.includes(d.label) && d.confidence > 0.6
  );
  
  if (weaponDetections.length > 0) {
    // Multiple weapon detections or high confidence = flagged
    const maxConfidence = Math.max(...weaponDetections.map(d => d.confidence));
    const weaponCount = weaponDetections.length;
    
    // Threshold: 30% (0.3) for review, 70% (0.7) for flagged
    if (maxConfidence > 0.7 || weaponCount >= 2) {
      status = "flagged";
      score = Math.min(0.9, maxConfidence);
      reason = `Weapons detected: ${uniqueObjects.join(", ")} (${weaponCount} detections)`;
    } else if (maxConfidence > 0.3 || sensitiveRatio > 0.3) {
      status = "review";
      score = maxConfidence * 0.7;
      reason = `Potential sensitive content: ${uniqueObjects.join(", ")}`;
    }
  } else if (sensitiveRatio > 0.3) {
    // High ratio of sensitive frames but no weapons (threshold: 30%)
    status = "review";
    score = sensitiveRatio * 0.5;
    reason = `Multiple sensitive objects detected: ${uniqueObjects.join(", ")}`;
  }
  
  return {
    status,
    score,
    reason,
    detectedObjects: uniqueObjects,
    sensitiveFrameCount,
    totalFrames: framePaths.length,
    allDetections: allDetections.slice(0, 20) // Limit to first 20 for storage
  };
}

module.exports = {
  analyzeFrame,
  analyzeFrames,
  isPythonServiceAvailable
};

