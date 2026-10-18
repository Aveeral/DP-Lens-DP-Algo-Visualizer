# DP Lens — From Recursion to Table

Oct 18, 2026 · 

DP Lens is a classroom visualizer for four DP problems: Binomial Coefficient, Matrix Chain Multiplication (MCM), Longest Common Subsequence (LCS) and 0/1 Knapsack. It shows *why* the DP table exists, not just how it fills.

## The pitch and the gap

> Existing visualizers show the DP table being filled. DP Lens shows why the table exists. It folds the recursion tree into the table, lets students test fill orders, and breaks the recurrence on purpose so they see what each term does.

Well-known tools (VisuAlgo, the USFCA visualizations, Algorithm Visualizer, many GitHub table-fillers) highlight one cell at a time as the table fills. That answers *what* DP computes. It leaves three questions unanswered, and these are where students get stuck:

| Student question | What existing tools show | What DP Lens shows |
| --- | --- | --- |
| Where did the table come from? | A ready-made empty grid | The recursion tree folding into the grid |
| Why fill in this order? | A fixed animation order | Students try orders and see which ones fail |
| Why is this cell this value? | A highlighted number | Arrows to its sources and the recurrence with real numbers |
| What does each term in the recurrence do? | Nothing | Break the recurrence and compare tables |

The unifying idea: all four problems are the same thing, a graph of subproblems laid out as a table. One set of features works for all four, so the project reads as one design rather than four separate demos.

## The core idea: The Fold

The Fold is one animation that explains DP: a recursion tree full of repeated calls merges into a graph of unique subproblems, and that graph laid flat is the table.

How it plays in class:
1. **Explode:** the student enters an input. The naive recursion tree grows level by level, and a counter shows the number of calls.
2. **Spot repeats:** identical subproblems light up in the same colour, so C(2,1) appearing twice is impossible to miss.
3. **Fold:** the professor presses Fold. Matching nodes slide together and merge; arrows re-route to the single surviving node.
4. **Snap to grid:** the merged graph slides into rows and columns. The table is now *derived*, not handed over.
5. **Compare:** the counter shows naive calls against unique subproblems, e.g. for C(10,5): 503 calls against 36 cells.

## Teaching features

### 1. Dependency Lens: every cell explains itself
Click or hover any cell. Arrows point to the exact cells it was computed from, and the explanation panel shows the recurrence with real numbers substituted.
- Knapsack example: `V[3][5] = max(V[2][5], 4 + V[2][2]) = max(7, 4 + 3) = 7`, labelled **skip = 7, take = 7, tie → skip kept**.
- LCS example: `A[4] = B[3] = 'C'`, so `L[4][3] = L[3][2] + 1 = 2`, with a diagonal arrow.
- The winning branch is drawn solid; the losing branch is drawn faint, so the "choice" in every cell is visible.

### 2. Fill-Order Challenge: discover the order
The table starts empty. Students click cells in any order they like.
- A cell whose dependencies are ready fills in green.
- A cell whose dependencies are not ready turns red, and the missing cells flash.
- A progress bar counts valid fills; a reset button restarts the attempt.

### 3. Predict Mode: the class answers before the tool does
The animation pauses before key cells and asks "What goes here?"
- The professor can pick which cells pause (or let the tool pick decision cells automatically).
- Students answer aloud, or on phones. Then the tool reveals the value and its Dependency Lens explanation.
- A tally shows how many predictions the class got right in the session.

### 4. Break-the-Algorithm: learn a rule by removing it
The professor flips one deliberate change. The correct table and the broken table appear side by side, with differing cells highlighted.
- 0/1 Knapsack: Use `V[i][w - w_i]` instead of `V[i-1][w - w_i]` -> unbounded knapsack
- LCS: Reset to 0 on a mismatch -> longest common substring
- MCM: Always split in the middle (greedy) -> cost jumps above optimum
- Binomial: Drop the `C(n-1, k)` term -> values collapse to 1s

### 5. Classroom voting (stretch)
The professor's screen shows a QR code. Students join from their phones with no login. Live bar chart with misconception insights.

---

# Part B — Implementation Plan

See specification for architecture, design tokens, algorithm specs, and 11-phase breakdown.
