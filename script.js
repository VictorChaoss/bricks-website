const sets = [
    "Alcatraz.jpg", "Blacked.png", "Chillhouse.png", "Clinton Set.jpg", "DB Cooper.jpg",
    "Deathnote.png", "Dexter.png", "Doakes.png", "Freak Off.jpg", "Futurama.png",
    "Gender Reveal.jpg", "I Cant Breathe.png", "ICE.jpg", "JFK.PNG", "Meth Lab.PNG",
    "Migrants.jpg", "Monke.png", "Pablo.jpg", "Pride.png", "THE TURNING POINT.jpg",
    "TMT Set.png", "TOP G.jpg", "The Crashout.jpg", "The Cybertruck.jpg", "The Deep Dive.jpg",
    "The Drive.jpg", "The Glove.jpg", "The Ice Wall.jpg", "The Mask.jpg", "The Slap.jpg",
    "The island.png", "The list.jpg", "The tunnel.jpg", "Tiger King.jpg", "Tokabu.png",
    "wif.png", "Striped Pyjamas.png"
];

const galleryGrid = document.getElementById('gallery-grid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const closeLightbox = document.querySelector('.close-lightbox');
const lightboxBackdrop = document.querySelector('.lightbox-backdrop');

// Navigation
const prevBtn = document.querySelector('.prev-arrow');
const nextBtn = document.querySelector('.next-arrow');
let currentImageIndex = 0;
let currentImages = [];

function formatTitle(filename) {
    return filename.replace(/\.[a-zA-Z0-9]+$/, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');
}

// Populate Gallery
if (galleryGrid) {
    sets.forEach(set => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'button');

        // Use encodeURI for the image path to handle spaces
        const imagePath = `assets/sets/${encodeURIComponent(set)}`;
        const title = formatTitle(set);

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imagePath}" alt="${title}" loading="lazy">
            </div>
            <div class="card-overlay">
                <div class="card-title">${title}</div>
                <div class="card-status">SOLD OUT</div>
            </div>
        `;

        // Pass original filename to openLightbox, we'll encode logic there
        card.addEventListener('click', () => openLightbox(set, title));
        galleryGrid.appendChild(card);
    });
}

// Lightbox Logic
function openLightbox(input, title) {
    // Determine if input is a full path (Minifigure) or a filename (Set)
    const isMinifigure = input.includes('/');

    // Reset State
    currentImages = [];

    if (isMinifigure) {
        // Simple Single Image Mode
        // Encoded input if needed, but minfigs usually single word or simple
        // Actually, we should encode the path just in case
        currentImages = [encodeURI(input)];
        lightboxTitle.textContent = title;

        // Hide arrows for single image
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        // Set Carousel Mode
        const filename = input;
        const baseName = filename.substring(0, filename.lastIndexOf('.'));
        const frontImg = `assets/sets/${filename}`;
        const backImg = `assets/sets/${baseName}_back.png`;
        const sideImg = `assets/sets/${baseName}_side.png`;

        // Apply encodeURI to handle spaces
        currentImages = [
            encodeURI(frontImg),
            encodeURI(backImg),
            encodeURI(sideImg)
        ];

        lightboxTitle.textContent = title;

        // Show arrows
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    }

    // Open Modal
    setMainImage(0);
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function setMainImage(index) {
    // Handle wrapping
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;

    currentImageIndex = index;

    // Set source
    const src = currentImages[index];
    lightboxImg.src = src;

    // Error handling: if image fails (e.g. missing side view), try next?
    // Or just let it show broken?
    // Let's add a one-time error handler to skip.
    lightboxImg.onerror = function () {
        // Prevent infinite loop if all fail
        if (currentImages.length <= 1) return;

        // Remove this bad image from array
        console.log("Image not found, skipping:", src);
        currentImages.splice(index, 1);

        // Try setting same index (which is now the next image)
        setMainImage(index);
    };

    // Unbind generic error handler after load? No, simplest is to just reassign src.
    // NOTE: The onerror above is bound to the element. It stays.
    // We need to be careful not to create a stack overflow if all 3 fail.
    // The previous check `currentImages.length <= 1` helps.
}

// Event Listeners
if (prevBtn) prevBtn.onclick = () => setMainImage(currentImageIndex - 1);
if (nextBtn) nextBtn.onclick = () => setMainImage(currentImageIndex + 1);

function closeLightboxFunc() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

closeLightbox.addEventListener('click', closeLightboxFunc);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightboxFunc);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightboxFunc();
    if (!lightbox.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') setMainImage(currentImageIndex - 1);
        if (e.key === 'ArrowRight') setMainImage(currentImageIndex + 1);
    }
});

const minifigures = [
    "67.jpg",
    "6ix9ine.jpg",
    "Question_Mark_Guy.png",
    "ASHWGA.png",
    "Alon.jpg",
    "Ash Ketchum.jpg",
    "Bender.png",
    "Beyonce.jpg",
    "Blacked .png",
    "Burger King.png",
    "Burning Meme.jpg",
    "CZ.png",
    "Chill Guy.jpg",
    "Chill House.jpg",
    "Connor Mcgregor.jpg",
    "Dana White.jpg",
    "Darth Vader.jpg",
    "Deadpool.jpg",
    "Dexter Morgan .jpeg",
    "Diddy.jpg",
    "Doakes.jpg",
    "Drake.jpg",
    "Elon.png",
    "Epstein.jpg",
    "Franklin Saint.png",
    "Fry.png",
    "George Floyd.jpg",
    "Get Out.png",
    "Ghost.png",
    "Go Hamm.jpg",
    "Grinch.jpg",
    "Happy Gilmore.jpg",
    "Harambe.jpeg",
    "Iron Man 2.jpg",
    "Iron Man.jpg",
    "Joe Exotic.jpg",
    "John Wick.jpg",
    "Joker.jpeg",
    "Jumanji.jpg",
    "Kabuso.jpeg",
    "Kanye.jpg",
    "Kermit.jpg",
    "LeBron.png",
    "Leela.png",
    "Looking Back Meme.png",
    "MJ.jpg",
    "Maduro.png",
    "Mayweather.png",
    "Meme Kid.png",
    "Messi.png",
    "Miley Cyrus.jpg",
    "Minerpng.png",
    "Mitch 2.png",
    "Moo Deng.jpg",
    "Mr Beast.jpg",
    "Mr Crabs.jpg",
    "Muhammed Ali.jpg",
    "Naruto.jpg",
    "Oj Simpson.jpg",
    "Patrick Bateman.jpg",
    "Patrick Star.jpg",
    "Pepe.jpg",
    "Plague Doctor.jpg",
    "Pwease.jpg",
    "Quant Kid.png",
    "Rick and Morty .jpg",
    "Rihanna.jpg",
    "Robert Downey Jr.jpg",
    "Ronald McDonald.jpg",
    "Ronaldo.png",
    "Routine.png",
    "Salt Bae.png",
    "Slim Shady.jpg",
    "Spongebob.jpeg",
    "Squidward.jpg",
    "Storm Trooper.jpg",
    "Sucess Kid.jpg",
    "Tate.jpg",
    "Taylor Swift 2.jpg",
    "Taylor Swift.jpg",
    "The Rock WWE.jpg",
    "Trax.png",
    "Troll Face.jpg",
    "Trump.jpeg",
    "Venom.jpg",
    "Walter White.jpeg",
    "Wolf of Wall Street.png",
    "YODA.jpg",
    "ishowspeed.jpg",
    "ninja.jpg"
];

const minifigureGrid = document.getElementById('minifigure-grid');

if (minifigureGrid) {
    minifigures.forEach(figure => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'button');

        const imagePath = `assets/minifigures/${figure}`;
        const title = formatTitle(figure);

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imagePath}" alt="${title}" loading="lazy">
            </div>
            <div class="card-overlay">
                <div class="card-title">${title}</div>
                <div class="card-status">SOLD OUT</div>
            </div>
        `;

        card.addEventListener('click', () => openLightbox(imagePath, title));
        minifigureGrid.appendChild(card);
    });
}

// Video Mute Toggle Logic
const heroVideo = document.getElementById('heroVideo');
const muteToggle = document.getElementById('muteToggle');

if (heroVideo && muteToggle) {
    muteToggle.addEventListener('click', () => {
        if (heroVideo.muted) {
            heroVideo.muted = false;
            muteToggle.textContent = 'MUTE';
            // Ensure play is forced just in case browser pauses on unmute
            heroVideo.play().catch(e => console.log('Autoplay unmuted blocked', e));
        } else {
            heroVideo.muted = true;
            muteToggle.textContent = 'UNMUTE';
        }
    });
}

