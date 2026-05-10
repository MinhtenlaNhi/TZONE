/**
 * Runs `npm run build` when client/dist is missing (e.g. Render with no Build Command).
 * Hook from root `prestart` so `npm start` always has a Vite output for Express to serve.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const dist = path.join(root, "client", "dist");

if (fs.existsSync(dist)) {
  process.exit(0);
}

console.log("[ensure-client-build] client/dist missing — running npm run build");
try {
  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      // So workspace devDependencies (e.g. Vite) are used if install ran with production=true
      NODE_ENV: "development",
      NPM_CONFIG_PRODUCTION: "false",
    },
  });
} catch {
  process.exit(1);
}
