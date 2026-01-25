const canvas = document.getElementById('mockupCanvas');
const ctx = canvas.getContext('2d');
const imgUpload = document.getElementById('imgUpload');

let userImage = null;
let currentDevice = 'iphone'; // iphone, laptop, browser
let currentBg = '#252525';
let orientation = 'portrait';
let deviceStyle = 'standard';

// Configs
const DEVICES = {
    iphone: { w: 1080, h: 1080, screenW: 350, screenH: 760, radius: 45 },
    laptop: { w: 1200, h: 900, screenW: 800, screenH: 500, radius: 10 },
    browser: { w: 1200, h: 900, screenW: 900, screenH: 600, radius: 8 }
};

// Init
resizeCanvas();
draw();

// Listeners
imgUpload.addEventListener('change', handleUpload);

document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDevice = btn.dataset.device;
        
        // Hide/Show Orientation for non-phone?
        // User asked "Change Phone Orientation", implies phone.
        // But let's keep it visible.
        
        resizeCanvas();
        draw();
    });
});

document.getElementById('orientationSelect').addEventListener('change', (e) => {
    orientation = e.target.value;
    draw();
});

document.getElementById('styleSelect').addEventListener('change', (e) => {
    deviceStyle = e.target.value;
    draw();
});

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const c = dot.dataset.color;
        if (c.startsWith('grad')) {
             if (c === 'grad1') currentBg = ['#667eea', '#764ba2'];
             if (c === 'grad2') currentBg = ['#FF512F', '#DD2476'];
        } else {
            currentBg = c;
        }
        draw();
    });
});

document.getElementById('applyGradBtn').addEventListener('click', () => {
    const c1 = document.getElementById('bgStart').value;
    const c2 = document.getElementById('bgEnd').value;
    currentBg = [c1, c2];
    draw();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `mockup-${currentDevice}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                userImage = img;
                draw();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function resizeCanvas() {
    const cfg = DEVICES[currentDevice];
    canvas.width = cfg.w;
    canvas.height = cfg.h;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;
    
    // 1. Background
    if (Array.isArray(currentBg)) {
        const gr = ctx.createLinearGradient(0, 0, w, h);
        gr.addColorStop(0, currentBg[0]);
        gr.addColorStop(1, currentBg[1]);
        ctx.fillStyle = gr;
    } else {
        ctx.fillStyle = currentBg;
    }
    ctx.fillRect(0, 0, w, h);
    
    // 2. Shadows
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 30;
    
    // 3. Draw Device Frame
    if (currentDevice === 'iphone') drawIphone(w/2, h/2);
    else if (currentDevice === 'laptop') drawLaptop(w/2, h/2);
    else if (currentDevice === 'browser') drawBrowser(w/2, h/2);
    
    ctx.restore();
}

function drawIphone(cx, cy) {
    let sw = 360; 
    let sh = 780;
    let padding = 15; // Bezel
    let r = 45;
    
    // Style adjustments
    if (deviceStyle === 'boxy') {
        r = 5;       // Sharp corners (iPhone 12/13/14 style is sharp but rounded, pure boxy is r=0? lets do small r)
        padding = 10;
    } else if (deviceStyle === 'minimal') {
        r = 30;
        padding = 5; // Thin bezel
    }

    // Orientation
    if (orientation === 'landscape') {
        // Swap dimensions
        const temp = sw; sw = sh; sh = temp;
    }
    
    const x = cx - sw/2;
    const y = cy - sh/2;
    
    // Body
    ctx.fillStyle = '#111'; 
    roundRect(ctx, x - padding, y - padding, sw + padding*2, sh + padding*2, r);
    
    // Screen Area (Mask)
    ctx.shadowColor = 'transparent'; 
    
    // Draw Screen BG
    ctx.fillStyle = '#222';
    // Inner radius logic
    let screenR = Math.max(0, r - 5);
    roundRect(ctx, x, y, sw, sh, screenR);
    
    // Image
    if (userImage) {
        ctx.save();
        roundedClip(ctx, x, y, sw, sh, screenR);
        drawImageCover(ctx, userImage, x, y, sw, sh);
        ctx.restore();
    } else {
        ctx.fillStyle = '#555';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Your Image Here', cx, cy);
    }
    
    // Notch (Dynamic Island)
    // Only if not minimal? Or minimalist notch?
    // Rotate Notch if landscape?
    if (deviceStyle !== 'minimal') {
        ctx.fillStyle = '#000';
        
        let nw = 120, nh = 35;
        let nx, ny;
        
        if (orientation === 'portrait') {
             nx = cx - nw/2;
             ny = y + 10;
        } else {
             // Landscape: Notch usually on the left or right side? 
             // iPhone Notch is 'top' of device relative to held. 
             // If rotated 90deg left: Notch is left.
             // Let's put notch on Left side
             const tnw = nh; const tnh = nw; // Swap W/H
             nx = x + 10;
             ny = cy - tnh/2;
             nw = tnw; nh = tnh;
        }
        
        roundRect(ctx, nx, ny, nw, nh, 17);
    }
    
    // Reflection/Gloss
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - padding, y - padding, sw + padding*2, sh + padding*2, r);
    ctx.stroke();
}

function drawLaptop(cx, cy) {
    // Orientation for laptop is weird, ignore usually.
    const sw = 800; // Screen Width
    const sh = 500; // Screen Height
    let bezel = 20;
    
    if (deviceStyle === 'minimal') bezel = 5;
    if (deviceStyle === 'boxy') bezel = 15; // Boxy laptop?

    const bx = cx - sw/2 - bezel;
    const by = cy - sh/2 - bezel;
    const bw = sw + bezel*2;
    const bh = sh + bezel*2;
    
    // Lid
    ctx.fillStyle = '#1a1a1a'; 
    roundRect(ctx, bx, by, bw, bh, deviceStyle === 'boxy' ? 2 : 15);
    
    // Screen Mask
    ctx.shadowColor = 'transparent';
    if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - sw/2, cy - sh/2, sw, sh);
        ctx.clip();
        drawImageCover(ctx, userImage, cx - sw/2, cy - sh/2, sw, sh);
        ctx.restore();
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - sw/2, cy - sh/2, sw, sh);
    }
    
    // Base
    const baseH = 25;
    const baseW = bw + 80;
    const baseY = by + bh;
    
    const grads = ctx.createLinearGradient(0, baseY, 0, baseY + baseH);
    grads.addColorStop(0, '#2a2a2a');
    grads.addColorStop(1, '#111');
    ctx.fillStyle = grads;
    
    // Hinge
    ctx.fillStyle = '#111';
    ctx.fillRect(bx, baseY, bw, 10);
    
    // Bottom Body
    ctx.fillStyle = '#c0c0c0'; 
    const slabW = bw + (deviceStyle==='minimal' ? 20 : 100);
    const slabX = cx - slabW/2;
    
    if (deviceStyle === 'boxy') {
        ctx.fillRect(slabX, baseY + 10, slabW, baseH);
    } else {
        // Rounded
        ctx.beginPath();
        ctx.moveTo(slabX, baseY + 10);
        ctx.lineTo(slabX + slabW, baseY + 10);
        ctx.lineTo(slabX + slabW, baseY + 25); 
        ctx.quadraticCurveTo(slabX + slabW, baseY + 40, slabX + slabW - 20, baseY + 40); 
        ctx.lineTo(slabX + 20, baseY + 40);
        ctx.quadraticCurveTo(slabX, baseY + 40, slabX, baseY + 25);
        ctx.fill();
    }
}

function drawBrowser(cx, cy) {
    const w = 900;
    const h = 600;
    const barH = 40;
    const r = (deviceStyle === 'boxy') ? 0 : 10;
    
    const x = cx - w/2;
    const y = cy - h/2;
    
    // Window Frame
    ctx.fillStyle = '#fff';
    roundRect(ctx, x, y, w, h, r);
    
    // Content
    ctx.shadowColor = 'transparent';
    const contentY = y + barH;
    const contentH = h - barH;
    
    if (userImage) {
        ctx.save();
        
        ctx.beginPath();
        if (deviceStyle === 'boxy') {
             ctx.rect(x, contentY, w, contentH);
        } else {
            // Complex Clip
            ctx.moveTo(x, contentY);
            ctx.lineTo(x + w, contentY);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        }
        ctx.closePath();
        ctx.clip();
        
        drawImageCover(ctx, userImage, x, contentY, w, contentH);
        ctx.restore();
    } else {
        ctx.fillStyle = '#eee';
        ctx.fillRect(x, contentY, w, contentH);
    }
    
    // Title Bar
    ctx.fillStyle = '#ddd'; 
    if (deviceStyle === 'boxy') {
        ctx.fillRect(x, y, w, barH);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, contentY);
        ctx.lineTo(x, contentY);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
    }
    
    // Lights (Minimal might hide them?)
    if (deviceStyle !== 'minimal') {
        ctx.fillStyle = '#ff5f56'; 
        ctx.beginPath(); ctx.arc(x + 20, y + 20, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffbd2e'; 
        ctx.beginPath(); ctx.arc(x + 40, y + 20, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#27c93f'; 
        ctx.beginPath(); ctx.arc(x + 60, y + 20, 6, 0, Math.PI*2); ctx.fill();
    }
    
    // URL Bar
    if (deviceStyle !== 'minimal') {
        ctx.fillStyle = '#fff';
        roundRect(ctx, x + 80, y + 8, w - 100, 24, 5);
    }
}


// --- Helpers ---
function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function roundedClip(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
}

function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const winRatio = w / h;
    
    let nw, nh, nx, ny;
    
    if (imgRatio > winRatio) {
        nh = h;
        nw = h * imgRatio;
        ny = 0;
        nx = (w - nw) / 2;
    } else {
        nw = w;
        nh = w / imgRatio;
        nx = 0;
        ny = (h - nh) / 2;
    }
    
    ctx.drawImage(img, x + nx, y + ny, nw, nh);
}
