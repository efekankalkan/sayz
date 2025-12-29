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
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

// İndirme Dropdown
const downloadContainer = document.getElementById('downloadContainer');
const downloadDropdownBtn = document.getElementById('downloadDropdownBtn');
const downloadDropdownMenu = document.getElementById('downloadDropdownMenu');
const downloadOptions = document.querySelectorAll('.download-option');

let originalImgObject = null;

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
            b.classList.remove('active', 'bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
            b.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-[#303134]');
        });
        btn.classList.add('active', 'bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        btn.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-[#303134]');

        // Grid Filtreleme
        const filterValue = btn.getAttribute('data-filter');
        filterGrid(filterValue);
    });
});

// İndirme Dropdown Toggle
downloadDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadDropdownMenu.classList.toggle('hidden');
});

// Dışarı tıklayınca menüyü kapat
window.addEventListener('click', (e) => {
    if (!downloadContainer.contains(e.target)) {
        downloadDropdownMenu.classList.add('hidden');
    }
});

// İndirme seçenekleri
downloadOptions.forEach(option => {
    option.addEventListener('click', () => {
        const format = option.getAttribute('data-format');
        downloadDropdownMenu.classList.add('hidden');
        downloadAll(format);
    });
});


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
    
    previewContainer.classList.add('hidden');
    dropContent.classList.remove('hidden');
    dropContent.classList.remove('opacity-0');
    
    outputSection.classList.add('opacity-0');
    outputSection.classList.add('hidden');
    
    // Grid temizle
    gridContainer.innerHTML = '';
}

// Ana İşlem Fonksiyonu: Canvas üzerinde resize ve crop (sadece önizleme için)
function processPresets() {
    gridContainer.innerHTML = ''; // Temizle

    presets.forEach(preset => {
        const canvas = document.createElement('canvas');
        canvas.width = preset.w;
        canvas.height = preset.h;
        const ctx = canvas.getContext('2d');

        const scale = Math.max(canvas.width / originalImgObject.width, canvas.height / originalImgObject.height);
        const x = (canvas.width / 2) - (originalImgObject.width / 2) * scale;
        const y = (canvas.height / 2) - (originalImgObject.height / 2) * scale;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Arka planı beyaz yap (JPEG için önemli)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(originalImgObject, x, y, originalImgObject.width * scale, originalImgObject.height * scale);

        // Önizleme Kartı Oluştur (DOM) - PNG data URL
        const card = createCard(preset, canvas.toDataURL('image/png'));
        gridContainer.appendChild(card);
    });
}

function createCard(preset, dataUrl) {
    const div = document.createElement('div');
    div.className = `group relative bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 preset-card flex flex-col`;
    div.setAttribute('data-group', preset.group);

    const imgClass = preset.group === 'macos' 
        ? 'macos-squircle max-w-[85%] max-h-[85%] object-cover' 
        : 'max-w-full max-h-full object-contain shadow-sm rounded-sm';

    div.innerHTML = `
        <div class="absolute top-3 left-3 z-10">
            <span class="bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                <i class="fa-brands ${preset.icon} mr-1"></i> ${preset.group}
            </span>
        </div>
        
        <div class="relative w-full aspect-square bg-gray-50 dark:bg-[#303134] flex items-center justify-center overflow-hidden p-4 group-hover:bg-gray-100 dark:hover:bg-[#3c4043] transition-colors">
             <img src="${dataUrl}" class="${imgClass} transition-transform duration-500 group-hover:scale-105">
        </div>
        
        <div class="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-600">
            <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-200">${preset.name}</h3>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">${preset.w} x ${preset.h}</p>
            </div>
            <a href="${dataUrl}" download="${preset.name.replace(/\s+/g, '_')}.png" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="İndir">
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

// Yeni Genel İndirme Fonksiyonu
async function downloadAll(format = 'png') {
    if (!originalImgObject) return;

    const btn = downloadDropdownBtn;
    const txt = document.getElementById('downloadText');
    const spinner = document.getElementById('downloadSpinner');
    const icon = btn.querySelector('.fa-chevron-down');

    // Loading state
    txt.innerText = "Hazırlanıyor...";
    icon.classList.add('hidden');
    spinner.classList.remove('hidden');
    btn.disabled = true;

    const zip = new JSZip();
    const mimeType = `image/${format}`;
    const fileExtension = format === 'jpeg' ? 'jpg' : format;

    // Klasör yapısı oluştur
    const folders = {
        ios: zip.folder("iOS"),
        macos: zip.folder("macOS"),
        android: zip.folder("Android"),
        social: zip.folder("Social_Media")
    };

    const blobPromises = presets.map(preset => {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            canvas.width = preset.w;
            canvas.height = preset.h;
            const ctx = canvas.getContext('2d');

            const scale = Math.max(canvas.width / originalImgObject.width, canvas.height / originalImgObject.height);
            const x = (canvas.width / 2) - (originalImgObject.width / 2) * scale;
            const y = (canvas.height / 2) - (originalImgObject.height / 2) * scale;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // JPEG için arka planı doldur
            if (format === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(originalImgObject, x, y, originalImgObject.width * scale, originalImgObject.height * scale);

            canvas.toBlob(blob => {
                const fileName = `${preset.name.replace(/\s+/g, '_')}_${preset.w}x${preset.h}.${fileExtension}`;
                const folder = folders[preset.group] || folders.social;
                folder.file(fileName, blob);
                resolve();
            }, mimeType, 0.95); // Kalite ayarı (JPEG için)
        });
    });

    try {
        await Promise.all(blobPromises);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Sayz_Assets_${format.toUpperCase()}.zip`);
        
        // Global sayaç (varsa)
        if (typeof window.incrementGlobalDownload === 'function') {
            window.incrementGlobalDownload().catch(e => console.warn('Global counter error:', e));
        }

    } catch (err) {
        alert(`Zip oluşturulurken bir hata oluştu: ${err}`);
    } finally {
        // Reset state
        setTimeout(() => {
            txt.innerText = "Hepsini İndir";
            icon.classList.remove('hidden');
            spinner.classList.add('hidden');
            btn.disabled = false;
        }, 1000);
    }
}
