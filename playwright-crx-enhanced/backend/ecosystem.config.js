module.exports = {
  apps: [
    {
      name: "playwright-backend",
      script: "./dist/index.js",
      instances: 1, // Start with 1 instance since it's an API, adjust as needed. 'max' for clustering.
      exec_mode: "cluster",
      watch: false, // Production typically doesn't watch
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "production",
        // Environment variables will be loaded from .env file by default if in CWD
        // or we can explicitly specifying them here if needed, but .env is preferred for secrets
      },
      // Explicitly point to the .env file if needed, though PM2 picks it up automatically
      env_file: "./.env",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      autorestart: true,
    },
  ],
};
