const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getProfile } = require("../controllers/profile.controller");

router.get("/", authMiddleware, getProfile);

module.exports = router;