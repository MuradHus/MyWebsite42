
// Gemini API Service
const GeminiService = {
    async getSettings() {
        try {
            const { data: secrets, error } = await _supabase
                .from('secrets')
                .select('*');

            if (error || !secrets) throw new Error("Could not fetch secrets from Supabase");

            return {
                apiKey: secrets.find(s => s.key === 'GEMINI_API_KEY')?.value,
                model: secrets.find(s => s.key === 'GEMINI_MODEL')?.value || 'gemini-2.5-flash',
                systemPrompt: secrets.find(s => s.key === 'GEMINI_SYSTEM_PROMPT')?.value || 'انت شخص ذكي جدا، قم باعطاء جملة ملهمة او حقيقة علمية او نكتة للمبرمجين باللغة العربية والانجليزية.'
            };
        } catch (error) {
            console.error('Gemini Settings Error:', error);
            return null;
        }
    },

    async generateMessage() {
        const settings = await this.getSettings();
        if (!settings || !settings.apiKey) return null;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: settings.systemPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7, // هدا يتحكم في مدى التفاؤل
                        maxOutputTokens: 500, // هدا يتحكم في عدد الـ tokens
                    }
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const text = data.candidates[0].content.parts[0].text.trim();
                // We expect a format like: "Arabic message | English message" or just text
                return text;
            }
            return null;
        } catch (error) {
            console.error('Gemini API Error:', error);
            return null;
        }
    }
};
