export interface Point2D {
  x: number;
  y: number;
}

export type PositionBlocked = (x: number, y: number, radius: number) => boolean;

export function normalizedDirection(x: number, y: number): Point2D {
  const length = Math.hypot(x, y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

export function moveWithCollision(
  position: Point2D,
  direction: Point2D,
  distance: number,
  radius: number,
  isBlocked: PositionBlocked,
): Point2D {
  const normalized = normalizedDirection(direction.x, direction.y);
  const deltaX = normalized.x * distance;
  const deltaY = normalized.y * distance;

  if (deltaX === 0 && deltaY === 0) return { ...position };

  if (deltaX !== 0 && deltaY !== 0) {
    const horizontalBlocked = isBlocked(position.x + deltaX, position.y, radius);
    const verticalBlocked = isBlocked(position.x, position.y + deltaY, radius);
    if (horizontalBlocked && verticalBlocked) return { ...position };
  }

  let x = position.x;
  let y = position.y;
  if (!isBlocked(x + deltaX, y, radius)) x += deltaX;
  if (!isBlocked(x, y + deltaY, radius)) y += deltaY;
  return { x, y };
}
