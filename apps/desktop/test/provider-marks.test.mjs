/**
 * Provider brand-mark contract.
 *
 * The marks are static SVGs, so node cannot import the module that maps them
 * (Vite resolves the asset URLs at build time). This suite therefore reads the
 * source and the asset directory and keeps the three in step: a mark that
 * exists on disk but not in the table would be silently unreachable, a table
 * entry with no asset would silently drop to the generic mark, and a vendored
 * file that ever carried a script or an external reference would turn
 * decorative artwork into executable content.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const assetsDir = fileURLToPath(new URL("../src/assets/models/", import.meta.url));
const marksSource = await readFile(
  new URL("../src/lib/provider-marks.ts", import.meta.url),
  "utf8",
);
const iconSource = await readFile(
  new URL("../src/features/chat/composer/ModelProviderIcon.tsx", import.meta.url),
  "utf8",
);

const tableEntries = [...marksSource.matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s+\w+Url,$/gm)]
  .map((match) => match[1]);
const importedKeys = [...marksSource.matchAll(/^import \w+ from "\.\.\/assets\/models\/([a-z0-9-]+)\.svg";$/gm)]
  .map((match) => match[1]);
const assetFiles = (await readdir(assetsDir))
  .filter((name) => name.endsWith(".svg"))
  .map((name) => name.slice(0, -".svg".length));

test("every vendor the app knows how to reach has a bundled mark", () => {
  // The set the Composer will actually meet: the providers whose metadata the
  // resolver can place, so an unnamed gateway is the only usual fallback.
  for (const key of [
    "openai", "anthropic", "google", "xai", "meta", "mistral", "deepseek",
    "alibaba-cn", "zhipuai", "moonshotai-cn", "minimax-cn", "volcengine",
    "openrouter", "groq", "togetherai",
  ]) {
    assert.ok(tableEntries.includes(key), `${key} is missing from the mark table`);
  }
});

test("the table, the imports and the asset directory are the same set", () => {
  assert.deepEqual([...tableEntries].sort(), assetFiles.sort());
  assert.deepEqual([...new Set(importedKeys)].sort(), assetFiles.sort());
});

test("an unknown or absent key resolves to no mark, never to a guess", () => {
  // The lookup is a plain record read, so a provider the catalog could not
  // place — or a custom display name a user typed — finds nothing and the
  // component falls back instead of borrowing another vendor's artwork.
  assert.match(marksSource, /export function providerMarkUrl\(catalogProviderKey: string \| undefined\): string \| undefined \{/);
  assert.match(marksSource, /if \(!catalogProviderKey\) return undefined;/);
  assert.match(marksSource, /return PROVIDER_MARKS\[catalogProviderKey\];/);
  assert.doesNotMatch(marksSource, /toLowerCase\(\)|trim\(\)|includes\(/);
});

test("a row without a vendored mark still carries the shared generic mark", () => {
  assert.match(iconSource, /providerMarkUrl\(catalogProviderKey\)/);
  assert.match(iconSource, /IconBot size=\{14\} className="provider-mark provider-mark-generic"/);
  // Decorative only: the model id beside it is the row's accessible name.
  assert.match(iconSource, /aria-hidden="true"/);
});

test("no vendored mark carries a script or an external reference", async () => {
  for (const name of await readdir(assetsDir)) {
    if (!name.endsWith(".svg")) continue;
    const body = await readFile(`${assetsDir}${name}`, "utf8");
    // `xmlns` names the SVG spec, not a fetched resource, so it is not a
    // remote reference; everything else that names a location is.
    const withoutNamespaces = body.replace(/\sxmlns(:\w+)?="[^"]*"/g, "");
    assert.doesNotMatch(body, /<script|javascript:|on[a-z]+=/i, `${name} carries executable content`);
    assert.doesNotMatch(withoutNamespaces, /https?:\/\//i, `${name} references a remote resource`);
    assert.doesNotMatch(withoutNamespaces, /\burl\(|xlink:href|<image\b/i, `${name} embeds another document`);
  }
});

test("every mark is a monochrome path the mask can paint", async () => {
  // A mask reads the image's alpha, so an opaque background rect would paint a
  // solid square and a second fill colour would defeat "one visual weight".
  // Upstream ships these as `currentColor` paths, which is what makes them
  // follow the theme text color instead of rendering black in an <img>.
  for (const name of await readdir(assetsDir)) {
    if (!name.endsWith(".svg")) continue;
    const body = await readFile(`${assetsDir}${name}`, "utf8");
    assert.match(body, /viewBox="[^"]+"/, `${name} is not scalable`);
    assert.doesNotMatch(body, /<rect/i, `${name} carries a background rectangle`);
    const fills = [...body.matchAll(/fill="([^"]*)"/g)].map((match) => match[1]);
    for (const fill of fills) {
      assert.ok(
        fill === "currentColor" || fill === "none",
        `${name} paints with ${fill}, so it would not follow the theme`,
      );
    }
  }
});
test("the vendored marks stay traceable to their upstream", async () => {
  const upstream = await readFile(`${assetsDir}UPSTREAM.md`, "utf8");
  assert.match(upstream, /https:\/\/models\.dev\/logos\//);
  assert.match(upstream, /model/);
});
