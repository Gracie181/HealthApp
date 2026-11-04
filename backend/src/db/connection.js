import "dotenv/config";
import pg from "pg";

// One shared connection pool for the whole app
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export default pool;