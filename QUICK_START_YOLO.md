# 🚀 Quick Start: YOLO Content Moderation

## ⚡ Fast Setup (3 Steps)

### 1. Install Python Dependencies
```bash
cd yolo_service
pip install -r requirements.txt
```

### 2. Verify Python Command
Check if your system uses `python` or `python3`:
```bash
python --version
# or
python3 --version
```

If you use `python`, set environment variable (Windows PowerShell):
```powershell
$env:PYTHON_COMMAND="python"
```

Or update `server-side/utils/yoloService.js` line 8 to use `"python"` instead of `"python3"`.

### 3. Start Server & Test
```bash
cd server-side
npm start
```

Upload a video through the frontend and check server logs for YOLO analysis results!

## 📊 What Gets Detected?

- ✅ **Weapons**: knife, gun, pistol, rifle
- ✅ **Alcohol**: bottle
- ✅ **People**: person (combined with weapons = high risk)

## 🎯 How It Works

1. Video uploaded → Cloudinary
2. Frames extracted (every 3 seconds, max 10 frames)
3. YOLO analyzes each frame
4. Results aggregated → Status: `safe`, `review`, or `flagged`

## ⚠️ Troubleshooting

**"Python command not found"**
- Set `PYTHON_COMMAND` environment variable
- Or edit `server-side/utils/yoloService.js`

**"YOLO service not found"**
- Ensure `yolo_service/app.py` exists at project root

**"ModuleNotFoundError"**
- Run: `cd yolo_service && pip install -r requirements.txt`

For detailed setup, see `YOLO_SETUP.md`

