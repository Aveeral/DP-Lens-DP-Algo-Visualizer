# DP Lens — Open Questions & Design Decisions

This document tracks clarifying and design decisions throughout the implementation.

### Q1: Fold Tree Caps
- **Spec decision:** Input size caps keep visuals readable on a projector: Binomial $n \le 10$ (Fold $n \le 6$), MCM 2–6 matrices (Fold $\le 4$), LCS strings $\le 8$ characters (Fold $\le 5$), Knapsack $\le 5$ items and capacity $\le 10$ (Fold $\le 4$ items, capacity $\le 6$).
- **Status:** Adopted as default. Inputs above the fold cap show an inline message + "use preset" button.

### Q2: Themes
- **Spec decision:** Light theme by default (high contrast, warm paper `#F6F5F1` chalkboard feel optimized for classroom projectors). Dark theme (`#14161A`) available via toggle or shortcut (`Shift+D`).
- **Status:** Both supported via CSS variables and `tokens.css`.

### Q3: Offline Capability
- **Spec decision:** All core visualizers, step engine, Fold, Predict mode, Fill-Order challenge, and Break mode run 100% locally and offline in class. Classroom voting (Phase 9) is the only online feature via Supabase Realtime.
- **Status:** Confirmed.
