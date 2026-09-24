const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const { getUserData } = require("../controllers/userController");

const adminMiddleware = require("../middleware/adminMiddleware");


router.get("/user", protect, getUserData);
router.get(
    "/admin-test",
    protect,
    adminMiddleware,
    (req, res) => {
        res.json({
            message: "Welcome to the admin area.",
            user: req.user.email,
            role: req.user.role,
        });
    }
);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", protect, getMe);


module.exports = router;