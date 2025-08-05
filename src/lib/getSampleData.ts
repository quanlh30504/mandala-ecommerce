import fs from "fs";
import path from "path";

export function getSampleData() {
  const filePath = path.join(process.cwd(), "src", "database", "db.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(jsonData);
}
