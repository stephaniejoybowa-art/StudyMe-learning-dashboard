# StudyMe

StudyMe is a learning app for all ages. Learners pick a level and subject, read short lessons, take quizzes, and earn collectible NFT badges on NEAR testnet when they pass. Progress is saved so learners can come back and keep going.

Built for **NEAR HACKATHON**.

## The problem
Students lose motivation when progress feels invisible. StudyMe makes it visible and rewarding: every finished lesson and passed quiz counts, and badges give learners something real to collect.

## What it does
- Splash screen, sign-in and a guest demo
- Learning levels from early years to adult learning
- Seven subjects: Mathematics, Science, English, Computer Science, History, economics and Geography
- Short lessons, each with a 3-question quiz and explanations
- Progress page with scores and attempts, saved in the browser
  

## NEAR tools used
- NEAR testnet NFTs for achievement badges

## Try it
1. Open the app: you see the StudyMe splash, then the sign-in screen.
2. Choose the guest demo: you see the learning dashboard.
3. Open **Subjects** and pick a lesson: you see the lesson text.
4. Take the quiz at the end: you see your score and explanations.
5. Open **My progress**: you see your saved results and badges.

## Run it yourself
Requires Node.js and pnpm.

```
pnpm install
pnpm --filter @workspace/studyme run dev
```

Then open http://localhost:5173 in your browser.

Windows note: if the install fails, open `pnpm-workspace.yaml` and delete the lines that end in `"-"` (they were added for Replit's Linux machines), then run `pnpm install` again.

## Links
- https://x.com/Stephaniebndt9i/status/2121672707389444590/video/1
- https://study-me-learning-dashboard--sedahsenku.replit.app/demo

## Next steps
- Mint badges to learners' own wallets from every passed quiz
- More subjects and modules, and teacher-made courses
- NFT achievement badges for passed quizzes on NEAR testnet
- NEAR wallet connection with `near-connect-hooks
