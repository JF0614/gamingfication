const db = require("../config/database");

const addGem = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0 || !Number.isInteger(Number(amount))) {
            return res.status(400).json({
                message: "Jumlah Gem harus berupa angka bulat lebih dari 0"
            });
        }

        const gemAmount = Number(amount);

        await db.execute(
            "UPDATE users SET gem = gem + ? WHERE id = ?",
            [gemAmount, req.user.id]
        );

        await db.execute(
            "INSERT INTO gem_history (user_id, amount) VALUES (?, ?)",
            [req.user.id, gemAmount]
        );

        const [users] = await db.execute(
            "SELECT username, gem FROM users WHERE id = ?",
            [req.user.id]
        );

        res.json({
            message: "Gem berhasil ditambahkan",
            username: users[0].username,
            gem: users[0].gem
        });

    } catch (error) {
        console.error("Add gem error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    addGem
};