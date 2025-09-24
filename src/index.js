#!/usr/bin/env node
import express from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import main from "ft-to-inv";

// Work out dirname since this is ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Utility to spawn CLI commands (e.g., for testing vs. production)
function run(cmd, args = []) {
  console.log(`▶️ Running ${cmd} ${args.join(" ")}`);
  return spawn(cmd, args, { stdio: "inherit" });
}

// Load static homepage
const root = path.join(__dirname, "..");
const homepage = fs.readFileSync(path.join(root, "html/index.html"), "utf-8");

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/html", express.static(path.join(__dirname, "html")));

// Routes
app.get("/", (req, res) => {
  res.send(homepage);
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "html/stylesheet.test.html"));
});

// Run ft-to-inv via spawn (separate process)
app.get("/test_run", (req, res) => {
  res.send("▶️ Test run initiated");
  run("ft-to-inv", ["-c", "ft-to-inv.jsonc"]); // runs via package.json "bin"
});

// Start server
app.listen(port, () => {
  console.log(`🌐 ft-to-inv-web listening at http://localhost:${port}`);
});
app.post("/save-config", express.json(), (req, res) => {
  try {
    fs.writeFileSync("ft-to-inv.jsonc", JSON.stringify(req.body, null, 2));
    res.send("✅ Config saved to ft-to-inv.jsonc");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to save config");
  }
});

app.post("/sync", express.json(), async (req, res) => {
  try {
    await main(req.body); // pass overrides directly
    res.send("✅ Sync completed");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Sync failed");
  }
});
