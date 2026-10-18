import type { CellId, TreeNode } from './types';

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface TreeLayoutNode extends LayoutPosition {
  id: string;
  key: CellId;
  label: string;
  depth: number;
}

export interface DagLayoutNode extends LayoutPosition {
  key: CellId;
  label: string;
  occurrenceCount: number;
}

export interface LayoutEdge {
  sourceId: string;
  targetId: string;
}

export interface TreeLayoutResult {
  nodes: Record<string, TreeLayoutNode>;
  edges: LayoutEdge[];
  width: number;
  height: number;
}

export interface DagLayoutResult {
  nodes: Record<CellId, DagLayoutNode>;
  edges: { sourceKey: CellId; targetKey: CellId }[];
  width: number;
  height: number;
}

export interface LayoutOptions {
  nodeWidth?: number; // default 64
  nodeHeight?: number; // default 30
  colGap?: number; // default 24
  rowGap?: number; // default 64
}

export function layoutTree(
  nodes: Record<string, TreeNode>,
  rootId: string,
  options: LayoutOptions = {}
): TreeLayoutResult {
  const { nodeWidth = 64, nodeHeight = 30, colGap = 20, rowGap = 60 } = options;

  const layoutNodes: Record<string, TreeLayoutNode> = {};
  const edges: LayoutEdge[] = [];

  if (!nodes[rootId]) {
    return { nodes: {}, edges: [], width: 0, height: 0 };
  }

  // Assign x positions based on leaves in post-order traversal
  let currentLeafX = 0;
  const leafStep = nodeWidth + colGap;

  function assignPositions(nodeId: string): number {
    const node = nodes[nodeId];
    if (!node) return 0;

    for (const childId of node.children) {
      edges.push({ sourceId: nodeId, targetId: childId });
    }

    let nodeX: number;
    if (node.children.length === 0) {
      nodeX = currentLeafX;
      currentLeafX += leafStep;
    } else {
      const childXs = node.children.map((cid) => assignPositions(cid));
      const firstChildX = childXs[0] ?? currentLeafX;
      const lastChildX = childXs[childXs.length - 1] ?? firstChildX;
      nodeX = (firstChildX + lastChildX) / 2;
    }

    const nodeY = node.depth * rowGap;

    layoutNodes[nodeId] = {
      id: nodeId,
      key: node.key,
      label: node.label,
      depth: node.depth,
      x: nodeX,
      y: nodeY,
    };

    return nodeX;
  }

  assignPositions(rootId);

  // Calculate bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;

  for (const node of Object.values(layoutNodes)) {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y > maxY) maxY = node.y;
  }

  if (minX === Infinity) {
    minX = 0;
    maxX = 0;
  }

  // Normalize so minX is padded
  const padding = 32;
  const shiftX = padding - minX;

  for (const node of Object.values(layoutNodes)) {
    node.x += shiftX;
    node.y += padding;
  }

  const width = Math.max(maxX - minX + nodeWidth + padding * 2, 200);
  const height = maxY + nodeHeight + padding * 2;

  return { nodes: layoutNodes, edges, width, height };
}

export function layoutDag(
  treeNodes: Record<string, TreeNode>,
  treeLayout: TreeLayoutResult
): DagLayoutResult {
  const dagNodes: Record<CellId, DagLayoutNode> = {};
  const dagEdgesMap = new Set<string>();
  const dagEdges: { sourceKey: CellId; targetKey: CellId }[] = [];

  // Group tree occurrences by key
  const keyOccurrences: Record<CellId, { xs: number[]; ys: number[]; label: string }> = {};

  for (const treeNode of Object.values(treeNodes)) {
    const layout = treeLayout.nodes[treeNode.id];
    if (!layout) continue;

    let occ = keyOccurrences[treeNode.key];
    if (!occ) {
      occ = { xs: [], ys: [], label: treeNode.label };
      keyOccurrences[treeNode.key] = occ;
    }
    occ.xs.push(layout.x);
    occ.ys.push(layout.y);

    for (const childId of treeNode.children) {
      const child = treeNodes[childId];
      if (child) {
        const edgeKey = `${treeNode.key}->${child.key}`;
        if (!dagEdgesMap.has(edgeKey)) {
          dagEdgesMap.add(edgeKey);
          dagEdges.push({ sourceKey: treeNode.key, targetKey: child.key });
        }
      }
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;

  for (const [key, occ] of Object.entries(keyOccurrences)) {
    const avgX = occ.xs.reduce((a, b) => a + b, 0) / occ.xs.length;
    const avgY = occ.ys.reduce((a, b) => a + b, 0) / occ.ys.length;

    dagNodes[key] = {
      key,
      label: occ.label,
      x: Math.round(avgX),
      y: Math.round(avgY),
      occurrenceCount: occ.xs.length,
    };

    if (avgX < minX) minX = avgX;
    if (avgX > maxX) maxX = avgX;
    if (avgY > maxY) maxY = avgY;
  }

  const width = Math.max((maxX === -Infinity ? 0 : maxX - minX) + 120, 200);
  const height = (maxY || 0) + 80;

  return { nodes: dagNodes, edges: dagEdges, width, height };
}
