/* ==========================================================================
   FONAVANZAR — Lógica de la página (100% local, sin internet)
   - Iconos Lucide
   - Fondo dinámico (burbujas de ahorro en canvas)
   - Navbar con estado de scroll + menú móvil
   - Animaciones de entrada (IntersectionObserver)
   - Contadores animados
   - Simulador de crédito interactivo
   - Formulario de contacto (validación frontend)
   ========================================================================== */

(function () {
    'use strict';

    /* ---------- Iconos ---------- */
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    /* ---------- Fondo dinámico: burbujas ---------- */
    var canvas = document.getElementById('bubbles-canvas');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var bubbles = [];
        var palette = [
            { r: 0, g: 96, b: 176 },   // azul fona
            { r: 46, g: 134, b: 193 }, // celeste
            { r: 208, g: 0, b: 16 },   // rojo fona
            { r: 0, g: 32, b: 96 }     // navy
        ];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function randomBubble(initial) {
            var color = palette[Math.floor(Math.random() * palette.length)];
            return {
                x: Math.random() * canvas.width,
                y: initial ? Math.random() * canvas.height : canvas.height + 40,
                radius: 8 + Math.random() * 46,
                speedY: 0.15 + Math.random() * 0.45,
                driftX: (Math.random() - 0.5) * 0.3,
                color: color,
                alpha: 0.05 + Math.random() * 0.10,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.004 + Math.random() * 0.008
            };
        }

        function initBubbles() {
            var isMobile = window.innerWidth < 768;
            var count = isMobile ? 30 : 55;
            bubbles = [];
            for (var i = 0; i < count; i++) {
                bubbles.push(randomBubble(true));
            }
        }

        function drawBubbles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < bubbles.length; i++) {
                var b = bubbles[i];
                b.wobble += b.wobbleSpeed;
                b.y -= b.speedY;
                b.x += b.driftX + Math.sin(b.wobble) * 0.3;

                if (b.y + b.radius < -20) {
                    bubbles[i] = randomBubble(false);
                    continue;
                }
                if (b.x - b.radius < -20) b.x = canvas.width + b.radius;
                if (b.x + b.radius > canvas.width + 20) b.x = -b.radius;

                var gradient = ctx.createRadialGradient(
                    b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
                    b.x, b.y, b.radius
                );
                gradient.addColorStop(0, 'rgba(' + b.color.r + ',' + b.color.g + ',' + b.color.b + ',' + (b.alpha * 1.8) + ')');
                gradient.addColorStop(1, 'rgba(' + b.color.r + ',' + b.color.g + ',' + b.color.b + ',' + b.alpha + ')');

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // brillo superior para efecto burbuja
                ctx.beginPath();
                ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.4, b.radius * 0.18, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + (b.alpha * 2.4) + ')';
                ctx.fill();
            }
            requestAnimationFrame(drawBubbles);
        }

        resizeCanvas();
        initBubbles();
        window.addEventListener('resize', function () {
            resizeCanvas();
            initBubbles();
        });
        requestAnimationFrame(drawBubbles);
    }

    /* ---------- Navbar: sombra al hacer scroll ---------- */
    var navbar = document.getElementById('navbar');
    if (navbar) {
        var onScroll = function () {
            if (window.scrollY > 40) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Menú móvil ---------- */
    var menuBtn = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.toggle('hidden');
            menuBtn.setAttribute('aria-expanded', String(!isOpen));
        });
        // cerrar al pulsar un enlace
        var links = mobileMenu.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        }
    }

    /* ---------- Animación de entrada al hacer scroll ---------- */
    var revealEls = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealEls.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }

    /* ---------- Contadores animados ---------- */
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var duration = 1800;
        var start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            var value = Math.round(target * eased);
            el.textContent = prefix + value.toLocaleString('es-CO') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    var counterEls = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window && counterEls.length) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counterEls.forEach(function (el) { counterObserver.observe(el); });
    }

    /* ---------- Simulador de crédito ---------- */
    var simAmount = document.getElementById('sim-amount');
    var simTerm = document.getElementById('sim-term');
    var simRate = document.getElementById('sim-rate');

    if (simAmount && simTerm && simRate) {
        var labelAmount = document.getElementById('sim-amount-label');
        var labelTerm = document.getElementById('sim-term-label');
        var labelRate = document.getElementById('sim-rate-label');
        var outResult = document.getElementById('sim-result');
        var outTotal = document.getElementById('sim-total');
        var outInterest = document.getElementById('sim-interest');
        var outPrincipal = document.getElementById('sim-principal');

        function formatCOP(value) {
            return '$' + Math.round(value).toLocaleString('es-CO');
        }

        function updateSimulator() {
            var P = parseFloat(simAmount.value);        // monto
            var n = parseInt(simTerm.value, 10);        // plazo en meses
            var monthlyRate = parseFloat(simRate.value); // tasa mensual %
            var i = monthlyRate / 100;                  // tasa mensual decimal

            var payment = P * i / (1 - Math.pow(1 + i, -n));
            var total = payment * n;
            var interest = total - P;

            if (labelAmount) labelAmount.textContent = formatCOP(P);
            if (labelTerm) labelTerm.textContent = n + ' meses';
            if (labelRate) labelRate.textContent = monthlyRate.toFixed(1).replace('.', ',') + '% mensual';
            if (outResult) outResult.textContent = formatCOP(payment);
            if (outTotal) outTotal.textContent = formatCOP(total);
            if (outInterest) outInterest.textContent = formatCOP(interest);
            if (outPrincipal) outPrincipal.textContent = formatCOP(P);
        }

        [simAmount, simTerm, simRate].forEach(function (input) {
            input.addEventListener('input', updateSimulator);
        });
        updateSimulator();
    }

    /* ---------- Formulario de contacto ---------- */
    var form = document.getElementById('contact-form');
    if (form) {
        var formMessage = document.getElementById('form-message');

        function showFormMessage(text, isError) {
            if (!formMessage) return;
            formMessage.textContent = text;
            formMessage.classList.remove('hidden');
            if (isError) {
                formMessage.classList.add('text-red-600');
                formMessage.classList.remove('text-blue-700');
            } else {
                formMessage.classList.add('text-blue-700');
                formMessage.classList.remove('text-red-600');
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = form.querySelector('#nombre');
            var phone = form.querySelector('#telefono');
            var email = form.querySelector('#email');
            var service = form.querySelector('#servicio');

            if (!name.value.trim() || !phone.value.trim() || !email.value.trim() || !service.value) {
                showFormMessage('Por favor completa todos los campos obligatorios.', true);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                showFormMessage('Por favor ingresa un correo electrónico válido.', true);
                return;
            }

            var btn = form.querySelector('button[type="submit"]');
            var originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            // Simulación de envío (frontend). Aquí se conectaría un backend o servicio de correo.
            setTimeout(function () {
                btn.disabled = false;
                btn.textContent = originalText;
                form.reset();
                showFormMessage('¡Gracias! Tu solicitud fue registrada. Nuestro equipo te contactará muy pronto.', false);
            }, 1500);
        });
    }
})();
