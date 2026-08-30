const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { addGem } = require("../controllers/gem.controller");

router.post("/add", authMiddleware, addGem);
    
module.exports = router;