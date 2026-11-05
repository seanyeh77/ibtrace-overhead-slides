// Write <dist>/slides.json listing every Slidev deck inside a built dist folder.
// Usage: node slides-manifest.mjs dist
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const dist = process.argv[2] ?? "dist";
const decks = [];

(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "assets") walk(p);
    } else if (entry.name === "index.html") {
      const title = readFileSync(p, "utf8").match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
      const rel = relative(dist, dirname(p)).split("\\").join("/");
      decks.push({ title, path: rel ? `./${rel}/` : "./" });
    }
  }
})(dist);

decks.sort((a, b) => (a.path === "./" ? -1 : b.path === "./" ? 1 : a.path.localeCompare(b.path)));
writeFileSync(join(dist, "slides.json"), JSON.stringify(decks, null, 2) + "\n");
console.log(decks);
