import app from "./app.js";
import { connectDb } from "./db.js";
import { assertEnv, env } from "./env.js";

async function start() {
  assertEnv();
  await connectDb(env.mongodbUri);
  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});
