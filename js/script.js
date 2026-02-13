// Setup Canvases
const bgCanvas = document.getElementById("backgroundCanvas");
const bgCtx = bgCanvas.getContext("2d");

const cursorCanvas = document.getElementById("cursorCanvas");
const cursorCtx = cursorCanvas.getContext("2d");

let width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  bgCanvas.width = width;
  bgCanvas.height = height;
  cursorCanvas.width = width;
  cursorCanvas.height = height;
}

window.addEventListener("resize", resize);
resize();

// --- Background Animation (Interconnected Numbers/Symbols) ---
const bgParticles = [];
const particleCount = 60; // Adjust for density
const connectionDistance = 150;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
    this.vy = (Math.random() - 0.5) * 0.5;
    this.text = Math.floor(Math.random() * 10).toString(); // Numbers 0-9
    // Add random symbols occasionally
    if (Math.random() > 0.7) {
      const symbols = ["∑", "∏", "∆", "Ω", "∞", "µ", "π", "#", "</>"];
      this.text = symbols[Math.floor(Math.random() * symbols.length)];
    }
    this.size = Math.random() * 10 + 10;
    this.color = "rgba(212, 175, 55, 0.3)"; // Golden, faint
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    bgCtx.font = `${this.size}px monospace`;
    bgCtx.fillStyle = this.color;
    bgCtx.fillText(this.text, this.x, this.y);
  }
}

// Initialize Background Particles
for (let i = 0; i < particleCount; i++) {
  bgParticles.push(new Particle());
}

function animateBackground() {
  bgCtx.clearRect(0, 0, width, height);

  for (let i = 0; i < bgParticles.length; i++) {
    const p1 = bgParticles[i];
    p1.update();
    p1.draw();

    // Connect particles
    for (let j = i + 1; j < bgParticles.length; j++) {
      const p2 = bgParticles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        bgCtx.beginPath();
        bgCtx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - dist / connectionDistance)})`;
        bgCtx.lineWidth = 1;
        bgCtx.moveTo(p1.x, p1.y);
        bgCtx.lineTo(p2.x, p2.y);
        bgCtx.stroke();
      }
    }
  }
  requestAnimationFrame(animateBackground);
}

animateBackground();

// --- Mouse Trail Animation (Falling Phosphorescent Green Letters) ---
const trailParticles = [];
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class TrailParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.text = characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
    this.size = Math.random() * 15 + 10;
    this.speedY = Math.random() * 2 + 1; // Fall speed
    this.life = 1.0; // Opacity/Life
    this.decay = 0.02; // How fast it fades
    this.color = "#39ff14"; // Phosphorescent Green (Neon)
  }

  update() {
    this.y += this.speedY;
    this.life -= this.decay;
  }

  draw() {
    cursorCtx.globalAlpha = this.life;
    cursorCtx.font = `bold ${this.size}px monospace`;
    cursorCtx.fillStyle = this.color;
    cursorCtx.fillText(this.text, this.x, this.y);
    cursorCtx.globalAlpha = 1.0;
  }
}

let mouseX = 0;
let mouseY = 0;
let isMoving = false;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMoving = true;

  // Spawn particles on move
  // Limit spawn rate for performance if needed, but for now every move event spawns one
  trailParticles.push(
    new TrailParticle(
      mouseX + (Math.random() - 0.5) * 20,
      mouseY + (Math.random() - 0.5) * 20,
    ),
  );
});

function animateCursor() {
  cursorCtx.clearRect(0, 0, width, height);

  for (let i = 0; i < trailParticles.length; i++) {
    const p = trailParticles[i];
    p.update();
    p.draw();

    if (p.life <= 0) {
      trailParticles.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(animateCursor);
}

animateCursor();

// Card Click Logic (Placeholder)
// Card Click Logic
// Card Click Logic
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.getAttribute("data-category");
    
    // Determine base path
    const isRoot = !window.location.pathname.toLowerCase().includes('/html/');
    const prefix = isRoot ? 'HTML/' : '';

    if (category === 'photos') {
         window.location.href = prefix + 'photos.html';
    } else if (category === 'tools') {
         window.location.href = prefix + 'tools.html';
    } else if (category === 'games') {
         window.location.href = prefix + 'games.html';
    } else if (category === 'designs') {
         window.location.href = prefix + 'designs.html';
    } else if (category === 'articles') {
         window.location.href = prefix + 'articles.html';
    } else {
         // Logic to navigate to other pages will be added later
         console.log(`Navigating to ${category} section...`);
         alert('قريباً في كوكب مرادو: ' + card.querySelector('h2').innerText);
    }
  });
});


// --- Sidebar Logic ---

// --- Language Management (Advanced) ---

function detectBrowserLanguage() {
    const navLang = navigator.language || navigator.userLanguage || 'en';
    return navLang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function setLanguage(lang) {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove all language classes first
    body.classList.remove('lang-ar', 'lang-en', 'lang-default');
    
    let activeLang = lang;
    
    if (lang === 'default' || lang === 'auto') {
        body.classList.add('lang-default');
        activeLang = detectBrowserLanguage();
    }
    
    body.classList.add('lang-' + activeLang);

    // Performance & SEO: Update HTML attributes
    html.lang = activeLang;
    html.dir = activeLang === 'ar' ? 'rtl' : 'ltr';

    // Update translations
    document.querySelectorAll('.ar-text').forEach(el => {
        el.style.display = activeLang === 'ar' ? '' : 'none';
        el.setAttribute('aria-hidden', activeLang !== 'ar');
    });
    document.querySelectorAll('.en-text').forEach(el => {
        el.style.display = activeLang === 'en' ? '' : 'none';
        el.setAttribute('aria-hidden', activeLang !== 'en');
    });

    // Save preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update UI components
    updateLanguageUI(lang);

    // Trigger updates in other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: activeLang } }));
    
    if (typeof updateTime === 'function') updateTime();
}

function updateLanguageUI(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (btnLang === activeLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Load preference on start
const savedLang = localStorage.getItem('preferredLanguage') || 'auto';
setLanguage(savedLang);

// 2. Lucky Strike Logic
window.generateLuckyMessage = function() {
    // Expanded list with deep links
    
    // Determine base path
    const isRoot = !window.location.pathname.toLowerCase().includes('/html/');
    const prefix = isRoot ? 'HTML/' : '';

    const destinations = [
        // Games
        prefix + 'games.html?game=xo',
        prefix + 'games.html?game=snake',
        prefix + 'games.html?game=memory',
        prefix + 'games.html?game=simon',
        prefix + 'games.html?game=hockey',
        prefix + 'games.html?game=balance',
        
        // Tools
        prefix + 'tools.html?tool=age',
        prefix + 'tools.html?tool=bmi',
        prefix + 'tools.html?tool=stopwatch',
        prefix + 'tools.html?tool=units',
        prefix + 'tools.html?tool=binary',
        prefix + 'tools.html?tool=color',
        prefix + 'tools.html?tool=speed',
        prefix + 'tools.html?tool=bricks',
        prefix + 'tools.html?tool=freefall',

        prefix + 'photos.html', 
        prefix + 'designs.html',
        prefix + 'articles.html',
        prefix + 'articles.html?article=mathematics',
        prefix + 'articles.html?article=science',
        prefix + 'articles.html?article=technology',
        prefix + 'articles.html?article=ai'
    ];
    
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    window.location.href = randomDest;
};

const luckyBtn = document.getElementById('luckyStrikeBtn');
if (luckyBtn) {
    luckyBtn.addEventListener('click', () => window.generateLuckyMessage());
}

// Ensure setLanguage is globally accessible (already is, but just in case)
window.setLanguage = setLanguage;

