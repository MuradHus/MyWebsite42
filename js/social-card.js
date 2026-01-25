const state = {
    name: "الاسم الكريم",
    job: "مصمم جرافيك",
    bio: "مدون وصانع محتوى في مجال التقنية.",
    avatar: null, // Image Object
    links: [
        { platform: 'twitter', user: '@username' },
        { platform: 'linkedin', user: 'My Profile' }
    ],
    bg: 'linear-gradient(45deg, #121212, #2a2a2a)'
};

const platforms = [
    { id: 'web', icon: '🌐', label: 'موقع' },
    { id: 'twitter', icon: '🐦', label: 'تويتر' },
    { id: 'instagram', icon: '📸', label: 'انستقرام' },
    { id: 'linkedin', icon: '💼', label: 'لينكد إن' },
    { id: 'email', icon: '📧', label: 'إيميل' },
    { id: 'phone', icon: '📞', label: 'هاتف' }
];

// Elements
const els = {
    inputName: document.getElementById('inputName'),
    inputJob: document.getElementById('inputJob'),
    inputBio: document.getElementById('inputBio'),
    avatarInput: document.getElementById('avatarInput'),
    avatarPreview: document.getElementById('avatarPreview'),
    linksContainer: document.getElementById('linksContainer'),
    addLinkBtn: document.getElementById('addLinkBtn'),
    
    // Card
    cardName: document.getElementById('cardName'),
    cardJob: document.getElementById('cardJob'),
    cardBio: document.getElementById('cardBio'),
    cardAvatar: document.getElementById('cardAvatar'),
    cardLinks: document.getElementById('cardLinks'),
    cardBg: document.querySelector('.card-bg'),
    
    download: document.getElementById('downloadBtn')
};

// --- Init ---
function init() {
    renderLinksEditor();
    updatePreview();
    
    // Listeners
    els.inputName.addEventListener('input', (e) => { state.name = e.target.value; updatePreview(); });
    els.inputJob.addEventListener('input', (e) => { state.job = e.target.value; updatePreview(); });
    els.inputBio.addEventListener('input', (e) => { state.bio = e.target.value; updatePreview(); });
    
    els.avatarInput.addEventListener('change', handleAvatarUpload);
    els.addLinkBtn.addEventListener('click', addLink);
    els.download.addEventListener('click', downloadCard);

    // Themes
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
             document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             state.bg = btn.dataset.bg;
             updatePreview();
        });
    });
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                state.avatar = img;
                els.avatarPreview.src = img.src;
                els.cardAvatar.src = img.src;
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function updatePreview() {
    els.cardName.innerText = state.name;
    els.cardJob.innerText = state.job;
    els.cardBio.innerText = state.bio;
    els.cardBg.style.background = state.bg;
    
    // Render Links in Card
    els.cardLinks.innerHTML = '';
    state.links.forEach(link => {
        const plat = platforms.find(p => p.id === link.platform) || platforms[0];
        const pill = document.createElement('div');
        pill.className = 'social-pill';
        pill.innerHTML = `
            <span>${plat.icon}</span>
            <div style="flex:1; text-align:right;">${link.user}</div>
        `;
        els.cardLinks.appendChild(pill);
    });
}

// --- Links Editor Logic ---
function renderLinksEditor() {
    els.linksContainer.innerHTML = '';
    state.links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        
        // Platform Select
        const select = document.createElement('select');
        select.className = 'link-icon-select';
        platforms.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.innerText = p.icon;
            if (p.id === link.platform) opt.selected = true;
            select.appendChild(opt);
        });
        select.onchange = (e) => { state.links[index].platform = e.target.value; updatePreview(); };

        // Username Input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = link.user;
        input.placeholder = 'اسم المستخدم / الرابط';
        input.oninput = (e) => { state.links[index].user = e.target.value; updatePreview(); };

        // Delete Btn
        const del = document.createElement('button');
        del.className = 'btn-remove';
        del.innerText = '×';
        del.onclick = () => {
            state.links.splice(index, 1);
            renderLinksEditor();
            updatePreview();
        };

        div.appendChild(select);
        div.appendChild(input);
        div.appendChild(del);
        els.linksContainer.appendChild(div);
    });
}

function addLink() {
    state.links.push({ platform: 'web', user: '' });
    renderLinksEditor();
    updatePreview();
}

// --- Export Logic ---
function downloadCard() {
    const canvas = document.getElementById('exportCanvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensions (Vertical Card)
    const W = 600;
    const H = 900; 
    canvas.width = W;
    canvas.height = H;
    
    // Draw BG
    // Note: Canvas gradients need explicit definition
    // We try to parse the linear-gradient string roughly, or default
    // Simplified: Just use a standard gradient based on selection index or parse color
    // For specific gradients, easier to create multiple gradient factories.
    // Hack: Create a temporary visual element or simple approximation.
    // Let's create a generic gradient generator.
    
    const grad = ctx.createLinearGradient(0, 0, W, H);
    if (state.bg.includes('#FF512F')) { grad.addColorStop(0, '#FF512F'); grad.addColorStop(1, '#DD2476'); }
    else if (state.bg.includes('#667eea')) { grad.addColorStop(0, '#667eea'); grad.addColorStop(1, '#764ba2'); }
    else if (state.bg.includes('#11998e')) { grad.addColorStop(0, '#11998e'); grad.addColorStop(1, '#38ef7d'); }
    else if (state.bg.includes('#000000')) { grad.addColorStop(0, '#000000'); grad.addColorStop(1, '#434343'); }
    else { grad.addColorStop(0, '#121212'); grad.addColorStop(1, '#2a2a2a'); }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Glass Card Overlay
    const cardX = 50;
    const cardY = 100;
    const cardW = W - 100;
    const cardH = H - 200;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    // Stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    // Round Rect
    roundRect(ctx, cardX, cardY, cardW, cardH, 40, true, true);
    
    // Avatar
    const avS = 150;
    const avX = W/2 - avS/2;
    const avY = cardY + 50;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(W/2, avY + avS/2, avS/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    
    if (state.avatar) {
        // Draw image cover
        // Simple draw
        ctx.drawImage(state.avatar, avX, avY, avS, avS);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(avX, avY, avS, avS);
    }
    ctx.restore();
    
    // Border for avatar
    ctx.beginPath();
    ctx.arc(W/2, avY + avS/2, avS/2, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Text
    ctx.textAlign = 'center';
    
    // Name
    ctx.font = 'bold 40px "Cairo", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.name, W/2, avY + avS + 60);
    
    // Job
    ctx.font = '600 24px "Cairo", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(state.job, W/2, avY + avS + 100);
    
    // Bio
    ctx.font = '20px "Cairo", sans-serif';
    ctx.fillStyle = '#cccccc';
    // Wrap text for Bio? Simple version: draw 1 line
    ctx.fillText(state.bio, W/2, avY + avS + 140);
    
    // Links pills
    let linkY = avY + avS + 190;
    state.links.forEach(link => {
        const plat = platforms.find(p => p.id === link.platform) || platforms[0];
        
        // Pill BG
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        roundRect(ctx, cardX + 30, linkY, cardW - 60, 50, 25, true, true);
        
        // Icon
        ctx.font = '24px serif'; // Emoji font
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(plat.icon, cardX + cardW - 50, linkY + 33);
        
        // Text
        ctx.font = '20px "Cairo", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(link.user, cardX + cardW - 90, linkY + 32);
        
        linkY += 65;
    });
    
    // Finish Download
    const link = document.createElement('a');
    link.download = `card-${state.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

// Run
init();
