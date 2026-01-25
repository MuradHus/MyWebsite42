const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('cursorPoint');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = (canvas.width / 2) - 20; // Leave room for expansion

// State
let activeSector = -1; // 0-11
let isHoveringWheel = false;

// --- Wheel Logic ---
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear

    // 1. Draw 12 Discrete Sectors
    const sectors = 12;
    const arcSize = (2 * Math.PI) / sectors;
    
    for (let i = 0; i < sectors; i++) {
        const startAngle = i * arcSize;
        const endAngle = (i + 1) * arcSize;
        const midAngleDeg = (i * 360) / sectors; // Base hue
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Base Color: Saturation 100%, Lightness 50%
        ctx.fillStyle = `hsl(${midAngleDeg}, 100%, 50%)`;
        ctx.fill();
        ctx.strokeStyle = '#1a1a1a'; // Gap
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 2. Draw Expanded Sector if Active
    if (activeSector !== -1) {
        drawExpandedSector(activeSector);
    }
}

function drawExpandedSector(index) {
    const sectors = 12;
    const arcSize = (2 * Math.PI) / sectors;
    const startAngle = (index * arcSize) - 0.1; // Overlap slightly
    const endAngle = ((index + 1) * arcSize) + 0.1;
    
    // Draw Outer Ring (Detailed Gradient)
    // We want a gradient of hues from start of sector to end of sector
    // Actually, let's draw a "Zoomed" arc that is larger
    const innerR = radius + 2;
    const outerR = radius + 20;
    
    // Fine grained drawing for gradient
    const steps = 30;
    const stepSize = (endAngle - startAngle) / steps;
    const hueStart = (index * 360) / sectors;
    const hueEnd = ((index + 1) * 360) / sectors;
    const hueStep = (hueEnd - hueStart) / steps;

    for (let j = 0; j < steps; j++) {
        const sA = startAngle + (j * stepSize);
        const eA = startAngle + ((j + 1) * stepSize);
        const curHue = hueStart + (j * hueStep);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerR, sA, eA);
        ctx.arc(centerX, centerY, innerR, eA, sA, true); // Outline path
        ctx.closePath();
        
        ctx.fillStyle = `hsl(${curHue}, 100%, 50%)`;
        ctx.fill();
    }
    
    // Highlight the inner sector too?
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius + 5, startAngle, endAngle); // Pop out
    ctx.fillStyle = `hsl(${(hueStart+hueEnd)/2}, 100%, 50%)`;
    // ctx.fill(); // Maybe not cover it, just popup logic if needed. 
    // Actually simpler: just the outer ring indicates focus.
}

// Initial Draw
drawWheel();

// Wheel Interaction
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Calculate Angle
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Detect Sector
    if (dist <= radius + 20) { // Include outer ring
        const sectors = 12;
        const arcSize = (2 * Math.PI) / sectors;
        activeSector = Math.floor(angle / arcSize);
        isHoveringWheel = true;
        
        // Pick Color Logic (Continuous inside sector?)
        // Let's stick to: Click to pick, Move to preview sector
        // But user wants "Choose color". 
        // We can update preview based on exact mouse pos logic from previous version 
        // OR based on the sector logic.
        // Let's keep pixel picking for exactness, but expand visual for effect.
        
        drawWheel(); // Re-render with expansion
        
        // Move Cursor
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        cursor.style.display = 'block';
        
        // Update Values (Pixel Peeping)
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        // Check transparent
        if(pixel[3] > 0) {
             updateValues(pixel[0], pixel[1], pixel[2]);
        }
        
    } else {
        if (activeSector !== -1) {
            activeSector = -1;
            drawWheel(); // Reset
        }
        isHoveringWheel = false;
    }
});

canvas.addEventListener('click', (e) => {
    // Lock selection or something? 
    // Currently it updates on hover, click just feels confirming.
    // Maybe play a sound or animation?
});

// --- Image Analysis Logic ---
const imgInput = document.getElementById('imgUpload');
const imgCanvas = document.getElementById('imgCanvas');
const imgCtx = imgCanvas.getContext('2d');
const paletteGrid = document.getElementById('paletteGrid');
const hoverPreview = document.getElementById('hoverPreview');
const imgWrapper = document.getElementById('imgWrapper');
const paletteContainer = document.getElementById('paletteContainer');

imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // Show containers
                imgWrapper.style.display = 'block';
                paletteContainer.style.display = 'block';
                
                const maxW = 350;
                const scale = Math.min(1, maxW / img.width);
                imgCanvas.width = img.width * scale;
                imgCanvas.height = img.height * scale;
                imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
                
                extractColors(img, imgCanvas.width, imgCanvas.height);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Pick from Image (Click)
imgCanvas.addEventListener('click', (e) => {
    const rect = imgCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = imgCtx.getImageData(x, y, 1, 1).data;
    
    // Hide wheel cursor to avoid confusion
    cursor.style.display = 'none'; 
    updateValues(pixel[0], pixel[1], pixel[2]);
});

// Hover Preview (Magnifier)
imgCanvas.addEventListener('mousemove', (e) => {
    const rect = imgCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x < 0 || y < 0 || x > imgCanvas.width || y > imgCanvas.height) {
        hoverPreview.style.display = 'none';
        return;
    }

    const pixel = imgCtx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    
    hoverPreview.style.display = 'block';
    hoverPreview.style.background = color;
    // Position fixed logic needs clientX/Y
    hoverPreview.style.left = (e.clientX + 20) + 'px'; // Offset slightly
    hoverPreview.style.top = (e.clientY + 20) + 'px';
});

imgCanvas.addEventListener('mouseleave', () => {
    hoverPreview.style.display = 'none';
});


function extractColors(img, w, h) {
    const pixelData = imgCtx.getImageData(0, 0, w, h).data;
    const colorCounts = {};
    const step = 4 * 10; 
    
    for (let i = 0; i < pixelData.length; i += step) {
        const r = pixelData[i];
        const g = pixelData[i+1];
        const b = pixelData[i+2];
        const a = pixelData[i+3];
        
        if (a < 128) continue; 
        
        const rQ = Math.round(r / 32) * 32;
        const gQ = Math.round(g / 32) * 32;
        const bQ = Math.round(b / 32) * 32;
        
        const key = `${rQ},${gQ},${bQ}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
    
    const sorted = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]).slice(0, 6);
    
    paletteGrid.innerHTML = '';
    sorted.forEach(key => {
        const [r, g, b] = key.split(',').map(Number);
        const div = document.createElement('div');
        div.className = 'palette-swatch';
        div.style.background = `rgb(${r},${g},${b})`;
        div.title = `RGB: ${r}, ${g}, ${b}`;
        div.onclick = () => {
             canvas.scrollIntoView({behavior: 'smooth'}); // Scroll to info panel?
             updateValues(r, g, b);
        }
        paletteGrid.appendChild(div);
    });
}


// --- Shared Update Logic ---
function updateValues(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    
    const div = document.getElementById('colorPreview');
    div.style.background = `rgb(${r},${g},${b})`;
    div.style.boxShadow = `0 0 20px rgb(${r},${g},${b})`;
    
    const txt = document.getElementById('previewText');
    txt.innerText = hex;
    txt.style.color = (hsl[2] > 50) ? '#000' : '#fff';
    
    document.getElementById('valHex').value = hex;
    document.getElementById('valRgb').value = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('valHsl').value = `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`;
    document.getElementById('valCmyk').value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    updateHarmonies(hsl[0], hsl[1], hsl[2]);
}

function updateHarmonies(h, s, l) {
    const swatches = document.getElementById('swatches');
    swatches.innerHTML = '';
    
    addSwatch((h + 180) % 360, s, l);
    addSwatch((h + 30) % 360, s, l);
    addSwatch((h - 30 + 360) % 360, s, l);
    addSwatch((h + 120) % 360, s, l);
    addSwatch((h + 240) % 360, s, l);
}

function addSwatch(h, s, l) {
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.background = `hsl(${h}, ${s}%, ${l}%)`;
    div.onclick = () => {
         // Visual only for now
    };
    document.getElementById('swatches').appendChild(div);
}

// Converters...
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; } 
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    c = (c - k) / (1 - k) || 0;
    m = (m - k) / (1 - k) || 0;
    y = (y - k) / (1 - k) || 0;
    return {c:Math.round(c*100), m:Math.round(m*100), y:Math.round(y*100), k:Math.round(k*100)};
}

window.copyToClipboard = (id) => {
    const el = document.getElementById(id);
    el.select();
    document.execCommand('copy');
};
