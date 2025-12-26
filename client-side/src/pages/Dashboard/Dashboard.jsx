import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get("/api/videos/all");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setMessage("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      await api.delete(`/api/videos/${videoId}`);
      setMessage("Video deleted successfully");
      fetchVideos();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete video");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "#00ff88";
      case "flagged":
        return "#ff3366";
      case "review":
        return "#ffc107";
      default:
        return "#00b7ff";
    }
  };

  return (
    <div style={styles.dashboard}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>MediaX</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.username}</span>
          {(user?.role === "editor" || user?.role === "admin") && (
            <button
              onClick={() => navigate("/videos/upload")}
              style={styles.uploadBtn}
            >
              + Upload Video
            </button>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Dashboard</h2>
          {user?.role === "viewer" && (
            <div style={styles.requestSection}>
              <p style={styles.requestText}>Want to become an editor?</p>
              <button
                onClick={() => navigate("/request-editor")}
                style={styles.requestBtn}
              >
                Request Editor Access
              </button>
            </div>
          )}
        </div>

        {message && (
          <div style={styles.messageBox}>
            <p style={styles.message}>{message}</p>
          </div>
        )}

        {loading ? (
          <p style={styles.loading}>Loading videos...</p>
        ) : videos.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No videos available</p>
          </div>
        ) : (
          <div style={styles.gallery}>
            {videos.map((video) => {
              // Hide flagged videos from viewers
              if (user?.role === "viewer" && video.sensitivityStatus === "flagged") {
                return null;
              }
              
              return (
                <div key={video._id} style={styles.videoCard}>
                  <div
                    style={styles.thumbnail}
                    onClick={() => navigate(`/videos/${video._id}`)}
                    onMouseEnter={(e) => {
                      const overlay = e.currentTarget.querySelector('.play-overlay');
                      if (overlay) overlay.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const overlay = e.currentTarget.querySelector('.play-overlay');
                      if (overlay) overlay.style.opacity = '0';
                    }}
                  >
                    <video
                      src={video.videoUrl}
                      style={styles.thumbnailVideo}
                      muted
                    />
                    <div className="play-overlay" style={styles.playOverlay}>
                      <span style={styles.playIcon}>▶</span>
                    </div>
                  </div>
                  <div style={styles.videoInfo}>
                    <h3 style={styles.videoTitle}>{video.originalName}</h3>
                    <p style={styles.uploader}>
                      By: {video.uploadedBy?.username || "Unknown"}
                    </p>
                    <div style={styles.meta}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: getStatusColor(video.sensitivityStatus),
                          borderColor: getStatusColor(video.sensitivityStatus)
                        }}
                      >
                        {video.sensitivityStatus.toUpperCase()}
                      </span>
                      {video.sensitivityStatus === "flagged" && (
                        <span style={styles.flaggedReason}>
                          {video.sensitivityReason}
                        </span>
                      )}
                    </div>
                    {(user?.role === "admin" ||
                      (user?.role === "editor" &&
                        (video.uploadedBy?._id?.toString() === user.userId || 
                         video.uploadedBy?.toString() === user.userId))) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video._id);
                        }}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: "'Orbitron', sans-serif"
  },
  navbar: {
    backgroundColor: 'rgba(0, 183, 255, 0.1)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #00b7ff',
    boxShadow: '0 0 20px rgba(0, 183, 255, 0.3)'
  },
  logo: {
    color: '#00f3ff',
    fontSize: '1.8rem',
    textShadow: '0 0 10px rgba(0, 183, 255, 0.8)',
    letterSpacing: '3px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ff3366 0%, #cc0044 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(255, 51, 102, 0.5)',
    transition: 'all 0.3s ease'
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    color: '#00f3ff',
    fontSize: '2rem',
    marginBottom: '20px',
    textShadow: '0 0 10px rgba(0, 183, 255, 0.8)'
  },
  uploadBtn: {
    background: 'linear-gradient(135deg, #00b7ff 0%, #0088cc 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: '0 0 15px rgba(0, 183, 255, 0.5)',
    transition: 'all 0.3s ease'
  },
  requestSection: {
    backgroundColor: 'rgba(0, 183, 255, 0.1)',
    border: '1px solid rgba(0, 183, 255, 0.3)',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '20px',
    textAlign: 'center'
  },
  requestText: {
    color: '#aaa',
    marginBottom: '15px',
    fontSize: '1rem'
  },
  requestBtn: {
    background: 'linear-gradient(135deg, #00b7ff 0%, #0088cc 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: '0 0 15px rgba(0, 183, 255, 0.5)',
    transition: 'all 0.3s ease'
  },
  messageBox: {
    backgroundColor: 'rgba(0, 183, 255, 0.1)',
    border: '1px solid rgba(0, 183, 255, 0.3)',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  message: {
    color: '#00f3ff',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '1.2rem'
  },
  emptyBox: {
    backgroundColor: 'rgba(0, 183, 255, 0.05)',
    border: '1px solid rgba(0, 183, 255, 0.2)',
    borderRadius: '10px',
    padding: '40px',
    textAlign: 'center'
  },
  emptyText: {
    color: '#aaa',
    fontSize: '1.2rem'
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '20px'
  },
  videoCard: {
    backgroundColor: 'rgba(0, 183, 255, 0.1)',
    border: '1px solid rgba(0, 183, 255, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 15px rgba(0, 183, 255, 0.2)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  thumbnail: {
    position: 'relative',
    width: '100%',
    height: '200px',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  playIcon: {
    fontSize: '3rem',
    color: '#00f3ff',
    textShadow: '0 0 10px rgba(0, 183, 255, 0.8)'
  },
  videoInfo: {
    padding: '20px'
  },
  videoTitle: {
    color: '#00f3ff',
    fontSize: '1.2rem',
    marginBottom: '10px',
    textShadow: '0 0 5px rgba(0, 183, 255, 0.5)'
  },
  uploader: {
    color: '#aaa',
    fontSize: '0.9rem',
    marginBottom: '10px'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '15px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    border: '1px solid',
    width: 'fit-content'
  },
  flaggedReason: {
    color: '#ff3366',
    fontSize: '0.85rem',
    fontStyle: 'italic'
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #ff3366 0%, #cc0044 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
    width: '100%'
  }
};

export default Dashboard;