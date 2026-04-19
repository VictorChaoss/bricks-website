// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sets (Drops page)
// NEW items first within each category; "new" filter shows only isNew:true
// ─────────────────────────────────────────────────────────────────────────────
const sets = [
    // 🔥 NEW — rises to top in ALL view
    { file: "Asteroid.jpeg",          category: "culture",  isNew: true },
    { file: "Day Care Centre.jpeg",   category: "culture",  isNew: true },
    { file: "Looks Maxxing.jpeg",     category: "internet", isNew: true },
    { file: "Punch.jpeg",             category: "culture",  isNew: true },
    { file: "Stock Market.jpeg",      category: "crime",    isNew: true },
    { file: "Strait of Hormuz.jpeg",  category: "politics", isNew: true },
    { file: "Kit Kat Heist.jpeg",     category: "crime",    isNew: true },
    { file: "Artemis.jpeg",           category: "crime",    isNew: true },
    { file: "Italian Brainrot.jpeg",  category: "culture",  isNew: true },

    // Politics
    { file: "JFK.PNG",               category: "politics" },
    { file: "Clinton Set.jpg",       category: "politics" },
    { file: "ICE.jpg",               category: "politics" },
    { file: "Migrants.jpg",          category: "politics" },
    { file: "TOP G.jpg",             category: "politics" },
    { file: "The Cybertruck.jpg",    category: "politics" },

    // Crime
    { file: "Alcatraz.jpg",          category: "crime" },
    { file: "DB Cooper.jpg",         category: "crime" },
    { file: "Freak Off.jpg",         category: "crime" },
    { file: "Meth Lab.PNG",          category: "crime" },
    { file: "Pablo.jpg",             category: "crime" },
    { file: "The island.png",        category: "crime" },
    { file: "The list.jpg",          category: "crime" },
    { file: "The tunnel.jpg",        category: "crime" },

    // Culture
    { file: "Blacked.png",           category: "culture" },
    { file: "Gender Reveal.jpg",     category: "culture" },
    { file: "I Cant Breathe.png",    category: "culture" },
    { file: "Pride.png",             category: "culture" },
    { file: "Striped Pyjamas.png",   category: "culture" },
    { file: "THE TURNING POINT.jpg", category: "culture" },
    { file: "The Crashout.jpg",      category: "culture" },
    { file: "Tokabu.png",            category: "culture" },
    { file: "Dexter.png",            category: "culture" },
    { file: "Doakes.png",            category: "culture" },
    { file: "The Deep Dive.jpg",     category: "culture" },
    { file: "The Drive.jpg",         category: "culture" },
    { file: "The Ice Wall.jpg",      category: "culture" },
    { file: "The Mask.jpg",          category: "culture" },
    { file: "The Slap.jpg",          category: "culture" },
    { file: "The_Beef.png",          category: "culture" },

    // Sports
    { file: "TMT Set.png",           category: "sports" },
    { file: "The Glove.jpg",         category: "sports" },

    // Internet / Entertainment
    { file: "Chillhouse.png",        category: "internet" },
    { file: "Deathnote.png",         category: "internet" },
    { file: "Futurama.png",          category: "internet" },
    { file: "Monke.png",             category: "internet" },
    { file: "Tiger King.jpg",        category: "internet" },
    { file: "wif.png",               category: "internet" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Minifigures
// ─────────────────────────────────────────────────────────────────────────────
const minifigures = [
    // 🔥 NEW — all new items at top of ALL view
    { file: "Trump New.png",           category: "politics",      isNew: true },
    { file: "Netenyahu.png",           category: "politics",      isNew: true },
    { file: "Ayatollah.png",           category: "politics",      isNew: true },
    { file: "Epstein.jpeg",            category: "crime",         isNew: true },
    { file: "Palm Beach Pete.jpeg",    category: "crime",         isNew: true },
    { file: "Jordan Belfort.png",      category: "crime",         isNew: true },
    { file: "Scarface.jpeg",           category: "crime",         isNew: true },
    { file: "Patrick Bateman New.jpeg",category: "entertainment", isNew: true },
    { file: "Clavicular.jpeg",         category: "entertainment", isNew: true },
    { file: "Penguin.png",             category: "crypto",        isNew: true },
    { file: "Punch.png",               category: "crypto",        isNew: true },
    { file: "Rick Roll.jpeg",          category: "internet",      isNew: true },
    { file: "Tung Tung Sahur.jpeg",    category: "internet",      isNew: true },

    // Politics
    { file: "Elon.png",                category: "politics" },
    { file: "Maduro.png",              category: "politics" },
    { file: "Dana White.jpg",          category: "politics" },

    // Crypto — CZ, Mitch, Penguin, Punch (Penguin & Punch above in new block)
    { file: "CZ.png",                  category: "crypto" },
    { file: "Mitch 2.png",             category: "crypto" },

    // Crime — Alon first
    { file: "Alon.jpg",                category: "crime" },
    { file: "Diddy.jpg",               category: "crime" },
    { file: "Walter White.jpeg",       category: "crime" },
    { file: "Wolf of Wall Street.png", category: "crime" },
    { file: "Oj Simpson.jpg",          category: "crime" },
    { file: "Joe Exotic.jpg",          category: "crime" },

    // Sports
    { file: "Messi.png",               category: "sports" },
    { file: "Ronaldo.png",             category: "sports" },
    { file: "LeBron.png",              category: "sports" },
    { file: "Mayweather.png",          category: "sports" },
    { file: "Muhammed Ali.jpg",        category: "sports" },
    { file: "Connor Mcgregor.jpg",     category: "sports" },
    { file: "The Rock WWE.jpg",        category: "sports" },

    // Entertainment
    { file: "Dexter Morgan .jpeg",     category: "entertainment" },
    { file: "Doakes.jpg",              category: "entertainment" },
    { file: "John Wick.jpg",           category: "entertainment" },
    { file: "Ghost.png",               category: "entertainment" },
    { file: "Franklin Saint.png",      category: "entertainment" },
    { file: "Happy Gilmore.jpg",       category: "entertainment" },
    { file: "Joker.jpeg",              category: "entertainment" },
    { file: "Venom.jpg",               category: "entertainment" },
    { file: "Deadpool.jpg",            category: "entertainment" },
    { file: "Jumanji.jpg",             category: "entertainment" },
    { file: "Iron Man.jpg",            category: "entertainment" },
    { file: "Iron Man 2.jpg",          category: "entertainment" },
    { file: "YODA.jpg",                category: "entertainment" },
    { file: "Darth Vader.jpg",         category: "entertainment" },
    { file: "Storm Trooper.jpg",       category: "entertainment" },
    { file: "Taylor Swift.jpg",        category: "entertainment" },
    { file: "Taylor Swift 2.jpg",      category: "entertainment" },
    { file: "Rihanna.jpg",             category: "entertainment" },
    { file: "Beyonce.jpg",             category: "entertainment" },
    { file: "Kanye.jpg",               category: "entertainment" },
    { file: "Drake.jpg",               category: "entertainment" },
    { file: "Slim Shady.jpg",          category: "entertainment" },
    { file: "MJ.jpg",                  category: "entertainment" },
    { file: "Robert Downey Jr.jpg",    category: "entertainment" },
    { file: "Miley Cyrus.jpg",         category: "entertainment" },
    { file: "Tate.jpg",                category: "entertainment" },

    // Fiction / Cartoon — Minerpng first
    { file: "Minerpng.png",            category: "fiction" },
    { file: "Fry.png",                 category: "fiction" },
    { file: "Leela.png",               category: "fiction" },
    { file: "Bender.png",              category: "fiction" },
    { file: "Ash Ketchum.jpg",         category: "fiction" },
    { file: "Naruto.jpg",              category: "fiction" },
    { file: "Spongebob.jpeg",          category: "fiction" },
    { file: "Patrick Star.jpg",        category: "fiction" },
    { file: "Squidward.jpg",           category: "fiction" },
    { file: "Mr Crabs.jpg",            category: "fiction" },
    { file: "Kermit.jpg",              category: "fiction" },
    { file: "Ronald McDonald.jpg",     category: "fiction" },
    { file: "Grinch.jpg",              category: "fiction" },
    { file: "Rick and Morty .jpg",     category: "fiction" },
    { file: "Get Out.png",             category: "fiction" },
    { file: "Blacked .png",            category: "fiction" },
    { file: "ASHWGA.png",              category: "fiction" },
    { file: "Plague Doctor.jpg",       category: "fiction" },
    { file: "Salt Bae.png",            category: "fiction" },
    { file: "Routine.png",             category: "fiction" },

    // Internet Memes — Trax & 67 first, then Tung Tung (already in new block)
    { file: "Trax.png",                category: "internet" },
    { file: "67.jpg",                  category: "internet" },
    { file: "Burger King.png",         category: "internet" },
    { file: "Pepe.jpg",                category: "internet" },
    { file: "Troll Face.jpg",          category: "internet" },
    { file: "Harambe.jpeg",            category: "internet" },
    { file: "Moo Deng.jpg",            category: "internet" },
    { file: "Kabuso.jpeg",             category: "internet" },
    { file: "Chill Guy.jpg",           category: "internet" },
    { file: "Chill House.jpg",         category: "internet" },
    { file: "Meme Kid.png",            category: "internet" },
    { file: "Looking Back Meme.png",   category: "internet" },
    { file: "Burning Meme.jpg",        category: "internet" },
    { file: "Sucess Kid.jpg",          category: "internet" },
    { file: "Pwease.jpg",              category: "internet" },
    { file: "Go Hamm.jpg",             category: "internet" },
    { file: "Quant Kid.png",           category: "internet" },
    { file: "Question_Mark_Guy.png",   category: "internet" },
    { file: "6ix9ine.jpg",             category: "internet" },
    { file: "ishowspeed.jpg",          category: "internet" },
    { file: "ninja.jpg",               category: "internet" },
    { file: "Mr Beast.jpg",            category: "internet" },
    { file: "George Floyd.jpg",        category: "internet" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatTitle(filename) {
    return filename
        .replace(/\.[a-zA-Z0-9]+$/, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/ New$/, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────────────────────────────────────
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightbox-img');
const lightboxTitle   = document.getElementById('lightbox-title');
const closeLightbox   = document.querySelector('.close-lightbox');
const lightboxBackdrop= document.querySelector('.lightbox-backdrop');
const prevBtn         = document.querySelector('.prev-arrow');
const nextBtn         = document.querySelector('.next-arrow');

let currentImageIndex = 0;
let currentImages     = [];

function openLightbox(input, title) {
    currentImages = [];
    const isMinifigure = input.includes('/minifigures/');

    if (isMinifigure) {
        currentImages = [encodeURI(input)];
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        const filename = input;
        const baseName = filename.substring(0, filename.lastIndexOf('.'));
        currentImages = [
            encodeURI(`assets/sets/${filename}`),
            encodeURI(`assets/sets/${baseName}_back.jpeg`),
            encodeURI(`assets/sets/${baseName}_back.png`),
            encodeURI(`assets/sets/${baseName}_side.png`),
        ];
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    }

    lightboxTitle.textContent = title;
    setMainImage(0);
    if (lightbox) {
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function setMainImage(index) {
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;
    currentImageIndex = index;
    const src = currentImages[index];
    lightboxImg.src = src;
    lightboxImg.onerror = function () {
        if (currentImages.length <= 1) return;
        currentImages.splice(index, 1);
        if (currentImages.length > 0) setMainImage(Math.min(index, currentImages.length - 1));
    };
}

if (prevBtn) prevBtn.onclick = () => setMainImage(currentImageIndex - 1);
if (nextBtn) nextBtn.onclick = () => setMainImage(currentImageIndex + 1);

function closeLightboxFunc() {
    if (lightbox) lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

if (closeLightbox)    closeLightbox.addEventListener('click', closeLightboxFunc);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightboxFunc);
document.addEventListener('keydown', (e) => {
    if (!lightbox) return;
    if (e.key === 'Escape') closeLightboxFunc();
    if (!lightbox.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft')  setMainImage(currentImageIndex - 1);
        if (e.key === 'ArrowRight') setMainImage(currentImageIndex + 1);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY BUILDER — generic for both drops and minifigures
// ─────────────────────────────────────────────────────────────────────────────
function buildCards(items, gridEl, assetFolder, isSetsPage) {
    gridEl.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'button');
        card.dataset.category = item.category;
        if (item.isNew) card.dataset.new = 'true';

        const imagePath = `assets/${assetFolder}/${item.file}`;
        const title = formatTitle(item.file);

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${encodeURI(imagePath)}" alt="${title}" loading="lazy">
                ${item.isNew ? '<span class="new-badge">NEW</span>' : ''}
            </div>
            <div class="card-overlay">
                <div class="card-title">${title}</div>
                <div class="card-status">SOLD OUT</div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (isSetsPage) {
                openLightbox(item.file, title);
            } else {
                openLightbox(imagePath, title);
            }
        });

        gridEl.appendChild(card);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function setupFilters(barId, items, gridEl, assetFolder, isSetsPage) {
    const bar = document.getElementById(barId);
    if (!bar) return;

    // Build initial grid with all items
    buildCards(items, gridEl, assetFolder, isSetsPage);

    bar.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        let filtered;
        if (filter === 'all') {
            filtered = items;
        } else if (filter === 'new') {
            filtered = items.filter(i => i.isNew);
        } else {
            filtered = items.filter(i => i.category === filter);
        }

        buildCards(filtered, gridEl, assetFolder, isSetsPage);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
const galleryGrid     = document.getElementById('gallery-grid');
const minifigureGrid  = document.getElementById('minifigure-grid');

if (galleryGrid) {
    setupFilters('dropFilterBar', sets, galleryGrid, 'sets', true);
}

if (minifigureGrid) {
    setupFilters('figFilterBar', minifigures, minifigureGrid, 'minifigures', false);
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO
// ─────────────────────────────────────────────────────────────────────────────
const heroVideo  = document.getElementById('heroVideo');
const muteToggle = document.getElementById('muteToggle');

if (heroVideo && muteToggle) {
    muteToggle.addEventListener('click', () => {
        if (heroVideo.muted) {
            heroVideo.muted = false;
            muteToggle.textContent = 'MUTE';
            heroVideo.play().catch(e => console.log('Autoplay blocked', e));
        } else {
            heroVideo.muted = true;
            muteToggle.textContent = 'UNMUTE';
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CA COPY
// ─────────────────────────────────────────────────────────────────────────────
function copyCA(element) {
    const caTextEl = element.querySelector('.ca-text');
    if (!caTextEl) return;
    const text = caTextEl.textContent;
    if (text === 'COMING SOON' || text === 'NOT YET AVAILABLE') {
        caTextEl.textContent = 'NOT YET AVAILABLE';
        setTimeout(() => caTextEl.textContent = text, 1500);
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        const orig = caTextEl.textContent;
        caTextEl.textContent = 'COPIED!';
        setTimeout(() => caTextEl.textContent = orig, 1500);
    });
}
