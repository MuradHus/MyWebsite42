
// Theme Manager
const ThemeManager = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSettings();
    },

    cacheDOM() {
        this.body = document.body;
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.colorPicker = document.getElementById('accentColorPicker');
    },

    bindEvents() {
        if (this.themeBtns) {
            this.themeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.setTheme(e.currentTarget.dataset.theme));
            });
        }
        
        if (this.colorPicker) {
            this.colorPicker.addEventListener('input', (e) => this.setCustomColor(e.target.value));
        }
    },

    setTheme(themeName) {
        // Remove all theme classes first
        this.body.classList.remove('light-theme', 'dark-theme');
        
        // 'default' is the original Dark/Golden
        if (themeName !== 'default') {
            this.body.classList.add(`${themeName}-theme`);
        }

        // Save to local storage
        localStorage.setItem('siteTheme', themeName);
        
        // Visual feedback for active button
        this.updateActiveButton(themeName);
    },

    setCustomColor(color) {
        if (!color) return;
        
        // Update CSS Variables on document root for maximum scope
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--border-color', color);
        
        // Generate variations (Glow)
        const glowColor = this.hexToRgba(color, 0.5);
        document.documentElement.style.setProperty('--accent-glow', glowColor);
        document.documentElement.style.setProperty('--accent-light', color); 
        
        localStorage.setItem('customAccent', color);
        if (this.colorPicker) this.colorPicker.value = color;
    },

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    loadSettings() {
        const savedTheme = localStorage.getItem('siteTheme') || 'default';
        this.setTheme(savedTheme);

        const savedColor = localStorage.getItem('customAccent');
        if (savedColor) {
            this.setCustomColor(savedColor);
        }
    },

    updateActiveButton(activeTheme) {
        if (!this.themeBtns) return;
        this.themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === activeTheme);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    
    // Load Google Analytics globally
    const gaScript = document.createElement('script');
    gaScript.src = (window.location.pathname.includes('/HTML/')) ? '../js/google-analytics.js' : 'js/google-analytics.js';
    document.head.appendChild(gaScript);
});
