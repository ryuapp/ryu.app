const MIN_THROW_SPEED = 0.04;
const THROW_FRICTION_PER_FRAME = 0.995;
const SAMPLE_WINDOW_MS = 100;
const FRAME_MS = 1000 / 60;
const DRAG_WALL_SPRING = 0.45;
const DRAG_STEP_PX = 44;

type AxisState = {
  position: number;
  velocity: number;
};

type MotionState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type CollisionRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type MotionInput = MotionState & {
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  deltaMs: number;
  walls?: CollisionRect[];
};

type DragPositionInput = {
  previousX: number;
  previousY: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  walls?: CollisionRect[];
};

type PointerSample = {
  x: number;
  y: number;
  time: number;
};

function reflectAxis(
  position: number,
  velocity: number,
  size: number,
  viewportSize: number,
  deltaMs: number,
): AxisState {
  const max = Math.max(0, viewportSize - size);

  if (max === 0) {
    return { position: 0, velocity: 0 };
  }

  let nextPosition = position + velocity * deltaMs;
  let nextVelocity = velocity;

  for (let i = 0; i < 8; i += 1) {
    if (nextPosition > max) {
      nextPosition = max - (nextPosition - max);
      nextVelocity = -Math.abs(nextVelocity);
      continue;
    }

    if (nextPosition < 0) {
      nextPosition = -nextPosition;
      nextVelocity = Math.abs(nextVelocity);
      continue;
    }

    break;
  }

  return {
    position: Math.min(max, Math.max(0, nextPosition)),
    velocity: nextVelocity,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getFrameFriction(deltaMs: number): number {
  return THROW_FRICTION_PER_FRAME ** (deltaMs / FRAME_MS);
}

function overlaps(
  x: number,
  y: number,
  width: number,
  height: number,
  rect: CollisionRect,
): boolean {
  return (
    x < rect.right &&
    x + width > rect.left &&
    y < rect.bottom &&
    y + height > rect.top
  );
}

function resolveWallCollision(
  previous: MotionState,
  next: MotionState,
  width: number,
  height: number,
  wall: CollisionRect,
): MotionState {
  if (!overlaps(next.x, next.y, width, height, wall)) {
    return next;
  }

  const previousRight = previous.x + width;
  const previousBottom = previous.y + height;

  if (previousRight <= wall.left && next.vx > 0) {
    return { ...next, x: wall.left - width, vx: -Math.abs(next.vx) };
  }

  if (previous.x >= wall.right && next.vx < 0) {
    return { ...next, x: wall.right, vx: Math.abs(next.vx) };
  }

  if (previousBottom <= wall.top && next.vy > 0) {
    return { ...next, y: wall.top - height, vy: -Math.abs(next.vy) };
  }

  if (previous.y >= wall.bottom && next.vy < 0) {
    return { ...next, y: wall.bottom, vy: Math.abs(next.vy) };
  }

  const pushLeft = Math.abs(next.x + width - wall.left);
  const pushRight = Math.abs(wall.right - next.x);
  const pushUp = Math.abs(next.y + height - wall.top);
  const pushDown = Math.abs(wall.bottom - next.y);
  const minPush = Math.min(pushLeft, pushRight, pushUp, pushDown);

  if (minPush === pushLeft) {
    return { ...next, x: wall.left - width, vx: -Math.abs(next.vx) };
  }

  if (minPush === pushRight) {
    return { ...next, x: wall.right, vx: Math.abs(next.vx) };
  }

  if (minPush === pushUp) {
    return { ...next, y: wall.top - height, vy: -Math.abs(next.vy) };
  }

  return { ...next, y: wall.bottom, vy: Math.abs(next.vy) };
}

function collidesWithWall(
  x: number,
  y: number,
  width: number,
  height: number,
  walls: CollisionRect[],
): boolean {
  return walls.some((wall) => overlaps(x, y, width, height, wall));
}

function springToward(current: number, target: number): number {
  return current + (target - current) * DRAG_WALL_SPRING;
}

function resolveDraggedX(
  previousX: number,
  targetX: number,
  y: number,
  width: number,
  height: number,
  walls: CollisionRect[],
): number {
  let nextX = targetX;

  for (const wall of walls) {
    if (!overlaps(nextX, y, width, height, wall)) {
      continue;
    }

    if (targetX > previousX && previousX + width <= wall.left) {
      const edge = wall.left - width;
      const pull = Math.min(edge, springToward(previousX, edge));
      nextX = Math.min(nextX, pull);
    } else if (targetX < previousX && previousX >= wall.right) {
      const edge = wall.right;
      const pull = Math.max(edge, springToward(previousX, edge));
      nextX = Math.max(nextX, pull);
    } else {
      nextX = springToward(previousX, targetX);
    }
  }

  return nextX;
}

function resolveDraggedY(
  x: number,
  previousY: number,
  targetY: number,
  width: number,
  height: number,
  walls: CollisionRect[],
): number {
  let nextY = targetY;

  for (const wall of walls) {
    if (!overlaps(x, nextY, width, height, wall)) {
      continue;
    }

    if (targetY > previousY && previousY + height <= wall.top) {
      const edge = wall.top - height;
      const pull = Math.min(edge, springToward(previousY, edge));
      nextY = Math.min(nextY, pull);
    } else if (targetY < previousY && previousY >= wall.bottom) {
      const edge = wall.bottom;
      const pull = Math.max(edge, springToward(previousY, edge));
      nextY = Math.max(nextY, pull);
    } else {
      nextY = springToward(previousY, targetY);
    }
  }

  return nextY;
}

function resolveDraggedStep(
  previousX: number,
  previousY: number,
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  walls: CollisionRect[],
): { x: number; y: number } {
  let nextX = targetX;
  let nextY = targetY;

  if (collidesWithWall(nextX, previousY, width, height, walls)) {
    nextX = resolveDraggedX(
      previousX,
      targetX,
      previousY,
      width,
      height,
      walls,
    );
  }

  if (collidesWithWall(nextX, nextY, width, height, walls)) {
    nextY = resolveDraggedY(nextX, previousY, targetY, width, height, walls);
  }

  if (collidesWithWall(nextX, nextY, width, height, walls)) {
    nextX = resolveDraggedX(previousX, targetX, nextY, width, height, walls);
  }

  return { x: nextX, y: nextY };
}

export function resolveDraggedPosition({
  previousX,
  previousY,
  targetX,
  targetY,
  width,
  height,
  viewportWidth,
  viewportHeight,
  walls = [],
}: DragPositionInput): { x: number; y: number } {
  const clampedTargetX = clamp(targetX, 0, Math.max(0, viewportWidth - width));
  const clampedTargetY = clamp(
    targetY,
    0,
    Math.max(0, viewportHeight - height),
  );
  const clampedPreviousX = clamp(
    previousX,
    0,
    Math.max(0, viewportWidth - width),
  );
  const clampedPreviousY = clamp(
    previousY,
    0,
    Math.max(0, viewportHeight - height),
  );

  const deltaX = clampedTargetX - clampedPreviousX;
  const deltaY = clampedTargetY - clampedPreviousY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= DRAG_STEP_PX) {
    return resolveDraggedStep(
      clampedPreviousX,
      clampedPreviousY,
      clampedTargetX,
      clampedTargetY,
      width,
      height,
      walls,
    );
  }

  const stepScale = DRAG_STEP_PX / distance;
  return resolveDraggedStep(
    clampedPreviousX,
    clampedPreviousY,
    clampedPreviousX + deltaX * stepScale,
    clampedPreviousY + deltaY * stepScale,
    width,
    height,
    walls,
  );
}

export function stepMotion({
  x,
  y,
  vx,
  vy,
  width,
  height,
  viewportWidth,
  viewportHeight,
  deltaMs,
  walls = [],
}: MotionInput): MotionState {
  const horizontal = reflectAxis(x, vx, width, viewportWidth, deltaMs);
  const vertical = reflectAxis(y, vy, height, viewportHeight, deltaMs);
  const damping = getFrameFriction(deltaMs);

  const previous = { x, y, vx, vy };
  let next = {
    x: horizontal.position,
    y: vertical.position,
    vx: horizontal.velocity * damping,
    vy: vertical.velocity * damping,
  };

  for (const wall of walls) {
    next = resolveWallCollision(previous, next, width, height, wall);
  }

  return next;
}

export function createBouncyDraggable(selector: string): () => void {
  const elements = [...document.querySelectorAll<HTMLElement>(selector)];
  const cleanups = elements.map((element) => attachBouncyDrag(element));

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function attachBouncyDrag(element: HTMLElement): () => void {
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let offsetX = 0;
  let offsetY = 0;
  let animationFrame = 0;
  let dragFrame = 0;
  let lastFrameTime = 0;
  let pointerId: number | null = null;
  let dragTargetX = 0;
  let dragTargetY = 0;
  let samples: PointerSample[] = [];
  let isFixed = false;

  const applyPosition = () => {
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const getWallRects = (): CollisionRect[] =>
    [...document.querySelectorAll<HTMLElement>("[data-bouncy-wall]")]
      .filter((wall) => wall !== element && !element.contains(wall))
      .map((wall) => wall.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => ({
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      }));

  const fixToViewport = () => {
    if (isFixed) {
      return;
    }

    const rect = element.getBoundingClientRect();
    x = rect.left;
    y = rect.top;
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.margin = "0";
    element.style.zIndex = "10";
    element.style.willChange = "transform";
    isFixed = true;
    applyPosition();
  };

  const stopAnimation = () => {
    if (animationFrame !== 0) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };

  const stopDragAnimation = () => {
    if (dragFrame !== 0) {
      cancelAnimationFrame(dragFrame);
      dragFrame = 0;
    }
  };

  const animateDrag = () => {
    const rect = element.getBoundingClientRect();
    const next = resolveDraggedPosition({
      previousX: x,
      previousY: y,
      targetX: dragTargetX,
      targetY: dragTargetY,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      walls: getWallRects(),
    });

    x = next.x;
    y = next.y;
    applyPosition();

    if (
      pointerId === null ||
      (Math.abs(x - dragTargetX) < 0.5 && Math.abs(y - dragTargetY) < 0.5)
    ) {
      dragFrame = 0;
      return;
    }

    dragFrame = requestAnimationFrame(animateDrag);
  };

  const startDragAnimation = () => {
    if (dragFrame !== 0) {
      return;
    }

    dragFrame = requestAnimationFrame(animateDrag);
  };

  const animate = (time: number) => {
    if (lastFrameTime === 0) {
      lastFrameTime = time;
    }

    const deltaMs = Math.min(32, time - lastFrameTime);
    lastFrameTime = time;

    const rect = element.getBoundingClientRect();
    const next = stepMotion({
      x,
      y,
      vx,
      vy,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      deltaMs,
      walls: getWallRects(),
    });

    x = next.x;
    y = next.y;
    vx = next.vx;
    vy = next.vy;
    applyPosition();

    if (Math.hypot(vx, vy) < MIN_THROW_SPEED) {
      vx = 0;
      vy = 0;
      animationFrame = 0;
      return;
    }

    animationFrame = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (Math.hypot(vx, vy) < MIN_THROW_SPEED) {
      return;
    }

    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(animate);
  };

  const addSample = (clientX: number, clientY: number, time: number) => {
    samples.push({ x: clientX, y: clientY, time });
    samples = samples.filter(
      (sample) => time - sample.time <= SAMPLE_WINDOW_MS,
    );
  };

  const updateVelocity = () => {
    const first = samples[0];
    const last = samples.at(-1);

    if (!first || !last || first.time === last.time) {
      vx = 0;
      vy = 0;
      return;
    }

    const deltaMs = last.time - first.time;
    vx = (last.x - first.x) / deltaMs;
    vy = (last.y - first.y) / deltaMs;
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary) {
      return;
    }

    stopAnimation();
    stopDragAnimation();
    fixToViewport();
    pointerId = event.pointerId;
    element.setPointerCapture(pointerId);
    element.style.cursor = "grabbing";
    offsetX = event.clientX - x;
    offsetY = event.clientY - y;
    dragTargetX = x;
    dragTargetY = y;
    samples = [];
    addSample(event.clientX, event.clientY, event.timeStamp);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    dragTargetX = event.clientX - offsetX;
    dragTargetY = event.clientY - offsetY;
    addSample(event.clientX, event.clientY, event.timeStamp);
    updateVelocity();
    startDragAnimation();
  };

  const releasePointer = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (pointerId !== null && element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    pointerId = null;
    stopDragAnimation();
    element.style.cursor = "grab";
    updateVelocity();
    startAnimation();
  };

  const handleResize = () => {
    if (!isFixed) {
      return;
    }

    const rect = element.getBoundingClientRect();
    x = clamp(x, 0, Math.max(0, window.innerWidth - rect.width));
    y = clamp(y, 0, Math.max(0, window.innerHeight - rect.height));
    applyPosition();
  };

  element.addEventListener("pointerdown", handlePointerDown);
  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerup", releasePointer);
  element.addEventListener("pointercancel", releasePointer);
  window.addEventListener("resize", handleResize);

  return () => {
    stopAnimation();
    stopDragAnimation();

    if (pointerId !== null && element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    pointerId = null;
    element.removeEventListener("pointerdown", handlePointerDown);
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerup", releasePointer);
    element.removeEventListener("pointercancel", releasePointer);
    window.removeEventListener("resize", handleResize);
  };
}
