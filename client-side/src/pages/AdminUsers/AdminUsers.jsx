import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/all");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to remove admin access from ${username}?`)) {
      return;
    }

    try {
      await api.post(`/api/users/remove-admin/${userId}`);
      setMessage(`Admin access removed from ${username}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove admin access");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.post(`/api/users/update-role/${userId}`, { role: newRole });
      setMessage("User role updated successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update role");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#ff3366";
      case "editor":
        return "#00ff88";
      case "viewer":
        return "#00b7ff";
      default:
        return "#aaa";
    }
  };

  const adminUsers = users.filter((u) => u.role === "admin");

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>User Management</h2>
        <p style={styles.subtitle}>Manage users and their roles</p>
      </div>

      {message && (
        <div style={styles.messageBox}>
          <p style={styles.message}>{message}</p>
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Loading users...</p>
      ) : (
        <>
          {adminUsers.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Admin Users</h3>
              <div style={styles.usersList}>
                {adminUsers.map((user) => (
                  <div key={user._id} style={styles.userCard}>
                    <div style={styles.userInfo}>
                      <h3 style={styles.username}>{user.username}</h3>
                      <p style={styles.email}>{user.email}</p>
                      <span
                        style={{
                          ...styles.roleBadge,
                          color: getRoleColor(user.role),
                          borderColor: getRoleColor(user.role)
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div style={styles.actions}>
                      {user._id !== currentUser?._id && (
                        <button
                          onClick={() => handleRemoveAdmin(user._id, user.username)}
                          style={styles.removeBtn}
                        >
                          Remove Admin
                        </button>
                      )}
                      {user._id === currentUser?._id && (
                        <span style={styles.currentUser}>Current User</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>All Users</h3>
            <div style={styles.usersList}>
              {users.map((user) => (
                <div key={user._id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <h3 style={styles.username}>{user.username}</h3>
                    <p style={styles.email}>{user.email}</p>
                    <p style={styles.date}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <span
                      style={{
                        ...styles.roleBadge,
                        color: getRoleColor(user.role),
                        borderColor: getRoleColor(user.role)
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      disabled={user._id === currentUser?._id && user.role === "admin"}
                      style={styles.roleSelect}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
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
  section: {
    marginBottom: "40px"
  },
  sectionTitle: {
    color: "#ff3366",
    fontSize: "1.8rem",
    marginBottom: "20px",
    textShadow: "0 0 5px rgba(255, 51, 102, 0.5)"
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  userCard: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    border: "1px solid rgba(255, 51, 102, 0.3)",
    borderRadius: "10px",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 0 15px rgba(255, 51, 102, 0.2)"
  },
  userInfo: {
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
    marginBottom: "10px"
  },
  roleBadge: {
    display: "inline-block",
    padding: "5px 15px",
    borderRadius: "5px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    border: "1px solid",
    backgroundColor: "rgba(255, 51, 102, 0.1)"
  },
  actions: {
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },
  removeBtn: {
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
  roleSelect: {
    background: "rgba(255, 51, 102, 0.1)",
    color: "#fff",
    border: "1px solid rgba(255, 51, 102, 0.5)",
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "1rem",
    fontFamily: "'Orbitron', sans-serif",
    cursor: "pointer"
  },
  currentUser: {
    color: "#aaa",
    fontSize: "0.9rem",
    fontStyle: "italic"
  }
};

export default AdminUsers;

