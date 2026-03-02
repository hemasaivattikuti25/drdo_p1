// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Replica Set Initialisation Script
// Runs once via the mongo-init container in docker-compose
// ─────────────────────────────────────────────────────────────────────────────

var config = {
    _id: "rs0",
    members: [
        { _id: 0, host: "mongo1:27017", priority: 3 },
        { _id: 1, host: "mongo2:27017", priority: 2 },
        { _id: 2, host: "mongo3:27017", priority: 1 },
    ],
};

// Wait for the primary to be ready before initiating
var maxRetries = 30;
var retries = 0;

while (retries < maxRetries) {
    try {
        var status = rs.initiate(config);
        print("Replica set initiated: " + JSON.stringify(status));
        break;
    } catch (e) {
        if (e.message.indexOf("already initialized") !== -1) {
            print("Replica set already initialized.");
            break;
        }
        print("Retrying replica initiation (" + retries + "/" + maxRetries + ")...");
        sleep(2000);
        retries++;
    }
}
