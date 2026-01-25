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
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.getAttribute("data-category");
    
    if (category === 'photos') {
         window.location.href = 'photos.html';
    } else if (category === 'tools') {
         window.location.href = 'tools.html';
    } else if (category === 'games') {
         window.location.href = 'games.html';
    } else if (category === 'designs') {
         window.location.href = 'designs.html';
    } else if (category === 'articles') {
         window.location.href = 'articles.html';
    } else {
         // Logic to navigate to other pages will be added later
         console.log(`Navigating to ${category} section...`);
         alert('قريباً: ' + card.querySelector('h2').innerText);
    }
  });
});


// --- Sidebar Logic ---

// 1. Language Toggle
function setLanguage(lang) {
    document.body.classList.remove('lang-ar', 'lang-en');
    
    if (lang === 'ar') {
        document.body.classList.add('lang-ar');
    } else if (lang === 'en') {
        document.body.classList.add('lang-en');
    }
    
    // Optional: Save preference
    localStorage.setItem('preferredLanguage', lang);
}

// Load preference on start
const savedLang = localStorage.getItem('preferredLanguage');
if (savedLang) {
    setLanguage(savedLang);
}

// 2. Lucky Strike Logic
const luckyBtn = document.getElementById('luckyStrikeBtn');
if (luckyBtn) {
    luckyBtn.addEventListener('click', () => {
        // Expanded list with deep links
        const destinations = [
            // Games
            'games.html?game=xo',
            'games.html?game=snake',
            'games.html?game=memory',
            'games.html?game=simon',
            'games.html?game=hockey',
            'games.html?game=balance',
            
            // Tools
            'tools.html?tool=age',
            'tools.html?tool=bmi',
            'tools.html?tool=stopwatch',
            'tools.html?tool=units',
            'tools.html?tool=binary',
            'tools.html?tool=color',
            'tools.html?tool=speed',
            'tools.html?tool=bricks',
            'tools.html?tool=freefall',

            // Photos Categories (Photos page handles categories?) 
            // Photos page structure suggests filtering by category but it's not fully clear if it supports URL param.
            // Let's assume standard page load for now or add a param if possible.
            // Looking at photos.html, it doesn't seem to have deep linking logic yet.
            // We will just link to the main page or specific hash if applicable.
            'photos.html', 
            
            // Designs
            'designs.html',

            // Articles
            'articles.html',
            'articles.html?article=mathematics',
            'articles.html?article=science',
            'articles.html?article=technology',
            'articles.html?article=ai'
        ];
        
        const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
        window.location.href = randomDest;
    });
}

