import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage/AuthPage";
import RoleBasedDashboard from "./components/RoleBasedDashboard/RoleBasedDashboard";
import RequestEditor from "./pages/RequestEditor/RequestEditor";
import AdminRequests from "./pages/AdminRequests/AdminRequests";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import VideoGallery from "./pages/VideoGallery/VideoGallery";
import VideoUpload from "./pages/VideoUpload/VideoUpload";
import VideoPlayer from "./pages/VideoPlayer/VideoPlayer";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/request-editor"
              element={
                <PrivateRoute>
                  <RequestEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequests />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <PrivateRoute>
                  <VideoGallery />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos/upload"
              element={
                <PrivateRoute>
                  <VideoUpload />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos/:videoId"
              element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;