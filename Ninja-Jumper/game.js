// ══════════════════════════════════════════════════
//  Ninja Jumper — game.js  (Complete — all 6 phases + City Theme)
//  Phase 1: Core Loop        Phase 2: Obstacles & Collision
//  Phase 3: Double Jump & Coins   Phase 4: Pixel Art & Backgrounds
//  Phase 5: Polish & Mobile  Phase 6: Sound, Pause, Birds, Blossoms
//  Phase 7: Procedural City Theme (crossfade at score 60–120)
// ══════════════════════════════════════════════════

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ── Canvas sizing ──────────────────────────────────
const BASE_W = 800;
const BASE_H = 320;

function resize() {
  const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
  canvas.width  = BASE_W;
  canvas.height = BASE_H;
  canvas.style.width  = Math.floor(BASE_W * scale) + 'px';
  canvas.style.height = Math.floor(BASE_H * scale) + 'px';
}
window.addEventListener('resize', resize);
resize();

// ── Constants ──────────────────────────────────────
const GROUND_Y    = 248;
const PLAYER_W    = 20;
const PLAYER_H    = 30;
const PLAYER_X    = 100;
const GRAVITY     = 0.65;
const JUMP_VY     = -13;
const DJUMP_VY    = -10;
const BASE_SPEED  = 4;
const SPEED_CAP   = 9;
const TILE_W      = 40;
const COIN_R      = 7;
const DEAD_FRAMES = 72;

// ── Colour palette ─────────────────────────────────
const C = {
  // Japan sky
  skyDeep:    '#060616',
  sky:        '#0b0b1f',
  moonGlow:   '#fffbe6',
  moonShadow: '#0b0b1f',
  mountFar:   '#13132e',
  mountMid:   '#1a1a40',
  houseSil:   '#111130',
  houseWin:   'rgba(255,200,80,0.14)',
  // Japan ground
  groundTop:  '#5c3d1e',
  groundBody: '#3d2810',
  tileEdge:   '#7a5230',
  tileDivide: '#2a1a08',
  // City sky
  citySkyDeep:    '#08052a',
  citySky:        '#1a0840',
  cityHaze:       '#4a1278',
  cityBldFar:     '#141418',
  cityBldMid:     '#1a1a22',
  cityWinLit:     'rgba(200,200,215,0.75)',
  cityWinOff:     'rgba(20,20,40,0.8)',
  cityNeonPink:   '#ff2080',
  cityNeonCyan:   '#00eeff',
  cityNeonGreen:  '#00ff88',
  cityNeonYellow: '#ffee00',
  // Space sky
  spaceSkyDeep: '#000008',
  spaceSkyMid:  '#00000f',
  // City ground
  cityAsphalt:  '#7a7a82',
  cityRoadLine: '#9a9aa2',
  cityRoadMark: '#e8e8e0',
  // City obstacles
  trashBody: '#2a7a2a',
  trashLid:  '#1a5a1a',
  lampPost:  '#8888a0',
  lampLight: '#ffe8a0',
  // Player
  playerBody: '#1c1c38',
  playerHead: '#252550',
  headband:   '#e0e0e0',
  scarf:      '#2a2060',
  eye:        '#c8f0ff',
  blade:      '#c0c0d8',
  guard:      '#c8a020',
  grip:       '#8b6914',
  // Japan obstacles
  spikeBody:  '#b8924a',
  spikeHi:    '#e8c87a',
  poleBody:   '#5c3318',
  poleHi:     '#8b5e2e',
  lanternRed: '#e05500',
  lanternYel: '#ffcc00',
  // Shared
  coinGold:   '#f0c020',
  coinHi:     '#ffe880',
  coinShade:  '#a07800',
  bird:       '#cc2020',
  birdEye:    '#ffff88',
  hudGold:    '#ffe566',
  hudGrey:    '#777755',
  hudCoin:    '#f0c020',
  startGreen: '#33ff99',
  deadRed:    '#ff2244',
  flashWhite: '#ffffff',
  pauseBlue:  '#66aaff',
};

// ── Stars ──────────────────────────────────────────
const STARS = Array.from({ length: 55 }, () => ({
  x:   Math.random() * BASE_W,
  y:   Math.random() * 175,
  big: Math.random() < 0.18,
}));

// ── Japan: Mountain ridge (600 px tile) ────────────
const RIDGE_TILE = 600;
const RIDGE_PTS  = [
  [  0, 215], [ 28, 205], [ 52, 192], [ 72, 178], [ 88, 162],
  [103, 148], [116, 133], [130, 148], [148, 163], [162, 148],
  [175, 133], [192, 148], [208, 162], [228, 172], [248, 158],
  [262, 143], [276, 128], [294, 145], [310, 160], [328, 170],
  [348, 158], [366, 143], [382, 130], [400, 148], [416, 163],
  [434, 173], [450, 158], [466, 142], [482, 128], [500, 144],
  [516, 162], [536, 173], [558, 183], [576, 196], [600, 215],
];
const PAGODA_POS = [118, 380];

// ── Japan: House layout (480 px tile) ──────────────
const HOUSE_TILE   = 480;
const HOUSE_LAYOUT = [
  { type: 'large', rx:  10, w: 90, h: 72 },
  { type: 'small', rx: 116, w: 60, h: 50 },
  { type: 'torii', rx: 202 },
  { type: 'large', rx: 254, w: 80, h: 65 },
  { type: 'small', rx: 360, w: 56, h: 46 },
  { type: 'small', rx: 420, w: 48, h: 56 },
];

// ── City: Far buildings (800 px tile, 0.10x parallax) ─
const CITY_FAR_TILE  = 800;
const CITY_FAR_BLDGS = [
  { rx:   0, w: 55, h: 175 },
  { rx:  60, w: 40, h: 135 },
  { rx: 105, w: 75, h: 200 },
  { rx: 185, w: 30, h: 115 },
  { rx: 220, w: 65, h: 158 },
  { rx: 290, w: 48, h: 178 },
  { rx: 343, w: 85, h: 215 },
  { rx: 433, w: 38, h: 128 },
  { rx: 476, w: 60, h: 168 },
  { rx: 541, w: 52, h: 148 },
  { rx: 598, w: 70, h: 192 },
  { rx: 673, w: 42, h: 138 },
  { rx: 720, w: 28, h: 108 },
  { rx: 753, w: 47, h: 155 },
];

// ── City: Mid buildings (480 px tile, 0.35x parallax) ─
const NEON_COLORS    = [C.cityNeonPink, C.cityNeonCyan, C.cityNeonGreen, C.cityNeonYellow];
const CITY_MID_TILE  = 480;
const CITY_MID_BLDGS = [
  { rx:   0, w: 82, h: 128, neon:  0 },
  { rx:  87, w: 52, h:  98, neon: -1 },
  { rx: 144, w: 68, h: 120, neon:  1 },
  { rx: 217, w: 44, h:  88, neon: -1 },
  { rx: 266, w: 80, h: 138, neon:  2 },
  { rx: 351, w: 58, h: 108, neon:  3 },
  { rx: 414, w: 62, h:  95, neon: -1 },
];

// ── Space: Planets (1000 px tile, 0.06x parallax) ──
const SPACE_PLANET_TILE = 1000;
const SPACE_PLANETS = [
  { rx:  90, ry:  72, r: 38, color: '#cc3311', shadowOff:  0.18, ring: false },
  { rx: 380, ry: 115, r: 24, color: '#3355cc', shadowOff:  0.20, ring: false },
  { rx: 640, ry:  52, r: 52, color: '#ccaa22', shadowOff:  0.15, ring: true,  ringColor: '#a88018' },
  { rx: 850, ry:  95, r: 19, color: '#33aa66', shadowOff:  0.22, ring: false },
];

// Rainbow colours for space floor
const RAINBOW = ['#ff2020','#ff8800','#eeee00','#22cc22','#2255ff','#8833cc','#cc44ff'];

// ══════════════════════════════════════════════════
//  Phase 6: Web Audio (8-bit synthesised sounds)
// ══════════════════════════════════════════════════

let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || (/** @type {any} */ (window)).webkitAudioContext)(); }
  catch (_) { audioCtx = null; }
}

function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now  = audioCtx.currentTime;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'jump':
      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
      break;

    case 'djump':
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.13);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
      break;

    case 'coin': {
      const osc2  = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2); gain2.connect(audioCtx.destination);
      osc.type  = 'triangle';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.07);
      osc2.frequency.setValueAtTime(1100, now);
      osc2.frequency.setValueAtTime(1760, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.linearRampToValueAtTime(0, now + 0.18);
      osc.start(now);  osc.stop(now + 0.18);
      osc2.start(now); osc2.stop(now + 0.18);
      break;
    }

    case 'death':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.55);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.55);
      osc.start(now); osc.stop(now + 0.55);
      break;
  }
}

// ══════════════════════════════════════════════════
//  Game state
// ══════════════════════════════════════════════════
// States: 'start' | 'playing' | 'dying' | 'dead' | 'paused'

let state      = 'start';
let score      = 0;
let bestScore  = +(localStorage.getItem('nj_best') || 0);
let speed      = BASE_SPEED;
let scrollX    = 0;
let scoreMs    = 0;
let coinCount  = 0;
let gameTime   = 0;
let flashText  = '';
let flashTimer = 0;
let themeBlend = 0;   // 0 = pure Japan, 1 = pure City
let spaceBlend = 0;   // 0 = pure City,  1 = pure Space
let spaceStars = [];  // fast-moving streaking stars

// ── Particles ──────────────────────────────────────
let particles = [];

function spawnBurst(x, y, count, colors) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const spd   = 1.5 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 0.5,
      life:    24 + (Math.random() * 10 | 0),
      maxLife: 34,
      color: colors[Math.random() * colors.length | 0],
      sz:    2 + Math.random() * 2,
    });
  }
}

// ── Player ─────────────────────────────────────────
const pl = {
  x: PLAYER_X,
  y: GROUND_Y - PLAYER_H,
  vy: 0,
  grounded: true,
  jumps: 0,
  spinning: 0,
  frame: 0,
  frameT: 0,
  deadTimer: 0,
  deadVy: 0,
  deadVx: 0,
  deadAngle: 0,
};

function plReset() {
  pl.x         = PLAYER_X;
  pl.y         = GROUND_Y - PLAYER_H;
  pl.vy        = 0;
  pl.grounded  = true;
  pl.jumps     = 0;
  pl.spinning  = 0;
  pl.frame     = 0;
  pl.frameT    = 0;
  pl.deadTimer = 0;
  pl.deadVy    = 0;
  pl.deadVx    = 0;
  pl.deadAngle = 0;
}

// ── Segments ───────────────────────────────────────
let segs = [];

function makeObs(segW) {
  const useSpace = spaceBlend > 0.5;
  const useCity  = !useSpace && themeBlend > 0.5;
  const isShort  = Math.random() < 0.5;
  const type     = useSpace
    ? (isShort ? 'asteroid'    : 'satellite')
    : useCity
      ? (isShort ? 'trashcan'  : 'streetlight')
      : (isShort ? 'spike'     : 'pole');
  const pad = 70;
  const rx  = pad + Math.random() * Math.max(0, segW - pad * 2 - 16);
  return (type === 'spike' || type === 'trashcan' || type === 'asteroid')
    ? { type, rx, ow: 16, oh: 28, passed: false }
    : { type, rx, ow: 12, oh: 52, passed: false };
}

function makeCoins(segW, obsRx) {
  const list  = [];
  const count = 1 + (Math.random() * 3 | 0);
  for (let i = 0; i < count; i++) {
    const pad = 35;
    const rx  = pad + Math.random() * (segW - pad * 2);
    if (obsRx !== undefined && Math.abs(rx - obsRx) < 40) continue;
    list.push({ rx, collected: false, animT: Math.random() * 60 | 0 });
  }
  return list;
}

function spawnSeg() {
  const last = segs[segs.length - 1];
  if (!last || last.x + last.w > BASE_W + 320) return;

  const rightEdge = last.x + last.w;
  const hasGap    = Math.random() < 0.38;
  const gapW      = hasGap ? 70 + Math.random() * 90 : 0;
  const segW      = (160 + (speed - BASE_SPEED) * 14) + Math.random() * 240;
  const obs       = [];
  let obsRx;

  const obsChance = Math.max(0.18, 0.5 * (BASE_SPEED / speed));
  if (segW > 140 && Math.random() < obsChance) {
    const o = makeObs(segW);
    obs.push(o);
    obsRx = o.rx;
  }

  const coins = Math.random() < 0.65 ? makeCoins(segW, obsRx) : [];
  segs.push({ x: rightEdge + gapW, w: segW, obs, coins });
}

function initSegs() {
  segs = [{ x: 0, w: 580, obs: [], coins: [] }];
  for (let i = 0; i < 10; i++) spawnSeg();
}

// ── Phase 6: Cherry blossom petals ─────────────────
let petals = [];

function spawnPetal() {
  petals.push({
    x:      Math.random() * (BASE_W + 40) - 20,
    y:      -6,
    vx:     -0.3 - Math.random() * 0.4,
    vy:     0.5 + Math.random() * 0.7,
    wobble: Math.random() * Math.PI * 2,
    size:   (1 + Math.random() * 2) | 0,
    color:  Math.random() < 0.7 ? '#ffb7c5' : '#ffd4e0',
    alpha:  0.4 + Math.random() * 0.5,
  });
}

// ── Phase 6 / City: Birds & neon signs ─────────────
let birds    = [];
let birdTimer = 220;

const BIRD_Y = 95;

function spawnBird() {
  const isCity  = themeBlend > 0.5;
  const neonIdx = Math.random() * NEON_COLORS.length | 0;
  birds.push({
    x:         BASE_W + 20,
    y:         BIRD_Y,
    frame:     0,
    frameT:    0,
    city:      isCity,
    neonColor: isCity ? NEON_COLORS[neonIdx] : null,
  });
}

// ── Input ──────────────────────────────────────────
let jumpHeld = false;

function onJump() {
  initAudio();
  if (state === 'start')  { startGame(); return; }
  if (state === 'dead')   { restartGame(); return; }
  if (state === 'dying')  return;
  if (state === 'paused') return;

  if (pl.grounded) {
    pl.vy       = JUMP_VY;
    pl.grounded = false;
    pl.jumps    = 1;
    playSound('jump');
  } else if (pl.jumps === 1) {
    pl.vy       = DJUMP_VY;
    pl.jumps    = 2;
    pl.spinning = 18;
    spawnBurst(
      pl.x + PLAYER_W / 2, pl.y + PLAYER_H / 2,
      8, ['#ffffff', '#ffe566', '#aaffff', '#ffaaff']
    );
    playSound('djump');
  }
}

window.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (state === 'playing') { state = 'paused'; return; }
    if (state === 'paused')  { state = 'playing'; return; }
  }
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (!jumpHeld) onJump();
    jumpHeld = true;
  }
});
window.addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') jumpHeld = false;
});
canvas.addEventListener('pointerdown', onJump);

// ── Game management ────────────────────────────────
function startGame() {
  state      = 'playing';
  score      = 0;
  scoreMs    = 0;
  coinCount  = 0;
  gameTime   = 0;
  flashText  = '';
  flashTimer = 0;
  speed      = BASE_SPEED;
  scrollX    = 0;
  themeBlend = 0;
  spaceBlend = 0;
  spaceStars = [];
  particles  = [];
  petals     = [];
  birds      = [];
  birdTimer  = 220;
  initSegs();
  plReset();
}

function restartGame() { startGame(); }

function triggerDeath(fromFall = false) {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('nj_best', String(bestScore));
  }
  if (fromFall) { state = 'dead'; return; }
  state        = 'dying';
  pl.deadTimer = DEAD_FRAMES;
  pl.deadVy    = -8;
  pl.deadVx    = -1.5;
  pl.deadAngle = 0;
  spawnBurst(
    pl.x + PLAYER_W / 2, pl.y + PLAYER_H / 2,
    14, ['#ff4444', '#ff8800', '#ffff44', '#ffffff']
  );
  playSound('death');
}

// ── Collision helpers ──────────────────────────────
function plHitbox() {
  return { x: pl.x + 4, y: pl.y + 4, w: PLAYER_W - 8, h: PLAYER_H - 4 };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ══════════════════════════════════════════════════
//  Update
// ══════════════════════════════════════════════════

function update(dt) {

  if (state === 'dying') {
    pl.deadTimer--;
    pl.x         += pl.deadVx;
    pl.y         += pl.deadVy;
    pl.deadVy    += GRAVITY * 0.6;
    pl.deadAngle += 0.22;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
    }
    particles = particles.filter(p => p.life > 0);
    if (pl.deadTimer <= 0) state = 'dead';
    return;
  }

  if (state !== 'playing') return;

  gameTime += dt;
  speed = Math.min(BASE_SPEED + score * 0.01, SPEED_CAP);

  // Theme blend: Japan until score 350, crossfade 350→400, full City 400+
  themeBlend = Math.max(0, Math.min(1, (score - 350) / 50));
  // Space blend: City until score 950, crossfade 950→1000, full Space 1000+
  spaceBlend = Math.max(0, Math.min(1, (score - 950) / 50));

  scrollX += speed;
  for (const s of segs) s.x -= speed;
  segs = segs.filter(s => s.x + s.w > -10);
  spawnSeg();

  pl.vy      += GRAVITY;
  pl.y       += pl.vy;
  pl.grounded = false;

  for (const s of segs) {
    const inX = pl.x + PLAYER_W > s.x && pl.x < s.x + s.w;
    if (inX && pl.vy >= 0 && pl.y + PLAYER_H >= GROUND_Y) {
      pl.y        = GROUND_Y - PLAYER_H;
      pl.vy       = 0;
      pl.grounded = true;
      pl.jumps    = 0;
      break;
    }
  }

  if (!pl.grounded && pl.y + PLAYER_H > GROUND_Y + 25) { triggerDeath(true); return; }

  const ph = plHitbox();

  for (const s of segs) {
    for (const o of s.obs) {
      const ox = s.x + o.rx;
      const oy = GROUND_Y - o.oh;
      if (overlaps(ph, { x: ox, y: oy, w: o.ow, h: o.oh })) {
        triggerDeath(false); return;
      }
      if (!o.passed && ox + o.ow < PLAYER_X) {
        o.passed = true;
        score   += 5;
      }
    }
  }

  const coinY = GROUND_Y - COIN_R * 2 - 2;
  for (const s of segs) {
    for (const co of s.coins) {
      if (co.collected) continue;
      const cx      = s.x + co.rx;
      const coinBox = { x: cx - COIN_R, y: coinY - COIN_R, w: COIN_R * 2, h: COIN_R * 2 };
      if (overlaps(ph, coinBox)) {
        co.collected = true;
        score       += 10;
        coinCount++;
        flashText    = '+10';
        flashTimer   = 45;
        spawnBurst(cx, coinY, 6, ['#f0c020', '#ffe880', '#ffffff']);
        playSound('coin');
      }
      co.animT++;
    }
  }

  birdTimer--;
  if (birdTimer <= 0 && gameTime > 8000) {
    if (Math.random() < 0.45) spawnBird();
    birdTimer = 160 + (Math.random() * 220 | 0);
  }
  for (const b of birds) {
    b.x -= speed;
    b.frameT++;
    if (b.frameT > 10) { b.frameT = 0; b.frame = 1 - b.frame; }
  }
  birds = birds.filter(b => b.x > -60);

  // Collision: neon sign is wider (36px), bird uses inset (20px)
  for (const b of birds) {
    const hitbox = b.city
      ? { x: b.x + 2,  y: b.y, w: 32, h: 14 }
      : { x: b.x + 4,  y: b.y, w: 20, h: 14 };
    if (overlaps(ph, hitbox)) { triggerDeath(false); return; }
  }

  // Space streaking stars
  if (spaceBlend > 0 && Math.random() < 0.4 * spaceBlend) {
    spaceStars.push({
      x:     BASE_W + 5,
      y:     2 + Math.random() * (GROUND_Y - 20),
      spd:   speed * 1.8 + Math.random() * speed * 1.5,
      size:  Math.random() < 0.12 ? 3 : (Math.random() < 0.4 ? 2 : 1),
      color: Math.random() < 0.6 ? '#ffffff' : (Math.random() < 0.5 ? '#aaddff' : '#ffaadd'),
      alpha: 0.5 + Math.random() * 0.5,
    });
  }
  for (const s of spaceStars) s.x -= s.spd;
  spaceStars = spaceStars.filter(s => s.x > -10);

  if (Math.random() < 0.045) spawnPetal();
  for (const p of petals) {
    p.x += p.vx - speed * 0.06;
    p.y += p.vy;
    p.wobble += 0.06;
    p.x += Math.sin(p.wobble) * 0.45;
  }
  petals = petals.filter(p => p.y < BASE_H + 6);

  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
  }
  particles = particles.filter(p => p.life > 0);

  if (pl.spinning > 0) pl.spinning--;
  if (flashTimer  > 0) flashTimer--;

  scoreMs += dt;
  if (scoreMs >= 1000) { score++; scoreMs -= 1000; }

  if (pl.grounded) {
    pl.frameT += speed;
    if (pl.frameT > 7) { pl.frameT = 0; pl.frame = (pl.frame + 1) % 4; }
  }
}

// ══════════════════════════════════════════════════
//  Draw helpers
// ══════════════════════════════════════════════════

// ── Space: Deep sky ─────────────────────────────────
function drawSpaceSky() {
  ctx.fillStyle = C.spaceSkyDeep;
  ctx.fillRect(0, 0, BASE_W, BASE_H);
  // Draw existing stars brighter — deep space has no light pollution
  for (const s of STARS) {
    ctx.globalAlpha = s.big ? 1.0 : 0.65;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.big ? 2 : 1, s.big ? 2 : 1);
  }
  // Nebula clouds (soft blobs, very slow scroll at 0.04x)
  const nOff = (scrollX * 0.04) % (BASE_W + 300);
  const nebulae = [
    { x: 180, y: 90,  r: 75, color: '#2a0055' },
    { x: 560, y: 55,  r: 55, color: '#003366' },
    { x: 850, y: 110, r: 65, color: '#550022' },
  ];
  for (const n of nebulae) {
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = n.color;
    const nx = (n.x - nOff + BASE_W * 2) % (BASE_W + 300);
    ctx.beginPath(); ctx.arc(nx, n.y, n.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Space: Planets ───────────────────────────────────
function drawPlanets() {
  const off = (scrollX * 0.06) % SPACE_PLANET_TILE;
  for (let tile = -1; tile <= 1; tile++) {
    const bx = tile * SPACE_PLANET_TILE - off;
    for (const p of SPACE_PLANETS) {
      const x = bx + p.rx;
      const y = p.ry;
      if (x + p.r + 100 < 0 || x - p.r - 100 > BASE_W) continue;

      // Planet body
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();

      // Ring (draw behind shadow by splitting — just draw over for simplicity)
      if (p.ring) {
        ctx.strokeStyle = p.ringColor;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(x, y + p.r * 0.12, p.r * 1.9, p.r * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
      }

      // Shadow crescent
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.arc(x + p.r * p.shadowOff, y - p.r * 0.08, p.r * 0.88, 0, Math.PI * 2); ctx.fill();

      // Specular highlight
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.arc(x - p.r * 0.32, y - p.r * 0.32, p.r * 0.38, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ── Space: Streaking stars ────────────────────────────
function drawSpaceStars() {
  for (const s of spaceStars) {
    ctx.globalAlpha = s.alpha * spaceBlend;
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x | 0, s.y | 0, s.size, s.size);
  }
  ctx.globalAlpha = 1;
}

// ── Sky — Japan / City crossfade ───────────────────
function drawSky() {
  // Japan sky (fades out)
  if (themeBlend < 1) {
    ctx.globalAlpha = 1 - themeBlend;
    ctx.fillStyle = C.skyDeep;
    ctx.fillRect(0, 0, BASE_W, GROUND_Y * 0.5);
    ctx.fillStyle = C.sky;
    ctx.fillRect(0, GROUND_Y * 0.5, BASE_W, GROUND_Y * 0.5);

    ctx.fillStyle = C.moonGlow;
    ctx.beginPath(); ctx.arc(700, 52, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.moonShadow;
    ctx.beginPath(); ctx.arc(713, 46, 23, 0, Math.PI * 2); ctx.fill();

    for (const s of STARS) {
      ctx.fillStyle = s.big ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.big ? 2 : 1, s.big ? 2 : 1);
    }
  }

  // City sky — deep purple top, orange-purple light-pollution haze near horizon (fades in)
  if (themeBlend > 0) {
    ctx.globalAlpha = themeBlend;
    ctx.fillStyle = C.citySkyDeep;
    ctx.fillRect(0, 0, BASE_W, GROUND_Y * 0.4);
    ctx.fillStyle = C.citySky;
    ctx.fillRect(0, GROUND_Y * 0.4, BASE_W, GROUND_Y * 0.35);
    ctx.fillStyle = C.cityHaze;
    ctx.fillRect(0, GROUND_Y * 0.75, BASE_W, GROUND_Y * 0.25);

    // Moon — dimmer through city smog
    ctx.fillStyle = 'rgba(255,240,210,0.55)';
    ctx.beginPath(); ctx.arc(700, 52, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.citySkyDeep;
    ctx.beginPath(); ctx.arc(713, 46, 23, 0, Math.PI * 2); ctx.fill();

    // Only bright stars visible through light pollution
    for (const s of STARS) {
      if (!s.big) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }
  }

  // Space sky (fades in over city at 950+)
  if (spaceBlend > 0) {
    ctx.globalAlpha = spaceBlend;
    drawSpaceSky();
  }

  ctx.globalAlpha = 1;
}

// ── Japan: Mountain ridge ──────────────────────────
function drawMountains() {
  const off = (scrollX * 0.10) % RIDGE_TILE;
  ctx.fillStyle = C.mountFar;
  for (let tile = -1; tile <= 1; tile++) {
    const ox = tile * RIDGE_TILE - off;
    ctx.beginPath();
    ctx.moveTo(ox, GROUND_Y + 10);
    for (const [rx, ry] of RIDGE_PTS) ctx.lineTo(ox + rx, ry);
    ctx.lineTo(ox + RIDGE_TILE, GROUND_Y + 10);
    ctx.closePath();
    ctx.fill();
    for (const px of PAGODA_POS) drawPagoda(ox + px);
  }
}

function drawPagoda(x) {
  ctx.fillStyle = C.mountMid;
  const tiers = [{ w: 10, h: 8 }, { w: 18, h: 8 }, { w: 26, h: 9 }, { w: 36, h: 11 }];
  let ty = 215;
  for (const t of tiers) {
    ty -= t.h + 3;
    ctx.fillRect(x - t.w / 2 - 4, ty + t.h - 3, t.w + 8, 4);
    ctx.fillRect(x - t.w / 2,     ty,            t.w,     t.h);
  }
  ctx.fillRect(x - 1, ty - 14, 2, 15);
}

// ── Japan: Houses ──────────────────────────────────
function drawHouses() {
  const off = (scrollX * 0.35) % HOUSE_TILE;
  for (let tile = -1; tile <= 2; tile++) {
    const bx = tile * HOUSE_TILE - off;
    for (const h of HOUSE_LAYOUT) {
      if (h.type === 'torii') drawToriiGate(bx + h.rx);
      else                    drawJapHouse(bx + h.rx, h.w, h.h);
    }
  }
}

function drawJapHouse(x, w, h) {
  ctx.fillStyle = C.houseSil;
  ctx.fillRect(x, GROUND_Y - h, w, h);
  const roofRows = [{ ext: 10, ht: 6 }, { ext: 5, ht: 5 }, { ext: 0, ht: 6 }];
  let ry = GROUND_Y - h;
  for (const r of roofRows) {
    ry -= r.ht;
    ctx.fillRect(x - r.ext, ry, w + r.ext * 2, r.ht + 1);
  }
  ctx.fillRect(x + w / 2 - 2, ry - 5, 4, 6);
  ctx.fillStyle = C.houseWin;
  const ww = Math.max(6, w * 0.22 | 0), wh = Math.max(8, h * 0.32 | 0);
  ctx.fillRect(x + 6,          GROUND_Y - h + 10, ww, wh);
  ctx.fillRect(x + w - 6 - ww, GROUND_Y - h + 10, ww, wh);
}

function drawToriiGate(x) {
  ctx.fillStyle = C.houseSil;
  const gH = 58, pW = 5, span = 46;
  ctx.fillRect(x,             GROUND_Y - gH, pW, gH);
  ctx.fillRect(x + span - pW, GROUND_Y - gH, pW, gH);
  ctx.fillRect(x - 5,  GROUND_Y - gH,     span + 10, 5);
  ctx.fillRect(x + 2,  GROUND_Y - gH + 9, span - 4,  4);
}

// ── City: Far buildings ─────────────────────────────
function drawCityFar() {
  const off = (scrollX * 0.10) % CITY_FAR_TILE;
  for (let tile = -1; tile <= 1; tile++) {
    const bx = tile * CITY_FAR_TILE - off;
    for (let i = 0; i < CITY_FAR_BLDGS.length; i++) {
      const b = CITY_FAR_BLDGS[i];
      const x = bx + b.rx;
      const y = GROUND_Y - b.h;
      ctx.fillStyle = C.cityBldFar;
      ctx.fillRect(x, y, b.w, b.h);

      // Deterministic lit windows (hash by building + tile index)
      const cols = Math.max(1, b.w / 10 | 0);
      const rows = Math.max(1, b.h / 14 | 0);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = ((i * 17 + tile * 7 + r * 5 + c * 3) % 11) < 4;
          if (!lit) continue;
          ctx.fillStyle = C.cityWinLit;
          ctx.fillRect(x + c * 10 + 2, y + r * 14 + 3, 6, 8);
        }
      }

      // Antenna on taller buildings
      if (b.h > 160) {
        ctx.fillStyle = C.cityBldFar;
        ctx.fillRect(x + (b.w / 2 | 0) - 1, y - 18, 2, 19);
        ctx.fillStyle = '#ff2020';
        ctx.fillRect(x + (b.w / 2 | 0) - 1, y - 18, 2, 2);
      }
    }
  }
}

// ── City: Mid buildings ─────────────────────────────
function drawCityMid() {
  const off = (scrollX * 0.35) % CITY_MID_TILE;
  for (let tile = -1; tile <= 2; tile++) {
    const bx = tile * CITY_MID_TILE - off;
    for (let i = 0; i < CITY_MID_BLDGS.length; i++) {
      const b = CITY_MID_BLDGS[i];
      const x = bx + b.rx;
      const y = GROUND_Y - b.h;
      ctx.fillStyle = C.cityBldMid;
      ctx.fillRect(x, y, b.w, b.h);

      // Windows
      const cols = Math.max(1, (b.w - 8) / 12 | 0);
      const rows = Math.max(1, (b.h - 12) / 16 | 0);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = ((i * 13 + tile * 9 + r * 7 + c * 4) % 13) < 6;
          ctx.fillStyle = lit ? C.cityWinLit : C.cityWinOff;
          ctx.fillRect(x + 4 + c * 12, y + 8 + r * 16, 8, 10);
        }
      }

      // Neon sign on designated buildings
      if (b.neon >= 0) {
        const nc = NEON_COLORS[b.neon % NEON_COLORS.length];
        const sx = x + 4, sy = y + (b.h * 0.35 | 0);
        const sw = b.w - 8, sh = 10;
        // Glow — multiply current alpha so crossfade applies
        ctx.save();
        ctx.globalAlpha *= 0.18;
        ctx.fillStyle = nc;
        ctx.fillRect(sx - 4, sy - 4, sw + 8, sh + 8);
        ctx.restore();
        // Sign face
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(sx, sy, sw, sh);
        // Neon border
        ctx.fillStyle = nc;
        ctx.fillRect(sx,          sy,          sw, 2);
        ctx.fillRect(sx,          sy + sh - 2, sw, 2);
        ctx.fillRect(sx,          sy,          2,  sh);
        ctx.fillRect(sx + sw - 2, sy,          2,  sh);
      }
    }
  }
}

// ── Cherry blossom petals ───────────────────────────
function drawPetals() {
  for (const p of petals) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle   = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// ── Ground — Japan rooftile / City asphalt blend ───
function drawGround(seg) {
  const x = Math.floor(seg.x);
  const w = Math.ceil(seg.w);
  const y = GROUND_Y;
  const h = BASE_H - GROUND_Y;

  // Japan rooftop tiles (fade out)
  if (themeBlend < 1) {
    ctx.globalAlpha = 1 - themeBlend;
    ctx.fillStyle = C.groundBody;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.groundTop;
    ctx.fillRect(x, y, w, 10);
    ctx.fillStyle = C.tileEdge;
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = C.tileDivide;
    const firstTile = Math.ceil((seg.x + scrollX) / TILE_W);
    for (let k = firstTile; k * TILE_W - scrollX < seg.x + seg.w; k++) {
      const tx = Math.floor(k * TILE_W - scrollX);
      if (tx >= x && tx < x + w) ctx.fillRect(tx, y + 2, 2, h - 2);
    }
    ctx.globalAlpha = 1;
  }

  // Space rainbow floor (fade in over city at 950+)
  if (spaceBlend > 0) {
    ctx.globalAlpha = spaceBlend;
    // Dark base under the rainbow
    ctx.fillStyle = '#050510';
    ctx.fillRect(x, y, w, h);
    // Rainbow tiled columns — each TILE_W column cycles through 7 colours
    const firstRTile = Math.ceil((seg.x + scrollX) / TILE_W);
    for (let k = firstRTile - 1; k * TILE_W - scrollX < seg.x + seg.w + TILE_W; k++) {
      const tx     = Math.floor(k * TILE_W - scrollX);
      const cIdx   = ((k % RAINBOW.length) + RAINBOW.length) % RAINBOW.length;
      const clampX = Math.max(tx, x);
      const clampW = Math.min(tx + TILE_W, x + w) - clampX;
      if (clampW <= 0) continue;
      ctx.fillStyle = RAINBOW[cIdx];
      ctx.fillRect(clampX, y, clampW, h);
    }
    // White sheen along the top edge
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, w, 3);
    ctx.globalAlpha = 1;
  }

  // City asphalt road (fade in with city, fade out as space takes over)
  if (themeBlend > 0 && spaceBlend < 1) {
    ctx.globalAlpha = themeBlend * (1 - spaceBlend);
    ctx.fillStyle = C.cityAsphalt;
    ctx.fillRect(x, y, w, h);
    // Road edge stripe
    ctx.fillStyle = C.cityRoadLine;
    ctx.fillRect(x, y, w, 3);
    // Dashed centre lane marking
    ctx.fillStyle = C.cityRoadMark;
    const dashW   = 18;
    const dashGap = 24;
    const dashY   = y + (h * 0.5 | 0);
    const first   = Math.floor((seg.x + scrollX) / (dashW + dashGap));
    for (let k = first - 1; ; k++) {
      const dx = Math.floor(k * (dashW + dashGap) - scrollX);
      if (dx > x + w) break;
      if (dx + dashW > x && dx < x + w) {
        const clampX = Math.max(dx, x);
        const clampW = Math.min(dx + dashW, x + w) - clampX;
        ctx.fillRect(clampX, dashY, clampW, 3);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ── Spike (Japan) ───────────────────────────────────
function drawSpike(x) {
  const y = GROUND_Y, h = 28;
  ctx.fillStyle = C.spikeBody;
  ctx.fillRect(x, y - h, 16, h);
  ctx.fillStyle = C.spikeHi;
  ctx.fillRect(x + 4, y - h, 4, h - 4);
  for (let i = 0; i < 3; i++) {
    const tx = x + 1 + i * 5;
    ctx.fillStyle = C.spikeBody;
    ctx.fillRect(tx, y - h - 9, 4, 10);
    ctx.fillStyle = C.spikeHi;
    ctx.fillRect(tx + 1, y - h - 13, 2, 5);
  }
}

// ── Pole / lantern (Japan) ──────────────────────────
function drawPole(x) {
  const y = GROUND_Y, h = 52;
  ctx.fillStyle = C.poleBody;
  ctx.fillRect(x, y - h, 10, h);
  ctx.fillStyle = C.poleHi;
  ctx.fillRect(x + 2, y - h, 3, h);
  const lx = x - 3, ly = y - h - 16;
  ctx.fillStyle = 'rgba(255,130,0,0.2)';
  ctx.beginPath(); ctx.arc(lx + 8, ly + 7, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.lanternRed;
  ctx.fillRect(lx, ly, 16, 14);
  ctx.fillStyle = C.lanternYel;
  ctx.fillRect(lx + 3, ly + 2, 4, 10);
  ctx.fillStyle = '#6b2200';
  ctx.fillRect(lx + 6, ly - 3, 3, 4);
  ctx.fillRect(lx + 6, ly + 14, 3, 3);
}

// ── Trashcan (City — replaces spike) ───────────────
function drawTrashcan(x) {
  const y = GROUND_Y, h = 28;
  // Handle
  ctx.fillStyle = C.trashLid;
  ctx.fillRect(x + 4, y - h - 7, 8, 5);
  // Lid
  ctx.fillRect(x - 1, y - h - 3, 18, 5);
  // Body
  ctx.fillStyle = C.trashBody;
  ctx.fillRect(x + 1, y - h + 2, 14, h - 2);
  // Highlight stripe
  ctx.fillStyle = '#50cc50';
  ctx.fillRect(x + 3, y - h + 4, 3, h - 8);
  // Horizontal band
  ctx.fillStyle = '#186018';
  ctx.fillRect(x + 1, y - h + 14, 14, 2);
  // Base flare
  ctx.fillStyle = '#1e6a1e';
  ctx.fillRect(x - 1, y - 4, 18, 4);
}

// ── Streetlight (City — replaces pole) ─────────────
function drawStreetlight(x) {
  const y = GROUND_Y, h = 52;
  // Post
  ctx.fillStyle = C.lampPost;
  ctx.fillRect(x + 3, y - h, 5, h);
  // Horizontal arm
  ctx.fillRect(x - 10, y - h, 14, 4);
  // Lamp housing
  ctx.fillStyle = '#444458';
  ctx.fillRect(x - 14, y - h - 10, 20, 12);
  // Light bulb
  ctx.fillStyle = C.lampLight;
  ctx.fillRect(x - 12, y - h - 8, 16, 8);
  // Glow — save/restore to preserve outer alpha during crossfade
  ctx.save();
  ctx.globalAlpha *= 0.22;
  ctx.fillStyle = C.lampLight;
  ctx.fillRect(x - 22, y - h - 14, 36, 22);
  ctx.restore();
}

// ── Asteroid (Space — replaces spike/trashcan) ──────
function drawAsteroid(x) {
  const y = GROUND_Y, h = 28;
  // Main rocky body (jagged silhouette using rects)
  ctx.fillStyle = '#6a5a48';
  ctx.fillRect(x + 2, y - h,      12, 6);   // top cluster
  ctx.fillRect(x,     y - h + 4,  16, 14);  // wide mid
  ctx.fillRect(x + 1, y - h + 16, 14, 8);   // lower body
  ctx.fillRect(x + 3, y - h + 22, 10, 6);   // base
  // Jagged top bumps
  ctx.fillStyle = '#7a6a58';
  ctx.fillRect(x + 1, y - h - 3,  4, 5);
  ctx.fillRect(x + 8, y - h - 5,  5, 7);
  ctx.fillRect(x + 12, y - h - 1, 3, 4);
  // Light face highlight
  ctx.fillStyle = '#8a7a68';
  ctx.fillRect(x + 2, y - h + 5,  5, 8);
  ctx.fillRect(x + 9, y - h + 3,  4, 5);
  // Dark shadow side
  ctx.fillStyle = '#3a2e24';
  ctx.fillRect(x + 12, y - h + 6, 4, 12);
  ctx.fillRect(x + 10, y - h + 18, 4, 6);
  // Crater 1 (top area)
  ctx.fillStyle = '#3a2e24';
  ctx.fillRect(x + 4,  y - h + 7,  4, 3);
  ctx.fillStyle = '#8a7a68';
  ctx.fillRect(x + 5,  y - h + 7,  2, 1);
  // Crater 2 (lower area)
  ctx.fillStyle = '#3a2e24';
  ctx.fillRect(x + 3,  y - h + 17, 5, 3);
  ctx.fillStyle = '#8a7a68';
  ctx.fillRect(x + 4,  y - h + 17, 2, 1);
}

// ── Satellite (Space — replaces pole/streetlight) ───
function drawSatellite(x) {
  const y = GROUND_Y, h = 52;
  // Main body (silver box in the middle of the post)
  const bodyY = y - h + 18;
  ctx.fillStyle = '#aaaabc';
  ctx.fillRect(x + 1, bodyY,      10, 16);  // body
  ctx.fillStyle = '#ccccde';
  ctx.fillRect(x + 2, bodyY + 1,  4, 5);   // highlight panel
  ctx.fillStyle = '#888898';
  ctx.fillRect(x + 8, bodyY + 8,  3, 6);   // shadow side
  // Gold foil stripe
  ctx.fillStyle = '#ccaa22';
  ctx.fillRect(x + 1, bodyY + 7,  10, 2);
  // Solar panel left
  ctx.fillStyle = '#1144aa';
  ctx.fillRect(x - 14, bodyY + 4, 14, 8);
  ctx.fillStyle = '#2255cc';
  ctx.fillRect(x - 13, bodyY + 5, 4,  6);
  ctx.fillRect(x - 7,  bodyY + 5, 4,  6);
  ctx.fillStyle = '#334466';
  ctx.fillRect(x - 14, bodyY + 4, 1,  8);  // left edge shadow
  // Solar panel right
  ctx.fillStyle = '#1144aa';
  ctx.fillRect(x + 12, bodyY + 4, 14, 8);
  ctx.fillStyle = '#2255cc';
  ctx.fillRect(x + 13, bodyY + 5, 4,  6);
  ctx.fillRect(x + 19, bodyY + 5, 4,  6);
  ctx.fillStyle = '#334466';
  ctx.fillRect(x + 25, bodyY + 4, 1,  8);  // right edge shadow
  // Vertical post (thin, runs full height)
  ctx.fillStyle = '#888898';
  ctx.fillRect(x + 4, y - h,      4, h);
  // Antenna on top
  ctx.fillStyle = '#aaaabc';
  ctx.fillRect(x + 5, y - h - 6,  2, 8);
  // Blinking red light on antenna tip
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(x + 4, y - h - 8,  4, 4);
  // Dish
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(x + 7, y - h + 8,  5, 4);
  ctx.fillRect(x + 9, y - h + 4,  3, 5);
}

// ── Coin ────────────────────────────────────────────
function drawCoin(cx, animT) {
  const cy    = GROUND_Y - COIN_R * 2 - 2;
  const frame = (animT / 8 | 0) % 2;
  if (frame === 0) {
    ctx.fillStyle = C.coinGold;
    ctx.fillRect(cx - COIN_R, cy - COIN_R, COIN_R * 2, COIN_R * 2);
    ctx.fillStyle = C.coinHi;
    ctx.fillRect(cx - COIN_R + 2, cy - COIN_R + 2, COIN_R - 2, 3);
    ctx.fillStyle = C.coinShade;
    ctx.fillRect(cx + 1, cy + 1, COIN_R - 1, COIN_R - 1);
  } else {
    ctx.fillStyle = C.coinGold;
    ctx.fillRect(cx - 2, cy - COIN_R, 4, COIN_R * 2);
    ctx.fillStyle = C.coinHi;
    ctx.fillRect(cx - 1, cy - COIN_R, 2, 3);
  }
}

// ── Bird (Japan / early city) ───────────────────────
function drawBird(b) {
  const x = Math.floor(b.x);
  const y = Math.floor(b.y);
  ctx.fillStyle = C.bird;
  if (b.frame === 0) {
    ctx.fillRect(x,      y + 4, 8, 4);
    ctx.fillRect(x + 6,  y,     8, 5);
    ctx.fillRect(x + 16, y,     8, 5);
    ctx.fillRect(x + 22, y + 4, 8, 4);
  } else {
    ctx.fillRect(x,      y + 8, 8, 4);
    ctx.fillRect(x + 6,  y + 6, 8, 5);
    ctx.fillRect(x + 16, y + 6, 8, 5);
    ctx.fillRect(x + 22, y + 8, 8, 4);
  }
  ctx.fillRect(x + 8,  y + 4, 16, 8);
  ctx.fillRect(x + 20, y + 2,  8, 7);
  ctx.fillRect(x + 27, y + 4,  5, 3);
  ctx.fillRect(x,      y + 7,  9, 4);
  ctx.fillStyle = C.birdEye;
  ctx.fillRect(x + 23, y + 3, 2, 2);
}

// ── Neon sign (City — replaces bird) ───────────────
function drawNeonSign(b) {
  const x  = Math.floor(b.x);
  const y  = Math.floor(b.y);
  const nc = b.neonColor;

  // Hanging wire
  ctx.fillStyle = '#555568';
  ctx.fillRect(x + 15, y - 10, 3, 11);

  // Glow behind sign — save/restore preserves outer alpha
  ctx.save();
  ctx.globalAlpha *= 0.22;
  ctx.fillStyle = nc;
  ctx.fillRect(x - 4, y - 4, 44, 22);
  ctx.restore();

  // Sign body
  ctx.fillStyle = '#0d0d1e';
  ctx.fillRect(x, y, 36, 14);

  // Neon border
  ctx.fillStyle = nc;
  ctx.fillRect(x,      y,      36, 2);
  ctx.fillRect(x,      y + 12, 36, 2);
  ctx.fillRect(x,      y,      2,  14);
  ctx.fillRect(x + 34, y,      2,  14);

  // Decorative inner squiggles
  ctx.fillRect(x + 5,  y + 5,  8, 2);
  ctx.fillRect(x + 15, y + 5, 10, 2);
  ctx.fillRect(x + 27, y + 5,  5, 2);
}

// ── Particles ───────────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle   = p.color;
    const s = Math.ceil(p.sz);
    ctx.fillRect(Math.floor(p.x - s * 0.5), Math.floor(p.y - s * 0.5), s, s);
  }
  ctx.globalAlpha = 1;
}

// ── Ninja sprite ────────────────────────────────────
function drawPlayer() {
  if (state === 'dying') {
    const x  = Math.floor(pl.x);
    const y  = Math.floor(pl.y);
    const cx = x + PLAYER_W / 2, cy = y + PLAYER_H / 2;
    ctx.globalAlpha = Math.max(0, pl.deadTimer / DEAD_FRAMES);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pl.deadAngle);
    ctx.translate(-cx, -cy);
    drawNinjaBody(x, y, 0, true);
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }

  const x = Math.floor(pl.x);
  const y = Math.floor(pl.y);

  if (pl.spinning > 0) {
    const cx = x + PLAYER_W / 2, cy = y + PLAYER_H / 2;
    const t  = 1 - pl.spinning / 18;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * Math.PI * 1.6);
    ctx.translate(-cx, -cy);
    drawNinjaBody(x, y, pl.frame, true);
    ctx.restore();
  } else {
    drawNinjaBody(x, y, pl.frame, false);
  }
}

function drawNinjaBody(x, y, f, inSpin) {
  ctx.fillStyle = C.playerBody;
  ctx.fillRect(x, y, PLAYER_W, PLAYER_H);

  ctx.fillStyle = C.scarf;
  ctx.fillRect(x - 6, y + 8, 8, 4);
  ctx.fillRect(x - 9, y + 9, 4, 3);

  ctx.fillStyle = C.playerHead;
  ctx.fillRect(x + 2, y, 16, 14);

  ctx.fillStyle = C.headband;
  ctx.fillRect(x + 2,  y + 5, 16, 3);
  ctx.fillRect(x + 16, y + 5,  5, 2);

  ctx.fillStyle = 'rgba(200,240,255,0.3)';
  ctx.fillRect(x + 12, y + 2, 6, 5);
  ctx.fillStyle = C.eye;
  ctx.fillRect(x + 13, y + 3, 3, 3);

  ctx.fillStyle = C.blade;
  ctx.fillRect(x + PLAYER_W, y + 12, 2, 14);
  ctx.fillStyle = C.guard;
  ctx.fillRect(x + PLAYER_W - 1, y + 16, 4, 3);
  ctx.fillStyle = C.grip;
  ctx.fillRect(x + PLAYER_W, y + 19, 2, 5);

  if (!inSpin && pl.grounded) {
    const legData = [[2, 10], [5, 6], [10, 2], [6, 5]];
    const [la, lb] = legData[f];
    ctx.fillStyle = C.playerBody;
    ctx.fillRect(x + 3,  y + PLAYER_H, 7, la);
    ctx.fillRect(x + 10, y + PLAYER_H, 7, lb);
    ctx.fillStyle = '#2a2a50';
    ctx.fillRect(x + 3,  y + PLAYER_H + la - 2, 8, 3);
    ctx.fillRect(x + 10, y + PLAYER_H + lb - 2, 8, 3);
    const armX = f < 2 ? x - 4 : x + PLAYER_W;
    ctx.fillStyle = C.playerBody;
    ctx.fillRect(armX, y + 10, 4, 3);
  } else if (!pl.grounded) {
    ctx.fillStyle = C.playerBody;
    ctx.fillRect(x + 2, y + PLAYER_H - 3, 14, 5);
    ctx.fillRect(x - 6,  y + 10, 8, 3);
  }
}

// ── HUD ─────────────────────────────────────────────
function drawHUD() {
  ctx.font      = '10px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillStyle = C.hudGold;
  ctx.fillText(`SCORE  ${score}`, 12, 22);

  ctx.fillStyle = C.coinGold;
  ctx.fillRect(BASE_W - 82, 10, 8, 8);
  ctx.fillStyle = C.coinHi;
  ctx.fillRect(BASE_W - 82, 10, 3, 3);

  ctx.font      = '10px "Press Start 2P"';
  ctx.textAlign = 'right';
  ctx.fillStyle = C.hudCoin;
  ctx.fillText(`x${coinCount}`, BASE_W - 12, 20);

  ctx.font      = '7px "Press Start 2P"';
  ctx.fillStyle = C.hudGrey;
  ctx.fillText(`BEST ${bestScore}`, BASE_W - 12, 34);

  if (flashTimer > 0) {
    ctx.globalAlpha = Math.min(1, flashTimer / 15);
    ctx.font        = '8px "Press Start 2P"';
    ctx.textAlign   = 'left';
    ctx.fillStyle   = C.flashWhite;
    ctx.fillText(flashText, pl.x + PLAYER_W + 4, pl.y - 4);
    ctx.globalAlpha = 1;
  }

  // Next zone hint
  ctx.font      = '10px "Press Start 2P"';
  ctx.textAlign = 'left';
  if (themeBlend <= 0) {
    ctx.fillStyle = '#667744';
    ctx.fillText('NEXT ZONE AT 400', 12, 36);
  } else if (themeBlend >= 1 && spaceBlend <= 0) {
    ctx.fillStyle = '#5566aa';
    ctx.fillText('NEXT ZONE AT 1000', 12, 36);
  }
}

// ── Screen overlays ─────────────────────────────────
function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.textAlign = 'center';
  ctx.font      = '20px "Press Start 2P"';
  ctx.fillStyle = C.startGreen;
  ctx.fillText('NINJA RUNNER', BASE_W / 2, 105);

  ctx.font      = '8px "Press Start 2P"';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('PRESS SPACE TO START', BASE_W / 2, 148);
  ctx.fillText('TAP TO START',         BASE_W / 2, 165);

  ctx.font      = '7px "Press Start 2P"';
  ctx.fillStyle = '#888888';
  ctx.fillText('DOUBLE JUMP: SPACE / TAP TWICE', BASE_W / 2, 190);
  ctx.fillText('PAUSE: P or ESC',                BASE_W / 2, 206);
}

function drawDeadScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.textAlign = 'center';
  ctx.font      = '20px "Press Start 2P"';
  ctx.fillStyle = C.deadRed;
  ctx.fillText('GAME OVER', BASE_W / 2, 98);

  ctx.font      = '10px "Press Start 2P"';
  ctx.fillStyle = C.hudGold;
  ctx.fillText(`SCORE   ${score}`, BASE_W / 2, 138);

  ctx.fillStyle = '#aaaaaa';
  ctx.fillText(`BEST    ${bestScore}`, BASE_W / 2, 160);

  ctx.font      = '8px "Press Start 2P"';
  ctx.fillStyle = C.coinGold;
  ctx.fillText(`COINS  x${coinCount}`, BASE_W / 2, 182);

  ctx.font      = '7px "Press Start 2P"';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('PRESS SPACE / TAP TO RESTART', BASE_W / 2, 206);
}

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.textAlign = 'center';
  ctx.font      = '18px "Press Start 2P"';
  ctx.fillStyle = C.pauseBlue;
  ctx.fillText('PAUSED', BASE_W / 2, 130);

  ctx.font      = '7px "Press Start 2P"';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('P  OR  ESC  TO  RESUME', BASE_W / 2, 160);
}

// ── Full draw frame ──────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  // Sky — manages its own globalAlpha internally
  drawSky();

  // Japan mid/near layers — fade out as city takes over
  if (themeBlend < 1) {
    ctx.globalAlpha = 1 - themeBlend;
    drawMountains();
    drawHouses();
    ctx.globalAlpha = 1;
  }

  // City mid/near layers — fade in with city, fade out as space takes over
  if (themeBlend > 0 && spaceBlend < 1) {
    ctx.globalAlpha = themeBlend * (1 - spaceBlend);
    drawCityFar();
    drawCityMid();
    ctx.globalAlpha = 1;
  }

  // Space mid layer — planets (fade in at 950+)
  if (spaceBlend > 0) {
    ctx.globalAlpha = spaceBlend;
    drawPlanets();
    ctx.globalAlpha = 1;
  }

  // Petals drift in front of backgrounds
  drawPetals();

  // Ground, obstacles, coins
  for (const s of segs) {
    drawGround(s);
    for (const o of s.obs) {
      const ox = Math.floor(s.x + o.rx);
      if      (o.type === 'spike')       drawSpike(ox);
      else if (o.type === 'pole')        drawPole(ox);
      else if (o.type === 'trashcan')    drawTrashcan(ox);
      else if (o.type === 'streetlight') drawStreetlight(ox);
      else if (o.type === 'asteroid')    drawAsteroid(ox);
      else if (o.type === 'satellite')   drawSatellite(ox);
    }
    for (const co of s.coins) {
      if (!co.collected) drawCoin(Math.floor(s.x + co.rx), co.animT);
    }
  }

  // Birds (Japan) or neon signs (City)
  for (const b of birds) {
    if (b.city) drawNeonSign(b);
    else        drawBird(b);
  }

  drawSpaceStars();
  drawParticles();
  drawPlayer();
  drawHUD();

  if (state === 'start')  drawStartScreen();
  if (state === 'dead')   drawDeadScreen();
  if (state === 'paused') drawPauseScreen();
}

// ── Game loop ────────────────────────────────────────
let lastTs = 0;

function gameLoop(ts) {
  if (lastTs === 0) lastTs = ts;
  const dt = Math.min(ts - lastTs, 50);
  lastTs = ts;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

// ── Init ─────────────────────────────────────────────
initSegs();
plReset();
requestAnimationFrame(gameLoop);
