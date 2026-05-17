const routes = {
    'dashboard': { url: 'pages/dashboard.html', init: 'initDashboard' },
    'cases': { url: 'pages/cases.html', init: 'initCases' },
    'hearings': { url: 'pages/hearings.html', init: 'initHearings' },
    'verdicts': { url: 'pages/verdicts.html', init: 'initVerdicts' },
    'judges': { url: 'pages/judges.html', init: 'initJudges' },
    'lawyers': { url: 'pages/lawyers.html', init: 'initLawyers' },
    'parties': { url: 'pages/parties.html', init: 'initParties' },
    'courtrooms': { url: 'pages/courtrooms.html', init: 'initCourtrooms' },
    'courtroom3d': { url: 'pages/courtroom3d.html', init: 'initCourtroom3D' },
    'evidence': { url: 'pages/evidence.html', init: 'initEvidence' },
    'settings': { url: 'pages/settings.html', init: 'initSettings' }
};

const initRouter = () => {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Load initial route
};

window.navigateTo = (page) => {
    window.location.hash = page;
};

const handleRoute = async () => {
    let hash = window.location.hash.slice(1) || 'dashboard';
    
    if (!routes[hash]) {
        hash = 'dashboard';
        window.location.hash = hash;
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-path') === hash) {
            link.classList.add('active');
        }
    });
    
    // Update breadcrumbs
    const pageName = hash.charAt(0).toUpperCase() + hash.slice(1);
    document.getElementById('breadcrumbs').innerHTML = `Home &gt; ${pageName}`;
    
    const contentDiv = document.getElementById('content');
    
    // Animate out current content if it exists
    if (contentDiv.children.length > 0 && typeof gsap !== 'undefined') {
        await new Promise(resolve => {
            gsap.to(contentDiv.children, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                stagger: 0.05,
                ease: "power2.in",
                onComplete: resolve
            });
        });
    }

    // Show spinner
    contentDiv.innerHTML = `
        <div class="loading-spinner active">
            <div class="spinner"></div>
        </div>
    `;
    
    try {
        // Simulate network delay for API feel
        await new Promise(r => setTimeout(r, 400));
        
        const response = await fetch(`${routes[hash].url}?v=4.3`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        contentDiv.innerHTML = `<div class="page-transition" style="opacity: 0;">${html}</div>`;
        
        // Animate in new content
        if (typeof gsap !== 'undefined') {
            gsap.to(contentDiv.querySelector('.page-transition'), {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out"
            });
        }
        
        // Call the specific init function for the loaded page
        if (window[routes[hash].init]) {
            await window[routes[hash].init]();
        }

        // Reposition 3D sphere away from content for this page
        if (window.repositionSphere) {
            window.repositionSphere(hash);
        }

        // Tag body with current page for CSS page-specific rules
        document.body.setAttribute('data-page', hash);
        
    } catch (error) {
        console.error(error);
        contentDiv.innerHTML = `
            <div class="empty-state" style="color: var(--danger)">
                <h3>Error loading page</h3>
                <p>Could not load ${hash}.html. Make sure you are running a local server.</p>
            </div>
        `;
    }
    
    // Close mobile menu if open
    document.getElementById('sidebar').classList.remove('open');
};
