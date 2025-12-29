// Remote counter: reads/increments from a JSON API and updates the UI (no localStorage fallback)
(function(){
    const API_CANDIDATES = [];
    if (window.SAYZ_API_BASE) API_CANDIDATES.push(window.SAYZ_API_BASE.replace(/\/$/, ''));
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
        void el.offsetWidth;
        el.classList.add('count-bump');
    }

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
        return null;
    }

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
        return null;
    }

    window.incrementGlobalDownload = async function(){
        try{
            const newCount = await postIncrement(1);
            if(typeof newCount === 'number'){
                window.dispatchEvent(new CustomEvent('sayz:download', { detail: { count: newCount } }));
                return newCount;
            }
        }catch(e){}
        return null;
    };

    document.addEventListener('DOMContentLoaded', ()=>{
        const holder = document.getElementById('downloadCounterHolder');
        if(!holder) return;
        const countEl = document.getElementById('downloadCounter');

        (async ()=>{
            const remote = await fetchRemoteCount();
            const value = (remote === null) ? 0 : remote;
            animateNumber(countEl, 0, value, 900);
        })();

        window.addEventListener('sayz:download', (e)=>{
            const newCount = e.detail && typeof e.detail.count === 'number' ? e.detail.count : null;
            if(newCount === null) return;
            const previous = parseInt(countEl.textContent.replace(/,/g,'')) || 0;
            animateNumber(countEl, previous, newCount, 700);
            bump(countEl);
        });

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
