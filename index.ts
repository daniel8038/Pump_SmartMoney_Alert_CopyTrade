import { subscriptionManager } from "./stream";
import { setupBot } from "./tg/bot/bot";

async function main(): Promise<void> {
  try {
    console.log("Starting application...");

    // Start bot and stream subscription in parallel
    await Promise.all([setupBot(), subscriptionManager.setupStream()]);

    console.log("Application started successfully");
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}
main();
