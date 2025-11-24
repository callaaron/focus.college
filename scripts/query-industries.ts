import "dotenv/config";
import mysql from "mysql2/promise";

async function queryIndustries() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await connection.execute("SELECT id, name FROM industries ORDER BY id");
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

queryIndustries();
