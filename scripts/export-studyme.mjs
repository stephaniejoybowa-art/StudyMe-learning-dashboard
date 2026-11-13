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
        "@clerk/react": "^6.18.6",
        "@clerk/themes": "^2.4.57",
        "lucide-react": "^0.545.0",
        react: "19.1.4",
        "react-dom": "19.1.4",
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
  plugins: [react(), tailwindcss({ optimize: false })],
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

A learning app for early-years, school, university, vocational, and lifelong learners. The opening screen offers secure sign-in, account creation, and a guest demo.

## Run it

Requirements: Node.js 20.19+ or 22.12+.

\`\`\`sh
npm install
cp .env.example .env.local
npm run dev
\`\`\`

Set \`VITE_CLERK_PUBLISHABLE_KEY\` in \`.env.local\` before opening the app. The Replit workspace provisions Clerk keys automatically; private keys are not included in this ZIP. For production, run the API server with the Clerk proxy and keep its \`CLERK_SECRET_KEY\` in server-side environment secrets.

Open the local Vite address shown in the terminal. Choose **Explore the demo** to enter without an account.

## Learning and rewards

Study a lesson to earn its module token, then pass its three-question quiz to earn a separate quiz token. Education-stage choices, lesson progress, scores, and tokens save in this browser. Demo progress and signed-in account progress are kept separate on this device; they do not sync across devices yet.

These rewards are local achievement tokens, not NFTs minted on NEAR. On-chain rewards require a wallet connection and a deployed compatible NFT contract.
`,
);

writeFileSync(
  path.join(appRoot, ".env.example"),
  "VITE_CLERK_PUBLISHABLE_KEY=\\nVITE_CLERK_PROXY_URL=\\n",
);

execFileSync("zip", ["-q", "-r", archivePath, "studyme-code"], {
  cwd: outputRoot,
});
console.log(`Created ${path.relative(workspaceRoot, archivePath)}`);
