module.exports = {
  apps: [
    {
      name: "adolf",
      script: "./index.js",
      watch: true,
      env: {
        "NODE_ENV": "development"
      },
      env_production: {
        "NODE_ENV": "production",
      }
    }
  ]
}

// https://pm2.keymetrics.io/docs/usage/environment/
