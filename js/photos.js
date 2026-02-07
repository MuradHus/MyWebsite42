// Photos Gallery Logic with Supabase

const carousel = document.getElementById('carousel3D');
let currentImages = [];

// Initialize Gallery
async function initGallery() {
    console.log("Initializing Supabase Gallery...");
    
    // Fetch all images initially
    await loadCategoryImages('all');
    
    // Setup Navigation Card Clicks
    document.querySelectorAll('.photo-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            // Navigate to the dynamic category page
            window.location.href = `category-photos.html?type=${category}`;
        });
    });
}

// Fetch images from Supabase
async function loadCategoryImages(category) {
    try {
        let query = _supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
            console.log("No images found for category:", category);
            if (category === 'all') {
                 // If all is empty, set all badges to 0
                 document.querySelectorAll('.photo-card .card-badge').forEach(badge => badge.textContent = '0');
            }
            updateCarousel([]);
            return;
        }

        // If loading all (initial load), calculate counts for badges
        if (category === 'all') {
            const counts = {};
            // Initialize known categories from DOM to 0
            document.querySelectorAll('.photo-card').forEach(card => {
                const cat = card.getAttribute('data-category');
                if(cat) counts[cat] = 0;
            });

            // Count images
            data.forEach(img => {
                if (img.category) {
                    counts[img.category] = (counts[img.category] || 0) + 1;
                }
            });

            // Update badges
            Object.keys(counts).forEach(cat => {
                const card = document.querySelector(`.photo-card[data-category="${cat}"]`);
                if (card) {
                    const badge = card.querySelector('.card-badge');
                    if (badge) badge.textContent = counts[cat];
                }
            });
        }

        currentImages = data;
        updateCarousel(currentImages);

    } catch (err) {
        console.error("Error loading images:", err.message);
        // If there's an error (like table not found yet), show a message
        carousel.innerHTML = '<div style="color: #d4af37; text-align: center; width: 100%; font-size: 1.2rem;">يرجى التأكد من إنشاء الجدول "photos" في Supabase</div>';
    }
}

// Update the 3D Carousel UI
function updateCarousel(images) {
    carousel.innerHTML = '';
    
    if (images.length === 0) {
        carousel.innerHTML = '<div style="color: #d4af37; text-align: center; width: 100%; font-size: 1.2rem; margin-top: 50px;">قريباً.. سيتم رفع الصور هنا لهذا القسم</div>';
        return;
    }

    // Limit to 12 for 3D performance
    const displayCount = Math.min(images.length, 12);
    const theta = 360 / displayCount;
    const radius = Math.round( (240 / 2) / Math.tan( Math.PI / displayCount ) ) + 80;

    for (let i = 0; i < displayCount; i++) {
        const item = images[i];
        const cell = document.createElement('div');
        cell.className = 'carousel-cell';
        
        const img = document.createElement('img');
        img.src = item.image_url;
        img.alt = item.title || 'Gallery Image';
        
        // Setup lazy loading
        img.loading = "lazy";
        
        cell.appendChild(img);
        
        // 3D positioning
        const angle = theta * i;
        cell.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        
        carousel.appendChild(cell);
    }
}

// Start
document.addEventListener('DOMContentLoaded', initGallery);
