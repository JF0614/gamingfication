const bcrypt = require("bcrypt");
const db = require("../config/database");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username dan password wajib diisi"
            });
        }

        const [existingUser] = await db.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Username sudah digunakan"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (username, password, role, gem, rank)VALUES (?, ?, 'student', 0, 0)",
            [username, hashedPassword]
        );

        res.status(201).json({
            message: "Register berhasil"
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username dan password wajib diisi"
            });
        }

        const [users] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,    
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

module.exports = {
    register,
    login
};