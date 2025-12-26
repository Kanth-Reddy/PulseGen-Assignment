"""
YOLO Content Moderation Service
Analyzes video frames for sensitive objects (weapons, violence-related items)
"""

from ultralytics import YOLO
import cv2
import sys
import json
import os
import warnings

# Suppress warnings and download progress
warnings.filterwarnings("ignore")
os.environ["YOLO_VERBOSE"] = "False"

# Load YOLO model (will download automatically on first run)
# Redirect stdout temporarily to suppress download messages
import io
from contextlib import redirect_stdout

# Load model with verbose=False to suppress download progress
model = YOLO("yolov8n.pt")

# Sensitive object labels that YOLO can detect (weapons only)
SENSITIVE_LABELS = [
    "knife",
    "gun",
    "pistol",
    "rifle"
]

def analyze_frame(image_path):
    """
    Analyze a single frame for sensitive objects
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of detections with label and confidence
    """
    if not os.path.exists(image_path):
        return {"error": f"Image file not found: {image_path}"}
    
    try:
        # Run YOLO inference with verbose=False to suppress output
        # Capture any stdout to prevent progress messages from interfering
        f = io.StringIO()
        with redirect_stdout(f):
            results = model(image_path, verbose=False)
        detections = []
        
        for r in results:
            for box in r.boxes:
                # Get class label
                class_id = int(box.cls)
                label = model.names[class_id]
                confidence = float(box.conf)
                
                # Only include detections with confidence > 0.5
                if confidence > 0.5:
                    detections.append({
                        "label": label,
                        "confidence": round(confidence, 3),
                        "bbox": {
                            "x1": float(box.xyxy[0][0]),
                            "y1": float(box.xyxy[0][1]),
                            "x2": float(box.xyxy[0][2]),
                            "y2": float(box.xyxy[0][3])
                        }
                    })
        
        return {
            "detections": detections,
            "sensitive_detections": [
                d for d in detections 
                if d["label"] in SENSITIVE_LABELS
            ]
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path required"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = analyze_frame(image_path)
    print(json.dumps(result))

