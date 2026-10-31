/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Catálogo Vectorial de Iconos SVG Corporativos (Estándar Lucide / Heroicons)
 * 
 * Especificación de diseño:
 * - viewBox: "0 0 24 24"
 * - stroke: "currentColor"
 * - stroke-width: "2"
 * - fill: "none"
 * - stroke-linecap: "round"
 * - stroke-linejoin: "round"
 * 
 * Autor: Frank Emiliano Vargas Huamán (Frankosyni @frankitoromas-tech)
 * ==========================================================================
 */

// 1. Escudo institucional del BCRP / edificio del banco central
const ICON_BCRP_SHIELD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-bcrp-shield"><path d="M12 2L3 6v6c0 5.25 3.82 10.18 9 11.45 5.18-1.27 9-6.2 9-11.45V6l-9-4z"/><path d="m12 8-5 2.5v1h10v-1L12 8z"/><path d="M9 11.5v4"/><path d="M12 11.5v4"/><path d="M15 11.5v4"/><path d="M8 17h8"/></svg>`;

// Edificio bancario clásico (variante institucional complementaria)
const ICON_BANK_BUILDING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-bank-building"><line x1="3" y1="21" x2="21" y2="21"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="18" x2="22" y2="18"/></svg>`;

// 2. Onda electrocardiograma / telemetría de red y latencia NOC
const ICON_PULSE_HEARTBEAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-pulse-heartbeat"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;

// 3. Triángulo de alerta para incidentes críticos
const ICON_ALERT_CRITICAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-alert-critical"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

// 4. Reloj para temporizador de sondeo de telemetría (30s) y marcas de tiempo
const ICON_CLOCK_NOC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-clock-noc"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

// 5. Documento normativo estructurado con código (Reporte SFT BCRP)
const ICON_FILE_SFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-file-sft"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>`;

// 6. Check de verificación verde (éxito en validaciones y resolución de incidentes)
const ICON_CHECK_SUCCESS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-check-success"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;

// 7. Candado de seguridad criptográfica para firma e integridad SHA-256
const ICON_LOCK_SECURITY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-lock-security"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`;

// Iconos vectoriales adicionales para consola NOC
const ICON_SEARCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
const ICON_REFRESH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-refresh"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`;
const ICON_SERVER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
const ICON_DATABASE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`;
const ICON_DOWNLOAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const ICON_EXTERNAL_LINK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const ICON_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg icon-close"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

/**
 * Mapeo principal exportado con soporte para renderizado dinámico
 */
const SVGIcons = {
    // 7 Constantes requeridas
    ICON_BCRP_SHIELD,
    ICON_PULSE_HEARTBEAT,
    ICON_ALERT_CRITICAL,
    ICON_CLOCK_NOC,
    ICON_FILE_SFT,
    ICON_CHECK_SUCCESS,
    ICON_LOCK_SECURITY,

    // Acceso semántico por nombre
    bcrpShield: ICON_BCRP_SHIELD,
    pulseHeartbeat: ICON_PULSE_HEARTBEAT,
    alertCritical: ICON_ALERT_CRITICAL,
    clockNoc: ICON_CLOCK_NOC,
    fileSft: ICON_FILE_SFT,
    checkSuccess: ICON_CHECK_SUCCESS,
    lockSecurity: ICON_LOCK_SECURITY,

    // Iconos adicionales de infraestructura
    bankBuilding: ICON_BANK_BUILDING,
    search: ICON_SEARCH,
    refresh: ICON_REFRESH,
    server: ICON_SERVER,
    database: ICON_DATABASE,
    download: ICON_DOWNLOAD,
    externalLink: ICON_EXTERNAL_LINK,
    close: ICON_CLOSE,

    /**
     * Aplica atributos dinámicos (dimensiones, clases CSS o estilos en línea) a un string SVG
     * @param {string} svgString - Markup SVG original
     * @param {Object} attrs - Atributos a sobreescribir ({ size, width, height, className, style, strokeWidth })
     * @returns {string} Markup SVG adaptado
     */
    withAttrs(svgString, attrs = {}) {
        if (!svgString || typeof svgString !== 'string') return '';
        let result = svgString;

        const width = attrs.size || attrs.width;
        const height = attrs.size || attrs.height;

        if (width) {
            result = result.replace(/width="[^"]*"/, `width="${width}"`);
        }
        if (height) {
            result = result.replace(/height="[^"]*"/, `height="${height}"`);
        }
        if (attrs.strokeWidth) {
            result = result.replace(/stroke-width="[^"]*"/, `stroke-width="${attrs.strokeWidth}"`);
        }
        if (attrs.className) {
            if (/class="[^"]*"/.test(result)) {
                result = result.replace(/class="([^"]*)"/, `class="$1 ${attrs.className}"`);
            } else {
                result = result.replace('<svg', `<svg class="${attrs.className}"`);
            }
        }
        if (attrs.style) {
            if (/style="[^"]*"/.test(result)) {
                result = result.replace(/style="([^"]*)"/, `style="$1; ${attrs.style}"`);
            } else {
                result = result.replace('<svg', `<svg style="${attrs.style}"`);
            }
        }

        return result;
    },

    /**
     * Renderiza un icono por identificador con atributos opcionales
     * @param {string} name - Nombre del icono (ej. 'bcrpShield', 'ALERT_CRITICAL', 'fileSft')
     * @param {Object} [attrs] - Opciones de atributos ({ size, className, style })
     * @returns {string} String SVG renderizable en innerHTML
     */
    render(name, attrs = {}) {
        const raw = this[name] || this[`ICON_${name.toUpperCase()}`] || '';
        return attrs && Object.keys(attrs).length > 0 ? this.withAttrs(raw, attrs) : raw;
    }
};

// Registro en el ámbito global del navegador para compatibilidad con app.js e index.html
if (typeof window !== 'undefined') {
    window.ICON_BCRP_SHIELD = ICON_BCRP_SHIELD;
    window.ICON_BANK_BUILDING = ICON_BANK_BUILDING;
    window.ICON_PULSE_HEARTBEAT = ICON_PULSE_HEARTBEAT;
    window.ICON_ALERT_CRITICAL = ICON_ALERT_CRITICAL;
    window.ICON_CLOCK_NOC = ICON_CLOCK_NOC;
    window.ICON_FILE_SFT = ICON_FILE_SFT;
    window.ICON_CHECK_SUCCESS = ICON_CHECK_SUCCESS;
    window.ICON_LOCK_SECURITY = ICON_LOCK_SECURITY;
    window.SVGIcons = SVGIcons;
}

// Soporte para entornos modulares CommonJS / bundlers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ICON_BCRP_SHIELD,
        ICON_BANK_BUILDING,
        ICON_PULSE_HEARTBEAT,
        ICON_ALERT_CRITICAL,
        ICON_CLOCK_NOC,
        ICON_FILE_SFT,
        ICON_CHECK_SUCCESS,
        ICON_LOCK_SECURITY,
        SVGIcons
    };
}
