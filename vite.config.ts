// vite.config.ts
import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const repoRoot = __dirname;

  const libRoot = path.resolve(repoRoot, "src");
  const publicAppRoot = path.resolve(repoRoot, "src/app-public");
  const privateAppRoot = path.resolve(repoRoot, "src/app-private");
  const distDir = path.resolve(repoRoot, "dist");

  // --- 1) BUILD APLIKACJI PUBLIC (HTML) ---
  // Uruchamiasz: vite build --mode public
  if (mode === "public") {
    return {

      root: publicAppRoot,
      build: {
        outDir: distDir,
        emptyOutDir: true,
      },
      test: {
        root: repoRoot,
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.spec.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
        exclude: [
          "node_modules",
          "dist",
          "cypress",
          "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
        ],
      },
    };
  }

  // --- 2) (OPCJONALNIE) BUILD APLIKACJI PRIVATE (HTML) ---
  // Uruchamiasz: vite build --mode private
  if (mode === "private") {
    return {
      root: privateAppRoot,
      build: {
        outDir: distDir,
        emptyOutDir: true,
      },
      test: {
        root: repoRoot,
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.spec.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
        exclude: [
          "node_modules",
          "dist",
          "cypress",
          "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
        ],
      },
    };
  }

  // --- 3) BUILD BIBLIOTEKI (bez HTML) ---
  // Domyślnie i w mode=production: vite build --mode production
  return {
    root: repoRoot,
    build: {
      lib: {
        name: "ksef-fe-invoice-converter",
        entry: path.resolve(libRoot, "index.ts"),
        outDir: distDir,
        emptyOutDir: true,
        formats: ["es", "umd"],
        fileName: (format) => (format === "es" ? "index.es.js" : "index.umd.js"),
      },
      rollupOptions: {
        // Upewniamy się, że appki nie wchodzą do paczki biblioteki
        external: [/\.spec\.(t|j)sx?$/, /\.test\.(t|j)sx?$/, "src/app-private", "src/app-public"],
      },
    },
    plugins: [
      dts({
        tsconfigPath: path.resolve(repoRoot, "tsconfig.base.json"),
      }),
    ],
    test: {
      root: repoRoot,
      globals: true,
      environment: "jsdom",
      include: ["src/**/*.spec.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
      exclude: [
        "node_modules",
        "dist",
        "cypress",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      ],
    },
  };
});
