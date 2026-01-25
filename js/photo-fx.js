const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');
const imgUpload = document.getElementById('imgUpload');
const loading = document.getElementById('loading');

let originalImage = null;
let processedImage = null;

// Controls
const toggles = {
    glitch: document.getElementById('glitchToggle'),
    pixelate: document.getElementById('pixelToggle'),
    duotone: document.getElementById('duotoneToggle')
};

const params = {
    glitchAmount: document.getElementById('glitchAmount'),
    glitchOffset: document.getElementById('glitchOffset'),
    pixelSize: document.getElementById('pixelSize'),
    duotoneC1: document.getElementById('duotoneC1'),
    duotoneC2: document.getElementById('duotoneC2')
};

// Listeners
imgUpload.addEventListener('change', handleUpload);

// Attach Render Trigger to all inputs
Object.values(toggles).forEach(el => el.addEventListener('change', render));
Object.values(params).forEach(el => el.addEventListener('input', render));

function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    loading.innerText = "جاري المعالجة...";
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            loading.style.display = 'none';
            // Resize for performance if huge
            fitCanvas(img);
            render();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function fitCanvas(img) {
    const max = 1000;
    let w = img.width;
    let h = img.height;
    
    if (w > max || h > max) {
        if (w > h) { h *= max/w; w = max; }
        else { w *= max/h; h = max; }
    }
    
    canvas.width = w;
    canvas.height = h;
}

function render() {
    if (!originalImage) return;
    
    // 1. Reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // 2. Apply Filters Pipeline
    // Order: Duotone -> Pixelate -> Glitch
    
    if (toggles.duotone.checked) {
        applyDuotone();
    }
    
    if (toggles.pixelate.checked) {
        applyPixelate();
    }
    
    if (toggles.glitch.checked) {
        applyGlitch();
    }
}

// --- Filters ---

function applyPixelate() {
    const size = parseInt(params.pixelSize.value);
    const w = canvas.width;
    const h = canvas.height;
    
    // Trick: Draw small then scale up
    const smW = Math.ceil(w / size);
    const smH = Math.ceil(h / size);
    
    // Create temp canvas
    const temp = document.createElement('canvas');
    temp.width = smW;
    temp.height = smH;
    const tCtx = temp.getContext('2d');
    
    // Draw current canvas state reduced
    tCtx.drawImage(canvas, 0, 0, smW, smH);
    
    // Draw back scaled
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(temp, 0, 0, smW, smH, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
}

function applyDuotone() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    
    const c1 = hexToRgb(params.duotoneC1.value); // Dark
    const c2 = hexToRgb(params.duotoneC2.value); // Light
    
    for (let i = 0; i < data.length; i += 4) {
        // Luminance
        const avg = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
        const ratio = avg / 255;
        
        // Interpolate
        data[i] = c1.r + (c2.r - c1.r) * ratio;     // R
        data[i+1] = c1.g + (c2.g - c1.g) * ratio; // G
        data[i+2] = c1.b + (c2.b - c1.b) * ratio; // B
        // Alpha unchanged
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function applyGlitch() {
    const amount = parseInt(params.glitchAmount.value);
    const offset = parseInt(params.glitchOffset.value);
    const w = canvas.width;
    const h = canvas.height;
    
    // 1. Channel Shift (RGB Split)
    if (offset > 0) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const shifted = ctx.createImageData(w, h);
        const sData = shifted.data;
        
        // Copy original coords
        for (let i=0; i<data.length; i++) sData[i] = data[i];
        
        // Shift Blue channel
        const shiftX = offset * 2;
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                
                // Get Blue from shifted pos
                const sx = x + shiftX;
                if (sx < w) {
                    const si = (y * w + sx) * 4;
                    sData[i+2] = data[si+2]; 
                }
            }
        }
        ctx.putImageData(shifted, 0, 0);
    }
    
    // 2. Random Slices
    const slices = amount; // Number of slices
    const maxShift = offset * 5;
    
    for (let i = 0; i < slices; i++) {
        const sliceH = Math.random() * 20 + 5;
        const sliceY = Math.random() * h;
        const shift = (Math.random() - 0.5) * maxShift;
        
        // Draw slice shifted
        // Using drawImage with cropping
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // We need to copy from current canvas context... inefficient to readback constantly.
        // Better: Grab that slice as ImageData and put it back shifted.
        
        // Simple visual glitch:
        try {
            const sliceData = ctx.getImageData(0, sliceY, w, sliceH);
            ctx.putImageData(sliceData, shift, sliceY);
        } catch(e) {}
    }
}

function hexToRgb(hex) {
    const r = parseInt(hex.substring(1,3), 16);
    const g = parseInt(hex.substring(3,5), 16);
    const b = parseInt(hex.substring(5,7), 16);
    return {r, g, b};
}

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'artistic-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
