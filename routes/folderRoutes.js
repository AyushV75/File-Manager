const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createFolder,
    getFolderContents,
    getRootContents,
    updateFolder,
    deleteFolder
} = require("../controllers/folderController");

router.post("/", protect, createFolder);

router.get("/", protect, getRootContents);       // root contents
router.get("/:id", protect, getFolderContents);    // specific folder's contents

router.put("/:id", protect, updateFolder);
router.delete("/:id", protect, deleteFolder);

module.exports = router;