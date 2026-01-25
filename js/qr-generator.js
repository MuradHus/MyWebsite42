// Elements
const els = {
    text: document.getElementById('qrText'),
    contactName: document.getElementById('contactName'),
    contactNumber: document.getElementById('contactNumber'),
    
    // Email inputs
    emailAddr: document.getElementById('emailAddr'),
    emailSubject: document.getElementById('emailSubject'),
    emailBody: document.getElementById('emailBody'),

    // Groups
    textGroup: document.getElementById('textInputGroup'),
    phoneGroup: document.getElementById('phoneInputGroup'),
    emailGroup: document.getElementById('emailInputGroup'),

    fg: document.getElementById('qrForeground'),
    fg2: document.getElementById('qrForeground2'), // Gradient End
    bg: document.getElementById('qrBackground'),
    
    size: document.getElementById('qrSize'),
    shape: document.getElementById('qrShape'),
    emojiWrapper: document.getElementById('emojiInputWrapper'),
    emojiChar: document.getElementById('qrEmojiChar'),
    logo: document.getElementById('logoInput'),
    logoSize: document.getElementById('logoSize'),
    download: document.getElementById('downloadBtn'),
    canvas: document.getElementById('qrCanvas'),
    sizeVal: document.getElementById('sizeValue')
};

let logoImage = null;
let currentMode = 'text';

// Listeners
document.querySelectorAll('input[name="contentType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        els.textGroup.style.display = 'none';
        els.phoneGroup.style.display = 'none';
        els.emailGroup.style.display = 'none';

        if (currentMode === 'text') els.textGroup.style.display = 'block';
        else if (currentMode === 'phone') els.phoneGroup.style.display = 'block';
        else if (currentMode === 'email') els.emailGroup.style.display = 'block';

        generateQR();
    });
});

// Attach input listeners
const inputs = [
    els.text, els.contactName, els.contactNumber, 
    els.emailAddr, els.emailSubject, els.emailBody,
    els.fg, els.fg2, els.bg, els.shape, els.emojiChar, els.logoSize
];
inputs.forEach(el => el && el.addEventListener('input', generateQR));

els.size.addEventListener('input', () => {
    els.sizeVal.innerText = els.size.value + 'px';
    generateQR();
});

els.shape.addEventListener('change', () => {
    els.emojiWrapper.style.display = (els.shape.value === 'emoji') ? 'block' : 'none';
    generateQR();
});

els.logo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                logoImage = img;
                document.getElementById('logoName').innerText = file.name;
                generateQR();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        logoImage = null;
        generateQR();
    }
});

function generateQR() {
    // 1. Data Mode
    let data = '';
    if (currentMode === 'text') {
        data = els.text.value || ' ';
    } else if (currentMode === 'phone') {
        const name = els.contactName.value || '';
        const num = els.contactNumber.value || '';
        data = `MECARD:N:${name};TEL:${num};;`;
    } else if (currentMode === 'email') {
        const to = els.emailAddr.value || '';
        const sub = els.emailSubject.value || '';
        const body = els.emailBody.value || '';
        data = `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    }

    // 2. Generate Logic
    const typeNumber = 0;
    const errorCorrectionLevel = 'H';
    const qr = qrcode(typeNumber, errorCorrectionLevel);

    try {
        qr.addData(data);
        qr.make();
    } catch (e) {
        console.error(e);
        return;
    }

    // 3. Render
    const canvas = els.canvas;
    const ctx = canvas.getContext('2d');
    const size = parseInt(els.size.value);
    const moduleCount = qr.getModuleCount();
    const cellSize = size / moduleCount;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = els.bg.value;
    ctx.fillRect(0, 0, size, size);

    // Gradient Setup
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, els.fg.value);
    gradient.addColorStop(1, els.fg2.value);

    // Helper: Identify Eyes (Finder Patterns)
    // TopLeft (0,0 to 7,7), TopRight (count-7,0), BottomLeft (0, count-7)
    // We will SKIP drawing modules inside these zones in the loop, 
    // and draw them manually as custom shapes.
    
    function isEyeZone(r, c) {
        return (r < 7 && c < 7) || 
               (r < 7 && c >= moduleCount - 7) || 
               (r >= moduleCount - 7 && c < 7);
    }

    // Draw Modules (Skip Eyes)
    ctx.fillStyle = gradient; // Use Gradient
    
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col) && !isEyeZone(row, col)) {
                const x = col * cellSize;
                const y = row * cellSize;
                const w = cellSize; // Use exact calculated size to avoid gaps
                
                // Shapes
                if (els.shape.value === 'circle') {
                    ctx.beginPath();
                    ctx.arc(x + w/2, y + w/2, w/2, 0, Math.PI*2);
                    ctx.fill();
                } else if (els.shape.value === 'emoji') {
                    ctx.font = `${w}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(els.emojiChar.value, x + w/2, y + w/2 + 2);
                } else {
                    // Square or default
                    // Slightly round inner squares?
                    // ctx.roundRect(x, y, w, w, w*0.2); -> requires browser support, fallback rect
                    if (ctx.roundRect) {
                         ctx.beginPath();
                         ctx.roundRect(x, y, w, w, w*0.2); // 20% radius
                         ctx.fill();
                    } else {
                         ctx.fillRect(x, y, w, w);
                    }
                }
            }
        }
    }

    // Draw Custom Eyes
    function drawEye(startX, startY) {
        const pad = cellSize; // 1 module padding
        const outerSize = 7 * cellSize;
        const innerSize = 3 * cellSize;
        
        ctx.save();
        
        // Shadow for Big Squares
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Outer Box (Hollow)
        ctx.lineWidth = cellSize;
        ctx.strokeStyle = gradient;
        
        // Draw Rounded Rect for Outer
        ctx.beginPath();
        const r = outerSize * 0.3; // 30% radius
        if (ctx.roundRect) {
            ctx.roundRect(startX + cellSize/2, startY + cellSize/2, outerSize - cellSize, outerSize - cellSize, r);
        } else {
            ctx.rect(startX + cellSize/2, startY + cellSize/2, outerSize - cellSize, outerSize - cellSize);
        }
        ctx.stroke();

        // Inner Box (Filled)
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const r2 = innerSize * 0.3;
        const innerOffset = 2 * cellSize;
        if (ctx.roundRect) {
            ctx.roundRect(startX + innerOffset, startY + innerOffset, innerSize, innerSize, r2);
        } else {
            ctx.fillRect(startX + innerOffset, startY + innerOffset, innerSize, innerSize);
        }
        ctx.fill();

        ctx.restore();
    }

    // Positions of eyes
    drawEye(0, 0); // TL
    drawEye((moduleCount - 7) * cellSize, 0); // TR
    drawEye(0, (moduleCount - 7) * cellSize); // BL


    // Logo Overlay
    if (logoImage) {
        const logoPercent = parseInt(els.logoSize.value) / 100;
        const logoW = size * logoPercent;
        const logoH = (logoImage.height / logoImage.width) * logoW;
        const lx = (size - logoW) / 2;
        const ly = (size - logoH) / 2;
        
        // Border for logo to clear QR noise
        ctx.strokeStyle = els.bg.value;
        ctx.lineWidth = 8;
        ctx.strokeRect(lx, ly, logoW, logoH);
        ctx.fillStyle = els.bg.value;
        ctx.fillRect(lx, ly, logoW, logoH);
        
        ctx.drawImage(logoImage, lx, ly, logoW, logoH);
    }
}

// Download
els.download.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'fancy-qr.png';
    link.href = els.canvas.toDataURL('image/png');
    link.click();
});

// Init
setTimeout(generateQR, 500);
