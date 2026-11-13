# StudyMe

StudyMe is a learning app for school, university, vocational, and lifelong learners. A branded welcome screen lets visitors create an account, sign in, or enter the demo. Learners can choose an education stage, study a subject module, take its quiz, and collect achievement tokens.

## Sign in or try the demo

The splash screen offers three paths: sign in, create an account, or explore the demo without an account. The demo curriculum and quizzes are bundled with the app; no AI service or wallet is required.

In both demo and signed-in modes:

1. Choose an education stage.
2. Open a subject and start a module.
3. Mark the lesson complete to earn its module token.
4. Pass the quiz to earn a separate quiz token.
5. Visit Achievements to see the collection.

The demo and each signed-in account use separate progress on this browser. Progress is not synced between devices yet. Changing education stages does not erase progress. Use Settings to reset the current learner's saved progress.

## Authentication

Sign-in and account creation use the Replit-managed Clerk setup configured for this workspace. Private auth keys are provisioned as workspace secrets and are never included in the source ZIP. If you run the frontend outside this workspace, configure Clerk's public key for the client and the matching private key on the server; do not commit either key.

## Achievement tokens

Tokens are app achievements saved in browser storage. They are not minted NFTs and are not stored on the NEAR blockchain. Real NFT minting requires a connected wallet and a deployed, compatible NFT contract; neither was included in the supplied project files.

## Run in this workspace

From the workspace root:

```sh
pnpm --filter @workspace/studyme run dev
```

To check the app's TypeScript:

```sh
pnpm --filter @workspace/studyme run typecheck
```

To check the Clerk proxy server:

```sh
pnpm --filter @workspace/api-server run typecheck
```
