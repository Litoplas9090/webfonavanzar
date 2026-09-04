# FONAVANZAR — Fondo de Empleados

Página web institucional de **FONAVANZAR**, construida con los más altos estándares
visuales y comerciales del sector de fondos de empleados en Colombia.

## Características

- **100% offline**: no requiere internet, CDN ni servidor local. Todas las
  librerías (Tailwind CSS, Lucide, fuentes Google) están incluidas localmente
  en `js/` y `fonts/`.
- **Fondo dinámico**: burbujas animadas en canvas con la paleta institucional.
- **Iconos dinámicos**: Lucide (SVG inline, escalables y animables por CSS).
- **Simulador de crédito interactivo**: el visitante ajusta monto, plazo y tasa
  con sliders y ve su cuota estimada al instante.
- **Marquee de beneficios**, contadores animados y animaciones de entrada al
  hacer scroll.
- **Responsive**: optimizada para escritorio, tablet y móvil.

## Estructura

```
fonavanzar-web/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos personalizados (marquee, tarjetas, sliders…)
├── js/
│   ├── main.js         # Lógica: fondo, animaciones, simulador, formulario
│   ├── tailwindcss.js  # Tailwind CSS (copia local)
│   └── lucide.min.js   # Iconos Lucide (copia local)
├── fonts/              # Fuentes Google (Sora, Inter…) + hoja de estilos
├── images/
│   └── logo.png        # Logo FONAVANZAR
└── abrir_directo.bat   # Atajo para abrir la página en Windows
```

## Cómo previsualizar (offline)

Opción 1: doble clic en **`abrir_directo.bat`** (Windows).

Opción 2: doble clic directo en **`index.html`**, o arrastrarlo al navegador.

No hace falta XAMPP, Live Server ni ningún `localhost`: la página abre
directamente desde el disco con `file://`.

## Publicar en GitHub Pages

1. Crear el repositorio y subir **el contenido de esta carpeta** (`fonavanzar-web/`).
2. En GitHub: **Settings → Pages → Source: Deploy from a branch**.
3. Elegir la rama (p. ej. `main`) y la carpeta **`/ (root)`**.
4. Guardar; en 1–2 minutos el sitio queda disponible en
   `https://<usuario>.github.io/<repo>/`.

> Tip: si se sube esta carpeta dentro de otra (p. ej. `FONAVANZAR-WEB/fonavanzar-web/`),
> el Publish Directory debe ser `./fonavanzar-web` en servicios como Render/Netlify.

## Nota sobre el formulario

El formulario de contacto funciona como **simulación frontend**: valida los
campos y muestra confirmación, pero **no envía datos a ningún servidor**. Para
recibir solicitudes reales hay que conectarlo a un backend o servicio de
correo (p. ej. Formspree, EmailJS o un correo corporativo con SMTP).

## Datos de contacto (placeholders)

Los teléfonos, WhatsApp y correos actuales son de ejemplo. Actualizar en
`index.html` (sección de contacto y footer) con los datos reales de FONAVANZAR.
