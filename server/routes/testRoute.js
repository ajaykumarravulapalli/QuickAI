// server/routes/testRoute.js
import express from "express";
import sql from "../configs/db.js"; // your Neon database connection

const router = express.Router();

// Simple route to test DB connection
router.get("/test-db", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`; // query current timestamp
    res.json({
      message: "Database connection successful!",
      server_time: result[0].now,
    });
  } catch (error) {
    console.error("DB connection error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});


router.get("/check-tables", async (req, res) => {
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    res.json({
      message: "Tables in your Neon DB:",
      tables: result.map(r => r.table_name),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tables", error: error.message });
  }
});

router.post("/insert-test", async (req, res) => {
  try {
    const result = await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES ('test_user', 'Sample Prompt', 'This is sample content', 'article')
      RETURNING *;
    `;
    res.json({
      message: "Row inserted successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Insert failed",
      error: error.message,
    });
  }
});


export default router;
