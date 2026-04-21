document.addEventListener('DOMContentLoaded', () => {
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));
    const cards = qsa('.card');

    // helper: load file into img preview
    const fileToDataURL = (file, cb) => {
        const fr = new FileReader();
        fr.onload = () => cb(fr.result);
        fr.readAsDataURL(file);
    };

    cards.forEach(card => {
        const thumb = card.querySelector('.thumb');
        const input = card.querySelector('.file-input');
        const preview = card.querySelector('.preview');
        const placeholder = card.querySelector('.placeholder');
        const removeBtn = card.querySelector('.remove');

        // click thumb -> open file picker
        thumb.addEventListener('click', () => input.click());

        // file chosen
        input.addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            fileToDataURL(f, (url) => {
                preview.src = url;
                preview.hidden = false;
                placeholder.style.opacity = '0';
            });
        });

        // remove file
        removeBtn.addEventListener('click', () => {
            input.value = '';
            preview.src = '';
            preview.hidden = true;
            placeholder.style.opacity = '1';
        });

        // drag & drop support
        thumb.addEventListener('dragover', (ev) => { ev.preventDefault(); thumb.classList.add('dragover'); });
        thumb.addEventListener('dragleave', () => { thumb.classList.remove('dragover'); });
        thumb.addEventListener('drop', (ev) => {
            ev.preventDefault();
            thumb.classList.remove('dragover');
            const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
            if (!f) return;
            input.files = ev.dataTransfer.files; // attach to input
            fileToDataURL(f, (url) => {
                preview.src = url;
                preview.hidden = false;
                placeholder.style.opacity = '0';
            });
        });
    });

    // keyboard accessibility: Enter/Space opens file picker
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const active = document.activeElement;
            if (active && active.classList && active.classList.contains('thumb')) {
                e.preventDefault();
                active.click();
            }
        }
    });
});

// Animações leves para os quadrados das matérias (entrada, hover e parallax/tilt)
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const qsa = s => Array.from(document.querySelectorAll(s));
    const qs = s => document.querySelector(s);
    const ease = 'cubic-bezier(.2,.9,.2,1)';
    const cards = qsa('.card');

    document.addEventListener('DOMContentLoaded', () => {
        // entrada com stagger
        cards.forEach((card, i) => {
            card.animate(
                [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 520, easing: ease, fill: 'forwards', delay: 140 + i * 70 }
            );
        });

        // efeito por cartão (tilt)
        cards.forEach(card => {
            const thumb = card.querySelector('.thumb') || card;
            let raf = null;
            let pointer = { x: 0, y: 0, inside: false };

            // smooth update via rAF
            const update = () => {
                if (!pointer.inside) {
                    thumb.style.transform = '';
                    raf = null;
                    return;
                }
                const rect = thumb.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (pointer.x - cx) / rect.width; // -0.5..0.5
                const dy = (pointer.y - cy) / rect.height;
                const rotY = (dx * 8).toFixed(2); // graus
                const rotX = (-dy * 8).toFixed(2);
                const tx = (dx * 6).toFixed(2);
                const ty = (dy * 6).toFixed(2);
                // combine tilt + subtle translation + slight scale
                thumb.style.transform = `perspective(900px) translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
                raf = requestAnimationFrame(update);
            };

            // pointer events
            thumb.addEventListener('pointerenter', (e) => {
                pointer.inside = true;
                pointer.x = e.clientX; pointer.y = e.clientY;
                if (!raf) raf = requestAnimationFrame(update);
                // hover lift (fallback quick)
                thumb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }], { duration: 160, fill: 'forwards', easing: 'ease-out' });
            });

            thumb.addEventListener('pointermove', (e) => {
                pointer.x = e.clientX; pointer.y = e.clientY;
                if (!raf) raf = requestAnimationFrame(update);
            });

            thumb.addEventListener('pointerleave', () => {
                pointer.inside = false;
                // anima de retorno suave
                thumb.animate(
                    [
                        { transform: thumb.style.transform || 'none' },
                        { transform: 'none' }
                    ],
                    { duration: 260, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' }
                );
                if (raf) { cancelAnimationFrame(raf); raf = null; }
                thumb.style.transform = '';
            });

            // acessibilidade: teclado/foco aplica leve destaque
            thumb.addEventListener('focus', () => thumb.style.transform = 'scale(1.02)');
            thumb.addEventListener('blur', () => thumb.style.transform = '');
        });

        // Parallax leve para o ícone do logo (como na página inicial)
        const logoMark = qs('.logo .mark');
        if (logoMark) {
            let winW = window.innerWidth, winH = window.innerHeight;
            window.addEventListener('resize', () => { winW = window.innerWidth; winH = window.innerHeight; });
            document.addEventListener('pointermove', (ev) => {
                const x = (ev.clientX / winW) - 0.5;
                const y = (ev.clientY / winH) - 0.5;
                const factor = 8; // ajuste sutil
                logoMark.style.transform = `translate3d(${(x * factor).toFixed(2)}px, ${(y * factor).toFixed(2)}px, 0)`;
            }, { passive: true });
        }
    });
})();