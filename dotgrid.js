/**
 * DotGrid – vanilla-JS canvas background
 * Ported from the React component; no dependencies.
 */
(() => {
    "use strict";

    /* ---------- Config ---------- */
    const CFG = {
        dotSize: 5,
        gap: 15,
        baseColor: { r: 30, g: 40, b: 60 },     // dark navy dots
        activeColor: { r: 0, g: 87, b: 168 },    // UTP blue glow
        proximity: 120,
        shockRadius: 250,
        shockStrength: 5,
        resistance: 0.92,       // friction per frame (0–1, higher = more slide)
        returnStrength: 0.04,   // spring pull back
        damping: 0.85,          // velocity damping on return
    };

    /* ---------- Canvas setup ---------- */
    const canvas = document.getElementById("dot-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let dots = [];
    let W = 0, H = 0, dpr = 1;

    const pointer = { x: -9999, y: -9999 };

    function resize() {
        dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.scale(dpr, dpr);
        buildGrid();
    }

    function buildGrid() {
        const cell = CFG.dotSize + CFG.gap;
        const cols = Math.floor((W + CFG.gap) / cell);
        const rows = Math.floor((H + CFG.gap) / cell);
        const gridW = cell * cols - CFG.gap;
        const gridH = cell * rows - CFG.gap;
        const startX = (W - gridW) / 2 + CFG.dotSize / 2;
        const startY = (H - gridH) / 2 + CFG.dotSize / 2;

        dots = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    cx: startX + c * cell,
                    cy: startY + r * cell,
                    ox: 0, oy: 0,   // offset from home
                    vx: 0, vy: 0,   // velocity
                });
            }
        }
    }

    /* ---------- Interaction ---------- */
    function shock(sx, sy) {
        const r2 = CFG.shockRadius * CFG.shockRadius;
        for (const d of dots) {
            const dx = d.cx - sx;
            const dy = d.cy - sy;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < r2) {
                const dist = Math.sqrt(dist2) || 1;
                const falloff = 1 - dist / CFG.shockRadius;
                d.vx += (dx / dist) * CFG.shockStrength * falloff * 8;
                d.vy += (dy / dist) * CFG.shockStrength * falloff * 8;
            }
        }
    }

    window.addEventListener("mousemove", e => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    }, { passive: true });

    window.addEventListener("click", e => {
        shock(e.clientX, e.clientY);
    });

    window.addEventListener("resize", () => {
        // reset scale before resize
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        resize();
    });

    /* ---------- Render loop ---------- */
    const proxSq = CFG.proximity * CFG.proximity;
    const halfDot = CFG.dotSize / 2;

    function frame() {
        ctx.clearRect(0, 0, W, H);

        for (const d of dots) {
            // Spring physics: pull back to home
            d.vx += -d.ox * CFG.returnStrength;
            d.vy += -d.oy * CFG.returnStrength;
            d.vx *= CFG.damping;
            d.vy *= CFG.damping;
            d.ox += d.vx;
            d.oy += d.vy;

            const px = d.cx + d.ox;
            const py = d.cy + d.oy;

            // Color based on pointer proximity
            const dx = d.cx - pointer.x;
            const dy = d.cy - pointer.y;
            const dsq = dx * dx + dy * dy;

            let r = CFG.baseColor.r, g = CFG.baseColor.g, b = CFG.baseColor.b;
            if (dsq < proxSq) {
                const t = 1 - Math.sqrt(dsq) / CFG.proximity;
                r = Math.round(r + (CFG.activeColor.r - r) * t);
                g = Math.round(g + (CFG.activeColor.g - g) * t);
                b = Math.round(b + (CFG.activeColor.b - b) * t);
            }

            ctx.beginPath();
            ctx.arc(px, py, halfDot, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fill();
        }

        requestAnimationFrame(frame);
    }

    /* ---------- Init ---------- */
    resize();
    frame();
})();
