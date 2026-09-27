import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
const root = resolve("_site");
const configuredPrefix = process.env.PATH_PREFIX || "/";
const pathPrefix = configuredPrefix === "/" ? "/" : `/${configuredPrefix.replace(/^\/+|\/+$/g, "")}/`;
const failures = [];
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  return nested.flat();
}
const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (!htmlFiles.length) failures.push("No HTML files were built.");
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const name = relative(root, file);
  const required = [["doctype", /<!doctype html>/i], ["language", /<html[^>]+lang=/i], ["title", /<title>[^<]+<\/title>/i], ["viewport", /name="viewport"/i], ["main landmark", /<main(?:\s|>)/i], ["level-one heading", /<h1(?:\s|>)/i]];
  for (const [label, pattern] of required) if (!pattern.test(html)) failures.push(name + ": missing " + label + ".");
  if (/<script\b/i.test(html)) failures.push(name + ": scripts are not permitted.");
  if (/(fonts\.(googleapis|gstatic)|use\.typekit|cloudflareinsights)/i.test(html)) failures.push(name + ": third-party font/tracker reference found.");
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) if (!/\balt\s*=/.test(match[1])) failures.push(name + ": image without alt attribute.");
  for (const match of html.matchAll(/href="([^"]+)"/gi)) {
    const href = match[1];
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    let target;
    if (clean.startsWith("/")) {
      const localPath = pathPrefix !== "/" && clean.startsWith(pathPrefix)
        ? clean.slice(pathPrefix.length)
        : clean.replace(/^\/+/, "");
      target = join(root, localPath);
    } else {
      target = resolve(file, "..", clean);
    }
    let candidate = target;
    try { if ((await stat(candidate)).isDirectory()) candidate = join(candidate, "index.html"); }
    catch { if (clean.endsWith("/")) candidate = join(target, "index.html"); }
    try { await stat(candidate); } catch { failures.push(name + ": broken local link " + href + "."); }
  }
}
if (files.some((file) => /glow-evan-mire/i.test(file))) failures.push("Draft post was emitted into _site.");
const home = await readFile(join(root, "index.html"), "utf8");
if (/Glow|Evan Mire/.test(home)) failures.push("Draft post leaked onto the homepage.");
if (!files.some((file) => file.endsWith("feed.xml"))) failures.push("RSS feed is missing.");
if (failures.length) { console.error(failures.map((item) => "✗ " + item).join("\n")); process.exit(1); }
console.log("✓ Checked " + htmlFiles.length + " HTML pages and " + files.length + " built files.");
console.log("✓ Required landmarks, local links, privacy guardrails, RSS, and draft exclusion passed.");
