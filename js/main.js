// --- Yapılandırma ---
// Platform boyut tanımları
const presets = [
    // iOS (App Store)
    { id: 'ios_icon', name: 'App Icon', group: 'ios', w: 1024, h: 1024, icon: 'fa-apple' },
    { id: 'ios_iphone_65', name: 'iPhone 6.5" Display', group: 'ios', w: 1242, h: 2688, icon: 'fa-mobile-screen' },
    { id: 'ios_iphone_55', name: 'iPhone 5.5" Display', group: 'ios', w: 1242, h: 2208, icon: 'fa-mobile-screen' },
    { id: 'ios_ipad_pro', name: 'iPad Pro 12.9"', group: 'ios', w: 2048, h: 2732, icon: 'fa-tablet-screen-button' },
    
    // macOS (Güncel Squircle Formu)
    { id: 'macos_icon_1024', name: 'macOS App Icon (L)', group: 'macos', w: 1024, h: 1024, icon: 'fa-laptop' },
    { id: 'macos_icon_512', name: 'macOS App Icon (M)', group: 'macos', w: 512, h: 512, icon: 'fa-laptop' },
    { id: 'macos_icon_256', name: 'macOS App Icon (S)', group: 'macos', w: 256, h: 256, icon: 'fa-laptop' },

    // Android (Google Play)
    { id: 'android_icon', name: 'Play Store Icon', group: 'android', w: 512, h: 512, icon: 'fa-google-play' },
    { id: 'android_feature', name: 'Feature Graphic', group: 'android', w: 1024, h: 500, icon: 'fa-image' },
    { id: 'android_phone', name: 'Phone Screenshot', group: 'android', w: 1080, h: 1920, icon: 'fa-mobile-android' },
    { id: 'android_tablet', name: 'Tablet 10"', group: 'android', w: 1920, h: 1200, icon: 'fa-tablet-android' },

    // Social Media
    { id: 'social_insta_sq', name: 'Instagram Kare', group: 'social', w: 1080, h: 1080, icon: 'fa-instagram' },
    { id: 'social_insta_story', name: 'Instagram Story', group: 'social', w: 1080, h: 1920, icon: 'fa-instagram' },
    { id: 'social_yt_thumb', name: 'YouTube Thumbnail', group: 'social', w: 1280, h: 720, icon: 'fa-youtube' }, 
    { id: 'social_twitter_header', name: 'Twitter Header', group: 'social', w: 1500, h: 500, icon: 'fa-twitter' },
    { id: 'generic_16_9', name: 'Genel 16:9', group: 'social', w: 1920, h: 1080, icon: 'fa-display' }
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
const filterButtons = document.querySelectorAll('.filter-btn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

let originalImgObject = null;
let generatedBlobs = {}; // İndirme için blob'ları saklayacağız

// --- Event Listeners ---

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

// Filtreleme
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI Güncelleme
        filterButtons.forEach(b => {
            b.classList.remove('bg-black', 'text-white');
            b.classList.add('text-gray-600', 'hover:bg-gray-100');
        });
        btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
        btn.classList.add('bg-black', 'text-white');

        // Grid Filtreleme
        const filterValue = btn.getAttribute('data-filter');
        filterGrid(filterValue);
    });
});

// ZIP İndir
downloadAllBtn.addEventListener('click', downloadZip);

// Mobil Menü Toggle
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

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

    presets.forEach(preset => {
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

        // Blob oluştur ve sakla (PNG)
        canvas.toBlob((blob) => {
            generatedBlobs[preset.id] = blob;
            
            // Önizleme Kartı Oluştur (DOM) - PNG data URL
            const card = createCard(preset, canvas.toDataURL('image/png'));
            gridContainer.appendChild(card);
        }, 'image/png');
    });
}

function createCard(preset, dataUrl) {
    const div = document.createElement('div');
    div.className = `group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 preset-card flex flex-col`;
    div.setAttribute('data-group', preset.group);

    // macOS ikonları için özel maskeleme sınıfı ekle
    const imgClass = preset.group === 'macos' 
        ? 'macos-squircle max-w-[85%] max-h-[85%] object-cover' 
        : 'max-w-full max-h-full object-contain shadow-sm rounded-sm';

    div.innerHTML = `
        <div class="absolute top-3 left-3 z-10">
            <span class="bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                <i class="fa-brands ${preset.icon} mr-1"></i> ${preset.group}
            </span>
        </div>
        
        <div class="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-4 group-hover:bg-gray-100 transition-colors">
             <img src="${dataUrl}" class="${imgClass} transition-transform duration-500 group-hover:scale-105">
        </div>
        
        <div class="p-4 flex justify-between items-center border-t border-gray-100">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">${preset.name}</h3>
                <p class="text-xs text-gray-400 mt-0.5">${preset.w} x ${preset.h}</p>
            </div>
            <a href="${dataUrl}" download="${preset.name.replace(/\s+/g, '_')}.png" class="text-gray-400 hover:text-black transition-colors" title="İndir">
                <i class="fa-solid fa-download text-lg"></i>
            </a>
        </div>
    `;
    return div;
}

function filterGrid(filter) {
    const cards = document.querySelectorAll('.preset-card');
    cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-group') === filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
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
    
    // Klasör yapısı oluştur
    const iosFolder = zip.folder("iOS");
    const macosFolder = zip.folder("macOS"); // Yeni klasör
    const androidFolder = zip.folder("Android");
    const socialFolder = zip.folder("Social_Media");

    presets.forEach(preset => {
        const blob = generatedBlobs[preset.id];
        if (blob) {
            const fileName = `${preset.name.replace(/\s+/g, '_')}_${preset.w}x${preset.h}.png`;
            
            if (preset.group === 'ios') {
                iosFolder.file(fileName, blob);
            } else if (preset.group === 'macos') {
                macosFolder.file(fileName, blob);
            } else if (preset.group === 'android') {
                androidFolder.file(fileName, blob);
            } else {
                socialFolder.file(fileName, blob);
            }
        }
    });

    try {
        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, "Sayz_Assets.zip");
        // Register this download with the global JSON API (no local fallback)
        try {
            if (typeof window.incrementGlobalDownload === 'function') {
                const newCount = await window.incrementGlobalDownload();
                if (typeof newCount === 'number') {
                    // successful server-side increment -> UI update is emitted by incrementGlobalDownload
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
