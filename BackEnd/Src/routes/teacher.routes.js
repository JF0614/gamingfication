const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const teacherMiddleware = require("../middleware/teacher.middleware");

const {
    getStudents,
    getStudentProfile,
    updateStudentXP
} = require("../controllers/teacher.controller");


router.get(
    "/students",
    authMiddleware,
    teacherMiddleware,
    getStudents
);


router.get(
    "/students/:id",
    authMiddleware,
    teacherMiddleware,
    getStudentProfile
);


router.patch(
    "/students/:id/xp",
    authMiddleware,
    teacherMiddleware,
    updateStudentXP
);


module.exports = router;