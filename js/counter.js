// Counter UI: reads count from localStorage and animates on page load and increments
(function(){
    const KEY = 'sayz_download_count';
    // Candidate API bases (try in order): explicit override, local Express server, Netlify Functions
    const API_CANDIDATES = [];
    if (window.SAYZ_API_BASE) API_CANDIDATES.push(window.SAYZ_API_BASE.replace(/\/$/, ''));
    API_CANDIDATES.push('http://localhost:3000');
    API_CANDIDATES.push('/.netlify/functions');

    function readCount(){
        return parseInt(localStorage.getItem(KEY) || '0', 10) || 0;
    }

    function setCount(n){
        localStorage.setItem(KEY, String(n));
    }

    function animateNumber(el, from, to, duration=800){
        const start = performance.now();
        function tick(now){
            const t = Math.min(1, (now - start) / duration);
            const val = Math.floor(from + (to - from) * t);
            el.textContent = val.toLocaleString();
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = to.toLocaleString();
        }
        requestAnimationFrame(tick);
    }

    function bump(el){
        el.classList.remove('count-bump');
        // reflow
        void el.offsetWidth;
        el.classList.add('count-bump');
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const holder = document.getElementById('downloadCounterHolder');
        if(!holder) return;
        const countEl = document.getElementById('downloadCounter');
        const labelEl = document.getElementById('downloadCounterLabel');

        // Try to fetch global count from available APIs in order, fallback to localStorage
        (async ()=>{
            for(const base of API_CANDIDATES){
                try{
                    const url = base + (base.includes('netlify') ? '/counter' : '/api/count');
                    const res = await fetch(url, { cache: 'no-store' });
                    if(!res.ok) continue;
                    const json = await res.json();
                    const remote = parseInt(json.count || 0, 10) || 0;
                    setCount(remote);
                    animateNumber(countEl, 0, remote, 900);
                    return;
                }catch(e){ /* try next */ }
            }
            const current = readCount();
            animateNumber(countEl, 0, current, 900);
        })();

        // Listen for custom event to increment
        window.addEventListener('sayz:download', (e)=>{
            const newCount = e.detail && typeof e.detail.count === 'number' ? e.detail.count : readCount();
            (function(){
                // Candidate API bases (try in order): explicit override, production placeholder, local Express server
                const API_CANDIDATES = [];
                if (window.SAYZ_API_BASE) API_CANDIDATES.push(window.SAYZ_API_BASE.replace(/\/$/, ''));
                // If user didn't configure a base, keep a harmless placeholder first so deployers are nudged
                API_CANDIDATES.push('https://sayz-counter.example.com');
                API_CANDIDATES.push('http://localhost:3000');

                function animateNumber(el, from, to, duration=800){
                    const start = performance.now();
                    function tick(now){
                        const t = Math.min(1, (now - start) / duration);
                        const val = Math.floor(from + (to - from) * t);
                        el.textContent = val.toLocaleString();
                        if (t < 1) requestAnimationFrame(tick);
                        else el.textContent = to.toLocaleString();
                    }
                    requestAnimationFrame(tick);
                }

                function bump(el){
                    el.classList.remove('count-bump');
                    // reflow
                    void el.offsetWidth;
                    el.classList.add('count-bump');
                }

                // Helper: attempt to GET the current global count from configured APIs
                async function fetchRemoteCount(){
                    for(const base of API_CANDIDATES){
                        try{
                            const url = base + (base.includes('netlify') ? '/counter' : '/api/count');
                            const res = await fetch(url, { cache: 'no-store' });
                            if(!res.ok) continue;
                            const json = await res.json();
                            return parseInt(json.count || 0, 10) || 0;
                        }catch(e){ /* try next */ }
                    }
                    return null; // none reachable
                }

                // Helper: attempt to POST an increment and return the new count
                async function postIncrement(delta = 1){
                    for(const base of API_CANDIDATES){
                        try{
                            const url = base + (base.includes('netlify') ? '/counter' : '/api/increment');
                            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });
                            if(!r.ok) continue;
                            const json = await r.json();
                            return parseInt(json.count || 0, 10) || 0;
                        }catch(e){ /* try next */ }
                    }
                    return null; // none reachable
                }

                // Expose a global function so other modules can increment the shared counter
                window.incrementGlobalDownload = async function(){
                    try{
                        const newCount = await postIncrement(1);
                        if(typeof newCount === 'number'){
                            window.dispatchEvent(new CustomEvent('sayz:download', { detail: { count: newCount } }));
                            return newCount;
                        }
                    }catch(e){}
                    // If increment couldn't reach the server, return null to indicate failure
                    return null;
                };

                document.addEventListener('DOMContentLoaded', ()=>{
                    const holder = document.getElementById('downloadCounterHolder');
                    if(!holder) return;
                    const countEl = document.getElementById('downloadCounter');

                    // Fetch remote count and display it. If unreachable, show 0.
                    (async ()=>{
                        const remote = await fetchRemoteCount();
                        const value = (remote === null) ? 0 : remote;
                        animateNumber(countEl, 0, value, 900);
                    })();

                    // Update UI when a successful increment happens
                    window.addEventListener('sayz:download', (e)=>{
                        const newCount = e.detail && typeof e.detail.count === 'number' ? e.detail.count : null;
                        if(newCount === null) return;
                        const previous = parseInt(countEl.textContent.replace(/,/g,'')) || 0;
                        animateNumber(countEl, previous, newCount, 700);
                        bump(countEl);
                    });

                    // Count individual downloads triggered by anchor[download] with data: URLs
                    document.addEventListener('click', async (ev)=>{
                        const a = ev.target.closest && ev.target.closest('a[download]');
                        if(!a) return;
                        try {
                            const href = a.getAttribute('href') || '';
                            if (href.startsWith('data:') || href.endsWith('.png')){
                                const newCount = await postIncrement(1);
                                if(typeof newCount === 'number'){
                                    window.dispatchEvent(new CustomEvent('sayz:download', { detail: { count: newCount } }));
                                } else {
                                    console.warn('Could not reach counter API to register download.');
                                }
                            }
                        } catch (e) {}
                    });
                });
            })();
