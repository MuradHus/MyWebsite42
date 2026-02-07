// --- Games Background Animation (Neon Blocks) ---
const canvas = document.getElementById('gamesBgCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

class NeonBlock {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 40 + 10;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.color = Math.random() > 0.5 ? '#d800ff' : '#00ffff'; // Purple or Cyan
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
}

const blocks = [];
for (let i = 0; i < 30; i++) {
    blocks.push(new NeonBlock());
}

function animateBg() {
    ctx.clearRect(0, 0, width, height);
    blocks.forEach(block => {
        block.update();
        block.draw();
    });
    requestAnimationFrame(animateBg);
}
animateBg();


// --- Game Engine ---
let currentGame = null;
let gameInterval = null;

const modal = document.getElementById('game-modal');
const container = document.getElementById('game-container');
const statusDiv = document.getElementById('game-status');

function openGame(gameType) {
    currentGame = gameType;
    modal.style.display = 'flex';
    startGame();
}

// Check for deep link on load
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const game = params.get('game');
    if (game) {
        openGame(game);
    }
});

function closeGame() {
    modal.style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
    container.innerHTML = '';
    statusDiv.innerHTML = '';
    currentGame = null;
    // Remove event listeners if needed
    document.onkeydown = null; 
}

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    container.innerHTML = '';
    statusDiv.innerHTML = '';
    document.onkeydown = null;

    if (currentGame === 'xo') initXO();
    else if (currentGame === 'memory') initMemory();
    else if (currentGame === 'snake') initSnake();
    else {
        container.innerHTML = `<h2 style="color:white; text-align:center;">Coming Soon...</h2>`;
    }
}

// --- XO Game ---
let xoBoard = [];
let xoTurn = 'X';
let xoActive = true;

function initXO() {
    // Redirect to the wrapper page containing the iframe
    window.location.href = "xo-game.html";
}

// Old XO functions removed - replaced by Phaser version


// --- Memory Game ---
const memoryIcons = ['🍎','🍌','🍇','🍉','🍒','🍓','🍍','🥝'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function initMemory() {
    // Duplicate and shuffle
    memoryCards = [...memoryIcons, ...memoryIcons].sort(() => 0.5 - Math.random());
    flippedCards = [];
    matchedPairs = 0;
    
    let html = '<div class="memory-board">';
    memoryCards.forEach((icon, index) => {
        html += `<div class="memory-card" id="mem-${index}" onclick="flipCard(${index})">❓</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    statusDiv.innerText = "جد الأزواج المتطابقة!";
}

function flipCard(index) {
    let card = document.getElementById(`mem-${index}`);
    if (card.classList.contains('flipped') || flippedCards.length >= 2) return;
    
    // Flip
    card.classList.add('flipped');
    card.innerText = memoryCards[index];
    flippedCards.push({index, icon: memoryCards[index]});
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;
    if (c1.icon === c2.icon) {
        matchedPairs++;
        if (matchedPairs === memoryIcons.length) {
            statusDiv.innerText = "مبروك! أنهيت اللعبة 🏆";
        }
    } else {
        // Unflip
        document.getElementById(`mem-${c1.index}`).classList.remove('flipped');
        document.getElementById(`mem-${c1.index}`).innerText = '❓';
        document.getElementById(`mem-${c2.index}`).classList.remove('flipped');
        document.getElementById(`mem-${c2.index}`).innerText = '❓';
    }
    flippedCards = [];
}


// --- Snake Game ---
let snake = [];
let food = {};
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let snakeScore = 0;
const gridSize = 20;

function initSnake() {
    container.innerHTML = '<canvas id="snakeCanvas" width="300" height="300"></canvas>';
    const cvs = document.getElementById('snakeCanvas');
    const ctxS = cvs.getContext('2d');
    
    snake = [{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}];
    spawnFood();
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    snakeScore = 0;
    statusDiv.innerText = "Score: 0";
    
    document.onkeydown = (e) => {
        if (e.key === "ArrowUp" && direction !== 'DOWN') nextDirection = 'UP';
        else if (e.key === "ArrowDown" && direction !== 'UP') nextDirection = 'DOWN';
        else if (e.key === "ArrowLeft" && direction !== 'RIGHT') nextDirection = 'LEFT';
        else if (e.key === "ArrowRight" && direction !== 'LEFT') nextDirection = 'RIGHT';
    };
    
    gameInterval = setInterval(() => gameLoopSnake(ctxS), 150); // Speed
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (300/gridSize)),
        y: Math.floor(Math.random() * (300/gridSize))
    };
}

function gameLoopSnake(ctxS) {
    direction = nextDirection;
    
    const head = {x: snake[0].x, y: snake[0].y};
    if (direction === 'UP') head.y--;
    else if (direction === 'DOWN') head.y++;
    else if (direction === 'LEFT') head.x--;
    else if (direction === 'RIGHT') head.x++;
    
    // Check collision (Wall or Self)
    if (head.x < 0 || head.x >= 300/gridSize || head.y < 0 || head.y >= 300/gridSize || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        clearInterval(gameInterval);
        statusDiv.innerText = `Game Over! Score: ${snakeScore}`;
        return;
    }
    
    snake.unshift(head);
    
    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        snakeScore++;
        statusDiv.innerText = `Score: ${snakeScore}`;
        spawnFood();
    } else {
        snake.pop();
    }
    
    // Draw
    ctxS.fillStyle = '#000';
    ctxS.fillRect(0, 0, 300, 300);
    
    // Draw Food
    ctxS.fillStyle = '#ff0000';
    ctxS.fillRect(food.x * gridSize, food.y * gridSize, gridSize-2, gridSize-2);
    
    // Draw Snake
    ctxS.fillStyle = '#00ff00';
    snake.forEach(s => {
        ctxS.fillRect(s.x * gridSize, s.y * gridSize, gridSize-2, gridSize-2);
    });
}
