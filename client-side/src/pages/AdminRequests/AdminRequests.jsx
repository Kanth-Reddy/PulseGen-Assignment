import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function AdminRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/api/access/all");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.post(`/api/access/approve/${requestId}`);
      setMessage("Request approved successfully");
      fetchRequests(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/access/reject/${requestId}`);
      setMessage("Request rejected successfully");
      fetchRequests(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reject request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "approved":
        return "#00ff00";
      case "rejected":
        return "#ff3366";
      default:
        return "#aaa";
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Editor Access Requests</h2>
        <p style={styles.subtitle}>
          Manage viewer requests for editor access
        </p>
      </div>

      {message && (
        <div style={styles.messageBox}>
          <p style={styles.message}>{message}</p>
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Loading requests...</p>
      ) : pendingRequests.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No pending requests</p>
        </div>
      ) : (
        <div style={styles.requestsList}>
          {pendingRequests.map((request) => (
            <div key={request._id} style={styles.requestCard}>
              <div style={styles.requestInfo}>
                <h3 style={styles.username}>{request.username}</h3>
                <p style={styles.email}>{request.email}</p>
                <p style={styles.date}>
                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => handleApprove(request._id)}
                  style={styles.approveBtn}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  style={styles.rejectBtn}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div style={styles.allRequests}>
          <h3 style={styles.sectionTitle}>All Requests</h3>
          <div style={styles.requestsList}>
            {requests.map((request) => (
              <div key={request._id} style={styles.requestCard}>
                <div style={styles.requestInfo}>
                  <h3 style={styles.username}>{request.username}</h3>
                  <p style={styles.email}>{request.email}</p>
                  <p style={styles.date}>
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.reviewedAt && (
                    <p style={styles.date}>
                      Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div style={styles.statusBadge}>
                  <span
                    style={{
                      ...styles.statusText,
                      color: getStatusColor(request.status)
                    }}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    marginBottom: "30px",
    textAlign: "center"
  },
  title: {
    color: "#ff3366",
    fontSize: "2.5rem",
    marginBottom: "10px",
    textShadow: "0 0 10px rgba(255, 51, 102, 0.8)"
  },
  subtitle: {
    color: "#aaa",
    fontSize: "1.1rem"
  },
  messageBox: {
    backgroundColor: "rgba(0, 183, 255, 0.1)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: "5px",
    padding: "15px",
    marginBottom: "20px",
    textAlign: "center"
  },
  message: {
    color: "#00f3ff",
    margin: 0
  },
  loading: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "1.2rem"
  },
  emptyBox: {
    backgroundColor: "rgba(255, 51, 102, 0.05)",
    border: "1px solid rgba(255, 51, 102, 0.2)",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center"
  },
  emptyText: {
    color: "#aaa",
    fontSize: "1.2rem"
  },
  requestsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "40px"
  },
  requestCard: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    border: "1px solid rgba(255, 51, 102, 0.3)",
    borderRadius: "10px",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 0 15px rgba(255, 51, 102, 0.2)"
  },
  requestInfo: {
    flex: 1
  },
  username: {
    color: "#ff3366",
    fontSize: "1.5rem",
    marginBottom: "8px",
    textShadow: "0 0 5px rgba(255, 51, 102, 0.5)"
  },
  email: {
    color: "#aaa",
    marginBottom: "5px"
  },
  date: {
    color: "#888",
    fontSize: "0.9rem",
    marginBottom: "5px"
  },
  actions: {
    display: "flex",
    gap: "15px"
  },
  approveBtn: {
    background: "linear-gradient(135deg, #00ff00 0%, #00cc00 100%)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: "0 0 15px rgba(0, 255, 0, 0.5)",
    transition: "all 0.3s ease"
  },
  rejectBtn: {
    background: "linear-gradient(135deg, #ff3366 0%, #cc0044 100%)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: "0 0 15px rgba(255, 51, 102, 0.5)",
    transition: "all 0.3s ease"
  },
  allRequests: {
    marginTop: "40px"
  },
  sectionTitle: {
    color: "#ff3366",
    fontSize: "1.8rem",
    marginBottom: "20px",
    textShadow: "0 0 5px rgba(255, 51, 102, 0.5)"
  },
  statusBadge: {
    padding: "10px 20px",
    borderRadius: "5px",
    backgroundColor: "rgba(255, 51, 102, 0.1)"
  },
  statusText: {
    fontWeight: "bold",
    fontSize: "0.9rem"
  }
};

export default AdminRequests;

