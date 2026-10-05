import type { ZelligeTile } from '@/components/zellige/geometry';
import type { Pillar } from '@/content/types';
import { START_RUNWAY, zoneAt } from './level';
import { createBlockSprites, gemPath, type BlockSprites } from './sprites';
import {
  BLOCK,
  GROUND_Y,
  VIEW_H,
  VIEW_W,
  type GameCallbacks,
  type GameColors,
  type Item,
  type Level,
  type Obstacle,
} from './types';

// Physics (logical pixels, seconds).
const STEP = 1 / 120;
const GRAVITY = 2300;
const JUMP_V = 820;
const DOUBLE_JUMP_V = 700;
const JUMP_CUT_V = 320;
const COYOTE = 0.1;
const BUFFER = 0.12;
const PLAYER_X = 220;
const PW = 26;
const PH = 38;
/** Platform blocks are "built" this far ahead of the player. */
const BUILD_AHEAD = 170;

export interface GameOptions {
  canvas: HTMLCanvasElement;
  level: Level;
  tile: ZelligeTile;
  colors: GameColors;
  zoneNames: Record<Pillar, string>;
  finishLabel: string;
  calm: boolean;
  reducedMotion: boolean;
  callbacks: GameCallbacks;
}

export interface GameController {
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  press: () => void;
  release: () => void;
  resize: () => void;
  destroy: () => void;
  readonly running: boolean;
}

const overlap = (
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

export function createGame(o: GameOptions): GameController {
  const { canvas, level, colors, callbacks } = o;
  const ctx = canvas.getContext('2d')!;
  const speed = o.calm ? 225 : 300;
  const fonts = getComputedStyle(document.documentElement);
  const displayFont = fonts.getPropertyValue('--font-fraunces').trim() || 'Georgia';
  const monoFont = fonts.getPropertyValue('--font-jetbrains').trim() || 'monospace';

  let dpr = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let sprites: BlockSprites;
  const gem = gemPath(13);
  const gemInner = gemPath(5);

  // State
  let camX = 0;
  let y = GROUND_Y - PH;
  let vy = 0;
  let onGround = true;
  let coyote = 0;
  let buffer = 0;
  let held = false;
  let airJumps = 1;
  let invuln = 0;
  let stun = 0;
  let score = 0;
  let streak = 0;
  let zone = 0;
  let time = 0;
  let finished = false;
  let running = false;
  let frame = 0;
  let last = 0;
  let acc = 0;
  const collected: Item[] = [];

  const multiplier = () => 1 + Math.min(2, Math.floor(streak / 3));
  const emitScore = () => callbacks.onScore(score, multiplier());

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    if (rect.width / rect.height >= VIEW_W / VIEW_H) {
      // Wide screens: fit the whole view, centred.
      scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H);
      offsetX = (rect.width - VIEW_W * scale) / 2;
    } else {
      // Narrow (portrait) screens: fill the height and crop the right side,
      // so the game stays readable; the player runs near the left edge.
      scale = rect.height / VIEW_H;
      offsetX = 0;
    }
    offsetY = (rect.height - VIEW_H * scale) / 2;
    sprites = createBlockSprites(o.tile, colors, dpr * scale);
    if (!running) render();
  }

  function hit(reason: 'obstacle' | 'fall', penalty: number) {
    score = Math.max(0, score - penalty);
    streak = 0;
    invuln = 1.3;
    callbacks.onHit(reason);
    emitScore();
  }

  function respawn() {
    const px = camX + PLAYER_X;
    const next = level.platforms
      .filter((p) => p.y === GROUND_Y && p.x + p.blocks * BLOCK > px + PW + 30)
      .sort((a, b) => a.x - b.x)[0];
    if (next && next.x > px) camX = next.x + 20 - PLAYER_X;
    y = GROUND_Y - PH - 240;
    vy = 0;
    airJumps = 1;
  }

  function finish(skipped: boolean) {
    if (finished) return;
    finished = true;
    running = false;
    cancelAnimationFrame(frame);
    render();
    callbacks.onEnd({ score, collected: [...collected], total: level.items.length, skipped });
  }

  function update(dt: number) {
    time += dt;
    const prevBottom = y + PH;
    camX += speed * dt * (stun > 0 ? 0.55 : 1);
    invuln = Math.max(0, invuln - dt);
    stun = Math.max(0, stun - dt);
    buffer = Math.max(0, buffer - dt);

    // Jump: buffered presses, coyote time, one extra jump in the air.
    if (buffer > 0 && (onGround || coyote > 0)) {
      vy = -JUMP_V;
      onGround = false;
      coyote = 0;
      buffer = 0;
    } else if (buffer > 0 && airJumps > 0) {
      vy = -DOUBLE_JUMP_V;
      airJumps--;
      buffer = 0;
    }
    if (!held && vy < -JUMP_CUT_V) vy = -JUMP_CUT_V;

    vy += GRAVITY * dt;
    y += vy * dt;

    // One-way platforms: land only when falling onto their top.
    const px = camX + PLAYER_X;
    const wasOnGround = onGround;
    onGround = false;
    if (vy >= 0) {
      for (const p of level.platforms) {
        if (
          px + PW > p.x + 2 &&
          px < p.x + p.blocks * BLOCK - 2 &&
          prevBottom <= p.y + 1 &&
          y + PH >= p.y
        ) {
          y = p.y - PH;
          vy = 0;
          onGround = true;
          airJumps = 1;
          break;
        }
      }
    }
    coyote = onGround ? COYOTE : wasOnGround ? COYOTE : Math.max(0, coyote - dt);

    if (y > VIEW_H + 60) {
      hit('fall', 100);
      respawn();
    }

    for (const item of level.items) {
      if (item.taken || Math.abs(item.x - px) > 60) continue;
      if (overlap(px, y, PW, PH, item.x - 16, item.y - 16, 32, 32)) {
        item.taken = true;
        streak++;
        score += 100 * multiplier();
        collected.push(item);
        callbacks.onCollect(item);
        emitScore();
      }
    }

    for (const ob of level.obstacles) {
      if (ob.squashed) continue;
      if (ob.kind === 'bug') {
        ob.x += ob.dir * 70 * dt;
        if (ob.x < ob.minX) ob.dir = 1;
        if (ob.x > ob.maxX) ob.dir = -1;
      }
      if (invuln > 0 || Math.abs(ob.x - px) > 80) continue;
      if (overlap(px + 3, y + 2, PW - 6, PH - 2, ob.x, ob.y, ob.w, ob.h)) {
        if (ob.kind === 'bug' && vy > 0 && prevBottom <= ob.y + 10) {
          ob.squashed = true;
          vy = -560;
          score += 50 * multiplier();
          emitScore();
        } else {
          hit('obstacle', 50);
          stun = 0.5;
          vy = -420;
        }
      }
    }

    const z = zoneAt(px, level.zoneLength);
    if (z !== zone) {
      zone = z;
      callbacks.onZone(zone);
    }
    callbacks.onProgress(
      Math.min(1, Math.max(0, (px - START_RUNWAY) / (level.end - START_RUNWAY))),
    );
    if (px >= level.end) finish(false);
  }

  // ---------- Rendering ----------

  function drawBackground() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // Faint zellige wall, slow parallax (static with reduced motion).
    const size = BLOCK * 3;
    const shift = o.reducedMotion ? 0 : (camX * 0.25) % size;
    ctx.globalAlpha = 0.16;
    for (let gx = -shift; gx < VIEW_W; gx += size) {
      for (let gy = 0; gy < GROUND_Y; gy += size) {
        ctx.drawImage(sprites.ghost, gx, gy, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGates() {
    level.zones.forEach((pillar, i) => {
      const gx = START_RUNWAY + i * level.zoneLength - camX;
      if (gx < -300 || gx > VIEW_W + 300) return;
      ctx.fillStyle = colors.pillar[pillar];
      ctx.fillRect(gx - 3, 120, 6, GROUND_Y - 120);
      ctx.font = `600 34px ${displayFont}`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(o.zoneNames[pillar], gx + 16, 160);
      ctx.font = `14px ${monoFont}`;
      ctx.fillStyle = colors.muted;
      ctx.fillText(`0${i + 1} / 03`, gx + 16, 132);
    });
    const fx = level.end - camX;
    if (fx > -200 && fx < VIEW_W + 200) {
      ctx.fillStyle = colors.fg;
      ctx.fillRect(fx - 3, 150, 6, GROUND_Y - 150);
      ctx.font = `600 40px ${displayFont}`;
      ctx.fillText(o.finishLabel, fx + 18, 200);
    }
  }

  function drawPlatforms() {
    const px = camX + PLAYER_X;
    for (const p of level.platforms) {
      const width = p.blocks * BLOCK;
      if (p.x + width < camX - BLOCK || p.x > camX + VIEW_W + BLOCK) continue;
      const pillar = level.zones[p.zone]!;
      for (let b = 0; b < p.blocks; b++) {
        const bx = p.x + b * BLOCK;
        const sx = bx - camX;
        if (sx < -BLOCK || sx > VIEW_W) continue;
        const rows = p.y === GROUND_Y ? 2 : 1;
        // Each block is laid down as the player approaches it.
        const t = o.reducedMotion
          ? bx < px + BUILD_AHEAD
            ? 1
            : 0
          : Math.min(1, Math.max(0, (px + BUILD_AHEAD - bx) / 90));
        for (let r = 0; r < rows; r++) {
          const sy = p.y + r * BLOCK;
          if (t < 1) ctx.drawImage(sprites.ghost, sx, sy, BLOCK, BLOCK);
          if (t > 0) {
            const s = 0.82 + 0.18 * t;
            const d = (BLOCK * (1 - s)) / 2;
            ctx.globalAlpha = t;
            ctx.drawImage(sprites.built[pillar], sx + d, sy + d, BLOCK * s, BLOCK * s);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
  }

  function drawItems() {
    ctx.textAlign = 'center';
    for (const item of level.items) {
      const sx = item.x - camX;
      if (item.taken || sx < -80 || sx > VIEW_W + 80) continue;
      const bob = o.reducedMotion ? 0 : Math.sin(time * 3 + item.id) * 4;
      ctx.save();
      ctx.translate(sx, item.y + bob);
      ctx.fillStyle = colors.pillar[item.pillar];
      ctx.fill(gem);
      ctx.fillStyle = colors.bg;
      ctx.fill(gemInner);
      ctx.restore();
      ctx.font = `12px ${monoFont}`;
      ctx.fillStyle = colors.fg;
      ctx.fillText(item.label, sx, item.y + bob - 22);
    }
    ctx.textAlign = 'start';
  }

  function drawObstacle(ob: Obstacle) {
    const sx = ob.x - camX;
    if (sx < -60 || sx > VIEW_W + 60) return;
    if (ob.kind === 'bug') {
      ctx.fillStyle = colors.zInk;
      ctx.strokeStyle = colors.zInk;
      ctx.lineWidth = 2;
      if (ob.squashed) {
        ctx.fillRect(sx, GROUND_Y - 5, ob.w, 5);
        return;
      }
      const legs = o.reducedMotion ? 0 : Math.sin(time * 18) * 3;
      for (let i = 0; i < 3; i++) {
        const lx = sx + 8 + i * 9;
        ctx.beginPath();
        ctx.moveTo(lx, ob.y + 14);
        ctx.lineTo(lx + (i % 2 ? legs : -legs), ob.y + ob.h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(sx + ob.w / 2, ob.y + 11, ob.w / 2, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      const eye = ob.dir < 0 ? sx + 7 : sx + ob.w - 9;
      ctx.fillRect(eye, ob.y + 7, 3, 3);
    } else {
      // "Scope creep": a blob that keeps swelling.
      const pulse = o.reducedMotion ? 1 : 1 + Math.sin(time * 4 + ob.id) * 0.08;
      ctx.fillStyle = colors.pillar.design;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(
        sx + ob.w / 2,
        GROUND_Y - (ob.h / 2) * pulse,
        (ob.w / 2) * pulse,
        (ob.h / 2) * pulse,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(sx + ob.w / 2 - 6, GROUND_Y - ob.h * 0.62, 4, 4);
      ctx.fillRect(sx + ob.w / 2 + 3, GROUND_Y - ob.h * 0.62, 4, 4);
    }
  }

  function drawPlayer() {
    const blink = invuln > 0 && (o.reducedMotion ? true : Math.floor(time * 12) % 2 === 0);
    ctx.globalAlpha = blink ? 0.4 : 1;
    const x = PLAYER_X;
    const pillar = level.zones[zone]!;
    // Legs
    ctx.fillStyle = colors.fg;
    const stride = onGround && !o.reducedMotion ? Math.sin(time * 22) * 5 : 0;
    ctx.fillRect(x + 5 + stride, y + PH - 10, 6, 10);
    ctx.fillRect(x + PW - 11 - stride, y + PH - 10, 6, 10);
    // Body
    ctx.beginPath();
    ctx.roundRect(x, y + 8, PW, PH - 16, 6);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(x + PW / 2, y + 6, 9, 0, Math.PI * 2);
    ctx.fill();
    // Scarf in the zone colour
    ctx.fillStyle = colors.pillar[pillar];
    ctx.fillRect(x - 2, y + 12, PW + 4, 5);
    ctx.fillRect(x - 9, y + 12 + (o.reducedMotion ? 0 : Math.sin(time * 14) * 2), 9, 4);
    // Eye
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x + PW / 2 + 3, y + 3, 3, 3);
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VIEW_W, VIEW_H);
    ctx.clip();
    drawBackground();
    drawGates();
    drawPlatforms();
    drawItems();
    level.obstacles.forEach(drawObstacle);
    drawPlayer();
    ctx.restore();
  }

  function loop(now: number) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP && running) {
      update(STEP);
      acc -= STEP;
    }
    render();
    if (running) frame = requestAnimationFrame(loop);
  }

  function run() {
    if (running || finished) return;
    running = true;
    last = performance.now();
    acc = 0;
    frame = requestAnimationFrame(loop);
  }

  resize();

  return {
    start: () => {
      callbacks.onZone(0);
      emitScore();
      run();
    },
    pause: () => {
      running = false;
      cancelAnimationFrame(frame);
    },
    resume: run,
    skip: () => finish(true),
    press: () => {
      buffer = BUFFER;
      held = true;
    },
    release: () => {
      held = false;
    },
    resize,
    destroy: () => {
      running = false;
      cancelAnimationFrame(frame);
    },
    get running() {
      return running;
    },
  };
}
