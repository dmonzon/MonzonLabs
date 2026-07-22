# Branding OEM — Monzon Labs

Kit para dejar la marca en cada computadora Windows que prepares o repares.

## Archivos

- `oemlogo.bmp` — mark solo (recomendado), 120×120 px, fondo blanco
- `oemlogo-con-texto.bmp` — mark + MONZON LABS (alternativa)
- `instalar-oem-monzonlabs.bat` — copia el logo a System32 y registra la info OEM

## Uso

1. Edita el .bat: pon tu teléfono real en `SupportPhone` (y ajusta horario si quieres).
2. Copia la carpeta a tu USB de técnico.
3. En la PC del cliente: clic derecho al .bat → **Ejecutar como administrador**.

## Dónde se ve

- **Windows 10/11:** los campos de texto (Monzon Labs, web, teléfono, horario) aparecen en Configuración → Sistema → Acerca de. El logo BMP es ignorado en estas versiones (Microsoft lo retiró desde Win10 1607), pero se instala igual — no estorba y cubre equipos viejos.
- **Windows 7/8 y Win10 viejo:** logo + info en Panel de Control → Sistema.

## Advertencia

En equipos de marca (Dell, HP, Lenovo) el script **reemplaza** la info de soporte del fabricante por la tuya. Para un técnico independiente eso es justo lo que quieres (el cliente te llama a ti), pero tenlo presente si el equipo está en garantía del fabricante.

Especificación Microsoft: BMP de 120×120 px ([docs](https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/microsoft-windows-shell-setup-oeminformation-logo)).
