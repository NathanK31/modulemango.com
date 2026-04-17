// modulemango — main

(function () {
    'use strict';

    // Mark JS as active immediately so progressive-enhancement CSS (boot overlay, .reveal)
    // only hides content when we can guarantee we'll reveal it.
    document.documentElement.classList.add('js');

    const init = () => {
        bootOverlay();
        setFooterYear();
        wireMobileNav();
        wireHeaderScroll();
        wireSmoothScroll();
        wireReveal();
        wireTyper();
        wireActiveNav();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    function bootOverlay() {
        const boot = document.getElementById('boot');
        if (!boot) return;

        // Sequence:
        // 0.05s line 1 appears
        // 0.25s line 2 appears
        // 0.45s line 3 appears
        // 0.65s line 4 (pending) appears, animated dots
        // 1.10s flip line 4 from [ .. ] booting ui  →  [ OK ] ready
        // 1.35s fade overlay out (0.4s transition)
        // 1.75s remove overlay from DOM

        const last = document.getElementById('bootLast');
        window.setTimeout(() => {
            if (!last) return;
            last.innerHTML = '<span class="status ok">[ OK ]</span> ready_';
        }, 1100);

        window.setTimeout(() => {
            boot.classList.add('done');
            document.documentElement.classList.add('booted');
        }, 1350);

        window.setTimeout(() => boot.remove(), 1750);
    }

    function setFooterYear() {
        const el = document.getElementById('year');
        if (el) el.textContent = String(new Date().getFullYear());
    }

    function wireMobileNav() {
        const toggle = document.getElementById('mobileToggle');
        const links = document.getElementById('navLinks');
        if (!toggle || !links) return;

        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('active');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
        });

        links.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                links.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function wireHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        let ticking = false;
        const update = () => {
            header.classList.toggle('scrolled', window.scrollY > 12);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }

    function wireSmoothScroll() {
        const header = document.getElementById('header');
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const offset = (header ? header.offsetHeight : 0) + 8;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    function wireReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!els.length) return;
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        els.forEach((el) => io.observe(el));
    }

    function wireTyper() {
        const typer = document.getElementById('typer');
        if (!typer) return;
        const target = typer.querySelector('.typer-text');
        if (!target) return;

        const phrases = [
            'an independent app development studio',
            'mobile-first · design-driven · code that lasts',
            'beautifully built. ship it.'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const tick = () => {
            const current = phrases[phraseIndex];
            if (deleting) {
                charIndex--;
                target.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    window.setTimeout(tick, 420);
                    return;
                }
                window.setTimeout(tick, 22);
            } else {
                charIndex++;
                target.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    window.setTimeout(tick, 2100);
                    return;
                }
                window.setTimeout(tick, 48);
            }
        };

        // Wait for boot overlay to finish before starting
        window.setTimeout(tick, 1450);
    }

    function wireActiveNav() {
        const sections = document.querySelectorAll('main section[id]');
        const links = document.querySelectorAll('.nav-links a[href^="#"]');
        if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

        const map = new Map();
        links.forEach((a) => {
            const hash = a.getAttribute('href');
            if (hash && hash.length > 1) map.set(hash.slice(1), a);
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    links.forEach((a) => a.classList.remove('active'));
                    const a = map.get(entry.target.id);
                    if (a) a.classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        sections.forEach((s) => io.observe(s));
    }
})();
