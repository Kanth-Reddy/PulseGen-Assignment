import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function VideoUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) {
        setMessage("File size must be less than 500MB");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    console.log("\n📹 ========== FRONTEND: VIDEO UPLOAD STARTED ==========");
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`User: ${user?.username} (${user?.role})`);
    
    if (!file) {
      console.error("❌ No file selected");
      setMessage("Please select a video file");
      return;
    }

    console.log(`✅ File selected: ${file.name}`);
    console.log(`   Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Type: ${file.type}`);

    setUploading(true);
    setMessage("");
    setUploadProgress(0);
    setUploadStatus("Upload started");

    const formData = new FormData();
    formData.append("video", file);
    console.log("📦 FormData created, appending file...");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 10) return 10;
          if (prev < 25) return 25;
          if (prev < 60) return 60;
          if (prev < 90) return 90;
          return prev;
        });
      }, 500);

      setUploadStatus("Upload started");
      setUploadProgress(10);
      console.log("🚀 Sending POST request to /api/videos/upload...");

      const response = await api.post("/api/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`   Upload progress: ${percentCompleted}%`);
          if (percentCompleted >= 25) {
            setUploadProgress(25);
            setUploadStatus("Video stored");
          }
        }
      });

      console.log("✅ Upload request successful!");
      console.log("   Response data:", response.data);
      clearInterval(progressInterval);
      setUploadProgress(60);
      setUploadStatus("Sensitivity analysis running");

      // Poll for completion
      const videoId = response.data.video._id;
      console.log(`⏳ Polling for video status (ID: ${videoId})...`);
      const statusInterval = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/api/videos/status/${videoId}`);
          const { uploadStatus, sensitivityStatus, sensitivityReason } = statusResponse.data;
          console.log(`   Status check: ${uploadStatus}, Sensitivity: ${sensitivityStatus}`);

          if (uploadStatus === "completed") {
            setUploadProgress(90);
            setUploadStatus("Video optimized for streaming");

            setTimeout(() => {
              setUploadProgress(100);
              setUploadStatus("Processing completed");
              clearInterval(statusInterval);
              console.log("✅ Video processing completed!");
              console.log("   Final status:", sensitivityStatus);
              console.log("===========================================\n");

              if (sensitivityStatus === "flagged") {
                if (user?.role === "editor") {
                  setMessage(`❌ Sensitive content found: ${sensitivityReason}. Your video has been flagged and is not visible to viewers.`);
                } else {
                  setMessage(`⚠️ Sensitive content found: ${sensitivityReason}. Video is not visible to viewers.`);
                }
              } else {
                setMessage("✅ Video uploaded successfully!");
              }
              setUploading(false);
              setFile(null);
            }, 1000);
          }
        } catch (error) {
          console.error("❌ Status check error:");
          console.error("   Error:", error.message);
          console.error("   Response:", error.response?.data);
        }
      }, 2000);

    } catch (error) {
      console.error("\n❌ FRONTEND: UPLOAD ERROR:");
      console.error("   Error message:", error.message);
      console.error("   Error code:", error.code);
      console.error("   Error name:", error.name);
      
      if (error.response) {
        console.error("   Response status:", error.response.status);
        console.error("   Response data:", error.response.data);
        console.error("   Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("   No response received");
        console.error("   Request:", error.request);
      }
      
      console.error("   Full error:", error);
      console.log("===========================================\n");
      
      setUploading(false);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("sensitive")) {
          setMessage(`❌ ${error.response.data.message}`);
        } else {
          setMessage(`❌ ${error.response.data.message}`);
        }
      } else if (error.response?.data?.error) {
        setMessage(`❌ ${error.response.data.error}`);
      } else {
        setMessage(`❌ Upload failed: ${error.message || "Please try again."}`);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload Video</h2>
        <p style={styles.description}>
          Upload videos to share with the community
        </p>

        <div style={styles.uploadArea}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={styles.fileInput}
            id="video-upload"
          />
          <label htmlFor="video-upload" style={styles.fileLabel}>
            {file ? file.name : "Choose Video File"}
          </label>
        </div>

        {file && (
          <div style={styles.fileInfo}>
            <p>File: {file.name}</p>
            <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}

        {uploading && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${uploadProgress}%`
                }}
              />
            </div>
            <p style={styles.progressText}>
              {uploadStatus} – {uploadProgress}%
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            ...styles.uploadBtn,
            opacity: (!file || uploading) ? 0.5 : 1,
            cursor: (!file || uploading) ? "not-allowed" : "pointer"
          }}
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("✅") ? "#00ff88" : message.includes("⚠️") ? "#ffc107" : "#ff3366"
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "'Orbitron', sans-serif",
    color: "#fff"
  },
  card: {
    backgroundColor: "rgba(0, 183, 255, 0.1)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: "10px",
    padding: "40px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 0 20px rgba(0, 183, 255, 0.2)"
  },
  title: {
    color: "#00f3ff",
    fontSize: "2rem",
    marginBottom: "10px",
    textShadow: "0 0 10px rgba(0, 183, 255, 0.8)"
  },
  description: {
    color: "#aaa",
    marginBottom: "30px"
  },
  uploadArea: {
    marginBottom: "20px"
  },
  fileInput: {
    display: "none"
  },
  fileLabel: {
    display: "block",
    padding: "15px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    border: "2px dashed rgba(0, 183, 255, 0.5)",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    color: "#00b7ff",
    transition: "all 0.3s ease"
  },
  fileInfo: {
    backgroundColor: "rgba(0, 183, 255, 0.05)",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    color: "#aaa",
    fontSize: "0.9rem"
  },
  progressContainer: {
    marginBottom: "20px"
  },
  progressBar: {
    width: "100%",
    height: "30px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "5px",
    overflow: "hidden",
    border: "1px solid rgba(0, 183, 255, 0.3)"
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00b7ff 0%, #00f3ff 100%)",
    transition: "width 0.3s ease",
    boxShadow: "0 0 10px rgba(0, 183, 255, 0.8)"
  },
  progressText: {
    marginTop: "10px",
    textAlign: "center",
    color: "#00f3ff",
    fontSize: "0.9rem"
  },
  uploadBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #00b7ff 0%, #0088cc 100%)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: "0 0 15px rgba(0, 183, 255, 0.5)",
    transition: "all 0.3s ease"
  },
  message: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "0.9rem",
    fontWeight: "bold"
  }
};

export default VideoUpload;

