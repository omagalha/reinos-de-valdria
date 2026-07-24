export interface GridPoint {
  x: number;
  y: number;
}

const DIRECTIONS: readonly GridPoint[] = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
  { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 },
];

const keyOf = ({ x, y }: GridPoint): string => `${x},${y}`;
const heuristic = (a: GridPoint, b: GridPoint): number =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export function findGridPath(
  start: GridPoint,
  goal: GridPoint,
  isWalkable: (x: number, y: number) => boolean,
  maxVisited = 4096,
): GridPoint[] {
  if (!isWalkable(start.x, start.y) || !isWalkable(goal.x, goal.y)) return [];
  if (start.x === goal.x && start.y === goal.y) return [start];

  const open = new Map<string, { point: GridPoint; score: number }>();
  const cameFrom = new Map<string, GridPoint>();
  const cost = new Map<string, number>([[keyOf(start), 0]]);
  open.set(keyOf(start), { point: start, score: heuristic(start, goal) });
  let visited = 0;

  while (open.size && visited < maxVisited) {
    visited += 1;
    const currentEntry = [...open.entries()].reduce((best, entry) =>
      entry[1].score < best[1].score ? entry : best,
    );
    const [currentKey, { point: current }] = currentEntry;
    open.delete(currentKey);

    if (current.x === goal.x && current.y === goal.y) {
      const path = [current];
      let cursor = current;
      while (cameFrom.has(keyOf(cursor))) {
        cursor = cameFrom.get(keyOf(cursor))!;
        path.push(cursor);
      }
      return path.reverse();
    }

    for (const direction of DIRECTIONS) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      if (!isWalkable(next.x, next.y)) continue;
      if (
        direction.x !== 0 &&
        direction.y !== 0 &&
        (!isWalkable(current.x + direction.x, current.y) ||
          !isWalkable(current.x, current.y + direction.y))
      ) {
        continue;
      }
      const nextKey = keyOf(next);
      const nextCost = (cost.get(currentKey) ?? 0) + (direction.x && direction.y ? Math.SQRT2 : 1);
      if (nextCost >= (cost.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;
      cameFrom.set(nextKey, current);
      cost.set(nextKey, nextCost);
      open.set(nextKey, { point: next, score: nextCost + heuristic(next, goal) });
    }
  }
  return [];
}
