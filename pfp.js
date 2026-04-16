const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const uploadContent = document.querySelector('.upload-content');
const generateBtn = document.getElementById('generateBtn');
const loadingStatus = document.getElementById('loadingStatus');
const statusText = document.getElementById('statusText');
const errorBox = document.getElementById('errorBox');
const resultZone = document.getElementById('resultZone');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

let base64Image = null;

// File Upload Logic
uploadZone.addEventListener('click', () => imageInput.click());

['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });
});

uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
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

// AI API Call Logic
generateBtn.addEventListener('click', async () => {
    if (!base64Image) return;

    generateBtn.disabled = true;
    loadingStatus.classList.remove('hidden');
    errorBox.classList.add('hidden');
    resultZone.classList.add('hidden');
    statusText.textContent = "Scanning Face & Assembling Bricks (Takes ~20s)...";

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to generate image.');
        }

        showResult(data.url);
    } catch (err) {
        showError(err.message);
    }
});

function showResult(imageUrl) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = "GENERATE ANOTHER";
    
    resultImage.src = imageUrl;
    
    // If the API returned a raw Base64 Data URL, we don't need the Proxy (and it would crash the query limit anyway)
    if (imageUrl.startsWith('data:')) {
        downloadBtn.href = imageUrl;
        downloadBtn.removeAttribute('target'); // Download directly
    } else {
        // Route HTTP URLs through proxy to bypass CORS
        downloadBtn.href = `/api/download?url=${encodeURIComponent(imageUrl)}`;
    }
    
    resultZone.classList.remove('hidden');
    resultZone.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    errorBox.textContent = "Error: " + msg;
    errorBox.classList.remove('hidden');
}
