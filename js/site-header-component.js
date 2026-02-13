// ============================================
// Web Component: Site Header Navigation
// ============================================
// Eliminates navigation duplication across all pages
// Usage: <site-header type="main"></site-header>
//        <site-header type="sub" back-url="../index.html"></site-header>

class SiteHeader extends HTMLElement {
    constructor() {
        super();
        // لا نستخدم Shadow DOM - نضع المحتوى مباشرة في DOM
    }

    connectedCallback() {
        const pageType = this.getAttribute('type') || 'main';
        const backUrl = this.getAttribute('back-url') || '../index.html';
        
        this.render(pageType, backUrl);
        this.setupListeners();
    }

    render(pageType, backUrl) {
        const navHTML = pageType === 'main' 
            ? this.renderMainNav() 
            : this.renderSubNav(backUrl);

        const pillMenuHTML = this.renderPillMenu();

        this.innerHTML = navHTML + pillMenuHTML;
    }

    renderMainNav() {
        return `
            <style>
                @keyframes gear-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(180deg); }
                }
                .settings-gear {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(212, 175, 55, 0.3) !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(5px);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                }
                .settings-gear:hover {
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.6) !important;
                    border-color: #d4af37 !important;
                    transform: scale(1.1);
                }
                .settings-gear:hover i {
                    animation: gear-rotate 0.8s ease-in-out;
                }
                .settings-gear:active {
                    transform: scale(0.95);
                }
            </style>
            <div class="nav-controls fixed-nav" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: calc(100% - 40px) !important; pointer-events: auto !important; padding: 10px 20px; box-sizing: border-box;">
                <div style="flex: 1;"></div>
                <div class="nav-left-group" style="display: flex !important; align-items: center !important; gap: 15px !important; pointer-events: auto !important;">
                    <div id="dateContainer" class="date-container" style="color: white; font-size: 14px; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
                    <button id="settingsToggle" class="settings-gear" aria-label="Settings" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">
                        <i class="fa-solid fa-gear" style="color: white;"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderSubNav(backUrl) {
        return `
            <div class="nav-controls fixed-nav" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: calc(100% - 40px) !important; pointer-events: auto !important; padding: 10px 20px; box-sizing: border-box;">
                <a href="${backUrl}" class="back-btn" style="margin-right: auto; color: white; text-decoration: none; font-weight: 500; background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 20px; border: 1px solid rgba(212,175,55,0.3); backdrop-filter: blur(5px); transition: all 0.3s;">🔙 قسم</a>
                <button id="settingsToggle" class="settings-gear" aria-label="Settings" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">
                    <i class="fa-solid fa-gear" style="color: white;"></i>
                </button>
            </div>
        `;
    }

    renderPillMenu() {
        return `
            <style>
                .settings-pill-container {
                    position: fixed;
                    z-index: 10000 !important;
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    background: rgba(10, 10, 15, 0.85);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-radius: 30px;
                    padding: 15px 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    min-width: 60px;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                .settings-pill-container.active {
                    display: flex;
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                .main-track {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                }
                .pill-item {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .pill-item:hover {
                    background: rgba(212, 175, 55, 0.15);
                    border-color: #d4af37;
                    color: #fff;
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
                    transform: scale(1.05);
                }
                .pill-item.active {
                    background: #d4af37;
                    color: #000;
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
                    border-color: #fff;
                }
                .sub-menus-layer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 0;
                    height: 0;
                }
                .sub-pill {
                    position: absolute;
                    left: calc(100% + 20px);
                    top: 0;
                    display: none;
                    flex-direction: row; /* تنسيق أفقي */
                    align-items: center;
                    gap: 12px;
                    background: rgba(10, 10, 15, 0.9);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(212, 175, 55, 0.4);
                    border-radius: 50px; /* شكل بيضاوي للمظهر الأفقي */
                    padding: 8px 15px;
                    min-width: max-content;
                    z-index: 10001;
                    box-shadow: 15px 15px 40px rgba(0,0,0,0.7), 0 0 20px rgba(212, 175, 55, 0.2);
                    
                    /* حركة المسح التدريجي */
                    clip-path: inset(0 100% 0 0);
                    transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
                    opacity: 0;
                }
                .sub-pill.active {
                    display: flex;
                    opacity: 1;
                    clip-path: inset(0 0 0 0);
                }
                .sub-item {
                    width: 42px;
                    height: 42px;
                    padding: 0;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    color: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .sub-item:hover {
                    background: #d4af37;
                    color: #000;
                    transform: scale(1.15) rotate(5deg);
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
                    border-color: #fff;
                }
                /* استثناء لقائمة اللغات لإظهار النص */
                #langSub .sub-item {
                    width: auto;
                    height: 38px;
                    padding: 0 15px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .color-wrapper {
                    width: 42px !important;
                    height: 42px !important;
                    padding: 4px !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .color-wrapper input {
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    border: none;
                    border-radius: 50%;
                    background: none;
                }
                .social-pill {
                    flex-direction: row !important;
                    flex-wrap: wrap;
                    min-width: 180px;
                    justify-content: center;
                }
                .social-pill .sub-item {
                    flex: 0 0 45px;
                    height: 45px;
                    padding: 0;
                    border-radius: 50%;
                }
            </style>
            <div id="settingsPillContainer" class="settings-pill-container">
                <!-- Main Vertical Track -->
                <div class="main-track">
                    <!-- Items -->
                    <button class="pill-item" data-target="langSub" data-tooltip="Language">
                        <i class="fa-solid fa-earth-americas"></i>
                    </button>
                    <button class="pill-item" data-target="themeSub" data-tooltip="Theme">
                        <i class="fa-solid fa-palette"></i>
                    </button>
                    <button class="pill-item" data-target="toolsSub" data-tooltip="Tools">
                        <i class="fa-solid fa-toolbox"></i>
                    </button>
                    <button class="pill-item" data-target="contactSub" data-tooltip="Contact">
                        <i class="fa-solid fa-address-book"></i>
                    </button>
                </div>

                <!-- Sub Menus (Pop out to right) -->
                <div class="sub-menus-layer">
                    <!-- Language Sub -->
                    <div id="langSub" class="sub-pill">
                        <button class="sub-item" onclick="setLanguage('ar')">العربية</button>
                        <button class="sub-item" onclick="setLanguage('en')">English</button>
                        <button class="sub-item" onclick="setLanguage('default')">Auto</button>
                    </div>

                    <!-- Theme Sub -->
                    <div id="themeSub" class="sub-pill">
                        <button class="sub-item theme-btn" data-theme="default" title="افتراضي">
                            <i class="fa-solid fa-moon"></i>
                        </button>
                        <button class="sub-item theme-btn" data-theme="light" title="نهاري">
                            <i class="fa-solid fa-sun"></i>
                        </button>
                        <button class="sub-item theme-btn" data-theme="dark" title="محيط">
                            <i class="fa-solid fa-cloud-moon"></i>
                        </button>
                        <div class="sub-item color-wrapper">
                            <input type="color" id="accentColorPicker" value="#d4af37">
                        </div>
                    </div>

                    <!-- Tools Sub -->
                    <div id="toolsSub" class="sub-pill">
                        <button id="luckyStrikeBtn" class="sub-item lucky-btn-sub">
                            <i class="fa-solid fa-dice"></i>
                        </button>
                    </div>

                    <!-- Contact Sub -->
                    <div id="contactSub" class="sub-pill social-pill">
                        <a href="#" class="sub-item"><i class="fa-brands fa-telegram"></i></a>
                        <a href="#" class="sub-item"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="#" class="sub-item"><i class="fa-brands fa-facebook"></i></a>
                        <a href="#" class="sub-item"><i class="fa-brands fa-snapchat"></i></a>
                        <a href="#" class="sub-item"><i class="fa-brands fa-tiktok"></i></a>
                    </div>
                </div>
            </div>
        `;
    }

    setupListeners() {
        // تأخير صغير للسماح بـ render كامل
        setTimeout(() => {
            this.initDateDisplay();
            this.initPillMenu();
        }, 0);
    }

    initDateDisplay() {
        const dateContainer = this.querySelector('#dateContainer');
        if (dateContainer) {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            const today = new Date().toLocaleDateString('ar-SA', options);
            dateContainer.textContent = today;
        }
    }

    initPillMenu() {
        const pillContainer = this.querySelector('#settingsPillContainer');
        const toggleBtn = this.querySelector('#settingsToggle');
        
        if (!pillContainer || !toggleBtn) return;

        // فتح/إغلاق قائمة الإعدادات
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = pillContainer.classList.contains('active');
            isActive ? this.closeAllPills(pillContainer) : this.openMainPill(toggleBtn, pillContainer);
        });

        // معالجة النقرات على عناصر القائمة الرئيسية
        this.querySelectorAll('.pill-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePillItemClick(item, index, pillContainer);
            });
        });

        // إغلاق عند النقر خارج القائمة
        document.addEventListener('click', (e) => {
            if (pillContainer.classList.contains('active') && 
                !pillContainer.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                this.closeAllPills(pillContainer);
            }
        });

        // معالجة المواضيع والألوان
        this.initThemeHandlers(pillContainer);
    }

    openMainPill(toggleBtn, pillContainer) {
        const btnRect = toggleBtn.getBoundingClientRect();
        const topPos = btnRect.bottom + 10;
        const leftPos = btnRect.left - 25;

        pillContainer.style.top = topPos + 'px';
        pillContainer.style.left = Math.max(10, leftPos) + 'px';
        pillContainer.style.right = 'auto';
        pillContainer.classList.add('active');
        console.log('Pill opened at:', topPos, Math.max(10, leftPos));
    }

    closeAllPills(pillContainer) {
        pillContainer.classList.remove('active');
        this.querySelectorAll('.sub-pill').forEach(s => s.classList.remove('active'));
        this.querySelectorAll('.pill-item').forEach(i => i.classList.remove('active'));
    }

    handlePillItemClick(item, index, pillContainer) {
        const wasActive = item.classList.contains('active');
        this.querySelectorAll('.pill-item').forEach(i => i.classList.remove('active'));
        
        // إغلاق أي قائمة فرعية مفتوحة مسبقاً
        this.querySelectorAll('.sub-pill').forEach(s => {
            s.classList.remove('active');
            // تأخير بسيط لإخفاء العنصر من الـ DOM بعد أنميشن الـ Wipe
            setTimeout(() => { if(!s.classList.contains('active')) s.style.display = 'none'; }, 500);
        });

        if (!wasActive) {
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const subMenu = this.querySelector('#' + targetId);
            if (subMenu) {
                subMenu.style.display = 'flex';
                // تأخير بسيط للسماح لـ display: flex بالعمل قبل تفعيل التحريك
                requestAnimationFrame(() => {
                    subMenu.classList.add('active');
                });
                
                // حساب الموضع بناءً على موضع العنصر داخل الحاوية
                const itemRect = item.getBoundingClientRect();
                const containerRect = pillContainer.getBoundingClientRect();
                const relativeTop = itemRect.top - containerRect.top;
                
                // تعديل الموضع ليكون في المنتصف العمودي للأيقونة
                subMenu.style.top = (relativeTop + (itemRect.height / 2) - 25) + 'px';
            }
        }
    }

    initThemeHandlers(pillContainer) {
        // معالجات المواضيع
        const themeButtons = this.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                if (window.applyTheme) {
                    window.applyTheme(theme);
                }
            });
        });

        // منتقي الألوان
        const colorPicker = this.querySelector('#accentColorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                if (window.setAccentColor) {
                    window.setAccentColor(e.target.value);
                }
            });
        }

        // زر الحظ
        const luckyBtn = this.querySelector('#luckyStrikeBtn');
        if (luckyBtn) {
            luckyBtn.addEventListener('click', () => {
                if (window.generateLuckyMessage) {
                    window.generateLuckyMessage();
                }
            });
        }
    }
}

// تسجيل الـ Web Component
customElements.define('site-header', SiteHeader);
