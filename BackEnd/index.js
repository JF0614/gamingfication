require("dotenv").config();

const express = require("express");
const db = require("./Src/config/database");
const authRoutes = require("./Src/routes/auth.routes");
const cors = require("cors");
const app = express();

const profileRoutes = require("./Src/routes/profile.routes");
const gemRoutes = require("./Src/routes/gem.routes");
const historyRoutes = require("./Src/routes/history.routes");
const badgeRoutes = require("./Src/routes/badge.routes");
const teacherRoutes = require("./Src/routes/teacher.routes");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", authRoutes);

//profile
app.use("/api/profile", profileRoutes);

//gem
app.use("/api/gem", gemRoutes);

//badge
app.use("/api/badges", badgeRoutes);

//history
app.use("/api/history", historyRoutes);

//guru
app.use("/api/teacher", teacherRoutes);



// Test API
app.get("/", (req, res) => {
    res.json({
        message: "Gamingfication API is running!"
    });
});



// Test database    
async function testDatabase() {
    try {
        const connection = await db.getConnection();

        console.log("✅ Database connected!");

        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed!");
        console.error(error.message);
    }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    await testDatabase();
});