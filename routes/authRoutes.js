const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const { getUserData } = require("../controllers/userController");


router.get("/user", protect, getUserData);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", protect, getMe);


module.exports = router;