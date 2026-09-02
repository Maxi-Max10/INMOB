import { copyFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("out");

await copyFile(
  path.join(outputDirectory, "index.html"),
  path.join(outputDirectory, "404.html"),
);
await writeFile(path.join(outputDirectory, ".nojekyll"), "", "utf8");
