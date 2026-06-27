import { execSync } from "node:child_process";

console.log("Updating countries dataset...");

execSync("npm run countries:generate", {
  stdio: "inherit",
});

console.log("Countries dataset updated successfully.");
