const db = require("../config/database");

const getMyBadges = async (req, res) => {
    try {
        const [badges] = await db.execute(
            `SELECT 
                b.id,
                b.name,
                b.description,
                b.image_url,
                ub.obtained_at
             FROM user_badges ub
             INNER JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.obtained_at DESC`,
            [req.user.id]
        );

        res.json({
            badges
        });

    } catch (error) {
        console.error("Badge error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    getMyBadges
};