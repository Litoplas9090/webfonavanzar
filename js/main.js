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
            if (r < 0.48) return 'snowflake';
            if (r < 0.60) return 'star';
            if (r < 0.68) return 'ornament';
            if (r < 0.75) return 'tree';
            if (r < 0.81) return 'gift';
            if (r < 0.87) return 'candyCane';
            if (r < 0.92) return 'bell';
            if (r < 0.96) return 'snowman';
            if (r < 0.985) return 'santa';
            return 'sleigh';
        }

        function randomFlake(initial) {
            var type = pickChristmasType();
            var color;
            if (type === 'snowflake') {
                color = Math.random() < 0.7 ? christmasPalette[1] : christmasPalette[0];
            } else if (type === 'star' || type === 'bell') {
                color = christmasPalette[4];
            } else if (type === 'tree') {
                color = christmasPalette[3];
            } else {
                color = Math.random() < 0.6 ? christmasPalette[2] : christmasPalette[4];
            }

            var isSleigh = type === 'sleigh';
            var size = isSleigh
                ? (22 + Math.random() * 12)
                : (type === 'snowflake' ? (7 + Math.random() * 13) : (11 + Math.random() * 12));

            return {
                x: isSleigh
                    ? (initial ? Math.random() * canvas.width : -60)
                    : Math.random() * canvas.width,
                y: initial
                    ? Math.random() * canvas.height
                    : (isSleigh ? (60 + Math.random() * (canvas.height * 0.75)) : -35),
                size: size,
                speedY: isSleigh ? (Math.random() - 0.5) * 0.25 : (0.45 + Math.random() * 0.95),
                driftX: isSleigh ? (0.85 + Math.random() * 0.75) : ((Math.random() - 0.5) * 0.35),
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.01 + Math.random() * 0.02,
                type: type,
                color: color,
                alpha: isSleigh || type === 'santa' ? (0.30 + Math.random() * 0.20) : (0.22 + Math.random() * 0.26)
            };
        }

        function initFlakes() {
            var isMobile = window.innerWidth < 768;
            var count = isMobile ? 40 : 72;
            flakes = [];
            for (var i = 0; i < count; i++) {
                flakes.push(randomFlake(true));
            }
            // Garantizar al menos un trineo y un Papá Noel visibles
            if (!flakes.some(function (f) { return f.type === 'sleigh'; })) {
                flakes[0].type = 'sleigh';
                flakes[0].size = 28;
                flakes[0].speedY = 0.1;
                flakes[0].driftX = 1.1;
                flakes[0].alpha = 0.38;
            }
            if (!flakes.some(function (f) { return f.type === 'santa'; })) {
                flakes[1].type = 'santa';
                flakes[1].size = 18;
                flakes[1].alpha = 0.38;
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

        function drawGift(f) {
            var r = f.size * 0.78;
            ctx.fillStyle = 'rgba(208, 0, 16, ' + f.alpha + ')';
            ctx.fillRect(-r, -r * 0.7, r * 2, r * 1.5);
            // cinta dorada vertical y horizontal
            ctx.fillStyle = 'rgba(217, 119, 6, ' + Math.min(1, f.alpha * 1.35) + ')';
            ctx.fillRect(-r * 0.18, -r * 0.7, r * 0.36, r * 1.5);
            ctx.fillRect(-r, -r * 0.15, r * 2, r * 0.32);
            // moño superior
            ctx.beginPath();
            ctx.ellipse(-r * 0.32, -r * 0.88, r * 0.32, r * 0.18, -0.35, 0, Math.PI * 2);
            ctx.ellipse(r * 0.32, -r * 0.88, r * 0.32, r * 0.18, 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawCandyCane(f) {
            var r = f.size;
            ctx.lineCap = 'round';
            ctx.lineWidth = Math.max(2.5, r * 0.24);
            ctx.strokeStyle = 'rgba(208, 0, 16, ' + f.alpha + ')';
            ctx.beginPath();
            ctx.moveTo(r * 0.25, r * 0.85);
            ctx.lineTo(r * 0.25, -r * 0.35);
            ctx.arc(-r * 0.12, -r * 0.35, r * 0.37, 0, Math.PI, true);
            ctx.stroke();

            ctx.setLineDash([r * 0.22, r * 0.22]);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + Math.min(1, f.alpha * 1.6) + ')';
            ctx.beginPath();
            ctx.moveTo(r * 0.25, r * 0.85);
            ctx.lineTo(r * 0.25, -r * 0.35);
            ctx.arc(-r * 0.12, -r * 0.35, r * 0.37, 0, Math.PI, true);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function drawBell(f) {
            var r = f.size * 0.85;
            ctx.fillStyle = 'rgba(217, 119, 6, ' + f.alpha + ')';
            ctx.beginPath();
            ctx.moveTo(-r * 0.72, r * 0.45);
            ctx.quadraticCurveTo(-r * 0.6, -r * 0.65, 0, -r * 0.75);
            ctx.quadraticCurveTo(r * 0.6, -r * 0.65, r * 0.72, r * 0.45);
            ctx.closePath();
            ctx.fill();
            // badajo
            ctx.beginPath();
            ctx.arc(0, r * 0.58, r * 0.18, 0, Math.PI * 2);
            ctx.fill();
            // lazo rojo arriba
            ctx.fillStyle = 'rgba(208, 0, 16, ' + Math.min(1, f.alpha * 1.25) + ')';
            ctx.beginPath();
            ctx.arc(0, -r * 0.78, r * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawSnowman(f) {
            var r = f.size;
            var white = 'rgba(255, 255, 255, ' + Math.min(0.9, f.alpha * 2.1) + ')';
            var border = 'rgba(0, 96, 176, ' + f.alpha + ')';
            // cuerpo y cabeza
            ctx.fillStyle = white;
            ctx.strokeStyle = border;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, r * 0.35, r * 0.52, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -r * 0.28, r * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // bufanda roja
            ctx.fillStyle = 'rgba(208, 0, 16, ' + Math.min(1, f.alpha * 1.4) + ')';
            ctx.fillRect(-r * 0.32, -r * 0.02, r * 0.64, r * 0.16);
            // sombrero
            ctx.fillStyle = 'rgba(10, 26, 60, ' + Math.min(1, f.alpha * 1.5) + ')';
            ctx.fillRect(-r * 0.42, -r * 0.62, r * 0.84, r * 0.1);
            ctx.fillRect(-r * 0.26, -r * 0.96, r * 0.52, r * 0.34);
        }

        function drawSanta(f) {
            var r = f.size;
            // cara
            ctx.fillStyle = 'rgba(255, 214, 186, ' + Math.min(0.95, f.alpha * 2) + ')';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
            ctx.fill();
            // barba blanca
            ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(0.95, f.alpha * 2.2) + ')';
            ctx.beginPath();
            ctx.arc(0, r * 0.18, r * 0.48, 0, Math.PI);
            ctx.fill();
            // gorro rojo
            ctx.fillStyle = 'rgba(208, 0, 16, ' + Math.min(1, f.alpha * 1.5) + ')';
            ctx.beginPath();
            ctx.moveTo(-r * 0.48, -r * 0.14);
            ctx.quadraticCurveTo(0, -r * 1.05, r * 0.62, -r * 0.55);
            ctx.lineTo(r * 0.42, -r * 0.14);
            ctx.closePath();
            ctx.fill();
            // borde blanco y pompón
            ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(0.95, f.alpha * 2.2) + ')';
            ctx.fillRect(-r * 0.5, -r * 0.2, r * 0.96, r * 0.16);
            ctx.beginPath();
            ctx.arc(r * 0.62, -r * 0.55, r * 0.14, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawSleigh(f) {
            var r = f.size;
            // patines dorados
            ctx.strokeStyle = 'rgba(217, 119, 6, ' + Math.min(1, f.alpha * 1.5) + ')';
            ctx.lineWidth = Math.max(2, r * 0.09);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-r * 0.95, r * 0.42);
            ctx.lineTo(r * 0.72, r * 0.42);
            ctx.quadraticCurveTo(r * 1.05, r * 0.42, r * 1.08, r * 0.08);
            ctx.stroke();
            // cuerpo del trineo rojo
            ctx.fillStyle = 'rgba(208, 0, 16, ' + Math.min(1, f.alpha * 1.45) + ')';
            ctx.beginPath();
            ctx.moveTo(-r * 0.85, -r * 0.28);
            ctx.quadraticCurveTo(-r * 0.65, r * 0.34, 0, r * 0.32);
            ctx.lineTo(r * 0.75, r * 0.32);
            ctx.quadraticCurveTo(r * 0.92, r * 0.05, r * 0.72, -r * 0.05);
            ctx.lineTo(r * 0.1, -r * 0.05);
            ctx.lineTo(-r * 0.35, -r * 0.38);
            ctx.closePath();
            ctx.fill();
            // regalito + gorrito dentro del trineo
            ctx.fillStyle = 'rgba(22, 128, 68, ' + Math.min(1, f.alpha * 1.4) + ')';
            ctx.fillRect(-r * 0.52, -r * 0.42, r * 0.38, r * 0.32);
            ctx.fillStyle = 'rgba(217, 119, 6, ' + Math.min(1, f.alpha * 1.5) + ')';
            ctx.fillRect(-r * 0.36, -r * 0.42, r * 0.08, r * 0.32);
        }

        function renderChristmasFrame(animate) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < flakes.length; i++) {
                var f = flakes[i];
                if (animate) {
                    f.wobble += f.wobbleSpeed;
                    f.y += f.type === 'sleigh' ? Math.sin(f.wobble) * 0.35 + f.speedY : f.speedY;
                    f.x += f.driftX + (f.type === 'sleigh' ? 0 : Math.sin(f.wobble) * 0.45);
                    f.rotation += f.rotSpeed;

                    if (f.type === 'sleigh') {
                        if (f.x - f.size > canvas.width + 60) {
                            flakes[i] = randomFlake(false);
                            continue;
                        }
                    } else if (f.y - f.size > canvas.height + 20) {
                        flakes[i] = randomFlake(false);
                        continue;
                    }
                    if (f.x < -70) f.x = canvas.width + 50;
                    if (f.type !== 'sleigh' && f.x > canvas.width + 40) f.x = -30;
                }

                ctx.save();
                ctx.translate(f.x, f.y);
                var swayTypes = ['tree', 'ornament', 'gift', 'bell', 'snowman', 'santa', 'sleigh'];
                ctx.rotate(swayTypes.indexOf(f.type) !== -1 ? Math.sin(f.wobble) * 0.12 : f.rotation);

                if (f.type === 'snowflake') drawSnowflake(f);
                else if (f.type === 'star') drawStar(f);
                else if (f.type === 'ornament') drawOrnament(f);
                else if (f.type === 'tree') drawTree(f);
                else if (f.type === 'gift') drawGift(f);
                else if (f.type === 'candyCane') drawCandyCane(f);
                else if (f.type === 'bell') drawBell(f);
                else if (f.type === 'snowman') drawSnowman(f);
                else if (f.type === 'santa') drawSanta(f);
                else drawSleigh(f);

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

    /* ---------- Simulador de crédito (modelo por líneas tipo Offiplex + WhatsApp) ---------- */
    var simLine = document.getElementById('sim-line');
    var simAmount = document.getElementById('sim-amount');
    var simTerm = document.getElementById('sim-term');

    if (simLine && simAmount && simTerm) {
        var LOAN_LINES = {
            'libre-inversion': {
                name: 'Libre Inversión',
                rate: 1.2,
                rateText: '1,2% M.V.',
                maxTerm: 60,
                note: 'Recursos de libre destinación sin necesidad de justificación o soporte. Cupo sujeto a 3x aportes y ahorros.'
            },
            'compra-cartera': {
                name: 'Compra de Cartera',
                rate: 1.2,
                rateText: '1,2% M.V.',
                maxTerm: 60,
                note: 'Unifica tus obligaciones con terceros para mejorar tu flujo de caja mensual.'
            },
            'calamidad': {
                name: 'Calamidad Doméstica',
                rate: 1.2,
                rateText: '1,2% M.V.',
                maxTerm: 24,
                note: 'Atención prioritaria ante emergencias médicas, familiares o daños imprevistos.'
            },
            'educativo': {
                name: 'Educativo',
                rate: 1.0,
                rateText: '1,0% M.V. (ref. 1,0% - 1,2%)',
                maxTerm: 12,
                note: 'Financiación de educación primaria, secundaria, superior o no formal para ti y tu familia.'
            },
            'convenios': {
                name: 'Órdenes de Crédito y Convenios',
                rate: 0.67,
                rateText: '0,67% M.V. (ref. 0,67% - 1,2%)',
                maxTerm: 12,
                note: 'Autorizaciones para compra de artículos, salud, medicamentos y ferias con proveedores aliados.'
            },
            'eventos': {
                name: 'Crédito Eventos',
                rate: 0,
                rateText: '0% interés',
                maxTerm: 12,
                note: 'Participación en actividades recreativas, deportivas, artísticas y culturales del Fondo.'
            },
            'vivienda': {
                name: 'Compra y Reparación de Vivienda',
                rate: 0.95,
                rateText: 'DTF+1 (ref. ~0,95% M.V.)',
                maxTerm: 60,
                note: 'Compra de vivienda hasta 15 SMMLV (máx. 60 meses) o mejoras hasta 10 SMMLV (máx. 36 meses) con tasa DTF+1.'
            }
        };

        var simFrequency = 'mensual';
        var freqButtons = document.querySelectorAll('.sim-freq-btn');
        var labelAmount = document.getElementById('sim-amount-label');
        var labelTerm = document.getElementById('sim-term-label');
        var labelTermMax = document.getElementById('sim-term-max-label');
        var labelRate = document.getElementById('sim-rate-label');
        var lineNote = document.getElementById('sim-line-note');
        var resultTitle = document.getElementById('sim-result-title');
        var outResult = document.getElementById('sim-result');
        var outSummaryLine = document.getElementById('sim-summary-line');
        var outSummaryRate = document.getElementById('sim-summary-rate');
        var outTotal = document.getElementById('sim-total');
        var outInterest = document.getElementById('sim-interest');
        var outPrincipal = document.getElementById('sim-principal');
        var whatsappBtn = document.getElementById('sim-whatsapp-btn');
        var amortizationBody = document.getElementById('sim-amortization-body');

        function formatCOP(value) {
            return '$' + Math.round(value).toLocaleString('es-CO');
        }

        function syncLineConstraints() {
            var line = LOAN_LINES[simLine.value] || LOAN_LINES['libre-inversion'];
            simTerm.max = String(line.maxTerm);
            if (parseInt(simTerm.value, 10) > line.maxTerm) {
                simTerm.value = String(line.maxTerm);
            }
            if (labelTermMax) labelTermMax.textContent = 'Máx. ' + line.maxTerm + ' meses';
            if (labelRate) labelRate.textContent = line.rateText;
            if (lineNote) lineNote.textContent = line.note;
        }

        function renderAmortization(P, periods, periodRate, payment) {
            if (!amortizationBody) return;
            var balance = P;
            var rowsHtml = '';
            for (var k = 1; k <= periods; k++) {
                var interestPaid = balance * periodRate;
                var principalPaid = k === periods ? balance : (payment - interestPaid);
                var currentPayment = k === periods ? (principalPaid + interestPaid) : payment;
                balance = Math.max(0, balance - principalPaid);
                rowsHtml += '<tr>' +
                    '<td class="px-4 py-2.5 font-medium">' + k + '</td>' +
                    '<td class="px-4 py-2.5">' + formatCOP(currentPayment) + '</td>' +
                    '<td class="px-4 py-2.5">' + formatCOP(principalPaid) + '</td>' +
                    '<td class="px-4 py-2.5">' + formatCOP(interestPaid) + '</td>' +
                    '<td class="px-4 py-2.5 font-medium">' + formatCOP(balance) + '</td>' +
                    '</tr>';
            }
            amortizationBody.innerHTML = rowsHtml;
        }

        function updateSimulator() {
            var line = LOAN_LINES[simLine.value] || LOAN_LINES['libre-inversion'];
            var P = parseFloat(simAmount.value);
            var months = parseInt(simTerm.value, 10);
            var isQuincenal = simFrequency === 'quincenal';
            var periods = isQuincenal ? months * 2 : months;
            var periodRate = (line.rate / 100) / (isQuincenal ? 2 : 1);

            var payment = periodRate === 0
                ? (P / periods)
                : (P * periodRate / (1 - Math.pow(1 + periodRate, -periods)));
            var total = payment * periods;
            var interest = total - P;

            if (labelAmount) labelAmount.textContent = formatCOP(P);
            if (labelTerm) {
                labelTerm.textContent = months + (months === 1 ? ' mes' : ' meses') +
                    (isQuincenal ? ' (' + periods + ' quincenas)' : '');
            }
            if (resultTitle) {
                resultTitle.textContent = isQuincenal ? 'Tu cuota quincenal estimada' : 'Tu cuota mensual estimada';
            }
            if (outResult) outResult.textContent = formatCOP(payment);
            if (outSummaryLine) outSummaryLine.textContent = line.name;
            if (outSummaryRate) outSummaryRate.textContent = line.rateText;
            if (outTotal) outTotal.textContent = formatCOP(total);
            if (outInterest) outInterest.textContent = formatCOP(interest);
            if (outPrincipal) outPrincipal.textContent = formatCOP(P);

            renderAmortization(P, periods, periodRate, payment);

            if (whatsappBtn) {
                var msg = [
                    'Hola, quiero solicitar un crédito con FONAVANZAR. Estos son los datos de mi simulación:',
                    '',
                    '• Línea de crédito: ' + line.name,
                    '• Monto solicitado: ' + formatCOP(P),
                    '• Plazo: ' + months + (months === 1 ? ' mes' : ' meses') + (isQuincenal ? ' (' + periods + ' quincenas)' : ''),
                    '• Periodicidad: ' + (isQuincenal ? 'Quincenal' : 'Mensual'),
                    '• Tasa referencial: ' + line.rateText,
                    '• Cuota ' + (isQuincenal ? 'quincenal' : 'mensual') + ' estimada: ' + formatCOP(payment),
                    '• Total intereses estimados: ' + formatCOP(interest),
                    '• Total estimado a pagar: ' + formatCOP(total),
                    '',
                    'Por favor indíquenme los pasos para continuar con la solicitud.'
                ].join('\n');
                whatsappBtn.href = 'https://wa.me/573017925683?text=' + encodeURIComponent(msg);
            }
        }

        freqButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                simFrequency = btn.getAttribute('data-freq') === 'quincenal' ? 'quincenal' : 'mensual';
                freqButtons.forEach(function (b) {
                    var active = b === btn;
                    b.setAttribute('aria-pressed', String(active));
                    if (active) {
                        b.classList.add('border-fona-blue', 'bg-fona-blue', 'text-white');
                        b.classList.remove('border-fona-blue/20', 'bg-white', 'text-fona-navy/80');
                    } else {
                        b.classList.remove('border-fona-blue', 'bg-fona-blue', 'text-white');
                        b.classList.add('border-fona-blue/20', 'bg-white', 'text-fona-navy/80');
                    }
                });
                updateSimulator();
            });
        });

        simLine.addEventListener('change', function () {
            syncLineConstraints();
            updateSimulator();
        });
        [simAmount, simTerm].forEach(function (input) {
            input.addEventListener('input', updateSimulator);
        });

        syncLineConstraints();
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
