// Counter UI: reads count from localStorage and animates on page load and increments
(function(){
    const KEY = 'sayz_download_count';
    // Default to Netlify Functions base; override with window.SAYZ_API_BASE if needed
    const API_BASE = window.SAYZ_API_BASE || '/.netlify/functions';

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

        // Try to fetch global count from API, fallback to localStorage
        (async ()=>{
            try{
                const res = await fetch(`${API_BASE}/counter`);
                if(res.ok){
                    const json = await res.json();
                    const remote = parseInt(json.count || 0, 10) || 0;
                    setCount(remote);
                    animateNumber(countEl, 0, remote, 900);
                    return;
                }
            }catch(e){/* ignore */}
            const current = readCount();
            animateNumber(countEl, 0, current, 900);
        })();

        // Listen for custom event to increment
        window.addEventListener('sayz:download', (e)=>{
            const newCount = e.detail && typeof e.detail.count === 'number' ? e.detail.count : readCount();
            // bump animation and quick number increase
            const previous = parseInt(countEl.textContent.replace(/,/g,'')) || 0;
            animateNumber(countEl, previous, newCount, 700);
            bump(countEl);
        });

        // Listen to storage events (other tabs)
        window.addEventListener('storage', (e)=>{
            if(e.key === KEY){
                const val = parseInt(e.newValue || '0',10) || 0;
                animateNumber(countEl, parseInt(countEl.textContent.replace(/,/g,'')) || 0, val, 700);
                bump(countEl);
            }
        });

        // Count individual downloads triggered by anchor[download] with data: URLs
        document.addEventListener('click', async (ev)=>{
            const a = ev.target.closest && ev.target.closest('a[download]');
            if(!a) return;
            try {
                const href = a.getAttribute('href') || '';
                if (href.startsWith('data:') || href.endsWith('.png')){
                    // increment remote counter (best-effort)
                    try{
                        const res = await fetch(`${API_BASE}/counter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: 1 }) });
                        if(res.ok){
                            const json = await res.json();
                            setCount(json.count);
                            window.dispatchEvent(new CustomEvent('sayz:download', { detail: { count: json.count } }));
                            return;
                        }
                    }catch(e){/* ignore network errors */}

                    // fallback to local increment
                    const prev = readCount();
                    const next = prev + 1;
                    setCount(next);
                    window.dispatchEvent(new CustomEvent('sayz:download', { detail: { count: next } }));
                }
            } catch (e) {}
        });
    });
})();
