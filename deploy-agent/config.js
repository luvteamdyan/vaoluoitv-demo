export const CONFIG = {
    PORT: 5555,
    SECRET_TOKEN: process.env.AGENT_TOKEN || "super-secret-token",
    ALLOWED_SERVICES: process.env.ALLOWED_SERVICES ? process.env.ALLOWED_SERVICES.split(',').map(s => s.trim()) : [],
    ALLOWED_STACKS: process.env.ALLOWED_STACKS ? process.env.ALLOWED_STACKS.split(',').map(s => s.trim()) : []
  };
  