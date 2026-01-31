
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
        
        if (themeName !== 'default') {
            this.body.classList.add(`${themeName}-theme`);
        }

        // Update Theme Icon in Sidebar
        this.updateThemeIcon(themeName);

        // Save to local storage
        localStorage.setItem('siteTheme', themeName);
        
        // Visual feedback for active button
        this.updateActiveButton(themeName);
    },

    updateThemeIcon(themeName) {
        const iconContainer = document.querySelector('.sidebar-toggle-btn[data-tooltip-text*="Theme"] i, .sidebar-toggle-btn[data-tooltip-text*="المظهر"] i');
        if (!iconContainer) return;

        // Reset class
        iconContainer.className = 'fa-solid';

        switch(themeName) {
            case 'light': iconContainer.classList.add('fa-sun'); break;
            case 'dark': iconContainer.classList.add('fa-star'); break;
            default: iconContainer.classList.add('fa-palette'); break;
        }
    },

    setCustomColor(color) {
        // Update CSS Variables
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--border-color', color);
        
        // Calculate lighter/glow variants (simplified)
        // Ideally we'd use color manipulation lib, but for now strict set
        document.documentElement.style.setProperty('--accent-light', color); 
        document.documentElement.style.setProperty('--accent-glow', `${color}80`); // 50% opacity hex
        
        localStorage.setItem('customAccent', color);
    },

    loadSettings() {
        const savedTheme = localStorage.getItem('siteTheme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }

        const savedColor = localStorage.getItem('customAccent');
        if (savedColor) {
            this.setCustomColor(savedColor);
            if (this.colorPicker) this.colorPicker.value = savedColor;
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
});
