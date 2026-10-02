import { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import {Eye, EyeOff} from "lucide-react";
 
const Login = () => { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
 
  const { login, loading } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { 
      setError("Please enter a valid email address."); 
      return; 
    } 
 
    try { 
      const userData = await login(normalizedEmail, password); 
 
      if (userData.role === "admin") { 
        navigate("/admin"); 
      } else { 
        navigate("/app"); 
      } 
    } catch (error) { 
      setError( 
        error.response?.data?.message || "Login failed. Please try again.", 
      ); 
    } 
  }; 
 
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">📁</div>
          <h1>File Manager</h1>
          <p>Securely manage your files and folders</p>
        </div>
 
        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Login to access your file manager</p>
        </div> 
 
        {error && (
          <div className="auth-error">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
 
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
 
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="password">Password</label>
 
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                placeholder="Enter your password"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
 
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              "Logging in..."
            ) : (
              <>
                Login
                <span>→</span>
              </>
            )}
          </button>
        </form>
 
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}; 
 
export default Login; 