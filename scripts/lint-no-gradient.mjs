#!/usr/bin/env node
/**
 * Design-system rule check (build guide Section 4):
 * the UI must use flat solid colors only - no CSS color ramps of any kind.
 */
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../apps/web/src", import.meta.url));
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html"]);
const BANNED = /gradient/i;

const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!SCANNED_EXTENSIONS.has(extname(entry.name))) continue;
    const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (BANNED.test(line)) {
        offenders.push(`${relative(process.cwd(), fullPath)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

walk(SRC_DIR);

if (offenders.length > 0) {
  console.error("Flat-color rule violated - banned CSS keyword found in apps/web/src:");
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

console.log("OK: flat-color rule holds (apps/web/src is clean).");
