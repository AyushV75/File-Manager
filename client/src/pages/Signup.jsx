import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const { signup, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await signup(email, password, confirmPassword);
            navigate("/app");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Sign up failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-brand-icon">📁</div>

                    <h1>File Manager</h1>

                    <p>
                        Securely manage your files and folders
                    </p>
                </div>

                <div className="auth-heading">
                    <h2>Create your account</h2>

                    <p>
                        Get started with your personal file manager
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        <span>⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default SignUp;