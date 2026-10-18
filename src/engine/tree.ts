import type { CellId, TreeNode } from './types';

export interface TreeSpec<TState> {
  rootState: TState;
  getKey: (state: TState) => CellId;
  getLabel: (state: TState) => string;
  getChildren: (state: TState) => TState[];
  maxNodes?: number;
}

export interface TreeResult {
  nodes: Record<string, TreeNode>;
  root: string;
  truncated: boolean;
  naiveCalls: number;
  uniqueSubproblems: number;
}

export function buildNaiveTree<TState>(spec: TreeSpec<TState>): TreeResult {
  const { rootState, getKey, getLabel, getChildren, maxNodes = 600 } = spec;

  const nodes: Record<string, TreeNode> = {};
  const uniqueKeys = new Set<CellId>();
  let callCount = 0;
  let truncated = false;
  let nodeCounter = 0;

  function traverse(state: TState, depth: number): string | null {
    callCount++;
    const key = getKey(state);
    uniqueKeys.add(key);

    if (nodeCounter >= maxNodes) {
      truncated = true;
      return null;
    }

    const id = `node-${nodeCounter++}`;
    const childStates = getChildren(state);
    const childIds: string[] = [];

    for (const childState of childStates) {
      const childId = traverse(childState, depth + 1);
      if (childId !== null) {
        childIds.push(childId);
      }
    }

    nodes[id] = {
      id,
      key,
      label: getLabel(state),
      children: childIds,
      depth,
    };

    return id;
  }

  const rootId = traverse(rootState, 0) ?? 'node-0';

  return {
    nodes,
    root: rootId,
    truncated,
    naiveCalls: callCount,
    uniqueSubproblems: uniqueKeys.size,
  };
}
