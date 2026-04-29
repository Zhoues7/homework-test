module.exports = {
  apps: [{
    name: 'bilibili-analysis',
    script: 'src/server.ts',
    interpreter: '/workspace/projects/node_modules/.bin/tsx',
    interpreter_args: 'watch',
    cwd: '/workspace/projects',
    env: {
      PORT: 5000,
      NODE_ENV: 'development'
    },
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: 5000,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', '.next', '.git'],
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 30000
  }]
};
