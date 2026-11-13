# StudyMe

A browser-first study dashboard where learners work through subject lessons and quizzes, track progress, and collect achievement tokens.

## Run & Operate

- `pnpm --filter @workspace/studyme run dev` — run the StudyMe preview
- `pnpm --filter @workspace/studyme run typecheck` — check the StudyMe TypeScript
- `pnpm --filter @workspace/studyme run build` — build the StudyMe frontend

## Stack

- pnpm workspaces, React, TypeScript, Vite
- Learner progress and achievement tokens are saved in browser localStorage
- No account, database, AI API key, or wallet is needed for the demo

## Where things live

- `artifacts/studyme/` — StudyMe app and downloadable source package
- `artifacts/studyme/src/` — app pages, learning flows, curriculum, and styles
- `artifacts/studyme/public/studyme-logo.png` — supplied StudyMe mark

## Architecture decisions

- Open directly into demo mode so the learning flow does not depend on missing authentication routes.
- Keep curriculum and quizzes bundled so the demo works without an AI service or API key.
- Save progress locally per browser; switching education stages does not reset it.
- Call rewards achievement tokens in the app; do not imply they are on-chain NFTs.

## Product

- Subject lessons and quizzes for learners from early years through lifelong learning.
- Progress tracking and a collection of tokens for completed modules and passed quizzes.
- Eight available stages: Early years, Primary, Lower secondary, Upper secondary, Vocational & technical, Undergraduate, Postgraduate, and Lifelong learning.

## User preferences

- Use the uploaded StudyMe project files and study guide as the product reference.

## Gotchas

- Real NEAR NFT minting requires a wallet connection and deployed compatible NFT contract; these are not included in the supplied files.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
