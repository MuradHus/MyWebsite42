
document.addEventListener('DOMContentLoaded', () => {
    // --- Dynamic Pill Menu Logic ---
    const pillContainer = document.getElementById('settingsPillContainer');
    const toggleBtn = document.getElementById('settingsToggle');
    const mainTrack = pillContainer ? pillContainer.querySelector('.main-track') : null;
    const pillItems = pillContainer ? pillContainer.querySelectorAll('.pill-item') : [];
    const subPills = pillContainer ? pillContainer.querySelectorAll('.sub-pill') : [];

    // console.log("Init Pill Logic", { pillContainer, toggleBtn });

    if (pillContainer && toggleBtn) {
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.pointerEvents = 'auto';

        // Toggle Main Menu
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = pillContainer.classList.contains('active');
            
            if (isActive) {
                closeAllPills();
            } else {
                openMainPill();
            }
        });

        function openMainPill() {
            const btnRect = toggleBtn.getBoundingClientRect();
            
            // Calculate Position
            const topPos = btnRect.bottom + 15;
            const centerBtn = btnRect.left + (btnRect.width / 2);
            const leftPos = centerBtn - 25; // Center with button (50px width / 2)

            // Force Styles directly
            pillContainer.style.setProperty('top', topPos + 'px', 'important');
            pillContainer.style.setProperty('left', leftPos + 'px', 'important');
            pillContainer.style.setProperty('right', 'auto', 'important'); // Prevent RTL issues
            
            pillContainer.classList.add('active');
        }

        function closeAllPills() {
            pillContainer.classList.remove('active');
            // Close all subs
            subPills.forEach(sub => sub.classList.remove('active'));
            pillItems.forEach(item => item.classList.remove('active'));
        }

        // Handle Sub Menus
        pillItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Toggle active state on item
                const wasActive = item.classList.contains('active');
                
                // Reset others
                pillItems.forEach(i => i.classList.remove('active'));
                subPills.forEach(s => s.classList.remove('active'));

                if (!wasActive) {
                    item.classList.add('active');
                    const targetId = item.getAttribute('data-target');
                    const subMenu = document.getElementById(targetId);
                    if (subMenu) {
                        subMenu.classList.add('active');
                        // Align sub menu with the item
                        // In CSS default is top: 0, we can adjust margin-top relative to index
                        subMenu.style.top = (index * 50) + 'px'; // 40px item + 10px gap approx
                    }
                }
            });
        });

        // Close on Click Outside
        document.addEventListener('click', (e) => {
            if (pillContainer.classList.contains('active') && 
                !pillContainer.contains(e.target) && 
                e.target !== toggleBtn &&
                !toggleBtn.contains(e.target)) {
                closeAllPills();
            }
        });
    }

    // --- AI Text Generator Logic ---
    const aiTextEl = document.getElementById('aiText');
    if (aiTextEl) {
        const phrases = [
            "تحليل البيانات الكونية...",
            "تحسين تجربة المستخدم...",
            "Analyzing cosmic data...",
            "Improving user experience...",
            "مرحباً بك في المستقبل.",
            "Welcome to the future.",
            "جاري تحميل الإبداع...",
            "Loading creativity...",
            "الذكاء ليس معرفة، بل خيال.",
            "Intelligence is not knowledge, it's imagination.",
            "كل سطر كود هو قصة.",
            "Every line of code is a story."
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeWriter() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                aiTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50; // Faster deleting
            } else {
                aiTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100; // Normal typing
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                // Finished typing phrase
                isDeleting = true;
                typeSpeed = 2000; // Pause before deleting
            } else if (isDeleting && charIndex === 0) {
                // Finished deleting
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause before next phrase
            }

            setTimeout(typeWriter, typeSpeed);
        }

        // Start typing
        typeWriter();
    }

    // --- Periodic AI Box Logic (Gemini Powered) ---
    const aiBoxContentEl = document.getElementById('aiBoxContent');
    if (aiBoxContentEl) {
        const defaultFunItems = [
            { ar: "لماذا يفضل المبرمجون الوضع الليلي؟ لأن الضوء يجذب الحشرات (Bugs). 🐛", en: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛" },
            { ar: "معلومة: أول مبرمجة في التاريخ كانت امرأة، وهي 'أدا لوفلايس'. 👩‍💻", en: "Fact: The first programmer in history was a woman, Ada Lovelace. 👩‍💻" }
        ];

        async function updateAIBox() {
            const now = new Date().getTime();
            // TODO: إعادة تفعيل فحص الـ 6 ساعات لاحقاً (6 * 60 * 60 * 1000)
            // const sixHours = 6 * 60 * 60 * 1000;
            
            let savedData = localStorage.getItem('aiBoxData');
            let data = savedData ? JSON.parse(savedData) : null;

            // تم التعديل ليتم التوليد في كل مرة بناءً على طلب المستخدم
            // if (!data || (now - data.timestamp > sixHours)) {
            if (true) { 
                
                // Try to get from Gemini
                let aiMessage = null;
                if (typeof GeminiService !== 'undefined') {
                    aiMessage = await GeminiService.generateMessage();
                }

                if (aiMessage) {
                    data = {
                        text: aiMessage,
                        timestamp: now,
                        isAI: true
                    };
                } else {
                    // Fallback to local items if Gemini fails
                    const newIndex = Math.floor(Math.random() * defaultFunItems.length);
                    const item = defaultFunItems[newIndex];
                    data = {
                        text: `${item.ar} | ${item.en}`,
                        index: newIndex,
                        timestamp: now,
                        isAI: false
                    };
                }
                localStorage.setItem('aiBoxData', JSON.stringify(data));
            }

            // Display Content
            const parts = data.text.split('|');
            const arText = parts[0]?.trim() || "";
            const enText = parts[1]?.trim() || "";

            aiBoxContentEl.innerHTML = `
                <span class="ar-text" style="display:block; margin-bottom:5px;">${arText}</span>
                ${enText ? `<span class="en-text" style="display:block; font-size:0.95em; color:var(--accent); opacity:0.9;">${enText}</span>` : ''}
            `;
        }

        updateAIBox();
    }
});
