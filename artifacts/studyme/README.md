# StudyMe

StudyMe is a learning dashboard for school, university, vocational, and lifelong learners. Choose an education stage, open a subject module, study a short lesson, and try its quiz. Progress and achievement tokens are saved in this browser.

## Try the demo

The app opens directly in demo mode. No account, wallet, API key, or internet connection is required for lessons and quizzes.

1. Choose an education stage.
2. Open a subject and start a module.
3. Mark the lesson complete to earn its module token.
4. Pass the quiz to earn a separate quiz token.
5. Visit Achievements to see the collection.

Changing education stages does not erase progress. Use the reset control in Settings to clear the demo learner's saved progress on this device.

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
