// Segments Map
const DIGIT_MAP = {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'd', 'e', 'g'],
    3: ['a', 'b', 'c', 'd', 'g'],
    4: ['b', 'c', 'f', 'g'],
    5: ['a', 'c', 'd', 'f', 'g'],
    6: ['a', 'c', 'd', 'e', 'f', 'g'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g']
};
const SEG_CLASSES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Debris System
const debrisLayer = document.getElementById('debrisLayer');
const debrisList = [];
const GRAVITY = 0.4;

function initClock() {
    // Generate Segments
    const ids = ['hour-1', 'hour-2', 'min-1', 'min-2', 'sec-1', 'sec-2'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        SEG_CLASSES.forEach(seg => {
            const div = document.createElement('div');
            div.className = `segment ${seg}`;
            if (['a', 'g', 'd'].includes(seg)) div.classList.add('h');
            else div.classList.add('v');
            el.appendChild(div);
        });
    });

    // Start Loops
    setInterval(updateTime, 1000);
    requestAnimationFrame(updatePhysics);
    updateTime(); // now
}

const prevActive = {}; // State tracking

function updateTime() {
    const now = new Date();
    
    // Date (Gold Dust Style Text)
    const dateEl = document.getElementById('dateContainer');
    if (dateEl) {
        const currentLang = document.documentElement.lang || 'ar';
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.innerText = now.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', options);
    }

    // Time Digits
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');

    updateDigit('hour-2', h[0]);
    updateDigit('hour-1', h[1]);
    updateDigit('min-2', m[0]);
    updateDigit('min-1', m[1]);
    updateDigit('sec-2', s[0]);
    updateDigit('sec-1', s[1]);
}

function updateDigit(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const activeSegs = new Set(DIGIT_MAP[val]);
    const prevSegs = prevActive[id] || new Set();
    
    Array.from(el.children).forEach(segDiv => {
        const segType = segDiv.classList[1]; // a, b, c...
        const isOn = activeSegs.has(segType);
        const wasOn = prevSegs.has(segType);
        
        if (isOn) {
            segDiv.classList.add('on');
        } else {
            segDiv.classList.remove('on');
            // Falling Logic: If was ON and now OFF -> Drop
            if (wasOn) {
                // spawnDebris(segDiv); // Disabled as requested
            }
        }
    });
    
    prevActive[id] = activeSegs;
}

function spawnDebris(sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'debris';
    d.style.left = rect.left + 'px';
    d.style.top = rect.top + 'px';
    d.style.width = rect.width + 'px';
    d.style.height = rect.height + 'px';
    
    debrisLayer.appendChild(d);
    
    debrisList.push({
        el: d,
        x: rect.left,
        y: rect.top,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() * -2), // Slight pop up
        rot: 0,
        vRot: (Math.random() - 0.5) * 10,
        life: 100 // frames
    });
}

function updatePhysics() {
    for (let i = debrisList.length - 1; i >= 0; i--) {
        const p = debrisList[i];
        p.life--;
        
        // Physics
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        
        // Render
        p.el.style.transform = `translate(${p.x - parseFloat(p.el.style.left)}px, ${p.y - parseFloat(p.el.style.top)}px) rotate(${p.rot}deg)`;
        
        // Fade out
        if (p.life < 20) {
            p.el.style.opacity = p.life / 20;
        }
        
        // Remove
        if (p.life <= 0 || p.y > window.innerHeight) {
            if(p.el.parentNode) p.el.parentNode.removeChild(p.el);
            debrisList.splice(i, 1);
        }
    }
    requestAnimationFrame(updatePhysics);
}

// Run
document.addEventListener('DOMContentLoaded', initClock);

// --- Page Visibility API: Clear debris when returning to tab ---
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Tab became visible again - clear all falling debris
        // Remove all debris elements from DOM
        while (debrisLayer.firstChild) {
            debrisLayer.removeChild(debrisLayer.firstChild);
        }
        // Clear debris array
        debrisList.length = 0;
    }
});
