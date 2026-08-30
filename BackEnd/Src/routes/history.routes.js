const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getGemHistory } = require("../controllers/history.controller");

router.get("/", authMiddleware, getGemHistory);

module.exports = router;