import type { Point2D } from './movement';

export interface ProximityObject extends Point2D {
  id: string;
}

export function nearestInRange<T extends ProximityObject>(
  origin: Point2D,
  objects: readonly T[],
  range: number,
): T | undefined {
  return objects
    .map((object) => ({ object, distance: Math.hypot(object.x - origin.x, object.y - origin.y) }))
    .filter(({ distance }) => distance <= range)
    .sort((a, b) => a.distance - b.distance)[0]?.object;
}
