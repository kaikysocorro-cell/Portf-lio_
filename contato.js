document.addEventListener('DOMContentLoaded', () => {
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const slots = qsa('.slot');

    const fileToDataURL = (file, cb) => {
        const fr = new FileReader();
        fr.onload = () => cb(fr.result);
        fr.readAsDataURL(file);
    };

    slots.forEach(slot => {
        const input = slot.querySelector('.inp');
        const img = slot.querySelector('.preview');
        const label = slot.querySelector('.label');

        const setImage = (file) => {
            if (!file) return;
            fileToDataURL(file, url => {
                img.src = url;
                img.hidden = false;
                label.style.opacity = '0';
            });
        };

        slot.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (f) setImage(f);
        });

        // drag & drop
        slot.addEventListener('dragover', (ev) => { ev.preventDefault(); slot.classList.add('dragover'); });
        slot.addEventListener('dragleave', () => { slot.classList.remove('dragover'); });
        slot.addEventListener('drop', (ev) => {
            ev.preventDefault();
            slot.classList.remove('dragover');
            const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
            if (f) {
                // attach to input for future use
                try { input.files = ev.dataTransfer.files; } catch(e){ /* ignore on strict browsers */ }
                setImage(f);
            }
        });

        // keyboard: Enter/Space opens file picker
        slot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });
    });
});

// Parallax leve para o ícone do logo na página "Sobre"
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const qs = s => document.querySelector(s);
    document.addEventListener('DOMContentLoaded', () => {
        const logoMark = qs('.logo .mark');
        if (!logoMark) return;
        let winW = window.innerWidth, winH = window.innerHeight;
        window.addEventListener('resize', () => { winW = window.innerWidth; winH = window.innerHeight; });
        document.addEventListener('pointermove', (ev) => {
            const x = (ev.clientX / winW) - 0.5;
            const y = (ev.clientY / winH) - 0.5;
            const factor = 8;
            logoMark.style.transform = `translate3d(${(x * factor).toFixed(2)}px, ${(y * factor).toFixed(2)}px, 0)`;
        }, { passive: true });
    });
})();