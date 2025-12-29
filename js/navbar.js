// Shared navbar injection
(function(){
    const inYay = location.pathname.includes('/streamer');
    const yayHref = inYay ? './' : 'streamer/';
    const homeHref = inYay ? '../' : './';

    const navHTML = `
    <nav class="border-b border-gray-200 dark:border-gray-700 py-4 sticky top-0 bg-white/90 dark:bg-[#202124]/90 backdrop-blur-sm z-50">
        <div class="container mx-auto px-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <svg class="w-6 h-6 dark:text-white" viewBox="0 0 197.71 255.15" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <polygon points="43.94 116.59 109.13 51.4 121.48 63.74 138.56 0 74.82 17.08 87.16 29.43 0 116.59 65.9 182.5 131.81 116.59 153.78 138.56 88.58 203.76 76.23 191.41 59.15 255.15 122.89 238.07 110.55 225.73 197.71 138.56 131.81 72.66 65.9 138.56 43.94 116.59"/>
                </svg>
                <a href="${homeHref}" class="text-xl font-semibold tracking-tight hover:text-gray-600 dark:hover:text-gray-300 dark:text-white transition-colors">Sayz</a>
            </div>

            <div class="hidden md:flex items-center gap-4">
                <a href="${yayHref}" class="nav-link text-sm font-medium px-4 py-2 rounded-lg transition-colors">Yayıncılar İçin</a>
                <div class="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
                <a href="https://kick.com/efekankalkan" target="_blank" class="nav-link text-sm font-medium px-4 py-2 rounded-lg transition-colors">@efekankalkan</a>
            </div>

            <div class="md:hidden flex items-center">
                <button id="mobileMenuButton" class="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
            </div>
        </div>

        <div id="mobileMenu" class="hidden md:hidden bg-white dark:bg-[#202124] mt-4">
            <a href="${yayHref}" class="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 transition-colors">Yayıncılar İçin</a>
            <a href="https://kick.com/efekankalkan" target="_blank" class="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 transition-colors">@efekankalkan</a>
        </div>
    </nav>
    `;

    const container = document.getElementById('site-navbar');
    if(!container) return;
    container.innerHTML = navHTML;

    // Active state: highlight correct link
    const navLinks = container.querySelectorAll('.nav-link');
    if(inYay){
        navLinks.forEach(a=>{ if(a.textContent.trim().includes('Yayıncı')) a.classList.add('active'); });
    }

    // Mobile menu toggle
    const mobileBtn = container.querySelector('#mobileMenuButton');
    const mobileMenu = container.querySelector('#mobileMenu');
    if(mobileBtn && mobileMenu){
        mobileBtn.addEventListener('click', ()=>{
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Add click handler to set active class on click (visual only)
    container.addEventListener('click', (e)=>{
        const link = e.target.closest('.nav-link');
        if(!link) return;
        navLinks.forEach(a=>a.classList.remove('active'));
        link.classList.add('active');
    });

})();
