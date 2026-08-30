const db = require("../config/database");
const { getRank } = require("../utils/rank");

const getStudents = async (req, res) => {
    try {
        const [students] = await db.execute(
            `SELECT id, username, gem, rank, createdAt
             FROM users
             WHERE role = 'student'
             ORDER BY username ASC`
        );

        res.json({
            students
        });
    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};


const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.params.id;

        const [students] = await db.execute(
            `SELECT id, username, gem, rank, createdAt
             FROM users
             WHERE id = ? AND role = 'student'`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan"
            });
        }

        const student = students[0];

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
            [studentId]
        );

        res.json({
            student: {
                id: student.id,
                username: student.username,
                gem: student.gem,
                rank: student.rank,
                createdAt: student.createdAt,
                badges
            }
        });

    } catch (error) {
        console.error("Student profile error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

const updateStudentXP = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { amount } = req.body;

        if (amount === undefined || amount === null) {
            return res.status(400).json({
                message: "Amount wajib diisi"
            });
        }

        const xpAmount = Number(amount);

        if (!Number.isInteger(xpAmount) || xpAmount === 0) {
            return res.status(400).json({
                message: "Amount harus berupa angka bulat dan tidak boleh 0"
            });
        }

        const [students] = await db.execute(
            `SELECT id, username, gem
             FROM users
             WHERE id = ? AND role = 'student'`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan"
            });
        }

        const student = students[0];
        const newXP = student.gem + xpAmount;
        const newRank = getRank(newXP);

        if (newXP < 0) {
            return res.status(400).json({
                message: "XP siswa tidak boleh kurang dari 0"
            });
        }

        await db.execute(
            `UPDATE users
     SET gem = ?, rank = ?
     WHERE id = ?`,
            [newXP, newRank, studentId]
        );

        res.json({
            message: xpAmount > 0
                ? "XP berhasil ditambahkan"
                : "XP berhasil dikurangi",
            student: {
                id: student.id,
                username: student.username,
                gem: newXP,
                rank: newRank
            }
        });
    } catch (error) {
        console.error("Update XP error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    getStudents,
    getStudentProfile,
    updateStudentXP
};