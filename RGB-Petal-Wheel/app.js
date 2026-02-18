// ============ State ============
const state = {
    h: 0,
    s: 100,
    l: 50,
    harmonyMode: 'complementary',
    palette: []
};

// ============ DOM Elements ============
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const colorPreview = document.getElementById('colorPreview');
const rgbValueEl = document.getElementById('rgbValue');
const hexValueEl = document.getElementById('hexValue');
const hslValueEl = document.getElementById('hslValue');
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const rVal = document.getElementById('rVal');
const gVal = document.getElementById('gVal');
const bVal = document.getElementById('bVal');
const lightnessSlider = document.getElementById('lightnessSlider');
const lightnessVal = document.getElementById('lightnessVal');
const harmonyDesc = document.getElementById('harmonyDesc');
const harmonySwatches = document.getElementById('harmonySwatches');
const paletteGrid = document.getElementById('paletteGrid');
const saveColorBtn = document.getElementById('saveColor');
const clearPaletteBtn = document.getElementById('clearPalette');
const randomizeBtn = document.getElementById('randomizeBtn');
const cvdModeSelect = document.getElementById('cvdMode');

// ============ Wheel Setup ============
let wheelRadius = 0;
let wheelCx = 0;
let wheelCy = 0;
let wheelImageData = null;
let isDragging = false;

function initWheel() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight, 420);
    canvas.width = size;
    canvas.height = size;
    wheelRadius = size / 2 - 4;
    wheelCx = size / 2;
    wheelCy = size / 2;
    drawWheel();
    drawOverlay();
}

// ============ Color Conversions ============
function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return {
        r: Math.round(f(0) * 255),
        g: Math.round(f(8) * 255),
        b: Math.round(f(4) * 255)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

// ============ Draw Wheel ============
function drawWheel() {
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;
    const l = state.l;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - wheelCx;
            const dy = y - wheelCy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const idx = (y * canvas.width + x) * 4;

            if (dist <= wheelRadius) {
                const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
                const sat = (dist / wheelRadius) * 100;
                const rgb = hslToRgb(angle, sat, l);
                data[idx] = rgb.r;
                data[idx + 1] = rgb.g;
                data[idx + 2] = rgb.b;
                data[idx + 3] = 255;
            } else if (dist <= wheelRadius + 2) {
                data[idx] = 60;
                data[idx + 1] = 60;
                data[idx + 2] = 60;
                data[idx + 3] = 128;
            }
        }
    }

    wheelImageData = imgData;
    ctx.putImageData(imgData, 0, 0);
}

// ============ Draw Overlay (crosshair + harmony dots) ============
function drawOverlay() {
    ctx.putImageData(wheelImageData, 0, 0);

    // Harmony dots
    const harmonyColors = getHarmonyColors();
    for (let i = 1; i < harmonyColors.length; i++) {
        const hc = harmonyColors[i];
        const rad = (hc.h * Math.PI) / 180;
        const r = (hc.s / 100) * wheelRadius;
        const dx = wheelCx + Math.cos(rad) * r;
        const dy = wheelCy + Math.sin(rad) * r;

        ctx.beginPath();
        ctx.arc(dx, dy, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        const dotRgb = hslToRgb(hc.h, hc.s, hc.l);
        ctx.fillStyle = `rgb(${dotRgb.r},${dotRgb.g},${dotRgb.b})`;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // Draw lines between harmony points
    if (harmonyColors.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < harmonyColors.length; i++) {
            const hc = harmonyColors[i];
            const rad = (hc.h * Math.PI) / 180;
            const r = (hc.s / 100) * wheelRadius;
            const px = wheelCx + Math.cos(rad) * r;
            const py = wheelCy + Math.sin(rad) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Crosshair for current color
    const angle = (state.h * Math.PI) / 180;
    const dist = (state.s / 100) * wheelRadius;
    const cx = wheelCx + Math.cos(angle) * dist;
    const cy = wheelCy + Math.sin(angle) * dist;

    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ============ Wheel Interaction ============
function getWheelColor(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dx = x - wheelCx;
    const dy = y - wheelCy;
    let dist = Math.sqrt(dx * dx + dy * dy);

    // Clamp to wheel edge
    if (dist > wheelRadius) dist = wheelRadius;

    const h = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
    const s = (dist / wheelRadius) * 100;

    return { h: Math.round(h), s: Math.round(s) };
}

function handleWheelPick(clientX, clientY) {
    const { h, s } = getWheelColor(clientX, clientY);
    state.h = h;
    state.s = s;
    updateAllUI();
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - wheelCx;
    const dy = y - wheelCy;
    if (Math.sqrt(dx * dx + dy * dy) <= wheelRadius + 10) {
        isDragging = true;
        handleWheelPick(e.clientX, e.clientY);
    }
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) handleWheelPick(e.clientX, e.clientY);
});

window.addEventListener('mouseup', () => { isDragging = false; });

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    isDragging = true;
    handleWheelPick(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        handleWheelPick(touch.clientX, touch.clientY);
    }
}, { passive: false });

canvas.addEventListener('touchend', () => { isDragging = false; });

// ============ Lightness Slider ============
lightnessSlider.addEventListener('input', () => {
    state.l = parseInt(lightnessSlider.value);
    lightnessVal.textContent = state.l;
    drawWheel();
    updateAllUI();
});

// ============ RGB Sliders ============
function onRgbSliderChange() {
    const r = parseInt(rSlider.value);
    const g = parseInt(gSlider.value);
    const b = parseInt(bSlider.value);
    const hsl = rgbToHsl(r, g, b);
    state.h = hsl.h;
    state.s = hsl.s;
    state.l = hsl.l;
    lightnessSlider.value = state.l;
    lightnessVal.textContent = state.l;
    drawWheel();
    updateAllUI();
}

rSlider.addEventListener('input', onRgbSliderChange);
gSlider.addEventListener('input', onRgbSliderChange);
bSlider.addEventListener('input', onRgbSliderChange);

// ============ Harmonies ============
const harmonyModes = {
    complementary: {
        offsets: [0, 180],
        desc: 'Two colors opposite each other — creates maximum contrast and visual tension.'
    },
    analogous: {
        offsets: [-30, 0, 30],
        desc: 'Neighboring colors on the wheel — creates a smooth, cohesive palette.'
    },
    triadic: {
        offsets: [0, 120, 240],
        desc: 'Three colors evenly spaced — vibrant and balanced, great for bold designs.'
    },
    split: {
        offsets: [0, 150, 210],
        desc: 'One color + two near its complement — high contrast without the tension of pure complementary.'
    },
    tetradic: {
        offsets: [0, 90, 180, 270],
        desc: 'Four colors forming a square — rich and diverse, best with one dominant color.'
    }
};

function getHarmonyColors() {
    const mode = harmonyModes[state.harmonyMode];
    return mode.offsets.map(offset => ({
        h: ((state.h + offset) % 360 + 360) % 360,
        s: state.s,
        l: state.l
    }));
}

function updateHarmonySwatches() {
    const colors = getHarmonyColors();
    harmonySwatches.innerHTML = '';

    colors.forEach((c, i) => {
        const rgb = hslToRgb(c.h, c.s, c.l);
        const simRgb = simulateCVD(rgb.r, rgb.g, rgb.b);
        const displayHex = rgbToHex(simRgb.r, simRgb.g, simRgb.b);
        const trueHex = rgbToHex(rgb.r, rgb.g, rgb.b);

        const swatch = document.createElement('button');
        swatch.className = 'harmony-swatch';
        swatch.style.background = displayHex;
        swatch.setAttribute('aria-label', `Harmony color ${trueHex}`);

        const hexLabel = document.createElement('span');
        hexLabel.className = 'swatch-hex';
        hexLabel.textContent = trueHex;
        swatch.appendChild(hexLabel);

        swatch.addEventListener('click', () => {
            state.h = c.h;
            state.s = c.s;
            state.l = c.l;
            lightnessSlider.value = state.l;
            lightnessVal.textContent = state.l;
            drawWheel();
            updateAllUI();
        });

        harmonySwatches.appendChild(swatch);
    });
}

// Harmony tab buttons
document.querySelectorAll('.harmony-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.harmony-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        state.harmonyMode = tab.dataset.mode;
        harmonyDesc.textContent = harmonyModes[state.harmonyMode].desc;
        updateHarmonySwatches();
        drawOverlay();
    });
});

// ============ Palette ============
function loadPalette() {
    const saved = localStorage.getItem('rgbWheelPalette');
    if (saved) {
        try { state.palette = JSON.parse(saved); } catch (e) { state.palette = []; }
    }
}

function savePaletteToStorage() {
    localStorage.setItem('rgbWheelPalette', JSON.stringify(state.palette));
}

function renderPalette() {
    paletteGrid.innerHTML = '';
    state.palette.forEach((hex, i) => {
        const rgb = hexToRgb(hex);
        const simRgb = simulateCVD(rgb.r, rgb.g, rgb.b);
        const displayHex = rgbToHex(simRgb.r, simRgb.g, simRgb.b);

        const chip = document.createElement('button');
        chip.className = 'palette-chip';
        chip.style.background = displayHex;
        chip.setAttribute('aria-label', `Saved color ${hex}`);

        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = hex;
        chip.appendChild(tooltip);

        chip.addEventListener('click', () => {
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            state.h = hsl.h;
            state.s = hsl.s;
            state.l = hsl.l;
            lightnessSlider.value = state.l;
            lightnessVal.textContent = state.l;
            drawWheel();
            updateAllUI();
        });

        paletteGrid.appendChild(chip);
    });
}

saveColorBtn.addEventListener('click', () => {
    const rgb = hslToRgb(state.h, state.s, state.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    state.palette.push(hex);
    if (state.palette.length > 16) state.palette.shift();
    savePaletteToStorage();
    renderPalette();
});

clearPaletteBtn.addEventListener('click', () => {
    state.palette = [];
    savePaletteToStorage();
    renderPalette();
});

// ============ Click-to-Copy ============
function setupCopy(rowId, getValueFn) {
    const row = document.getElementById(rowId);
    const flash = row.querySelector('.copy-flash');

    function doCopy() {
        const text = getValueFn();
        navigator.clipboard.writeText(text).then(() => {
            flash.classList.add('show');
            setTimeout(() => flash.classList.remove('show'), 800);
        });
    }

    row.addEventListener('click', doCopy);
    row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            doCopy();
        }
    });
}

setupCopy('copyRgb', () => {
    const rgb = hslToRgb(state.h, state.s, state.l);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
});

setupCopy('copyHex', () => {
    const rgb = hslToRgb(state.h, state.s, state.l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
});

setupCopy('copyHsl', () => {
    return `hsl(${state.h}°, ${state.s}%, ${state.l}%)`;
});

// ============ Randomize ============
randomizeBtn.addEventListener('click', () => {
    state.h = Math.floor(Math.random() * 360);
    state.s = Math.floor(Math.random() * 80) + 20; // 20-100 to avoid near-gray
    // Keep current lightness
    updateAllUI();
});

// ============ Color Vision Deficiency Simulation ============
// Matrices based on Brettel, Vienot & Mollon (1997) simulation model
const cvdMatrices = {
    normal: null,
    protanopia: [
        0.152286, 1.052583, -0.204868,
        0.114503, 0.786281,  0.099216,
       -0.003882, -0.048116, 1.051998
    ],
    deuteranopia: [
        0.367322, 0.860646, -0.227968,
        0.280085, 0.672501,  0.047413,
       -0.011820, 0.042940,  0.968881
    ],
    tritanopia: [
        1.255528, -0.076749, -0.178779,
       -0.078411,  0.930809,  0.147602,
        0.004733,  0.691367,  0.303900
    ]
};

function simulateCVD(r, g, b) {
    const mode = cvdModeSelect.value;
    if (mode === 'normal') return { r, g, b };

    const m = cvdMatrices[mode];
    const lr = r / 255, lg = g / 255, lb = b / 255;

    // Apply linearization (sRGB gamma)
    const toLinear = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const fromLinear = c => c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

    const rl = toLinear(lr), gl = toLinear(lg), bl = toLinear(lb);

    const sr = m[0] * rl + m[1] * gl + m[2] * bl;
    const sg = m[3] * rl + m[4] * gl + m[5] * bl;
    const sb = m[6] * rl + m[7] * gl + m[8] * bl;

    return {
        r: Math.round(Math.min(1, Math.max(0, fromLinear(sr))) * 255),
        g: Math.round(Math.min(1, Math.max(0, fromLinear(sg))) * 255),
        b: Math.round(Math.min(1, Math.max(0, fromLinear(sb))) * 255)
    };
}

cvdModeSelect.addEventListener('change', () => {
    updateAllUI();
    renderPalette();
});

// ============ Update All UI ============
function updateAllUI() {
    const rgb = hslToRgb(state.h, state.s, state.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Color preview (with CVD simulation)
    const simRgb = simulateCVD(rgb.r, rgb.g, rgb.b);
    colorPreview.style.background = rgbToHex(simRgb.r, simRgb.g, simRgb.b);

    // Value displays
    rgbValueEl.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hexValueEl.textContent = hex;
    hslValueEl.textContent = `hsl(${state.h}°, ${state.s}%, ${state.l}%)`;

    // RGB sliders (avoid feedback loop by checking if slider is being dragged)
    if (document.activeElement !== rSlider &&
        document.activeElement !== gSlider &&
        document.activeElement !== bSlider) {
        rSlider.value = rgb.r;
        gSlider.value = rgb.g;
        bSlider.value = rgb.b;
    }
    rVal.textContent = rgb.r;
    gVal.textContent = rgb.g;
    bVal.textContent = rgb.b;

    // Harmonies
    updateHarmonySwatches();
    drawOverlay();
}

// ============ Init ============
function init() {
    loadPalette();
    renderPalette();
    initWheel();
    updateAllUI();

    window.addEventListener('resize', () => {
        initWheel();
        updateAllUI();
    });
}

init();
