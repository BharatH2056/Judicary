/**
 * JudicaMS Landing Page Animations
 * GSAP Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create a timeline for the entry sequence
    const tl = gsap.timeline({
        defaults: { ease: 'expo.out', duration: 1.5 }
    });

    // 2. Initial state setup (handled by CSS opacity 0, but can reinforce here)
    gsap.set('.navbar, .hero-badge, .hero-title, .hero-subtitle, .hero-btn, .hero-stats, .feature-row', {
        opacity: 0,
        y: 30
    });

    // 3. Entry Sequence
    tl.to('.navbar', {
        opacity: 1,
        y: 0,
        duration: 1
    })
    .to('.hero-badge', {
        opacity: 1,
        y: 0,
        duration: 0.8
    }, '-=0.5')
    .to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1.2
    }, '-=0.6')
    .to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1
    }, '-=0.8')
    .to('.hero-btn', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'back.out(1.7)'
    }, '-=0.7')
    .to('.hero-stats', {
        opacity: 1,
        y: 0,
        duration: 1
    }, '-=0.8');

    // 4. Animate Features on Scroll
    // Since this is a minimal landing page, we can just trigger them or use ScrollTrigger if library is loaded.
    // For now, let's just animate them in with a stagger after the hero.
    tl.to('.feature-row', {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1
    }, '-=0.5');

    // 5. Subtle Hover Effects (reinforce the CSS ones)
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn) {
        heroBtn.addEventListener('mouseenter', () => {
            gsap.to('.btn-arrow', { x: 5, duration: 0.3 });
        });
        heroBtn.addEventListener('mouseleave', () => {
            gsap.to('.btn-arrow', { x: 0, duration: 0.3 });
        });
    }

    // 6. Navbar Link hover effects
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, { color: '#ffffff', duration: 0.3 });
        });
        link.addEventListener('mouseleave', () => {
            gsap.to(link, { color: '#888888', duration: 0.3 });
        });
    });
});
