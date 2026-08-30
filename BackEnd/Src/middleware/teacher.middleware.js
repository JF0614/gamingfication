const teacherMiddleware = (req, res, next) => {
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Akses khusus Guru"
        });
    }

    next();
};

module.exports = teacherMiddleware;