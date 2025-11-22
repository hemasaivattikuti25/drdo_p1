const replSetConfig = {
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017", priority: 2 },
    { _id: 1, host: "localhost:27018", priority: 1 },
  ],
};

try {
  console.log("🚀 Initiating MongoDB Replica Set...");
  const status = rs.initiate(replSetConfig);
  console.log("✅ Replica set initiated successfully:", status);
} catch (error) {
  if (error.codeName === "AlreadyInitialized") {
    console.log("✅ Replica set is already initialized.");
  } else {
    console.error("❌ Failed to initiate replica set:", error.message);
    process.exit(1);
  }
}

// Wait for the primary to be elected
console.log("⏳ Waiting for a primary to be elected...");
let primaryElected = false;
for (let i = 0; i < 30; i++) { // Wait up to 30 seconds
  const status = rs.status();
  const primary = status.members.find(member => member.stateStr === "PRIMARY");
  if (primary) {
    console.log(`✅ Primary elected: ${primary.name}`);
    primaryElected = true;
    break;
  }
  sleep(1000); // Wait for 1 second
}

if (!primaryElected) {
  console.error("❌ Timed out waiting for a primary to be elected.");
  printjson(rs.status());
  process.exit(1);
}

console.log("✨ Replica set is ready for use.");
