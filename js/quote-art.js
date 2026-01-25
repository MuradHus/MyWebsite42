const canvas = document.getElementById('quoteCanvas');
const ctx = canvas.getContext('2d');

// State
const state = {
    text: "إنما الأمم الأخلاق ما بقيت\nفإن هم ذهبت أخلاقهم ذهبوا",
    author: "أحمد شوقي",
    font: "Cairo",
    bgType: "color", // color, grad, image
    bgValue: "#000000",
    bgImage: null,
    textColor: "#ffffff",
    fontSize: 40,
    align: "center"
};

// Canvas Size (Instagram Square)
canvas.width = 1080;
canvas.height = 1080;

// Listeners
document.getElementById('quoteText').addEventListener('input', (e) => { state.text = e.target.value; draw(); });
document.getElementById('quoteAuthor').addEventListener('input', (e) => { state.author = e.target.value; draw(); });
document.getElementById('fontSelect').addEventListener('change', (e) => { state.font = e.target.value; draw(); });
document.getElementById('textColor').addEventListener('input', (e) => { state.textColor = e.target.value; draw(); });
document.getElementById('fontSize').addEventListener('input', (e) => { state.fontSize = parseInt(e.target.value); draw(); });

document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.align = btn.dataset.align;
        draw();
    });
});

document.querySelectorAll('.bg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.type === 'image') return; // Image handled by upload
        document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.bgType = btn.dataset.type;
        state.bgValue = btn.dataset.val;
        draw();
    });
});

document.getElementById('bgUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                state.bgType = 'image';
                state.bgImage = img;
                draw();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `quote-art.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Logic
function draw() {
    const w = canvas.width;
    const h = canvas.height;
    
    // 1. Background
    if (state.bgType === 'color') {
        ctx.fillStyle = state.bgValue;
        ctx.fillRect(0, 0, w, h);
    } else if (state.bgType === 'grad') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        // Simple parsing for specific preset values used in HTML
        if (state.bgValue.includes('#FF9A9E')) { grad.addColorStop(0, '#FF9A9E'); grad.addColorStop(1, '#FECFEF'); }
        else if (state.bgValue.includes('#84fab0')) { grad.addColorStop(0, '#84fab0'); grad.addColorStop(1, '#8fd3f4'); }
        else if (state.bgValue.includes('#30cfd0')) { grad.addColorStop(0, '#30cfd0'); grad.addColorStop(1, '#330867'); }
        else { grad.addColorStop(0, '#000'); grad.addColorStop(1, '#333'); } // Fallback
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    } else if (state.bgType === 'image' && state.bgImage) {
        drawImageCover(ctx, state.bgImage, 0, 0, w, h);
        // Overlay for readability
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, w, h);
    }
    
    // 2. Text
    ctx.fillStyle = state.textColor;
    ctx.font = `${state.fontSize}px "${state.font}", sans-serif`;
    ctx.textAlign = state.align;
    ctx.textBaseline = 'middle';
    
    const padding = 100;
    const maxWidth = w - (padding * 2);
    const lineHeight = state.fontSize * 1.5;
    
    const x = (state.align === 'center') ? w/2 : (state.align === 'right' ? w - padding : padding);
    
    // Wrap Text
    const lines = wrapText(ctx, state.text, maxWidth);
    const totalTextHeight = lines.length * lineHeight;
    let y = (h - totalTextHeight) / 2;
    
    // Draw Quote Mark (Big)
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '200px serif';
    ctx.fillText('“', w/2, h/2 - 100);
    ctx.restore();
    
    // Draw Text Lines
    lines.forEach(line => {
        ctx.fillText(line, x, y);
        y += lineHeight;
    });
    
    // 3. Author
    if (state.author) {
        ctx.fillStyle = state.textColor;
        ctx.font = `bold ${state.fontSize * 0.6}px "${state.font}", sans-serif`;
        y += 40; // Spacing
        // Dash
        const authorText = `- ${state.author}`;
        ctx.fillText(authorText, x, y);
    }
}

function wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    
    paragraphs.forEach(para => {
        const words = para.split(' ');
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
    });
    return lines;
}

function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const winRatio = w / h;
    let nw, nh, nx, ny;
    if (imgRatio > winRatio) {
        nh = h; nw = h * imgRatio; ny = 0; nx = (w - nw) / 2;
    } else {
        nw = w; nh = w / imgRatio; nx = 0; ny = (h - nh) / 2;
    }
    ctx.drawImage(img, x + nx, y + ny, nw, nh);
}

// Init
draw();
