import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FileManager from "./pages/FileManager";
import ProtectedRoute from "./components/ProtectedRoute";
import { FileManagerProvider } from "./context/FileManagerContext";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <FileManagerProvider>
                <FileManager />
              </FileManagerProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
