const db = require("../config/database");

const ranks = [
    { name: "Noob Builder", required: 0 },
    { name: "Junior Creator", required: 100 },
    { name: "Studio Explorer", required: 250 },
    { name: "Script Explorer", required: 450 },
    { name: "Game Designer", required: 700 },
    { name: "Roblox Engineer", required: 1000 },
    { name: "Master Developer", required: 1500 }
];

const getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, username, gem, createdAt FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        const user = users[0];

        let currentRank = ranks[0];
        let nextRank = null;

        for (let i = 0; i < ranks.length; i++) {
            if (user.gem >= ranks[i].required) {
                currentRank = ranks[i];
            }
        }

        const currentIndex = ranks.findIndex(
            rank => rank.name === currentRank.name
        );

        if (currentIndex < ranks.length - 1) {
            nextRank = ranks[currentIndex + 1];
        }

        let progress = 100;

        if (nextRank) {
            const range =
                nextRank.required - currentRank.required;

            const current =
                user.gem - currentRank.required;

            progress = Math.floor((current / range) * 100);
        }

        res.json({
            username: user.username,
            gem: user.gem,
            rank: currentRank.name,
            nextRank: nextRank ? nextRank.name : null,
            progress,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    getProfile
};