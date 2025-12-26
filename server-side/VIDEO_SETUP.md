# Video Upload System Setup

## Cloudinary Configuration

The system uses Cloudinary for video storage. Credentials are already configured in `config/cloudinary.js`:

- **API Key**: 313146379662928
- **API Secret**: zkw_vaGdb4VOdWD8DmOz0IeMS9A

To use your own Cloudinary account, update `server-side/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Google Vision API Setup

The system uses Google Vision API for content moderation. The service account JSON file is located at:
`server-side/pulsegen-content-moderation-b89f90e594c9.json`

Make sure this file exists and has proper permissions.

## Features

### Upload Progress Tracking
- **10%** - Upload started
- **25%** - Video stored in Cloudinary
- **60%** - Sensitivity analysis running
- **90%** - Video optimized for streaming
- **100%** - Processing completed

### Role-Based Access

**Viewer:**
- Can view videos (only safe ones)
- Cannot upload videos
- Cannot delete videos

**Editor:**
- Can upload videos
- Can delete own videos only
- Receives error message if content is flagged
- Can see all videos (including flagged ones)

**Admin:**
- Can upload videos
- Can delete any video
- Can see all videos (including flagged ones)
- Full access to video management

### Content Moderation

Videos are analyzed using Google Vision API:
- Extracts frames at 0s, 5s, 10s, 15s, 20s, 25s, 30s
- Analyzes each frame for:
  - Adult content
  - Violence
  - Racy content
  - Medical content
  - Spoof content

**Status Levels:**
- **Safe** - No sensitive content detected
- **Review** - Needs manual review (score 0.5-0.7)
- **Flagged** - Sensitive content found (score ≥ 0.7)

**Flagged videos:**
- Not visible to viewers
- Visible to admin
- Editor sees error message with reason

## API Endpoints

- `POST /api/videos/upload` - Upload video (Editor/Admin only)
- `GET /api/videos/all` - Get all videos (role-based)
- `GET /api/videos/:videoId` - Get single video
- `DELETE /api/videos/:videoId` - Delete video (Editor own/Admin any)
- `GET /api/videos/status/:videoId` - Get upload/processing status

## Frontend Routes

- `/videos` - Video gallery
- `/videos/upload` - Upload video (Editor/Admin)
- `/videos/:videoId` - Video player page

