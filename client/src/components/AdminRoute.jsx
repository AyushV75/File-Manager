import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (storedUser?.role !== "admin") {
        return <Navigate to="/app" replace />;
    }

    return children;
};

export default AdminRoute;