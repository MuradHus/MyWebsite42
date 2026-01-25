// Image Data Pool
const allImages = [
    '../Photos/GamesPhotos/____Earth.png',
    '../Photos/GamesPhotos/_____Mars.png',
    '../Photos/GamesPhotos/______neptune planet .png',
    '../Photos/GamesPhotos/_____pppp.png',
    '../Photos/GamesPhotos/_____sun.png',
    '../Photos/GamesPhotos/_____zzuhl.png',
    '../Photos/GamesPhotos/____moon.png',
    '../Photos/GamesPhotos/____moshtry.png',
    '../Photos/GamesPhotos/____zohra.png',
    '../Photos/‏‏ClokPhotos/_19026f35-a998-4a60-8eea-b683d81c5be8-removebg-preview.png',
    '../Photos/‏‏CarsPhotos/4.jpg',
    '../Photos/‏‏CarsPhotos/1.png'
];

// Select 9 images for optimal 3D ring
const cellCount = 9; 
const selectedImages = allImages.slice(0, cellCount);

const carousel = document.getElementById('carousel3D');

// Build Carousel
selectedImages.forEach((src) => {
    const cell = document.createElement('div');
    cell.className = 'carousel-cell';
    const img = document.createElement('img');
    // Fix path relative to HTML location vs JS location?
    // HTML is in root, JS in /js. Images in /Photos.
    // If photos.js is loaded in photos.html, paths should be relative to photos.html
    // So 'Photos/...' is correct. 
    // Wait, my `allImages` array above uses `../Photos` which might be wrong if this script is referenced by `src="js/photos.js"` in `photos.html`.
    // The relative path is from the HTML file. So 'Photos/...'
    
    // Correction:
    const cleanSrc = src.replace('../', ''); // Just in case I messed up in the array above
    img.src = cleanSrc;
    
    cell.appendChild(img);
    carousel.appendChild(cell);
});

// Apply 3D Transforms
const cells = document.querySelectorAll('.carousel-cell');
const theta = 360 / cellCount;
let radius = Math.round( (240 / 2) / Math.tan( Math.PI / cellCount ) ); 
// 240 is cell width. This formula calculates distance to center of polygon.
// Push it out a bit more for spacing
radius += 50; 

cells.forEach((cell, i) => {
    const angle = theta * i;
    cell.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
});


// Card Click Logic
document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
        alert('سيتم إضافة هذا القسم قريباً: ' + card.querySelector('h2').innerText);
    });
});
