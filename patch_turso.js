const { createClient } = require("@libsql/client");
require("dotenv").config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    await client.execute("ALTER TABLE MaintenanceRequest ADD COLUMN cost REAL");
    console.log("Added cost column");
  } catch(e) { console.log("cost: " + e.message) }

  try {
    await client.execute("ALTER TABLE MaintenanceRequest ADD COLUMN resolvedAt DATETIME");
    console.log("Added resolvedAt column");
  } catch(e) { console.log("resolvedAt: " + e.message) }
  
  try {
    await client.execute("ALTER TABLE MaintenanceRequest ADD COLUMN resolvedById INTEGER REFERENCES Employee(id) ON DELETE SET NULL ON UPDATE CASCADE");
    console.log("Added resolvedById column");
  } catch(e) { console.log("resolvedById: " + e.message) }
  
  console.log("Done patching Turso DB");
}
main();
