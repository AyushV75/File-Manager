const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/folder", require("./routes/folderRoutes"));
app.use("/api/file", require("./routes/fileRoutes"));
app.get("/api/health", (req, res )=> {
    res.json({
        message: "File Manager API is running "
    });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});