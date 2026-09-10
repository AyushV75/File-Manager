import { useNavigate } from "react-router-dom";
import { FolderOpen, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">
          <FolderOpen size={21} />
        </div>

        <div className="navbar-brand-text">
          <span className="navbar-title">File Manager</span>
          <span className="navbar-subtitle">Your personal workspace</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>

          <span title={user?.email}>{user?.email}</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;