const MIN_THROW_SPEED = 0.04;
const THROW_FRICTION_PER_FRAME = 0.97;
const SAMPLE_WINDOW_MS = 100;
const FRAME_MS = 1000 / 60;

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

type MotionInput = MotionState & {
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  deltaMs: number;
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

function stepMotion({
  x,
  y,
  vx,
  vy,
  width,
  height,
  viewportWidth,
  viewportHeight,
  deltaMs,
}: MotionInput): MotionState {
  const horizontal = reflectAxis(x, vx, width, viewportWidth, deltaMs);
  const vertical = reflectAxis(y, vy, height, viewportHeight, deltaMs);
  const damping = getFrameFriction(deltaMs);

  return {
    x: horizontal.position,
    y: vertical.position,
    vx: horizontal.velocity * damping,
    vy: vertical.velocity * damping,
  };
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
  let lastFrameTime = 0;
  let pointerId: number | null = null;
  let samples: PointerSample[] = [];
  let isFixed = false;

  const applyPosition = () => {
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

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
    fixToViewport();
    pointerId = event.pointerId;
    element.setPointerCapture(pointerId);
    element.style.cursor = "grabbing";
    offsetX = event.clientX - x;
    offsetY = event.clientY - y;
    samples = [];
    addSample(event.clientX, event.clientY, event.timeStamp);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    const rect = element.getBoundingClientRect();
    x = clamp(
      event.clientX - offsetX,
      0,
      Math.max(0, window.innerWidth - rect.width),
    );
    y = clamp(
      event.clientY - offsetY,
      0,
      Math.max(0, window.innerHeight - rect.height),
    );
    addSample(event.clientX, event.clientY, event.timeStamp);
    updateVelocity();
    applyPosition();
  };

  const releasePointer = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (pointerId !== null && element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    pointerId = null;
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
    element.removeEventListener("pointerdown", handlePointerDown);
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerup", releasePointer);
    element.removeEventListener("pointercancel", releasePointer);
    window.removeEventListener("resize", handleResize);
  };
}
