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
    statusText.textContent = "Uploading Image...";

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to start generation.');
        }

        pollStatus(data.id);
    } catch (err) {
        showError(err.message);
    }
});

async function pollStatus(id) {
    statusText.textContent = "Assembling Bricks (Takes ~15 secs)...";
    
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`/api/status?id=${id}`);
            const data = await res.json();

            if (!res.ok) {
                clearInterval(interval);
                throw new Error(data.error || 'Failed to check status');
            }

            if (data.status === 'succeeded') {
                clearInterval(interval);
                showResult(data.output[0] || data.output);
            } else if (data.status === 'failed' || data.status === 'canceled') {
                clearInterval(interval);
                throw new Error("Generation " + data.status);
            }
            // If processing, do nothing and wait for next poll
        } catch (err) {
            clearInterval(interval);
            showError(err.message);
        }
    }, 2500);
}

function showResult(imageUrl) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = "GENERATE ANOTHER";
    
    resultImage.src = imageUrl;
    downloadBtn.href = imageUrl;
    
    resultZone.classList.remove('hidden');
    resultZone.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    loadingStatus.classList.add('hidden');
    generateBtn.disabled = false;
    errorBox.textContent = "Error: " + msg;
    errorBox.classList.remove('hidden');
}
