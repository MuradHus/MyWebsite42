/**
 * Google Analytics Global Injector - Supabase Version
 * Fetches GA_ID from Supabase 'secrets' table and initializes tracking.
 */
(async function() {
    try {
        // Wait for Supabase to be available (it is loaded in every page)
        if (typeof _supabase === 'undefined') {
            console.error('Supabase client (_supabase) is not defined.');
            return;
        }

        // Fetch secrets from Supabase
        const { data: secrets, error } = await _supabase
            .from('secrets')
            .select('*');

        if (error || !secrets) {
            console.error('Error fetching GA_ID from Supabase:', error);
            return;
        }

        const gaSecret = secrets.find(s => s.key === 'GA_ID');
        if (!gaSecret || !gaSecret.value) {
            console.warn('GA_ID not found in Supabase secrets table.');
            return;
        }

        const GA_ID = gaSecret.value;
        
        // Create the script tag for gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        // Initialize dataLayer and gtag function
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_ID);
        
        window.gtag = gtag;
        console.log('Google Analytics initialized via Supabase.');

    } catch (err) {
        console.error('GA Supabase Initialization Error:', err);
    }
})();
