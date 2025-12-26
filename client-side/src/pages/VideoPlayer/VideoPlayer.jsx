import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/api/videos/${videoId}`);
      setVideo(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setError("This video is not available for viewing");
      } else {
        setError("Failed to load video");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      await api.delete(`/api/videos/${videoId}`);
      navigate("/videos");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error || "Video not found"}</p>
          <button onClick={() => navigate("/videos")} style={styles.backBtn}>
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/videos")} style={styles.backBtn}>
          ← Back
        </button>
        {(user?.role === "admin" ||
          (user?.role === "editor" && 
           (video.uploadedBy?._id?.toString() === user.userId || 
            video.uploadedBy?.toString() === user.userId))) && (
          <button onClick={handleDelete} style={styles.deleteBtn}>
            Delete Video
          </button>
        )}
      </div>

      <div style={styles.videoContainer}>
        <video
          src={video.videoUrl}
          controls
          style={styles.video}
          autoPlay
        />
      </div>

      <div style={styles.info}>
        <h2 style={styles.title}>{video.originalName}</h2>
        <div style={styles.meta}>
          <p style={styles.metaItem}>
            <strong>Uploaded by:</strong> {video.uploadedBy?.username || "Unknown"}
          </p>
          <p style={styles.metaItem}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  video.sensitivityStatus === "safe"
                    ? "#00ff88"
                    : video.sensitivityStatus === "flagged"
                    ? "#ff3366"
                    : "#ffc107"
              }}
            >
              {video.sensitivityStatus.toUpperCase()}
            </span>
          </p>
          {video.sensitivityReason && (
            <p style={styles.metaItem}>
              <strong>Reason:</strong> {video.sensitivityReason}
            </p>
          )}
          <p style={styles.metaItem}>
            <strong>Uploaded:</strong>{" "}
            {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px"
  },
  backBtn: {
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00f3ff",
    border: "1px solid rgba(0, 183, 255, 0.5)",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1rem"
  },
  deleteBtn: {
    background: "linear-gradient(135deg, #ff3366 0%, #cc0044 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1rem",
    boxShadow: "0 0 10px rgba(255, 51, 102, 0.5)"
  },
  videoContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    boxShadow: "0 0 20px rgba(0, 183, 255, 0.2)"
  },
  video: {
    width: "100%",
    maxHeight: "70vh",
    borderRadius: "5px"
  },
  info: {
    backgroundColor: "rgba(0, 183, 255, 0.1)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: "10px",
    padding: "30px"
  },
  title: {
    color: "#00f3ff",
    fontSize: "2rem",
    marginBottom: "20px",
    textShadow: "0 0 10px rgba(0, 183, 255, 0.8)"
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  metaItem: {
    color: "#aaa",
    fontSize: "1rem"
  },
  loading: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "1.2rem"
  },
  errorBox: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    border: "1px solid rgba(255, 51, 102, 0.3)",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center"
  },
  errorText: {
    color: "#ff3366",
    fontSize: "1.2rem",
    marginBottom: "20px"
  }
};

export default VideoPlayer;

