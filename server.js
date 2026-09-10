const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/folder", require("./routes/folderRoutes"));
app.use("/api/file", require("./routes/fileRoutes"));
app.get("/api/health", (req, res )=> {
    res.json({
        message: "File Manager API is running "
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=> {
    console.log(`Server running on port ${PORT}`);
});