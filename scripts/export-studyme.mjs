import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactRoot = path.join(workspaceRoot, "artifacts", "studyme");
const outputRoot = path.join(workspaceRoot, "generated-artifacts");
const appRoot = path.join(outputRoot, "studyme-code");
const archivePath = path.join(outputRoot, "studyme-source.zip");

rmSync(appRoot, { recursive: true, force: true });
rmSync(archivePath, { force: true });
mkdirSync(appRoot, { recursive: true });

const files = [
  "index.html",
  "public",
  "src/App.tsx",
  "src/components/error-boundary.tsx",
  "src/data/curriculum.ts",
  "src/index.css",
  "src/main.tsx",
  "src/pages/not-found.tsx",
];

for (const file of files) {
  const source = path.join(artifactRoot, file);
  const destination = path.join(appRoot, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

writeFileSync(
  path.join(appRoot, "package.json"),
  `${JSON.stringify(
    {
      name: "studyme",
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0",
        build: "tsc --noEmit && vite build",
        preview: "vite preview --host 0.0.0.0",
      },
      dependencies: {
        "lucide-react": "^0.545.0",
        react: "^19.1.0",
        "react-dom": "^19.1.0",
        wouter: "^3.13.0",
      },
      devDependencies: {
        "@tailwindcss/vite": "^4.3.3",
        "@types/node": "^25.9.9",
        "@types/react": "^19.3.0",
        "@types/react-dom": "^19.3.0",
        "@vitejs/plugin-react": "^5.2.0",
        tailwindcss: "^4.3.3",
        "tw-animate-css": "^1.4.0",
        typescript: "^5.9.3",
        vite: "^7.3.7",
      },
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  path.join(appRoot, "vite.config.ts"),
  `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
`,
);

writeFileSync(
  path.join(appRoot, "tsconfig.json"),
  `${JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        useDefineForClassFields: true,
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "Bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        baseUrl: ".",
        paths: { "@/*": ["src/*"] },
        types: ["node", "vite/client"],
      },
      include: ["src"],
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  path.join(appRoot, "README.md"),
  `# StudyMe

A local-first learning dashboard for early-years, school, university, vocational, and lifelong learners.

## Run it

Requirements: Node.js 20.19+ or 22.12+.

\`\`\`sh
npm install
npm run dev
\`\`\`

Open the local Vite address shown in the terminal. The demo opens directly; no account, API key, or wallet is needed.

## Learning and rewards

Study a lesson to earn its module token, then pass its three-question quiz to earn a separate quiz token. Education-stage choices, lesson progress, scores, and tokens save in this browser.

These rewards are local achievement tokens, not NFTs minted on NEAR. On-chain rewards require a wallet connection and a deployed compatible NFT contract.
`,
);

execFileSync("zip", ["-q", "-r", archivePath, "studyme-code"], {
  cwd: outputRoot,
});
console.log(`Created ${path.relative(workspaceRoot, archivePath)}`);
