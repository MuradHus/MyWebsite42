
// Theme Manager & Feedback Widget Integration (Ultimate Fix)
const ThemeManager = {
    init() {
        console.log('ThemeManager: Initializing...');
        this.cacheDOM();
        this.bindEvents();
        this.loadSettings();
        this.initFeedbackWidget();
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
        this.body.classList.remove('light-theme', 'dark-theme');
        if (themeName !== 'default') {
            this.body.classList.add(`${themeName}-theme`);
        }
        localStorage.setItem('siteTheme', themeName);
        this.updateActiveButton(themeName);
    },

    setCustomColor(color) {
        if (!color) return;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--border-color', color);
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
        if (savedColor) this.setCustomColor(savedColor);
    },

    updateActiveButton(activeTheme) {
        if (!this.themeBtns) return;
        this.themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === activeTheme);
        });
    },

    // --- Feedback Widget Logic (Reinforced) ---
    initFeedbackWidget() {
        const inject = () => {
            if (document.getElementById('feedbackBtn')) return;
            const target = document.getElementById('settingsToggle');
            if (!target) {
                // If the gear isn't there, we can't inject.
                return;
            }

            console.log('Feedback Widget: Target found, injecting between date and gear...');

            const btn = document.createElement('button');
            btn.id = 'feedbackBtn';
            btn.type = 'button';
            // Explicit styles to override any CSS conflicts
            const btnStyle = `
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: blur(5px) !important;
                -webkit-backdrop-filter: blur(5px) !important;
                border: 1px solid var(--accent, #d4af37) !important;
                color: var(--accent, #d4af37) !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: transform 0.3s ease, box-shadow 0.3s ease !important;
                margin: 0 10px !important;
                padding: 0 !important;
                box-shadow: 0 0 15px var(--accent-glow, rgba(212, 175, 55, 0.5)) !important;
                z-index: 999999 !important;
                visibility: visible !important;
                opacity: 1 !important;
                flex-shrink: 0 !important;
                pointer-events: auto !important;
            `;
            btn.style.cssText = btnStyle;
            btn.innerHTML = '<i class="fa-solid fa-comment-dots" style="font-size: 18px;"></i>';
            btn.title = 'إرسال ملاحظات';

            // Hover interactions
            btn.onmouseover = () => {
                btn.style.backgroundColor = 'var(--accent, #d4af37)';
                btn.style.color = '#000';
                btn.style.transform = 'scale(1.1)';
            };
            btn.onmouseout = () => {
                btn.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                btn.style.color = 'var(--accent, #d4af37)';
                btn.style.transform = 'scale(1)';
            };

            // Inject BEFORE the settings toggle (between date and toggle in the DOM)
            target.parentNode.insertBefore(btn, target);

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showFeedbackModal();
            };
            
            console.log('Feedback Widget: Injection complete.');
        };

        // Multiple attempts to ensure it lands
        inject();
        window.addEventListener('load', inject);
        
        let attempts = 0;
        const interval = setInterval(() => {
            if (document.getElementById('feedbackBtn')) {
                clearInterval(interval);
                return;
            }
            inject();
            attempts++;
            if (attempts > 15) clearInterval(interval);
        }, 1000);
    },

    showFeedbackModal() {
        let modal = document.getElementById('feedbackModal');
        if (!modal) {
            const html = `
                <div id="feedbackModal" style="display:none; position:fixed; z-index:2000000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); align-items:center; justify-content:center; direction:rtl; font-family:'Cairo', sans-serif;">
                    <div style="background:#151515; padding:30px; border-radius:20px; width:90%; max-width:480px; border:2px solid var(--accent, #d4af37); position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.8); animation: feedbackFadeIn 0.3s ease-out;">
                        <style>
                            @keyframes feedbackFadeIn { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }
                        </style>
                        <span id="closeFeedback" style="position:absolute; top:15px; left:20px; font-size:30px; color:#fff; cursor:pointer; line-height:1;">&times;</span>
                        <h2 style="color:var(--accent, #d4af37); margin:0 0 10px 0; font-size:24px; text-align:center;">ارسل ملاحظات ... نهتم برأيك</h2>
                        <p style="color:#aaa; font-size:14px; margin-bottom:20px; text-align:center;">نحن نقدر وقتك. ساعدنا في تحسين تجربتك.</p>
                        <textarea id="feedbackMessage" style="width:100%; height:140px; padding:15px; border-radius:12px; border:1px solid rgba(212,175,55,0.4); background:#202020; color:#fff; font-size:17px; margin-bottom:20px; box-sizing:border-box; outline:none; resize:none; transition: border-color 0.3s;" placeholder="اكتب ملاحظاتك هنا..."></textarea>
                        <button id="sendFeedbackBtn" style="width:100%; padding:14px; border:none; border-radius:30px; background:linear-gradient(135deg, var(--accent, #d4af37), #b08e2a); color:#000; font-weight:bold; cursor:pointer; font-size:18px; transition:0.3s; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">إرسال الملاحظات</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modal = document.getElementById('feedbackModal');
            
            document.getElementById('closeFeedback').onclick = () => modal.style.display = 'none';
            modal.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
            
            const textarea = document.getElementById('feedbackMessage');
            textarea.onfocus = () => textarea.style.borderColor = 'var(--accent, #d4af37)';
            textarea.onblur = () => textarea.style.borderColor = 'rgba(212,175,55,0.4)';
            
            document.getElementById('sendFeedbackBtn').onclick = () => this.handleFeedbackSend();
        }
        modal.style.display = 'flex';
        document.getElementById('feedbackMessage').focus();
    },

    async handleFeedbackSend() {
        const msg = document.getElementById('feedbackMessage').value.trim();
        if (!msg) return;

        const btn = document.getElementById('sendFeedbackBtn');
        btn.disabled = true;
        btn.innerHTML = 'جاري الإرسال...';

        try {
            // Direct fetch for credentials fallback
            const url = 'https://qfrkzsyarnyifshzvmdj.supabase.co/rest/v1/secrets?select=*';
            const key = 'sb_publishable_435Qmr4FYDEOxGskR_-6Lw_epGi-5wr';
            
            const response = await fetch(url, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } });
            if (!response.ok) throw new Error('API Error');
            const secrets = await response.json();
            
            const token = secrets.find(s => s.key === 'TELEGRAM_BOT_TOKEN')?.value;
            const chat = secrets.find(s => s.key === 'TELEGRAM_CHAT_ID')?.value;

            if (!token || !chat) throw new Error('Creds missing');

            const text = `📬 <b>ملاحظة جديدة</b>\n\n⏰ الوقت: ${new Date().toLocaleString('ar-EG')}\n📍 الصفحة: ${window.location.href}\n\n💬 <b>الرسالة:</b>\n${msg}`;

            const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' })
            });

            if (!tgRes.ok) throw new Error('Telegram Error');

            alert('✅ شكرًا لك! تم استلام رسالتك بنجاح.');
            document.getElementById('feedbackMessage').value = '';
            document.getElementById('feedbackModal').style.display = 'none';
        } catch (e) {
            console.error('Feedback Error:', e);
            alert('❌ عذراً، حدث خطأ ما. يرحى التأكد من اتصال الإنترنت ثم المحاولة ثانيةً.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'إرسال الملاحظات';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    
    const isSubPage = window.location.pathname.toLowerCase().includes('/html/');

    // Load Google Analytics globally
    const gaScript = document.createElement('script');
    gaScript.src = isSubPage ? '../js/google-analytics.js' : 'js/google-analytics.js';
    document.head.appendChild(gaScript);

    // Load Microsoft Clarity globally
    const clarityScript = document.createElement('script');
    clarityScript.src = isSubPage ? '../js/microsoft-clarity.js' : 'js/microsoft-clarity.js';
    document.head.appendChild(clarityScript);
});
