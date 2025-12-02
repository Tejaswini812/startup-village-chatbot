module.exports = {
  apps: [{
    name: 'villagecounty-backend',  // Unique name to avoid conflicts with other projects
    script: 'backend/production-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'development',
      PORT: process.env.PORT || 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000  // Hostinger sets this automatically
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    combine_logs: true
  }]
}
