const canvas = document.getElementById('meshCanvas');
const ctx = canvas.getContext('2d');

// Configure
let balls = [];
const colorInputs = [
    document.getElementById('color1'),
    document.getElementById('color2'),
    document.getElementById('color3'),
    document.getElementById('color4')
];
const blurInput = document.getElementById('blurRange');

// Resize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Ball Class
class Ball {
    constructor(id) {
        this.id = id;
        this.randomize();
    }

    randomize() {
        this.r = Math.random() * 300 + 200; // Large radius
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1; // Slow movement
        this.vy = (Math.random() - 0.5) * 1;
        this.color = colorInputs[this.id].value;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < -this.r) this.vx *= -1;
        if (this.x > canvas.width + this.r) this.vx *= -1;
        if (this.y < -this.r) this.vy *= -1;
        if (this.y > canvas.height + this.r) this.vy *= -1;
        
        // Sync color
        this.color = colorInputs[this.id].value;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Init
function init() {
    balls = [];
    for (let i = 0; i < 4; i++) {
        balls.push(new Ball(i));
    }
    randomizeColors(); // Start random
}

// Animation
function animate() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background first (Dark or Color 1?)
    // Let's us a dark base
    ctx.fillStyle = '#000'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Blur
    const blurVal = blurInput.value;
    ctx.filter = `blur(${blurVal}px)`;

    // Draw Balls
    balls.forEach(ball => {
        ball.update();
        ball.draw(ctx);
    });
    
    // Reset Filter (important if we draw UI on top, but UI is HTML)
    ctx.filter = 'none';

    requestAnimationFrame(animate);
}

// Controls
document.getElementById('randomBtn').addEventListener('click', randomizeColors);

function randomizeColors() {
    const palette = generatePalette();
    colorInputs.forEach((input, i) => {
        input.value = palette[i];
    });
}

function generatePalette() {
    // Simple random
    // Better: Analogous or complementary?
    // Let's do completely random for "Mesh" vibrance
    const p = [];
    for(let i=0; i<4; i++) {
        const r = Math.floor(Math.random()*255);
        const g = Math.floor(Math.random()*255);
        const b = Math.floor(Math.random()*255);
        p.push(rgbToHex(r,g,b));
    }
    return p;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
    // We need to render one high-res frame with filter applied
    const link = document.createElement('a');
    link.download = 'mesh-gradient.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Run
init();
animate();
