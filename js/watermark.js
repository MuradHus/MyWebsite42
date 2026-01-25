const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const workspace = document.getElementById('workspace');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const thumbnailsContainer = document.getElementById('thumbnailsList');

// State
let loadedImages = []; // Array of { file, imgObject, name }
let currentImageIndex = 0;
let watermarkImage = null;

let config = {
    type: 'text', // text, image, both
    text: '',
    textColor: '#ffffff',
    strokeColor: '#000000',
    textPosition: 'BR', 
    imagePosition: 'TL',
    size: 15,
    opacity: 100
};

// --- Upload Logic ---
uploadArea.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#fff'; });
uploadArea.addEventListener('dragleave', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#d4af37'; });
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#d4af37';
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    
    // Convert FileList to Array and process
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                loadedImages.push({
                    file: file,
                    img: img,
                    name: file.name
                });
                
                // If first image, init workspace
                if (loadedImages.length === 1) {
                    currentImageIndex = 0;
                    initWorkspace();
                }
                updateThumbnails();
                if (loadedImages.length > 0) render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function initWorkspace() {
    uploadArea.style.display = 'none';
    workspace.style.display = 'grid';
}

function updateThumbnails() {
    thumbnailsContainer.innerHTML = '';
    loadedImages.forEach((item, index) => {
        const thumb = document.createElement('img');
        thumb.src = item.img.src;
        thumb.className = `thumb-img ${index === currentImageIndex ? 'active' : ''}`;
        thumb.onclick = () => {
            currentImageIndex = index;
            updateThumbnails();
            render();
        };
        thumbnailsContainer.appendChild(thumb);
    });
}

// --- Tool Controls ---

// Type Switch
document.querySelectorAll('input[name="signatureType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        config.type = e.target.value;
        const textBlock = document.getElementById('textSettingsBlock');
        const imgBlock = document.getElementById('imageSettingsBlock');
        
        if (config.type === 'text') {
            textBlock.style.display = 'block';
            imgBlock.style.display = 'none';
        } else if (config.type === 'image') {
            textBlock.style.display = 'none';
            imgBlock.style.display = 'block';
        } else {
            textBlock.style.display = 'block';
            imgBlock.style.display = 'block';
        }
        render();
    });
});

// Text Inputs
document.getElementById('signatureText').addEventListener('input', (e) => { config.text = e.target.value; render(); });
document.getElementById('textColor').addEventListener('input', (e) => { config.textColor = e.target.value; render(); });
document.getElementById('strokeColor').addEventListener('input', (e) => { config.strokeColor = e.target.value; render(); });

// Watermark Image
const sigImgInput = document.getElementById('signatureImageInput');
document.getElementById('uploadSignatureBtn').addEventListener('click', () => sigImgInput.click());
sigImgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                watermarkImage = img;
                document.getElementById('uploadSignatureBtn').innerText = "تم ✅";
                render();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Positioning
document.querySelectorAll('.position-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type; // text or image
        const pos = btn.dataset.pos;
        
        // Update active class in correct grid
        const gridId = type === 'text' ? 'textPosGrid' : 'imgPosGrid';
        document.querySelector(`#${gridId} .active`).classList.remove('active');
        btn.classList.add('active');
        
        if (type === 'text') config.textPosition = pos;
        else config.imagePosition = pos;
        
        render();
    });
});

// Common Sliders
document.getElementById('signatureSize').addEventListener('input', (e) => {
    config.size = parseInt(e.target.value);
    document.getElementById('sizeVal').innerText = config.size + '%';
    render();
});
document.getElementById('signatureOpacity').addEventListener('input', (e) => {
    config.opacity = parseInt(e.target.value);
    document.getElementById('opacityVal').innerText = config.opacity + '%';
    render();
});


// --- Render Logic ---
function render() {
    if (loadedImages.length === 0) return;
    const base = loadedImages[currentImageIndex].img;

    canvas.width = base.width;
    canvas.height = base.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Base
    ctx.drawImage(base, 0, 0);

    ctx.save();
    ctx.globalAlpha = config.opacity / 100;
    ctx.direction = 'ltr'; // Force LTR for consistent coordinate system
    
    const padding = Math.min(canvas.width, canvas.height) * 0.05;

    // Draw Text if needed
    if (config.type === 'text' || config.type === 'both') {
        const text = config.text || "Watermark";
        const fontSize = (canvas.width * config.size) / 100; 
        ctx.font = `bold ${fontSize}px 'Cairo', sans-serif`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left'; // Reset alignment to be safe
        
        const metrics = ctx.measureText(text);
        
        // Calculate true text height including accents
        let actualHeight = fontSize * 1.2;
        if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
             actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 10;
        }

        const ww = metrics.width;
        const wh = actualHeight;
        
        const pos = calculatePosition(ww, wh, padding, config.textPosition);
        
        // Adjust Y for baseline 'top' if using bounding box logic
        // But simple 'textBaseline=top' is usually consistent enough if we use standard line height.
        // Let's stick to calculated pos.
        
        // Stroke
        ctx.strokeStyle = config.strokeColor;
        ctx.lineWidth = fontSize / 25;
        ctx.strokeText(text, pos.x, pos.y);
        
        // Fill
        ctx.fillStyle = config.textColor;
        ctx.fillText(text, pos.x, pos.y);
    }

    // Draw Image if needed
    if ((config.type === 'image' || config.type === 'both') && watermarkImage) {
        const scale = (canvas.width * (config.size / 100)) / watermarkImage.width;
        const ww = watermarkImage.width * scale;
        const wh = watermarkImage.height * scale;
        
        const pos = calculatePosition(ww, wh, padding, config.imagePosition);
        ctx.drawImage(watermarkImage, pos.x, pos.y, ww, wh);
    }

    ctx.restore();
}

function calculatePosition(objW, objH, padding, posCode) {
    let x, y;
    const W = canvas.width;
    const H = canvas.height;

    // H
    if (posCode.includes('L')) x = padding;
    else if (posCode.includes('R')) x = W - objW - padding;
    else x = (W - objW) / 2;

    // V
    if (posCode.includes('T')) y = padding;
    else if (posCode.includes('B')) y = H - objH - padding;
    else y = (H - objH) / 2;

    return {x, y};
}

// --- Download ---
document.getElementById('downloadCurrentBtn').addEventListener('click', () => {
    if (loadedImages.length === 0) return;
    const link = document.createElement('a');
    link.download = `watermarked-${loadedImages[currentImageIndex].name}`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

document.getElementById('downloadAllBtn').addEventListener('click', async () => {
    if (loadedImages.length === 0) return;
    
    // Need JSZip
    if (typeof JSZip === 'undefined') {
        alert("خطأ: مكتبة الضغط غير محملة.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("signed-images");
    
    // Process all images
    // We use a hidden canvas or reuse the main one carefully? 
    // Reusing main canvas is visible to user (will flash). 
    // Better create temp canvas.
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const btn = document.getElementById('downloadAllBtn');
    btn.innerText = "جاري المعالجة...";

    for (let i = 0; i < loadedImages.length; i++) {
        const item = loadedImages[i];
        tempCanvas.width = item.img.width;
        tempCanvas.height = item.img.height;
        
        // Draw base
        tempCtx.drawImage(item.img, 0, 0);
        
        tempCtx.save();
        tempCtx.globalAlpha = config.opacity / 100;
        const padding = Math.min(tempCanvas.width, tempCanvas.height) * 0.05;

        // Draw Text
        if (config.type === 'text' || config.type === 'both') {
            const text = config.text || "Watermark";
            const fontSize = (tempCanvas.width * config.size) / 100; 
            tempCtx.font = `bold ${fontSize}px 'Cairo', sans-serif`;
            tempCtx.textBaseline = 'top';
            tempCtx.textAlign = 'left';
            tempCtx.direction = 'ltr';

            const metrics = tempCtx.measureText(text);
            const ww = metrics.width;
            const wh = fontSize * 1.2;

            const pos = calculateAdvancedPos(tempCanvas.width, tempCanvas.height, ww, wh, padding, config.textPosition);
            
            tempCtx.strokeStyle = config.strokeColor;
            tempCtx.lineWidth = fontSize / 25;
            tempCtx.strokeText(text, pos.x, pos.y);
            tempCtx.fillStyle = config.textColor;
            tempCtx.fillText(text, pos.x, pos.y);
        }

        // Draw Image
        if ((config.type === 'image' || config.type === 'both') && watermarkImage) {
            const scale = (tempCanvas.width * (config.size / 100)) / watermarkImage.width;
            const ww = watermarkImage.width * scale;
            const wh = watermarkImage.height * scale;
            const pos = calculateAdvancedPos(tempCanvas.width, tempCanvas.height, ww, wh, padding, config.imagePosition);
            tempCtx.drawImage(watermarkImage, pos.x, pos.y, ww, wh);
        }
        tempCtx.restore();

        // Add to Zip
        const dataUrl = tempCanvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        folder.file(`signed-${item.name}`, base64, {base64: true});
    }

    // Generate Zip
    const content = await zip.generateAsync({type:"blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "images-bundle.zip";
    link.click();
    
    btn.innerText = "📦 تحميل الكل (ZIP)";
});

function calculateAdvancedPos(W, H, objW, objH, padding, posCode) {
    let x, y;
    if (posCode.includes('L')) x = padding;
    else if (posCode.includes('R')) x = W - objW - padding;
    else x = (W - objW) / 2;

    if (posCode.includes('T')) y = padding;
    else if (posCode.includes('B')) y = H - objH - padding;
    else y = (H - objH) / 2;
    return {x, y};
}
