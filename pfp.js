const uploadZone    = document.getElementById('uploadZone');
const imageInput    = document.getElementById('imageInput');
const imagePreview  = document.getElementById('imagePreview');
const uploadContent = document.querySelector('.upload-content');
const generateBtn   = document.getElementById('generateBtn');
const loadingStatus = document.getElementById('loadingStatus');
const statusText    = document.getElementById('statusText');
const errorBox      = document.getElementById('errorBox');
const resultZone    = document.getElementById('resultZone');
const resultImage   = document.getElementById('resultImage');
const downloadBtn   = document.getElementById('downloadBtn');
const shareXBtn     = document.getElementById('shareXBtn');
const shareHint     = document.getElementById('shareHint');
const bgPresets     = document.getElementById('bgPresets');
const customBgInput = document.getElementById('customBgInput');

let base64Image = null;
let selectedBg  = 'clean white studio background'; // default

// ── Background Chip Logic ─────────────────────────────────────────────────────
bgPresets.addEventListener('click', e => {
    const chip = e.target.closest('.bg-chip');
    if (!chip) return;
    bgPresets.querySelectorAll('.bg-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    if (chip.dataset.bg === 'custom') {
        customBgInput.classList.remove('hidden');
        customBgInput.focus();
        selectedBg = customBgInput.value || 'colourful abstract background';
    } else {
        customBgInput.classList.add('hidden');
        selectedBg = chip.dataset.bg;
    }
});

customBgInput.addEventListener('input', () => {
    selectedBg = customBgInput.value.trim() || 'colourful abstract background';
});

// ── Drag & Drop ───────────────────────────────────────────────────────────────
uploadZone.addEventListener('click', () => imageInput.click());

uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); });
uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
});

imageInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
    // Warn if file is too large (>4MB will inflate to ~5.5MB base64 and may hit limits)
    if (file.size > 4 * 1024 * 1024) {
        showError('Image is too large. Please use a photo under 4MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        base64Image = e.target.result;
        imagePreview.src = base64Image;
        imagePreview.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        generateBtn.disabled = false;
        resultZone.classList.add('hidden');
        errorBox.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// ── Generate ──────────────────────────────────────────────────────────────────
generateBtn.addEventListener('click', async () => {
    if (!base64Image) return;

    generateBtn.disabled = true;
    loadingStatus.classList.remove('hidden');
    errorBox.classList.add('hidden');
    resultZone.classList.add('hidden');
    statusText.textContent = '🔍 Scanning face... (~20s total)';

    try {
        // Timeout guard — Vercel max is 60s
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);

        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, background: selectedBg }),
            signal: controller.signal
        });
        clearTimeout(timeout);

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Something went wrong on the server.');
        }

        if (!data.url) {
            throw new Error('Server returned no image URL.');
        }

        statusText.textContent = '🧱 Assembling bricks...';
        showResult(data.url);

    } catch (err) {
        if (err.name === 'AbortError') {
            showError('Request timed out. The image may be too large. Try a smaller photo.');
        } else {
            showError(err.message);
        }
    }
});

// ── Result ────────────────────────────────────────────────────────────────────
function showResult(imageUrl) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = '🔄 GENERATE ANOTHER';

    resultImage.src = imageUrl;

    // Download
    if (imageUrl.startsWith('data:')) {
        downloadBtn.href = imageUrl;
        downloadBtn.download = 'bricks_pfp.png';
    } else {
        downloadBtn.href = `/api/download?url=${encodeURIComponent(imageUrl)}`;
        downloadBtn.download = 'bricks_pfp.png';
    }

    // Share to X
    shareXBtn.onclick = async () => {
        const tweetText = encodeURIComponent('Just turned myself into a LEGO minifigure 🧱🔥 @buildonbricks #BRICKS');
        const tweetUrl  = encodeURIComponent('https://www.bricksonsol.xyz/pfp.html');

        // Try native share (works on iOS/Android — can attach image directly)
        if (navigator.canShare && navigator.share) {
            try {
                // Convert data URL to File for native share
                const res   = await fetch(imageUrl);
                const blob  = await res.blob();
                const file  = new File([blob], 'bricks_pfp.png', { type: blob.type });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        text: 'Just turned myself into a LEGO minifigure 🧱🔥 @buildonbricks #BRICKS',
                        url: 'https://www.bricksonsol.xyz/pfp.html'
                    });
                    return;
                }
            } catch (e) {
                // Fallback to Twitter web intent below
            }
        }

        // Desktop fallback — open Twitter intent, prompt to attach image
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
        // Show the hint about attaching the image
        shareHint.classList.remove('hidden');
        setTimeout(() => shareHint.classList.add('hidden'), 6000);
    };

    resultZone.classList.remove('hidden');
    resultZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Error ─────────────────────────────────────────────────────────────────────
function showError(msg) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    errorBox.textContent = 'Error: ' + msg;
    errorBox.classList.remove('hidden');
}
