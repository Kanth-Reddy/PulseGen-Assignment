import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminDashboard() {
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
      <style>{`
        .admin-manage-btn:hover {
          background: rgba(255, 51, 102, 0.4) !important;
          box-shadow: 0 0 15px rgba(255, 51, 102, 0.6) !important;
          transform: translateY(-2px);
        }
        .admin-upload-btn:hover {
          box-shadow: 0 0 25px rgba(0, 183, 255, 0.8) !important;
          transform: translateY(-2px);
        }
        .admin-logout-btn:hover {
          box-shadow: 0 0 25px rgba(255, 51, 102, 0.8) !important;
          transform: translateY(-2px);
        }
        .admin-video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 25px rgba(255, 51, 102, 0.4) !important;
        }
        .admin-delete-btn:hover {
          box-shadow: 0 0 15px rgba(255, 51, 102, 0.8) !important;
          transform: translateY(-2px);
        }
      `}</style>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>MediaX - ADMIN PANEL</h1>
        <div style={styles.userInfo}>
          <span style={styles.adminBadge}>ADMIN: {user?.username}</span>
          <button
            onClick={() => navigate("/admin/users")}
            style={styles.manageBtn}
            className="admin-manage-btn"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate("/admin/requests")}
            style={styles.manageBtn}
            className="admin-manage-btn"
          >
            Access Requests
          </button>
          <button
            onClick={() => navigate("/videos/upload")}
            style={styles.uploadBtn}
            className="admin-upload-btn"
          >
            + Upload Video
          </button>
          <button 
            onClick={handleLogout} 
            style={styles.logoutBtn}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Dashboard</h2>
          <p style={styles.subtitle}>Manage videos, users, and access requests</p>
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
            {videos.map((video) => (
              <div key={video._id} style={styles.videoCard} className="admin-video-card">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video._id);
                    }}
                    style={styles.deleteBtn}
                    className="admin-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ff3366',
    boxShadow: '0 0 20px rgba(255, 51, 102, 0.4)'
  },
  logo: {
    color: '#ff3366',
    fontSize: '1.8rem',
    textShadow: '0 0 10px rgba(255, 51, 102, 0.8)',
    letterSpacing: '3px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  adminBadge: {
    color: '#ff3366',
    fontWeight: 'bold',
    fontSize: '1rem',
    textShadow: '0 0 5px rgba(255, 51, 102, 0.8)',
    padding: '8px 16px',
    border: '1px solid rgba(255, 51, 102, 0.5)',
    borderRadius: '5px',
    backgroundColor: 'rgba(255, 51, 102, 0.1)'
  },
  manageBtn: {
    background: 'rgba(255, 51, 102, 0.2)',
    color: '#ff3366',
    border: '1px solid rgba(255, 51, 102, 0.5)',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    textShadow: '0 0 5px rgba(255, 51, 102, 0.5)'
  },
  uploadBtn: {
    background: 'linear-gradient(135deg, #00b7ff 0%, #0088cc 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: '0 0 15px rgba(0, 183, 255, 0.5)',
    transition: 'all 0.3s ease'
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
    marginBottom: '30px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    color: '#ff3366',
    textShadow: '0 0 10px rgba(255, 51, 102, 0.8)',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#aaa',
    fontSize: '1.1rem'
  },
  messageBox: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    border: '1px solid rgba(255, 51, 102, 0.3)',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  message: {
    color: '#ff3366',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '1.2rem'
  },
  emptyBox: {
    backgroundColor: 'rgba(255, 51, 102, 0.05)',
    border: '1px solid rgba(255, 51, 102, 0.2)',
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
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    border: '1px solid rgba(255, 51, 102, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 15px rgba(255, 51, 102, 0.2)',
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
    color: '#ff3366',
    textShadow: '0 0 10px rgba(255, 51, 102, 0.8)'
  },
  videoInfo: {
    padding: '20px'
  },
  videoTitle: {
    color: '#ff3366',
    fontSize: '1.2rem',
    marginBottom: '10px',
    textShadow: '0 0 5px rgba(255, 51, 102, 0.5)'
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

export default AdminDashboard;

