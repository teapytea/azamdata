import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

type EmbeddedAsset = {
  body: string;
  contentType: string;
};

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function collectAssets(buildRoot: string, directory = buildRoot): Promise<Record<string, EmbeddedAsset>> {
  const assets: Record<string, EmbeddedAsset> = {};
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = resolve(directory, entry.name);
    const relativePath = relative(buildRoot, absolutePath).split(sep).join("/");
    const topLevel = relativePath.split("/")[0];
    if (topLevel === ".openai" || topLevel === "server") continue;

    if (entry.isDirectory()) {
      Object.assign(assets, await collectAssets(buildRoot, absolutePath));
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    assets[`/${relativePath}`] = {
      body: (await readFile(absolutePath)).toString("base64"),
      contentType: contentTypes[extension] ?? "application/octet-stream",
    };
  }

  return assets;
}

function createWorkerSource(assets: Record<string, EmbeddedAsset>): string {
  return `const assets = ${JSON.stringify(assets)};

function decode(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = assets[requestedPath] ?? (acceptsHtml ? assets["/index.html"] : undefined);

    if (!asset || (request.method !== "GET" && request.method !== "HEAD")) {
      return new Response("Not found", { status: 404 });
    }

    const isHtml = asset.contentType.startsWith("text/html");
    return new Response(request.method === "HEAD" ? null : decode(asset.body), {
      headers: {
        "cache-control": isHtml ? "no-cache" : "public, max-age=31536000, immutable",
        "content-type": asset.contentType,
        "x-content-type-options": "nosniff",
      },
    });
  },
};

export default worker;
`;
}

// Packages Sites metadata and a self-contained static Worker after Vite compiles.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const buildDirectory = resolve(root, "dist");
      const outputDirectory = resolve(buildDirectory, ".openai");
      const serverDirectory = resolve(buildDirectory, "server");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");

      await rm(outputDirectory, { recursive: true, force: true });
      await rm(serverDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });
      await mkdir(serverDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), { recursive: true });
      }

      const assets = await collectAssets(buildDirectory);
      await writeFile(resolve(serverDirectory, "index.js"), createWorkerSource(assets), "utf8");
    },
  };
}
