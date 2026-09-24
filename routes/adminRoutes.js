const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getAllFolders,
  getAllFiles,
  moveFileAsAdmin,
} = require("../controllers/adminController");

router.get("/users", protect, adminMiddleware, getAllUsers);

router.get("/folders", protect, adminMiddleware, getAllFolders);
router.get("/files", protect, adminMiddleware, getAllFiles);
router.put("/files/:fileId/move", protect, adminMiddleware, moveFileAsAdmin);

module.exports = router;
