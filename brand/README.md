# Monzon Labs — Paquete de Identidad (Concepto B)

## Colores de marca
- Navy:  #0D1B33  (principal)
- Gold:  #D4A853  (acento)
- Off-white: #FAFAF8 (fondos claros)

## Archivos
- monzonlabs-logo-light.svg   → logo completo, para fondos CLAROS (texto navy)
- monzonlabs-logo-dark.svg    → logo completo, para fondos OSCUROS (texto blanco)
- monzonlabs-mark-light.svg   → solo el mark (M de nodos), fondos claros
- monzonlabs-mark-dark.svg    → solo el mark, fondos oscuros
- favicon.ico                 → favicon clásico multi-tamaño (16/32/48)
- favicon-16/32/48.png        → favicons PNG individuales
- apple-touch-icon-180.png    → icono iOS (mark blanco sobre navy)
- icon-512.png                → PWA / manifest
- avatar-social-1024.png      → avatar para LinkedIn, X, Instagram

Los SVG tienen el texto convertido a curvas: se ven idénticos en cualquier
dispositivo sin depender de fuentes instaladas. Tipografía original: Outfit
(Bold para MONZON, Regular para LABS) — licencia OFL, gratis en Google Fonts.

## Snippet para el <head> de la landing (Next.js: /app layout o /public)
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
```

## Reglas de uso rápidas
- Fondo claro → versión light (navy). Fondo oscuro → versión dark (blanco).
- El nodo dorado siempre es el central (el vértice de la M).
- Espacio mínimo alrededor del logo: la altura de la palabra LABS.
- No estirar, no cambiar el dorado por otro color, no agregar sombras.
