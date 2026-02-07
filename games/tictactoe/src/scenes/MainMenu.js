export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
        console.log('MainMenu constructor');
    }

    create() {
        console.log('MainMenu create start');
        const { width, height } = this.scale;

        // Procedural Background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a2a6c, 0xb21f1f, 0xfdbb2d, 0x1a2a6c, 1);
        graphics.fillRect(0, 0, width, height);

        // Add some floating shapes for effect
        for(let i=0; i<30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(20, 100);
            const rect = this.add.rectangle(x, y, size, size, 0xffffff, 0.05);
            this.tweens.add({
                targets: rect,
                y: y + Phaser.Math.Between(-100, 100),
                rotation: Phaser.Math.Between(0, 360),
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Layout Container
        const centerX = width / 2;
        const centerY = height / 2;

        // Title
        const title = this.add.text(centerX, centerY - 150, 'Tic-Tac-Toe', {
            fontSize: '96px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 5, offsetY: 5, color: '#000', blur: 10, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // PvP Button
        this.createButton(centerX, centerY + 50, 'Player vs Player', () => {
            this.scene.start('GameScene', { mode: 'pvp' });
        });

        // PvE Button
        this.createButton(centerX, centerY + 180, 'Player vs Computer', () => {
            this.scene.start('GameScene', { mode: 'pve' });
        });
        
        // Footer
        this.add.text(width / 2, height - 30, 'Designed with AI', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: 'rgba(255,255,255,0.5)'
        }).setOrigin(0.5);
        console.log('MainMenu create end');
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        // Gradient Button Background
        const bg = this.add.graphics();
        const width = 400;
        const height = 90;
        
        const drawButton = (color1, color2) => {
            bg.clear();
            bg.fillGradientStyle(color1, color1, color2, color2, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
            bg.lineStyle(4, 0xffffff, 0.8);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
        };

        drawButton(0x4a90e2, 0x003366);

        // Hit Area
        const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                drawButton(0x6aa0e2, 0x205386);
                this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
            })
            .on('pointerout', () => {
                drawButton(0x4a90e2, 0x003366);
                this.tweens.add({ targets: button, scale: 1, duration: 100 });
            })
            .on('pointerdown', () => {
                 this.tweens.add({ targets: button, scale: 0.95, duration: 50 });
            })
            .on('pointerup', () => {
                this.tweens.add({ targets: button, scale: 1.05, duration: 50 });
                callback();
            });

        const label = this.add.text(0, 0, text, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label, hitArea]);
        return button;
    }
}
