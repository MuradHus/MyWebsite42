// Telegram Visitor Tracker
// ملاحظة أمنية: هذا الكود في موقع ساكن، التوكن مشفر بشكل بسيط لكن يمكن فك تشفيره
// للأمان الكامل، استخدم Cloudflare Worker أو Vercel Function

(function() {
    // تشفير بسيط للتوكن (استبدل القيم بالقيم الحقيقية)
    const encodedToken = btoa("8574671989:AAHdLXmvhUXwjo0GoS4MirGVEqi-GUAHMTc"); // ضع التوكن هنا
    const encodedChatId = btoa("8004559160"); // ضع الـ Chat ID هنا
    
    // فك التشفير
    const botToken = atob(encodedToken);
    const chatId = atob(encodedChatId);
    
    // جمع معلومات الزائر
    async function getVisitorInfo() {
        const now = new Date();
        const browserInfo = navigator.userAgent;
        const language = navigator.language;
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const currentPage = window.location.href;
        
        // الحصول على معلومات الموقع الجغرافي (IP و الدولة)
        let locationData = { country: "Unknown", city: "Unknown", ip: "Unknown" };
        
        try {
            const geoResponse = await fetch('https://ipapi.co/json/');
            if (geoResponse.ok) {
                locationData = await geoResponse.json();
            }
        } catch (error) {
            console.error('Failed to get location:', error);
        }
        
        // تنسيق الرسالة
        const message = `
🌐 زائر جديد للموقع!

⏰ الوقت: ${now.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
🌍 الدولة: ${locationData.country} | ${locationData.city}
📍 IP: ${locationData.ip}
💻 المتصفح: ${browserInfo}
🌐 اللغة: ${language}
📱 الدقة: ${screenRes}
🔗 الصفحة: ${currentPage}
        `.trim();
        
        return message;
    }
    
    // إرسال الرسالة إلى تيليجرام
    async function sendToTelegram() {
        try {
            const message = await getVisitorInfo();
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            if (response.ok) {
                console.log('Visitor notification sent successfully');
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }
    
    // تنفيذ الإرسال عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendToTelegram);
    } else {
        sendToTelegram();
    }
})();
