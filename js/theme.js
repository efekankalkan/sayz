// Theme Management (Dark/Light Mode)
(function() {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
})();

// Language Management (TR/EN)
(function() {
    // Translations
    const translations = {
        tr: {
            rights: 'Tüm hakları saklıdır.',
            'Yayıncılar İçin': 'Yayıncılar İçin',
            'Ana Sayfa': 'Ana Sayfa',
            'Görsellerinizi Platformlara Hazırlayın': 'Görsellerinizi Platformlara Hazırlayın',
            'iOS, Android, macOS ve Sosyal Medya için tek tıkla otomatik boyutlandırma.': 'iOS, Android, macOS ve Sosyal Medya için tek tıkla otomatik boyutlandırma.',
            'Görseli buraya sürükleyin': 'Görseli buraya sürükleyin',
            'veya seçmek için tıklayın': 'veya seçmek için tıklayın',
            'Hepsini İndir (ZIP)': 'Hepsini İndir (ZIP)',
            'Hazırlanıyor...': 'Hazırlanıyor...',
            'Tümü': 'Tümü',
            'Rozet ve Emote Oluşturun': 'Rozet ve Emote Oluşturun',
            'Yayıncılar için rozet ve emote\'larınızı tek tıkla oluşturun ve topluca indirin.': 'Yayıncılar için rozet ve emote\'larınızı tek tıkla oluşturun ve topluca indirin.',
            'Abone Rozet': 'Abone Rozet',
            'Emote': 'Emote'
        },
        en: {
            rights: 'All rights reserved.',
            'Yayıncılar İçin': 'For Streamers',
            'Ana Sayfa': 'Home',
            'Görsellerinizi Platformlara Hazırlayın': 'Prepare Your Images for Platforms',
            'iOS, Android, macOS ve Sosyal Medya için tek tıkla otomatik boyutlandırma.': 'One-click automatic resizing for iOS, Android, macOS and Social Media.',
            'Görseli buraya sürükleyin': 'Drag your image here',
            'veya seçmek için tıklayın': 'or click to select',
            'Hepsini İndir (ZIP)': 'Download All (ZIP)',
            'Hazırlanıyor...': 'Preparing...',
            'Tümü': 'All',
            'Rozet ve Emote Oluşturun': 'Create Badges and Emotes',
            'Yayıncılar için rozet ve emote\'larınızı tek tıkla oluşturun ve topluca indirin.': 'Create and download your badges and emotes for streamers with one click.',
            'Abone Rozet': 'Subscriber Badge',
            'Emote': 'Emote'
        }
    };
    
    // Get current language from localStorage or default to English
    let currentLang = localStorage.getItem('language') || 'en';
    
    // Update language display
    function updateLanguageDisplay() {
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.textContent = currentLang.toUpperCase();
        }
    }
    
    // Translate page
    function translatePage(lang) {
        document.documentElement.lang = lang;
        
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        // Translate elements that don't use data-i18n by matching current visible text.
        // Build mapping pairs from the translation table so we can replace either direction.
        Object.keys(translations.tr).forEach(key => {
            const trText = translations.tr[key] || key;
            const enText = (translations.en && translations.en[key]) || trText;

            let sourceText, targetText;
            if (lang === 'en') {
                sourceText = trText;
                targetText = enText;
            } else {
                sourceText = enText;
                targetText = trText;
            }

            // Find elements that exactly match the sourceText and replace their text
            const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                if (el.hasAttribute('data-i18n') || el.hasAttribute('data-no-translate')) return false;
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
                if (el.childElementCount > 0) return false; // skip containers
                return el.textContent.trim() === sourceText;
            });

            elements.forEach(el => {
                el.textContent = targetText;
            });
        });
    }
    
    // Language toggle dropdown
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langToggle && langDropdown) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.add('hidden');
            }
        });
        
        // Language option clicks
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedLang = option.getAttribute('data-lang');
                currentLang = selectedLang;
                localStorage.setItem('language', selectedLang);
                updateLanguageDisplay();
                translatePage(selectedLang);
                langDropdown.classList.add('hidden');
            });
        });
    }
    
    // Initialize
    updateLanguageDisplay();
    translatePage(currentLang);
})();

