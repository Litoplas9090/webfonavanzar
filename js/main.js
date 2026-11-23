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

    /* ---------- Fondo dinámico: copos y figuras de navidad ---------- */
    var canvas = document.getElementById('christmas-canvas');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var flakes = [];
        var animFrameId = null;
        var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        var christmasPalette = [
            { r: 0, g: 96, b: 176 },   // azul fona (copos invernales)
            { r: 46, g: 134, b: 193 }, // celeste hielo
            { r: 208, g: 0, b: 16 },   // rojo navideño fona
            { r: 22, g: 128, b: 68 },  // verde pino
            { r: 217, g: 119, b: 6 }   // dorado estrella
        ];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function pickChristmasType() {
            var r = Math.random();
            if (r < 0.62) return 'snowflake';
            if (r < 0.80) return 'star';
            if (r < 0.92) return 'ornament';
            return 'tree';
        }

        function randomFlake(initial) {
            var type = pickChristmasType();
            var color;
            if (type === 'snowflake') {
                color = Math.random() < 0.7 ? christmasPalette[1] : christmasPalette[0];
            } else if (type === 'star') {
                color = christmasPalette[4];
            } else if (type === 'tree') {
                color = christmasPalette[3];
            } else {
                color = Math.random() < 0.6 ? christmasPalette[2] : christmasPalette[4];
            }

            return {
                x: Math.random() * canvas.width,
                y: initial ? Math.random() * canvas.height : -30,
                size: type === 'snowflake' ? (7 + Math.random() * 14) : (8 + Math.random() * 11),
                speedY: 0.45 + Math.random() * 0.95,
                driftX: (Math.random() - 0.5) * 0.35,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.01 + Math.random() * 0.02,
                type: type,
                color: color,
                alpha: 0.22 + Math.random() * 0.28
            };
        }

        function initFlakes() {
            var isMobile = window.innerWidth < 768;
            var count = isMobile ? 35 : 65;
            flakes = [];
            for (var i = 0; i < count; i++) {
                flakes.push(randomFlake(true));
            }
        }

        function drawSnowflake(f) {
            var r = f.size;
            ctx.strokeStyle = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + f.alpha + ')';
            ctx.lineWidth = Math.max(1.2, r * 0.11);
            ctx.lineCap = 'round';
            for (var i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate((Math.PI / 3) * i);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -r);
                // ramitas laterales del copo
                ctx.moveTo(0, -r * 0.55);
                ctx.lineTo(-r * 0.24, -r * 0.76);
                ctx.moveTo(0, -r * 0.55);
                ctx.lineTo(r * 0.24, -r * 0.76);
                ctx.stroke();
                ctx.restore();
            }
        }

        function drawStar(f) {
            var r = f.size;
            ctx.fillStyle = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + f.alpha + ')';
            ctx.beginPath();
            for (var i = 0; i < 8; i++) {
                var radius = i % 2 === 0 ? r : r * 0.32;
                var angle = (Math.PI / 4) * i;
                var px = Math.cos(angle) * radius;
                var py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }

        function drawOrnament(f) {
            var r = f.size * 0.75;
            var rgba = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + f.alpha + ')';
            // capuchón
            ctx.fillStyle = 'rgba(217, 119, 6, ' + f.alpha + ')';
            ctx.fillRect(-r * 0.28, -r * 1.18, r * 0.56, r * 0.28);
            // esfera
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba;
            ctx.fill();
            // brillo
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.3, r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (f.alpha * 1.3) + ')';
            ctx.fill();
        }

        function drawTree(f) {
            var r = f.size;
            ctx.fillStyle = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + f.alpha + ')';
            // copa superior
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(-r * 0.55, -r * 0.2);
            ctx.lineTo(r * 0.55, -r * 0.2);
            ctx.closePath();
            ctx.fill();
            // copa inferior
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.45);
            ctx.lineTo(-r * 0.78, r * 0.55);
            ctx.lineTo(r * 0.78, r * 0.55);
            ctx.closePath();
            ctx.fill();
            // tronco
            ctx.fillRect(-r * 0.14, r * 0.55, r * 0.28, r * 0.28);
        }

        function renderChristmasFrame(animate) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < flakes.length; i++) {
                var f = flakes[i];
                if (animate) {
                    f.wobble += f.wobbleSpeed;
                    f.y += f.speedY;
                    f.x += f.driftX + Math.sin(f.wobble) * 0.45;
                    f.rotation += f.rotSpeed;

                    if (f.y - f.size > canvas.height + 20) {
                        flakes[i] = randomFlake(false);
                        continue;
                    }
                    if (f.x < -30) f.x = canvas.width + 30;
                    if (f.x > canvas.width + 30) f.x = -30;
                }

                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.type === 'tree' || f.type === 'ornament' ? Math.sin(f.wobble) * 0.14 : f.rotation);

                if (f.type === 'snowflake') drawSnowflake(f);
                else if (f.type === 'star') drawStar(f);
                else if (f.type === 'ornament') drawOrnament(f);
                else drawTree(f);

                ctx.restore();
            }
        }

        function tickChristmas() {
            if (document.hidden || reducedMotionQuery.matches) {
                animFrameId = null;
                return;
            }
            renderChristmasFrame(true);
            animFrameId = requestAnimationFrame(tickChristmas);
        }

        function startChristmasCanvas() {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            if (reducedMotionQuery.matches) {
                renderChristmasFrame(false);
            } else if (!document.hidden) {
                animFrameId = requestAnimationFrame(tickChristmas);
            }
        }

        resizeCanvas();
        initFlakes();
        window.addEventListener('resize', function () {
            resizeCanvas();
            initFlakes();
            if (reducedMotionQuery.matches) renderChristmasFrame(false);
        });
        document.addEventListener('visibilitychange', startChristmasCanvas);
        if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', startChristmasCanvas);
        }
        startChristmasCanvas();
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
