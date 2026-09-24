import { createContext, useContext, useState, useEffect, useRef } from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const authCheckStarted = useRef(false);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { _id, email: userEmail, role, token } = response.data;

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          _id,
          email: userEmail,
          role,
        }),
      );

      setUser({
        _id,
        email: userEmail,
        role,
      });

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, confirmPassword) => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const response = await api.post("/auth/register", {
        email,
        password,
      });

      const { _id, email: userEmail, role, token } = response.data;

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          _id,
          email: userEmail,
          role: role || "user",
        }),
      );

      setUser({
        _id,
        email: userEmail,
        role: role || "user",
      });

      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthChecking(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      const userData = response.data;

      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    if (authCheckStarted.current) return;

    authCheckStarted.current = true;

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecking,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
