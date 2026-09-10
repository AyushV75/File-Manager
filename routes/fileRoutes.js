const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const {
    createFile,
    getFile,
    updateFile,
    deleteFile,
    moveFile
} = require("../controllers/fileController");

router.post("/", protect, upload.single("file"), createFile);
router.put("/:id/move", protect, moveFile);
router.get("/:id", protect, getFile);

router.put("/:id", protect, updateFile);
router.delete("/:id", protect, deleteFile);


module.exports = router;    