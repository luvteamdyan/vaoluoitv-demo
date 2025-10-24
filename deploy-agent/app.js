import express from "express";
import { exec } from "child_process";
import { CONFIG } from "./config.js";
import fs from "fs";

const app = express();
app.use(express.json());

// Load allowlist
let allowlist;
try {
  allowlist = JSON.parse(fs.readFileSync("./allowlist.json", "utf8"));
} catch (error) {
  console.error("Failed to load allowlist:", error.message);
  process.exit(1);
}

app.post("/deploy", (req, res) => {
  const { stack, service, image, token } = req.body;

  // 1. Auth
  if (token !== CONFIG.SECRET_TOKEN) {
    console.warn(`[AUTH FAIL] Invalid token`);
    return res.status(403).json({ error: "Unauthorized" });
  }

  // 2. Validate input
  if (!allowlist.services.includes(service)) {
    console.warn(`[DENY] Service ${service} not allowed`);
    return res.status(400).json({ error: "Service not allowed" });
  }

  if (!image) {
    return res.status(400).json({ error: "Image missing" });
  }

  if (!stack) {
    return res.status(400).json({ error: "Stack name missing" });
  }

  if (!allowlist.stacks.includes(stack)) {
    console.warn(`[DENY] Stack ${stack} not allowed`);
    return res.status(400).json({ error: "Stack not allowed" });
  }

  // 3. Run docker service update with stack name
  const serviceName = stack ? `${stack}_${service}` : service;
  const cmd = `docker service update --force --image ${image} ${serviceName}`;
  console.log(`[DEPLOY] ${cmd}`);

  exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] ${stderr}`);
      return res.status(500).json({ 
        error: "Deployment failed", 
        details: stderr,
        timestamp: new Date().toISOString()
      });
    }
    console.log(`[SUCCESS] ${stdout}`);
    res.json({ 
      message: `Service ${serviceName} updated successfully`, 
      output: stdout,
      timestamp: new Date().toISOString()
    });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Deploy Agent API", 
    version: "1.0.0",
    endpoints: ["/deploy", "/health"]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Deploy agent listening on port ${CONFIG.PORT}`);
  console.log(`📋 Health check: http://localhost:${CONFIG.PORT}/health`);
  console.log(`🔧 Deploy endpoint: http://localhost:${CONFIG.PORT}/deploy`);
});
