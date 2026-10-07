import app from "./app.js";
import { connectDb, disconnectDb } from "./db.js";
import { assertEnv, env } from "./env.js";

let server = null;

async function start() {
  assertEnv();
  await connectDb(env.mongodbUri);
  server = app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
    });
  }
  try {
    await disconnectDb();
    console.log("Database disconnected.");
  } catch (err) {
    console.error("Error during database disconnect:", err);
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

