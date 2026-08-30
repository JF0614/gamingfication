const db = require("../config/database");

const getGemHistory = async (req, res) => {
    try {
        const [history] = await db.execute(
            `SELECT id, amount, created_at
             FROM gem_history
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            history
        });

    } catch (error) {
        console.error("History error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    getGemHistory
};