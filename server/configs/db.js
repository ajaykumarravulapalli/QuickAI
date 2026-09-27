import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force dotenv to load from the server directory
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

const sql = neon(`${process.env.DATABASE_URL}`);
export default sql;
