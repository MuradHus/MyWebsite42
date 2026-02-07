// Basic error logger to show on screen if things fail
window.onerror = function(msg, url, line, col, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.background = 'rgba(255,0,0,0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.zIndex = '10000';
    errorDiv.style.fontSize = '14px';
    errorDiv.innerHTML = `Error: ${msg}<br>at ${url}:${line}`;
    document.body.appendChild(errorDiv);
};

import { MainMenu } from './scenes/MainMenu.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenu, GameScene]
};

try {
    console.log('Phaser Config initialized');
    const game = new Phaser.Game(config);
    console.log('Phaser Game instance created');
} catch (e) {
    console.error('Failed to start Phaser:', e);
}