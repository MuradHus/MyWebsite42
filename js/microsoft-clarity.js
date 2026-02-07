
/**
 * Microsoft Clarity Integration
 * Fetches Project ID from Supabase and initializes tracking.
 */
(function() {
    'use strict';

    async function initClarity() {
        try {
            // Check if Supabase config is loaded
            if (typeof _supabase === 'undefined') {
                console.warn('Clarity: Supabase not found, waiting...');
                return;
            }

            // Fetch Project ID from secrets table
            const { data: secrets, error } = await _supabase
                .from('secrets')
                .select('*');

            if (error || !secrets) {
                console.error('Clarity: Error fetching secrets:', error);
                return;
            }

            const claritySecret = secrets.find(s => s.key === 'CLARITY_ID');
            if (!claritySecret || !claritySecret.value) {
                console.warn('Clarity: CLARITY_ID not found in Supabase secrets.');
                return;
            }

            const CLARITY_ID = claritySecret.value;

            // Microsoft Clarity Snippet
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", CLARITY_ID);

            console.log('Microsoft Clarity: Initialized correctly.');

        } catch (err) {
            console.error('Microsoft Clarity: Initialization failed:', err);
        }
    }

    // Run when Supabase is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initClarity);
    } else {
        initClarity();
    }
})();
