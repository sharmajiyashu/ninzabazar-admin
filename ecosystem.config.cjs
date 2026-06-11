/** PM2 config — run from project root: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'ninzabazar-admin',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 6500',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 6500,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 6500,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
