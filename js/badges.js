// badges.js - lightweight stub restored after folder rename
// This file initializes badge page UI only when elements exist.
(function(){
    function initBadges(){
        const downloadBtn = document.getElementById('downloadAllBtn');
        if(!downloadBtn) return;
        // simple safe handler: log and disable until real implementation added
        downloadBtn.addEventListener('click', ()=>{
            console.log('badges.js: downloadAllBtn clicked (stub)');
            // real implementation should be added here
        });
        console.log('badges.js initialized');
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initBadges);
    } else { initBadges(); }

})();
