# YOLO Content Moderation Setup Guide

This guide will help you set up YOLO-based content moderation for video analysis.

## 🎯 Overview

The system uses YOLOv8 to detect sensitive objects (weapons, violence-related items) in video frames extracted from Cloudinary videos.

## 📋 Prerequisites

1. **Python 3.8+** installed on your system
2. **Node.js** (already installed)
3. **Cloudinary account** (already configured)

## 🚀 Setup Steps

### Step 1: Install Python Dependencies

Navigate to the `yolo_service` directory and install dependencies:

```bash
cd yolo_service
pip install -r requirements.txt
```

**Note:** On first run, YOLOv8 will automatically download the model file (`yolov8n.pt`, ~6MB).

### Step 2: Verify Python Installation

Test the YOLO service:

```bash
# Make sure you're in yolo_service directory
python app.py path/to/test/image.jpg
```

You should see JSON output with detections.

### Step 3: Configure Python Command (if needed)

If your Python command is `python` instead of `python3`, you can set an environment variable:

**Windows (PowerShell):**
```powershell
$env:PYTHON_COMMAND="python"
```

**Linux/Mac:**
```bash
export PYTHON_COMMAND="python"
```

Or update `server-side/utils/yoloService.js` line 8:
```javascript
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || "python";
```

### Step 4: Test the Integration

1. Start your Node.js server:
   ```bash
   cd server-side
   npm start
   ```

2. Upload a video through the frontend
3. Check server logs for:
   - Frame extraction messages
   - YOLO analysis progress
   - Detection results

## 🔍 How It Works

1. **Video Upload** → Cloudinary stores the video
2. **Frame Extraction** → Extract frames every 3 seconds (max 10 frames)
3. **YOLO Analysis** → Python service analyzes each frame
4. **Aggregation** → Node.js aggregates results across frames
5. **Status Determination**:
   - **Flagged**: Weapons detected with confidence > 70% or multiple detections
   - **Review**: Potential sensitive content (confidence > 50%)
   - **Safe**: No sensitive objects detected

## 📊 Detected Objects

YOLO can detect:
- ✅ Weapons: knife, gun, pistol, rifle
- ✅ Alcohol: bottle
- ✅ People: person (used in combination with weapons)

**Note:** YOLO does NOT detect NSFW/nudity. For that, you would need specialized models.

## 🐛 Troubleshooting

### Error: "Python command 'python3' not found"

**Solution:** Set `PYTHON_COMMAND` environment variable or update `yoloService.js`:
```javascript
const PYTHON_COMMAND = "python"; // Change to your Python command
```

### Error: "YOLO service not found"

**Solution:** Ensure `yolo_service/app.py` exists in the project root (same level as `server-side`).

### Error: "ModuleNotFoundError: No module named 'ultralytics'"

**Solution:** Install Python dependencies:
```bash
cd yolo_service
pip install -r requirements.txt
```

### Frames not extracting

**Solution:** 
- Check Cloudinary configuration
- Verify video URL is accessible
- Check `temp_frames` directory is created (auto-created on first run)

### Analysis taking too long

**Solution:** 
- Reduce number of frames (modify `extractFrames` call in `videos.js`)
- Use smaller frame resolution (modify in `frameExtractor.js`)

## 📁 Project Structure

```
pulseGen/
├── yolo_service/
│   ├── app.py              # Python YOLO service
│   ├── requirements.txt    # Python dependencies
│   └── README.md
├── server-side/
│   ├── utils/
│   │   ├── frameExtractor.js  # Frame extraction from Cloudinary
│   │   └── yoloService.js      # Node-Python communication
│   ├── routes/
│   │   └── videos.js           # Video upload route (uses YOLO)
│   └── models/
│       └── Video.js            # Video schema (includes YOLO fields)
└── temp_frames/            # Temporary frame storage (auto-created)
```

## 🎓 Interview Explanation

**"We implemented sensitivity detection using a YOLO-based object detection pipeline. Video frames are sampled at regular intervals and analyzed for restricted objects like weapons. Results are aggregated across frames to determine whether a video should be flagged for review. This approach provides explainable AI results without relying on cloud billing."**

## ⚠️ Important Notes

1. **YOLO ≠ NSFW Detection**: YOLO detects objects, not explicit content. For NSFW, you'd need specialized models.

2. **Performance**: First analysis may be slower as YOLO model downloads. Subsequent analyses are faster.

3. **Storage**: Temporary frames are stored in `temp_frames/` and automatically cleaned up after analysis.

4. **Offline Capable**: Once Python dependencies are installed, the system works offline (no cloud API needed).

## ✅ Next Steps

1. Install Python dependencies
2. Test with a sample video
3. Monitor server logs for analysis results
4. Adjust sensitivity thresholds in `yoloService.js` if needed

