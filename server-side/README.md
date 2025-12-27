# YOLO Content Moderation Service

Python microservice for analyzing video frames using YOLOv8 for sensitive content detection.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **First run will download YOLOv8n model automatically** (~6MB)

## Usage

### Command Line:
```bash
python app.py path/to/image.jpg
```

### Output:
JSON with detections:
```json
{
  "detections": [
    {
      "label": "knife",
      "confidence": 0.87,
      "bbox": {"x1": 100, "y1": 200, "x2": 150, "y2": 250}
    }
  ],
  "sensitive_detections": [...]
}
```

## Detected Objects

- Weapons: knife, gun, pistol, rifle
- Alcohol: bottle
- People: person (used in combination with weapons)

## Integration

This service is called by Node.js backend via child process or HTTP API.

