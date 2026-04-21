// Animações e interações para a página de início

(function () {
    // Respeita preferência por reduzir movimento
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Helpers
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => Array.from(document.querySelectorAll(s));
    const ease = 'cubic-bezier(.2,.9,.2,1)';

    // Elementos principais
    const header = qs('header');
    const card = qs('.card');
    const intro = qs('.intro');
    const profile = qs('.profile');
    const avatar = qs('.avatar');
    const logoMark = qs('.logo .mark');
    const navLinks = qsa('nav a');
    const ctaBtns = qsa('.btn');

    document.addEventListener('DOMContentLoaded', () => {
        // Entrada principal com pequeno stagger
        const seq = [
            {el: header, delay: 0},
            {el: card, delay: 120},
            {el: profile, delay: 220},
            {el: intro, delay: 260},
            {el: qs('footer'), delay: 360}
        ].filter(i => i.el);

        seq.forEach(item => {
            item.el.animate(
                [
                    { opacity: 0, transform: 'translateY(10px)'},
                    { opacity: 1, transform: 'translateY(0)'}
                ],
                { duration: 520, easing: ease, fill: 'forwards', delay: item.delay }
            );
        });

        // Stagger dos links do nav
        navLinks.forEach((a, idx) => {
            a.animate(
                [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 420, easing: ease, fill: 'forwards', delay: 320 + idx * 60 }
            );
        });

        // Animações de hover (botões e links) usando WAAPI para suavidade
        const addHoverScale = (el, scale = 1.06) => {
            let active = null;
            el.addEventListener('pointerenter', () => {
                if (active) active.cancel();
                active = el.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale})` }], { duration: 160, easing: 'ease-out', fill: 'forwards' });
            });
            el.addEventListener('pointerleave', () => {
                if (active) active.cancel();
                active = el.animate([{ transform: `scale(${scale})` }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
            });
        };
        ctaBtns.forEach(b => addHoverScale(b, 1.04));
        navLinks.forEach(a => addHoverScale(a, 1.03));

        // Smooth scroll para âncoras internas
        navLinks.forEach(a => {
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            a.addEventListener('click', (e) => {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Observer para revelar elementos ao rolar
        const revealTargets = qsa('.intro, .profile, footer');
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, o) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    el.animate(
                        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
                        { duration: 520, easing: ease, fill: 'forwards' }
                    );
                    o.unobserve(el);
                });
            }, { threshold: 0.12 });
            revealTargets.forEach(t => obs.observe(t));
        }

        // Pequena "flutuação" do avatar com requestAnimationFrame
        if (avatar) {
            let rafId = null;
            const start = performance.now();
            const loop = (t) => {
                const dt = (t - start) / 1000; // segundos
                const y = Math.sin(dt * 1.2) * 6; // amplitude vertical
                const r = Math.sin(dt * 0.8) * 1.2; // rotação sutil
                avatar.style.transform = `translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;
                rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
            // pausa quando a aba não estiver visível
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                } else if (!rafId) {
                    requestAnimationFrame(loop);
                }
            });
        }

        // Parallax simples baseado no movimento do mouse (marca e avatar)
        const parallaxElements = [
            { el: logoMark, factor: 10 },
            { el: avatar, factor: 20 }
        ].filter(x => x.el);

        let winW = window.innerWidth, winH = window.innerHeight;
        window.addEventListener('resize', () => { winW = window.innerWidth; winH = window.innerHeight; });

        document.addEventListener('pointermove', (ev) => {
            const x = (ev.clientX / winW) - 0.5;
            const y = (ev.clientY / winH) - 0.5;
            parallaxElements.forEach(({ el, factor }) => {
                el.style.transform = `translate3d(${(x * factor).toFixed(2)}px, ${(y * factor).toFixed(2)}px, 0)`;
            });
        }, { passive: true });
    });
})();