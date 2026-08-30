const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getMyBadges } = require("../controllers/badge.controller");

router.get("/", authMiddleware, getMyBadges);

module.exports = router;