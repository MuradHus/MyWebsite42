// Telegram Visitor Tracker (Supabase Version)

(function() {
    async function getVisitorInfo() {
        // ... (نفس كود جلب المعلومات السابق)
        const now = new Date();
        const browserInfo = navigator.userAgent;
        const language = navigator.language;
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        
        let locationData = { country: "Unknown", city: "Unknown", ip: "Unknown" };
        try {
            const geoResponse = await fetch('https://ipapi.co/json/');
            if (geoResponse.ok) locationData = await geoResponse.json();
        } catch (e) {}
        
        return `
🌐 زائر جديد!

⏰ الوقت: ${now.toLocaleString('ar-EG')}

🌍 الدولة: ${locationData.country} | ${locationData.city}

💻 المتصفح: ${browserInfo}

📱 الدقة: ${screenRes}
        `.trim();
    }
    
    async function sendToTelegram() {
        try {
            // جلب التوكن والـ ID من Supabase
            // يجب إنشاء جدول باسم 'secrets' يحتوي على حقول key و value
            const { data: secrets, error: secretError } = await _supabase
                .from('secrets')
                .select('*');

            if (secretError || !secrets) throw new Error("Could not fetch secrets");

            const botToken = secrets.find(s => s.key === 'TELEGRAM_BOT_TOKEN')?.value;
            const chatId = secrets.find(s => s.key === 'TELEGRAM_CHAT_ID')?.value;

            if (!botToken || !chatId) return;

            const message = await getVisitorInfo();
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
            
        } catch (error) {
            console.error('Telegram Tracking Error:', error);
        }
    }
    
    // الإرسال في الصفحة الرئيسية فقط (index)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        document.addEventListener('DOMContentLoaded', sendToTelegram);
    }
})();
