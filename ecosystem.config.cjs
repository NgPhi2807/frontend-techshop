module.exports = {
  apps: [
    {
      name: "motchillhd.online",
      script: "./dist/server/entry.mjs",
      node_args: "--max-old-space-size=1536",
      env: {
        NODE_ENV: "production",
        PORT: 4445,
        HOST: "0.0.0.0",
      },
    },
  ],
};
