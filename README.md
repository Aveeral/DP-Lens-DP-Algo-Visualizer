# DP Lens — From Recursion to Table

A classroom visualizer for dynamic programming that shows **why** the DP table exists, not just how it fills.

## Features
- **The Fold:** The naive recursion tree folds into the table, demonstrating how overlapping subproblems collapse into unique table cells.
- **Dependency Lens:** Every cell explains itself with live substitutions, winning solid branches, and losing dashed branches.
- **Fill-Order Challenge:** Test valid and invalid table fill sequences to discover topological subproblem orders.
- **Predict Mode:** Interactive pauses before key subproblem decisions to poll the classroom.
- **Break-the-Algorithm:** Intentionally mutate the recurrence to see visual side-by-side deviations.
- **Classroom Voting:** Real-time smartphone polling with misconception insights.

## Tech Stack
- React 18, TypeScript 5 (Strict), Vite 5
- Tailwind CSS 3 with custom chalkboard design tokens
- Framer Motion 11
- Zustand 4
- Vitest & React Testing Library

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Checks
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
