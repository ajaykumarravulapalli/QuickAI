import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import testRouter from "./routes/testRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectCloudinary();

app.use(cors());
app.use(express.json());

// ✅ Public routes first — these don’t require Clerk authentication
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/test", testRouter);

// ✅ Now load Clerk middleware for protected routes only
app.use(clerkMiddleware());
app.use(requireAuth());

// ✅ Protected routes (require valid Clerk token)
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

