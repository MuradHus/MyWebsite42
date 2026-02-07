import { AI } from '../utils/AI.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        console.log('GameScene constructor');
    }

    init(data) {
        this.mode = data.mode || 'pvp'; // 'pvp' or 'pve'
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.currentPlayer = 'X'; // X always starts
        this.gameOver = false;
    }

    preload() {
        console.log('GameScene preload started');
        this.load.image('BG1', 'assets/BG1.png');
        this.load.image('X', 'assets/X.png');
        this.load.image('O', 'assets/O.png');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'BG1');
        // Fit background to cover screen while maintaining aspect ratio, or stretch if preferred by user (user asked to show full background)
        // To show "full background" without cutting, we usually use 'contain' logic, but that leaves black bars.
        // User said "Make grid on right and show full background image". 
        // I will assume they want the image to be fully visible.
        
        // Let's stretch it to fill for now to avoid black bars, as is standard for wallpapers.
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        // Dim the background slightly to make UI pop
        this.add.rectangle(0,0,width,height, 0x000000, 0.4).setOrigin(0);

        // --- Layout ---
        // Left Side: UI (width * 0.35)
        // Right Side: Grid (width * 0.65)

        const rightCenterX = width * 0.70;
        const leftCenterX = width * 0.20;
        
        // Grid Configuration
        // Maximize grid size based on available height
        const margin = 50;
        const maxGridHeight = height - (margin * 2);
        this.cellSize = maxGridHeight / 3;
        this.gridSize = this.cellSize * 3;
        
        this.startX = rightCenterX - (this.gridSize / 2);
        this.startY = (height - this.gridSize) / 2;

        // Draw Grid Lines
        const graphics = this.add.graphics();
        graphics.lineStyle(8, 0xffffff, 1); // Thicker lines

        // Vertical lines
        graphics.moveTo(this.startX + this.cellSize, this.startY);
        graphics.lineTo(this.startX + this.cellSize, this.startY + this.gridSize);
        graphics.moveTo(this.startX + this.cellSize * 2, this.startY);
        graphics.lineTo(this.startX + this.cellSize * 2, this.startY + this.gridSize);

        // Horizontal lines
        graphics.moveTo(this.startX, this.startY + this.cellSize);
        graphics.lineTo(this.startX + this.gridSize, this.startY + this.cellSize);
        graphics.moveTo(this.startX, this.startY + this.cellSize * 2);
        graphics.lineTo(this.startX + this.gridSize, this.startY + this.cellSize * 2);

        graphics.strokePath();

         // Shadow for Grid
         // Re-draw grid with shadow offset
         const shadowGraphics = this.add.graphics();
         shadowGraphics.lineStyle(8, 0x000000, 0.5);
         shadowGraphics.moveTo(this.startX + this.cellSize + 5, this.startY + 5);
         shadowGraphics.lineTo(this.startX + this.cellSize + 5, this.startY + this.gridSize + 5);
         shadowGraphics.moveTo(this.startX + this.cellSize * 2 + 5, this.startY + 5);
         shadowGraphics.lineTo(this.startX + this.cellSize * 2 + 5, this.startY + this.gridSize + 5);
         shadowGraphics.moveTo(this.startX + 5, this.startY + this.cellSize + 5);
         shadowGraphics.lineTo(this.startX + this.gridSize + 5, this.startY + this.cellSize + 5);
         shadowGraphics.moveTo(this.startX + 5, this.startY + this.cellSize * 2 + 5);
         shadowGraphics.lineTo(this.startX + this.gridSize + 5, this.startY + this.cellSize * 2 + 5);
         shadowGraphics.strokePath();
         
         // Move shadow behind
         shadowGraphics.depth = 1;
         graphics.depth = 2;


        // Interactive Zones
        this.cells = [];
        for (let row = 0; row < 3; row++) {
            this.cells[row] = [];
            for (let col = 0; col < 3; col++) {
                const x = this.startX + col * this.cellSize;
                const y = this.startY + row * this.cellSize;

                const zone = this.add.rectangle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize, this.cellSize, 0xffffff, 0.01) // Slight visible tint for debug/hover
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => zone.setFillStyle(0xffffff, 0.1))
                    .on('pointerout', () => zone.setFillStyle(0xffffff, 0.01))
                    .on('pointerdown', () => this.handleInput(row, col));
                
                this.cells[row][col] = { zone, symbol: null };
            }
        }

        // --- UI Panel (Left Side) ---
        
        // Panel Configuration
        const panelWidth = 350;
        const panelHeight = 500;
        const panelX = 100; // Fixed left margin
        const panelY = (height - panelHeight) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.7); // Darker opacity
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        panel.lineStyle(4, 0x4a90e2, 0.8); // Blue stroke
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        panel.setDepth(5); // Ensure visibility

        const panelCenterX = panelX + panelWidth / 2;

        // Status Text
        this.statusText = this.add.text(panelCenterX, panelY + 80, `Turn:\nPlayer ${this.currentPlayer}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffcc00',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, stroke: true, fill: true },
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5).setDepth(6);

        // Mode Indicator
        this.add.text(panelCenterX, panelY + 30, this.mode === 'pvp' ? 'PvP Mode' : 'PvE Mode', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(6);

        // Buttons
        // Fixed positions relative to panel
        this.createProfessionalButton(panelCenterX, panelY + panelHeight - 140, 'Main Menu', () => this.scene.start('MainMenu'), 0xcc3333, 250, 60).setDepth(6);
        this.createProfessionalButton(panelCenterX, panelY + panelHeight - 60, 'Restart Game', () => this.scene.restart({ mode: this.mode }), 0x33cc33, 250, 60).setDepth(6);
    }

    handleInput(row, col) {
        if (this.gameOver || this.board[row][col] !== '') return;

        // Player Move
        this.makeMove(row, col, this.currentPlayer);

        if (this.gameOver) return;

        // Switch Turn
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();

        // AI Turn
        if (this.mode === 'pve' && this.currentPlayer === 'O' && !this.gameOver) {
            // Add a small delay for realism
            this.time.delayedCall(600, () => {
                const move = AI.bestMove(this.board);
                if (move) {
                    this.makeMove(move.i, move.j, 'O');
                    if (!this.gameOver) {
                        this.currentPlayer = 'X';
                        this.updateStatus();
                    }
                }
            });
        }
    }

    updateStatus() {
         const playerText = this.currentPlayer === 'X' ? 'Player X' : (this.mode === 'pve' ? 'Computer' : 'Player O');
         this.statusText.setText(`Turn:\n${playerText}`);
         this.statusText.setColor(this.currentPlayer === 'X' ? '#44aaff' : '#ff4444');
         
         this.tweens.add({
             targets: this.statusText,
             scale: 1.1,
             duration: 100,
             yoyo: true,
             ease: 'Sine.easeInOut'
         });
    }

    makeMove(row, col, symbol) {
        this.board[row][col] = symbol;
        
        // Visual
        const x = this.startX + col * this.cellSize + this.cellSize / 2;
        const y = this.startY + row * this.cellSize + this.cellSize / 2;
        const img = this.add.image(x, y, symbol);
        img.setDepth(10); // Ensure on top of grid lines
        
        // Scale to fit 70% of cell size
        const targetSize = this.cellSize * 0.7;
        const scale = targetSize / Math.max(img.width, img.height);
        
        img.setScale(0); // Animation start
        
        // Pop sound effect (simulated with tween)
        this.tweens.add({
            targets: img,
            scale: scale, 
            angle: Phaser.Math.Between(-20, 20),
            duration: 400,
            ease: 'Back.out'
        });

        this.cells[row][col].symbol = img;

        // Check Win
        const result = AI.checkWinner(this.board);
        if (result) {
            this.gameOver = true;
            this.endGame(result.winner, result.line);
        }
    }

    endGame(winner, line) {
        let message = '';
        let color = '#ffffff';
        if (winner === 'tie') {
            message = "Draw!";
            color = '#cccccc';
        } else {
            message = `${winner === 'X' ? 'Player X' : (this.mode === 'pve' ? 'Computer' : 'Player O')}\nWins!`;
            color = winner === 'X' ? '#44aaff' : '#ff4444';
            
            // Draw Winning Line
            if (line) {
                this.drawWinningLine(line, '#DDA0DD'); // Light Purple (Plum/Violet)
            }
        }
        
        this.statusText.setText(message);
        this.statusText.setColor(color);
        this.statusText.setFontSize('42px');
    }

    drawWinningLine(line, colorStr) {
        const graphics = this.add.graphics();
        const color = Phaser.Display.Color.HexStringToColor(colorStr).color;
        graphics.setDepth(100);

        // Highlight Winning Cells
        const highlightGraphics = this.add.graphics();
        highlightGraphics.fillStyle(color, 0.3); // Semi-transparent highlight
        highlightGraphics.setDepth(5); // Below symbols but above grid background

        line.forEach(cell => {
            const x = this.startX + cell.c * this.cellSize;
            const y = this.startY + cell.r * this.cellSize;
            
            // Draw highlight rect with padding
            highlightGraphics.fillRoundedRect(x + 10, y + 10, this.cellSize - 20, this.cellSize - 20, 15);
            
            // Pulse animation for highlight
            this.tweens.add({
                targets: highlightGraphics,
                alpha: 0.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        });

        const startCell = line[0];
        const endCell = line[2];
        
        const x1 = this.startX + startCell.c * this.cellSize + this.cellSize / 2;
        const y1 = this.startY + startCell.r * this.cellSize + this.cellSize / 2;
        const x2 = this.startX + endCell.c * this.cellSize + this.cellSize / 2;
        const y2 = this.startY + endCell.r * this.cellSize + this.cellSize / 2;

        // Line Glow
        graphics.lineStyle(20, color, 0.4);
        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
        
        // Core Line
        graphics.lineStyle(8, color, 1); 
        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
        
        graphics.strokePath();

         // Particles
         if (!this.textures.exists('flare')) {
             const g = this.make.graphics({x:0, y:0, add: false});
             g.fillStyle(0xffffff, 1);
             g.fillCircle(8, 8, 8);
             g.generateTexture('flare', 16, 16);
        }

        const particles = this.add.particles(0, 0, 'flare', {
            speed: { min: -50, max: 50 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            tint: color,
            quantity: 15
        });
        
        particles.setDepth(101);

        const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const points = Math.floor(distance / 15); 
        for(let i=0; i<=points; i++) {
             const t = i/points;
             const px = Phaser.Math.Linear(x1, x2, t);
             const py = Phaser.Math.Linear(y1, y2, t);
             particles.emitParticleAt(px, py);
        }
    }

    createProfessionalButton(x, y, text, callback, baseColor, w = 250, h = 60) {
        const button = this.add.container(x, y);
        const width = w;
        const height = h;

        const bg = this.add.graphics();
        
        const draw = (color) => {
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
            bg.lineStyle(2, 0xffffff, 0.8);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
        };

        draw(baseColor);

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                 bg.clear();
                 bg.fillStyle(baseColor, 0.8); // Lighter
                 bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
                 bg.lineStyle(2, 0xffffff, 1);
                 bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
                 this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
            })
            .on('pointerout', () => {
                draw(baseColor);
                this.tweens.add({ targets: button, scale: 1, duration: 100 });
            })
            .on('pointerdown', () => {
                 this.tweens.add({ targets: button, scale: 0.95, duration: 50 });
            })
            .on('pointerup', () => {
                this.tweens.add({ targets: button, scale: 1.05, duration: 50 });
                callback();
            });

        button.add([bg, label, hitArea]);
        return button;
    }
}
