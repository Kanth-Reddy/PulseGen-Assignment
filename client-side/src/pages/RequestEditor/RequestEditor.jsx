import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function RequestEditor() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canRequestAfter, setCanRequestAfter] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    checkRequestStatus();
  }, []);

  useEffect(() => {
    let interval = null;
    if (canRequestAfter) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const after = new Date(canRequestAfter).getTime();
        const remaining = after - now;

        if (remaining <= 0) {
          setTimeRemaining(null);
          setCanRequestAfter(null);
          checkRequestStatus();
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [canRequestAfter]);

  const checkRequestStatus = async () => {
    try {
      const response = await api.get("/api/access/my-request");
      // Only set status if there's an actual request and user is a viewer
      if (response.data && response.data.status && user?.role === "viewer") {
        setRequestStatus(response.data.status);
        setCanRequestAfter(response.data.canRequestAfter || null);
      } else {
        // Clear status if no request or user is not a viewer
        setRequestStatus(null);
        setCanRequestAfter(null);
      }
    } catch (error) {
      console.error("Error checking request status:", error);
      setRequestStatus(null);
    }
  };

  const handleRequest = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/api/access/request");
      setMessage(response.data.message);
      setRequestStatus("pending");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to send request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Request Editor Access</h2>
        <p style={styles.description}>
          As a viewer, you can request editor access to get more permissions.
        </p>

        {requestStatus === "pending" && (
          <div style={styles.statusBox}>
            <p style={styles.statusText}>⏳ Your request is pending approval</p>
          </div>
        )}

        {requestStatus === "approved" && (
          <div style={styles.statusBoxApproved}>
            <p style={styles.statusTextApproved}>✅ Your request has been approved!</p>
            <p style={styles.statusSubtext}>You now have editor access.</p>
          </div>
        )}

        {requestStatus === "rejected" && (
          <div style={styles.statusBoxRejected}>
            <p style={styles.statusTextRejected}>❌ Your request has been rejected</p>
            {timeRemaining ? (
              <p style={styles.statusSubtext}>
                You can request again in: <strong style={{color: "#ff3366"}}>{timeRemaining}</strong>
              </p>
            ) : (
              <p style={styles.statusSubtext}>You can now request again.</p>
            )}
          </div>
        )}

        {(!requestStatus || (requestStatus === "rejected" && !timeRemaining)) && (
          <button
            onClick={handleRequest}
            disabled={loading || (requestStatus === "rejected" && timeRemaining)}
            style={{
              ...styles.requestBtn,
              opacity: (requestStatus === "rejected" && timeRemaining) ? 0.5 : 1,
              cursor: (requestStatus === "rejected" && timeRemaining) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Sending Request..." : "Request Editor Access"}
          </button>
        )}

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("success") ? "#00f3ff" : "#ff3366"
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Orbitron', sans-serif"
  },
  card: {
    backgroundColor: "rgba(0, 183, 255, 0.1)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: "10px",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 0 20px rgba(0, 183, 255, 0.2)",
    textAlign: "center"
  },
  title: {
    color: "#00f3ff",
    fontSize: "2rem",
    marginBottom: "10px",
    textShadow: "0 0 10px rgba(0, 183, 255, 0.8)"
  },
  description: {
    color: "#aaa",
    marginBottom: "30px",
    lineHeight: "1.6"
  },
  requestBtn: {
    background: "linear-gradient(135deg, #00b7ff 0%, #0088cc 100%)",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    boxShadow: "0 0 15px rgba(0, 183, 255, 0.5)",
    transition: "all 0.3s ease",
    width: "100%"
  },
  statusBox: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    border: "1px solid rgba(255, 193, 7, 0.5)",
    borderRadius: "5px",
    padding: "20px",
    marginBottom: "20px"
  },
  statusBoxApproved: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    border: "1px solid rgba(0, 255, 0, 0.5)",
    borderRadius: "5px",
    padding: "20px",
    marginBottom: "20px"
  },
  statusBoxRejected: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    border: "1px solid rgba(255, 51, 102, 0.5)",
    borderRadius: "5px",
    padding: "20px",
    marginBottom: "20px"
  },
  statusText: {
    color: "#ffc107",
    fontSize: "1.1rem",
    fontWeight: "bold",
    margin: 0
  },
  statusTextApproved: {
    color: "#00ff00",
    fontSize: "1.1rem",
    fontWeight: "bold",
    margin: 0
  },
  statusTextRejected: {
    color: "#ff3366",
    fontSize: "1.1rem",
    fontWeight: "bold",
    margin: 0
  },
  statusSubtext: {
    color: "#aaa",
    fontSize: "0.9rem",
    marginTop: "10px",
    margin: "10px 0 0 0"
  },
  message: {
    marginTop: "20px",
    fontSize: "0.9rem"
  }
};

export default RequestEditor;

