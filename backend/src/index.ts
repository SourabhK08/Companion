import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { initSocket } from "./lib/socket.js";

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }

  // Create HTTP server from Express app
  const httpServer = createServer(app);

  // Attach Socket.IO to the HTTP server
  initSocket(httpServer);
  console.log("✅ Socket.IO initialized");

  // Start server
  httpServer.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║          Modhuralap Backend API              ║
╠══════════════════════════════════════════════╣
║  Status:  Running                           ║
║  Port:    ${String(env.PORT).padEnd(36)}║
║  Mode:    ${env.NODE_ENV.padEnd(36)}║
║  WS:      Socket.IO enabled                ║
║  Health:  http://localhost:${env.PORT}/api/health    ║
╚══════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
