// --- Yapılandırma ---
// Abone Rozet boyutları (18x18, 36x36, 72x72)
const twitchBadgePresets = [
    { id: 'twitch_18', name: 'Abone Rozet (Küçük)', name_en: 'Subscriber Badge (Small)', w: 18, h: 18, icon: 'fa-award' },
    { id: 'twitch_36', name: 'Abone Rozet (Orta)', name_en: 'Subscriber Badge (Medium)', w: 36, h: 36, icon: 'fa-award' },
    { id: 'twitch_72', name: 'Abone Rozet (Büyük)', name_en: 'Subscriber Badge (Large)', w: 72, h: 72, icon: 'fa-award' }
];

// Emote boyutları (28x28, 56x56, 112x112)
const emoteBadgePresets = [
    { id: 'emote_28', name: 'Emote (Küçük)', name_en: 'Emote (Small)', w: 28, h: 28, icon: 'fa-face-smile' },
    { id: 'emote_56', name: 'Emote (Orta)', name_en: 'Emote (Medium)', w: 56, h: 56, icon: 'fa-face-smile' },
    { id: 'emote_112', name: 'Emote (Büyük)', name_en: 'Emote (Large)', w: 112, h: 112, icon: 'fa-face-smile' }
];

// --- DOM Elemanları ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const dropContent = document.getElementById('dropContent');
const previewContainer = document.getElementById('previewContainer');
const sourceImage = document.getElementById('sourceImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const outputSection = document.getElementById('outputSection');
const gridContainer = document.getElementById('gridContainer');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const twitchBadgeBtn = document.getElementById('twitchBadgeBtn');
const emoteBadgeBtn = document.getElementById('emoteBadgeBtn');

let originalImgObject = null;
let generatedBlobs = {}; // İndirme için blob'ları saklayacağız
let currentBadgeType = 'twitch'; // 'twitch' veya 'emote'
let currentPresets = twitchBadgePresets;

// --- Event Listeners ---

// Badge Tipi Değiştirme
twitchBadgeBtn.addEventListener('click', () => {
    currentBadgeType = 'twitch';
    currentPresets = twitchBadgePresets;
    updateBadgeTypeUI();
    if (originalImgObject) {
        processPresets();
    }
});

emoteBadgeBtn.addEventListener('click', () => {
    currentBadgeType = 'emote';
    currentPresets = emoteBadgePresets;
    updateBadgeTypeUI();
    if (originalImgObject) {
        processPresets();
    }
});

function updateBadgeTypeUI() {
    if (currentBadgeType === 'twitch') {
        twitchBadgeBtn.classList.remove('text-gray-600', 'hover:bg-gray-100');
        twitchBadgeBtn.classList.add('bg-black', 'text-white');
        emoteBadgeBtn.classList.remove('bg-black', 'text-white');
        emoteBadgeBtn.classList.add('text-gray-600', 'hover:bg-gray-100');
    } else {
        emoteBadgeBtn.classList.remove('text-gray-600', 'hover:bg-gray-100');
        emoteBadgeBtn.classList.add('bg-black', 'text-white');
        twitchBadgeBtn.classList.remove('bg-black', 'text-white');
        twitchBadgeBtn.classList.add('text-gray-600', 'hover:bg-gray-100');
    }
}

// Drag & Drop Efektleri
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('active');
}

function unhighlight(e) {
    dropZone.classList.remove('active');
}

// Dosya Seçimi
dropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles, false);

// Resmi Kaldır
removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Dropzone tetiğini engelle
    resetApp();
});

// ZIP İndir
downloadAllBtn.addEventListener('click', downloadZip);

// --- Fonksiyonlar ---

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files: files } });
}

function handleFiles(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sourceImage.src = e.target.result;
            
            // Görsel yüklendiğinde işlemleri başlat
            originalImgObject = new Image();
            originalImgObject.onload = function() {
                showPreview();
                processPresets();
            }
            originalImgObject.src = e.target.result;
        }
        reader.readAsDataURL(file);
    } else {
        alert('Lütfen geçerli bir görsel dosyası (JPG, PNG, WEBP) yükleyin.');
    }
}

function showPreview() {
    dropContent.classList.add('opacity-0');
    setTimeout(() => {
        dropContent.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        outputSection.classList.remove('hidden');
        outputSection.classList.remove('opacity-0');
        outputSection.classList.add('opacity-100');
    }, 300);
}

function resetApp() {
    fileInput.value = '';
    originalImgObject = null;
    generatedBlobs = {};
    
    previewContainer.classList.add('hidden');
    dropContent.classList.remove('hidden');
    dropContent.classList.remove('opacity-0');
    
    outputSection.classList.add('opacity-0');
    outputSection.classList.add('hidden');
    
    // Grid temizle
    gridContainer.innerHTML = '';
}

// Ana İşlem Fonksiyonu: Canvas üzerinde resize ve crop
function processPresets() {
    gridContainer.innerHTML = ''; // Temizle
    generatedBlobs = {}; // Reset

    currentPresets.forEach(preset => {
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        canvas.width = preset.w;
        canvas.height = preset.h;
        const ctx = canvas.getContext('2d');

        // Smart Crop (Object-fit: Cover mantığı)
        const scale = Math.max(canvas.width / originalImgObject.width, canvas.height / originalImgObject.height);
        const x = (canvas.width / 2) - (originalImgObject.width / 2) * scale;
        const y = (canvas.height / 2) - (originalImgObject.height / 2) * scale;
        
        // Yüksek kalite çizim ayarları
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Çizim
        ctx.drawImage(originalImgObject, x, y, originalImgObject.width * scale, originalImgObject.height * scale);

        // Blob oluştur ve sakla
        canvas.toBlob((blob) => {
            generatedBlobs[preset.id] = blob;
            
            // Önizleme Kartı Oluştur (DOM)
            const card = createCard(preset, canvas.toDataURL('image/png', 1.0));
            gridContainer.appendChild(card);
        }, 'image/png', 1.0);
    });
}

function createCard(preset, dataUrl) {
    const div = document.createElement('div');
    div.className = `group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 preset-card flex flex-col`;

    div.innerHTML = `
        <div class="absolute top-3 left-3 z-10">
            <span class="bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                <i class="${preset.icon === 'fa-award' ? 'fa-solid fa-award' : 'fa-solid fa-face-smile'} mr-1"></i> ${currentBadgeType === 'twitch' ? 'Abone Rozeti' : 'Emote'}
            </span>
        </div>
        
        <div class="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-4 group-hover:bg-gray-100 transition-colors">
             <img src="${dataUrl}" class="max-w-full max-h-full object-contain shadow-sm rounded-sm transition-transform duration-500 group-hover:scale-105">
        </div>
        
        <div class="p-4 flex justify-between items-center border-t border-gray-100">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">${preset.name}</h3>
                <p class="text-xs text-gray-400 mt-0.5">${preset.w} x ${preset.h}</p>
            </div>
            <a href="${dataUrl}" download="${(preset.name_en || preset.name).replace(/\s+/g, '_')}.png" class="text-gray-400 hover:text-black transition-colors" title="İndir" data-no-translate>
                <i class="fa-solid fa-download text-lg"></i>
            </a>
        </div>
    `;
    return div;
}

async function downloadZip() {
    if (Object.keys(generatedBlobs).length === 0) return;

    const btn = document.getElementById('downloadAllBtn');
    const txt = document.getElementById('downloadText');
    const spinner = document.getElementById('downloadSpinner');
    const icon = btn.querySelector('.fa-file-zipper');

    // Loading state
    txt.innerText = "Hazırlanıyor...";
    icon.classList.add('hidden');
    spinner.classList.remove('hidden');
    btn.disabled = true;

    const zip = new JSZip();
    
    // Klasör adı
    const folderName = currentBadgeType === 'twitch' ? 'Subscriber_Badges' : 'Emotes';
    const badgeFolder = zip.folder(folderName);

    currentPresets.forEach(preset => {
        const blob = generatedBlobs[preset.id];
        if (blob) {
            const fileName = `${(preset.name_en || preset.name).replace(/\s+/g, '_')}_${preset.w}x${preset.h}.png`;
            badgeFolder.file(fileName, blob);
        }
    });

    try {
        const content = await zip.generateAsync({type:"blob"});
        const zipFileName = currentBadgeType === 'twitch' ? 'Subscriber_Badges.zip' : 'Emotes.zip';
        saveAs(content, zipFileName);
        // Register this ZIP download with the global JSON API (no local fallback)
        try {
            if (typeof window.incrementGlobalDownload === 'function') {
                const newCount = await window.incrementGlobalDownload();
                if (typeof newCount === 'number') {
                    // UI update is emitted by incrementGlobalDownload
                } else {
                    console.warn('Global counter increment failed; server not reachable.');
                }
            } else {
                console.warn('incrementGlobalDownload not available on window.');
            }
        } catch (e) {
            console.warn('Error while incrementing global counter:', e);
        }
    } catch (err) {
        alert("Zip oluşturulurken bir hata oluştu: " + err);
    } finally {
        // Reset state
        setTimeout(() => {
            txt.innerText = "Hepsini İndir (ZIP)";
            icon.classList.remove('hidden');
            spinner.classList.add('hidden');
            btn.disabled = false;
        }, 1000);
    }
}


