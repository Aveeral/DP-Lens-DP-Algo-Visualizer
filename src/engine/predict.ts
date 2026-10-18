import type { Step, Trace } from './types';

export interface Distractor {
  option: number;
  mistake: string;
}

export interface PredictQuestion {
  stepIndex: number;
  cell: string;
  correctAnswer: number;
  options: { label: string; value: number; mistake?: string }[];
  hint: string;
}

/**
 * Picks decision steps distributed across the trace execution.
 */
export function pickStops(trace: Trace, count = 5): number[] {
  const decisionIndices = trace.steps
    .map((step, idx) => ({ step, idx }))
    .filter(({ step }) => step.isDecision)
    .map(({ idx }) => idx);

  if (decisionIndices.length <= count) {
    return decisionIndices;
  }

  const result: number[] = [];
  const stepSize = (decisionIndices.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const selected = decisionIndices[Math.round(i * stepSize)];
    if (selected !== undefined && !result.includes(selected)) {
      result.push(selected);
    }
  }

  return result;
}

/**
 * Generates 3 distinct, non-negative wrong answers with specific pedagogical mistake explanations.
 */
export function distractors(step: Step): Distractor[] {
  const correct = step.result;
  const usedValues = new Set<number>([correct]);
  const result: Distractor[] = [];

  function tryAdd(val: number, mistake: string): boolean {
    if (val >= 0 && !usedValues.has(val)) {
      usedValues.add(val);
      result.push({ option: val, mistake });
      return true;
    }
    return false;
  }

  // 1. Losing term value (if available)
  if (step.terms.length > 1) {
    for (let i = 0; i < step.terms.length; i++) {
      if (i !== step.chosen) {
        const losingTerm = step.terms[i];
        if (losingTerm) {
          tryAdd(
            losingTerm.value,
            `Chose branch "${losingTerm.label}" instead of the optimal choice`
          );
          if (result.length >= 3) break;
        }
      }
    }
  }

  // 2. Lookup without addition (forgot +1, +value, or +cost)
  if (result.length < 3) {
    const chosenTerm = step.terms[step.chosen];
    if (chosenTerm) {
      // Check for simple single source lookup value without cost
      // (E.g. in LCS: L[i-1][j-1] without +1; in Knapsack: V[i-1][w-wi] without +v)
      if (correct > 0) {
        tryAdd(
          correct - 1,
          'Off-by-one or forgot to increment subproblem result'
        );
      }
    }
  }

  // 3. Result + 1
  if (result.length < 3) {
    tryAdd(
      correct + 1,
      'Added an extra count or misread index boundary'
    );
  }

  // 4. Result - 1 or Result - 2
  if (result.length < 3 && correct >= 2) {
    tryAdd(
      correct - 2,
      'Subtracted too much or missed a contributing subproblem'
    );
  }

  // 5. Result + 2
  if (result.length < 3) {
    tryAdd(
      correct + 2,
      'Overcounted or double-counted subproblem contributions'
    );
  }

  // Fallback candidate generation to guarantee exactly 3 distractors
  let delta = 3;
  while (result.length < 3) {
    tryAdd(correct + delta, `Arithmetic miscalculation (+${delta})`);
    if (result.length < 3 && correct - delta >= 0) {
      tryAdd(correct - delta, `Arithmetic miscalculation (-${delta})`);
    }
    delta++;
  }

  return result.slice(0, 3);
}

/**
 * Builds a 4-option randomized question for a given step.
 */
export function buildPredictQuestion(step: Step): PredictQuestion {
  const wrongs = distractors(step);
  const correct = { value: step.result, mistake: undefined };

  const allChoices = [
    correct,
    ...wrongs.map((d) => ({ value: d.option, mistake: d.mistake })),
  ];

  // Deterministic or pseudo-random shuffle based on step index
  allChoices.sort((a, b) => a.value - b.value);

  const labels = ['A', 'B', 'C', 'D'];
  const options = allChoices.map((choice, i) => ({
    label: labels[i] ?? `Option ${i + 1}`,
    value: choice.value,
    mistake: choice.mistake,
  }));

  return {
    stepIndex: step.index,
    cell: step.cell,
    correctAnswer: step.result,
    options,
    hint: `Sources for this cell: ${step.terms.flatMap((t) => t.sources).join(', ')}`,
  };
}
