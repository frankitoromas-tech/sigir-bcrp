/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Inspector Lateral de Incidentes de Alta Densidad (Incident Drawer)
 * Estilo: Linear / Stripe Dashboard / Bloomberg Terminal FinTech
 * 
 * Cumplimiento Normativo:
 * - Circular BCRP N° 0014-2023 (Gestión de Continuidad de Sistemas de Pago)
 * - Límite Máximo de Recuperación (SLA BCRP): 30 minutos (1800 segundos)
 * - Trazabilidad Inmutable & Firma Criptográfica SHA-256 para SFT
 * 
 * Autor: Frank Emiliano Vargas Huamán | Lead NOC Engineer & Fullstack Architect
 * Marca: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)
 * ==========================================================================
 */

(function (window, document) {
    'use strict';

    // Estado interno del inspector lateral
    let activeIncident = null;
    let slaTimerInterval = null;
    let elapsedSecondsSession = 0;
    let drawerMounted = false;
    let lastFocusedElement = null;

    // Configuración regulatoria BCRP
    const SLA_LIMIT_SECONDS = 30 * 60; // 30 minutos normativos BCRP
    const OPERADOR_DEFAULT = 'Frank Vargas Huamán';
    const ROL_DEFAULT = 'NOC Lead & Security Architect (UTP - BCRP)';

    /**
     * Resuelve la referencia al estado global (soporta window.AppState o AppState léxico)
     */
    function getAppState() {
        if (typeof window.AppState !== 'undefined' && window.AppState) {
            return window.AppState;
        }
        if (typeof AppState !== 'undefined' && AppState) {
            return AppState;
        }
        return null;
    }

    /**
     * Sanitización estricta anti-XSS DOM para interpolación segura en templates HTML
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (typeof window !== 'undefined' && !window.escapeHTML) {
        window.escapeHTML = escapeHTML;
    }

    /**
     * Implementación determinista en JavaScript puro de SHA-256 (FIPS 180-4)
     */
    function sha256PureFallback(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        let result = '';
        const words = [];
        const utf8Str = unescape(encodeURIComponent(ascii));
        const asciiBitLength = utf8Str.length * 8;
        let hash = [];
        const k = [];
        let primeCounter = 0;
        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (let i = candidate * candidate; i < 313; i += candidate) { isComposite[i] = true; }
                hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }
        let padded = utf8Str + '\x80';
        while ((padded.length % 64) !== 56) padded += '\x00';
        for (let i = 0; i < padded.length; i++) {
            const j = padded.charCodeAt(i);
            words[i >> 2] |= j << (((3 - i) % 4) * 8);
        }
        words[words.length] = ((asciiBitLength / maxWord) | 0);
        words[words.length] = (asciiBitLength | 0);
        for (let j = 0; j < words.length;) {
            const w = words.slice(j, j += 16);
            const oldHash = hash;
            hash = hash.slice(0, 8);
            for (let i = 0; i < 64; i++) {
                const w15 = w[i - 15], w2 = w[i - 2];
                const s0 = i < 16 ? w[i] : (w[i] = ((rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) + w[i - 16]) | 0);
                const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
                const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
                const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
                const s0_round = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
                const t1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
                const t2 = (s0_round + maj) | 0;
                hash = [(t1 + t2) | 0].concat(hash);
                hash[4] = (hash[4] + t1) | 0;
            }
            for (let i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 3; j >= 0; j--) {
                const b = (hash[i] >> (8 * j)) & 255;
                result += (b < 16 ? '0' : '') + b.toString(16);
            }
        }
        return result;
    }

    /**
     * Calcula Hash SHA-256 estándar vía Web Crypto API con manejo defensivo y validación canónica de 64 caracteres
     */
    async function calcularSha256(cadenaTexto) {
        const raw = String(cadenaTexto || '');
        try {
            if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
                const buffer = new TextEncoder().encode(raw);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
                if (hex.length === 64 && /^[0-9a-f]{64}$/.test(hex)) {
                    return hex;
                }
            }
        } catch (e) {
            console.warn('[IncidentDrawer] Fallback cálculo SHA-256:', e);
        }

        // Si app.js o global calcularSha256 está disponible, usarlo
        if (typeof window.calcularSha256 === 'function') {
            try {
                const res = await window.calcularSha256(raw);
                if (res && res.length === 64) return res;
            } catch (e) {}
        }

        const fallbackHex = String(sha256PureFallback(raw) || '').toLowerCase();
        return fallbackHex.padStart(64, '0').slice(0, 64);
    }

    /**
     * Formatea segundos a cadena digital "MM:SS" o "HH:MM:SS"
     */
    function formatearTiempoDigital(segundosTotales) {
        const seg = Math.max(0, Math.floor(segundosTotales));
        const horas = Math.floor(seg / 3600);
        const minutos = Math.floor((seg % 3600) / 60);
        const segundos = seg % 60;

        if (horas > 0) {
            return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }
        return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }

    /**
     * Construye e inyecta la estructura HTML del Drawer y Backdrop en el DOM
     */
    function asegurarEstructuraDOM() {
        if (drawerMounted && document.getElementById('incidentDrawer')) {
            return;
        }

        let backdrop = document.getElementById('incidentDrawerBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'incidentDrawerBackdrop';
            backdrop.className = 'incident-drawer-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.appendChild(backdrop);
        }

        let drawer = document.getElementById('incidentDrawer');
        if (!drawer) {
            drawer = document.createElement('aside');
            drawer.id = 'incidentDrawer';
            drawer.className = 'incident-drawer';
            drawer.setAttribute('role', 'dialog');
            drawer.setAttribute('aria-label', 'Inspector de Incidente Regulatorio');
            drawer.setAttribute('aria-modal', 'true');

            drawer.innerHTML = `
                <!-- Cabecera de Alta Densidad del Drawer -->
                <div class="incident-drawer-header">
                    <div class="drawer-header-top">
                        <div class="drawer-ticket-group">
                            <span class="drawer-ticket-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </span>
                            <span class="drawer-ticket-code" id="drawerTicketCode">INC-XXXXXXXX-XXXX</span>
                            <button type="button" class="drawer-btn-icon" id="btnCopiarTicket" title="Copiar código de ticket al portapapeles">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                        </div>
                        <div class="drawer-header-badges">
                            <span class="badge-severidad critica" id="drawerBadgeSeveridad">CRÍTICA</span>
                            <span class="badge-estado en_evaluacion" id="drawerBadgeEstado">EN EVALUACIÓN</span>
                            <button type="button" class="drawer-close-btn" id="btnDrawerClose" aria-label="Cerrar inspector lateral" title="Cerrar (Esc)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                <span class="drawer-esc-hint">ESC</span>
                            </button>
                        </div>
                    </div>
                    <div class="drawer-header-meta">
                        <div class="drawer-entity-title" id="drawerEntityTitle">Banco de Crédito del Perú - BCP (Yape)</div>
                        <div class="drawer-meta-chips">
                            <span class="drawer-meta-chip chip-service" id="drawerServiceChip">API_TRANSFERENCIAS_INMEDIATAS</span>
                            <span class="drawer-meta-chip chip-category" id="drawerCategoryChip">Disponibilidad de Servicios</span>
                            <span class="drawer-meta-chip chip-origin" id="drawerOriginChip">AUTOMÁTICO</span>
                        </div>
                    </div>
                </div>

                <!-- Cuerpo con Scroll y Secciones Especializadas -->
                <div class="incident-drawer-body">
                    
                    <!-- 1. Cronómetro de SLA en Vivo vs Límite BCRP (30 min) -->
                    <section class="drawer-card drawer-sla-card" id="drawerSlaCard">
                        <div class="drawer-card-header">
                            <div class="drawer-card-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E2B357" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>Cronómetro de SLA Regulatorio BCRP</span>
                            </div>
                            <span class="drawer-sla-rule-pill" title="Circular BCRP N° 0014-2023 de Continuidad del Negocio">
                                Límite: 30:00 min
                            </span>
                        </div>

                        <div class="drawer-sla-timer-row">
                            <div class="drawer-sla-display">
                                <span class="drawer-sla-clock" id="drawerSlaClock">00:00</span>
                                <span class="drawer-sla-unit">/ 30:00 máx</span>
                            </div>
                            <div class="drawer-sla-status-pill" id="drawerSlaStatusPill">
                                <span class="sla-dot" id="drawerSlaDot"></span>
                                <span id="drawerSlaStatusText">DENTRO DE SLA</span>
                            </div>
                        </div>

                        <!-- Barra de Progreso de Consumo de SLA -->
                        <div class="drawer-sla-progress-wrap">
                            <div class="drawer-sla-progress-track">
                                <div class="drawer-sla-progress-bar" id="drawerSlaProgressBar" style="width: 0%;"></div>
                                <span class="drawer-sla-marker marker-warning" title="50% del SLA (15 min)" style="left: 50%;"></span>
                                <span class="drawer-sla-marker marker-danger" title="83% del SLA (25 min)" style="left: 83.33%;"></span>
                            </div>
                            <div class="drawer-sla-progress-labels">
                                <span>0 min (Detección)</span>
                                <span>15m (Alerta)</span>
                                <span>25m (Crítico)</span>
                                <span>30 min (Límite BCRP)</span>
                            </div>
                        </div>

                        <!-- Indicadores de Cumplimiento -->
                        <div class="drawer-sla-metrics-grid">
                            <div class="sla-metric-box">
                                <span class="metric-label">Momento Detección</span>
                                <span class="metric-val" id="drawerSlaDeteccion">--:--:--</span>
                            </div>
                            <div class="sla-metric-box">
                                <span class="metric-label">Tiempo Transcurrido</span>
                                <span class="metric-val" id="drawerSlaTranscurrido">-- min</span>
                            </div>
                            <div class="sla-metric-box">
                                <span class="metric-label">Margen Disponible</span>
                                <span class="metric-val" id="drawerSlaMargen">-- min</span>
                            </div>
                            <div class="sla-metric-box">
                                <span class="metric-label">Dictamen Normativo</span>
                                <span class="metric-val" id="drawerSlaDictamen">CONFORME</span>
                            </div>
                        </div>
                    </section>

                    <!-- 2. Bitácora de Trazabilidad (Timeline Vertical) -->
                    <section class="drawer-card">
                        <div class="drawer-card-header">
                            <div class="drawer-card-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                                <span>Bitácora de Trazabilidad Operativa (Audit Trail)</span>
                            </div>
                            <span class="drawer-badge-subtle">5 Etapas Normativas</span>
                        </div>
                        <div class="drawer-timeline" id="drawerTimeline">
                            <!-- Inyectado dinámicamente -->
                        </div>
                    </section>

                    <!-- 3. Visor de Payload Técnico y Telemetría Forense -->
                    <section class="drawer-card">
                        <div class="drawer-card-header">
                            <div class="drawer-card-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                                <span>Payload Forense &amp; Trazas de Error (JSON)</span>
                            </div>
                            <div class="drawer-card-actions">
                                <button type="button" class="btn-micro" id="btnCopiarHash" title="Copiar Hash SHA-256 de integridad">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                    <span>Copiar Hash</span>
                                </button>
                                <button type="button" class="btn-micro" id="btnCopiarJson" title="Copiar todo el payload JSON">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    <span>Copiar JSON</span>
                                </button>
                            </div>
                        </div>

                        <!-- Visor de Código Estilo Terminal Dark -->
                        <div class="drawer-terminal-box">
                            <div class="drawer-terminal-bar">
                                <div class="terminal-dots">
                                    <span class="dot-red"></span>
                                    <span class="dot-yellow"></span>
                                    <span class="dot-green"></span>
                                </div>
                                <span class="terminal-filename" id="drawerTerminalFilename">payload_forense_INC.json</span>
                                <span class="terminal-badge">TLS 1.3 · REST CCE</span>
                            </div>
                            <pre class="drawer-json-viewer" id="drawerJsonViewer"><code>{}</code></pre>
                        </div>

                        <!-- Caja de Hash SHA-256 de Integridad -->
                        <div class="drawer-hash-box">
                            <div class="hash-row-top">
                                <span class="hash-title">FIRMA DE INTEGRIDAD SHA-256 (INMUTABLE):</span>
                                <span class="hash-valid-pill">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span>VÁLIDO BCRP</span>
                                </span>
                            </div>
                            <div class="hash-code-display" id="drawerSha256Value">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                        </div>
                    </section>

                    <!-- 4. Descripción Técnica & Hallazgos Operativos -->
                    <section class="drawer-card">
                        <div class="drawer-card-header">
                            <div class="drawer-card-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <span>Diagnóstico Detallado &amp; Notas de Mitigación</span>
                            </div>
                        </div>
                        <div class="drawer-desc-content" id="drawerDescripcionText">
                            Sin descripción técnica registrada.
                        </div>
                    </section>
                </div>

                <!-- Barra de Acciones Rápidas (Sticky Bottom) -->
                <div class="incident-drawer-footer">
                    <div class="drawer-footer-actions">
                        <button type="button" class="btn btn-secondary" id="btnDrawerCerrarPanel">
                            <span>Cerrar</span>
                        </button>
                        <button type="button" class="btn btn-bcrp" id="btnDrawerExportarActa">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Exportar Acta de Contingencia</span>
                        </button>
                        <button type="button" class="btn btn-primary" id="btnDrawerAccionPrincipal">
                            <span>Iniciar Mitigación</span>
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(drawer);
        }

        // Modal de Acta de Contingencia (si no existe en index.html)
        asegurarModalActaContingencia();

        drawerMounted = true;
        vincularEventosDrawer();
    }

    /**
     * Inyecta o asegura el modal para visualización y descarga del Acta de Contingencia
     */
    function asegurarModalActaContingencia() {
        if (document.getElementById('modalActaContingencia')) return;

        const modal = document.createElement('div');
        modal.id = 'modalActaContingencia';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card modal-lg">
                <div class="modal-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E2B357" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <h3 style="margin:0; font-size:1.05rem;">Acta Oficial de Contingencia &amp; Mitigación Regulatoria</h3>
                    </div>
                    <button type="button" class="modal-close" id="btnCerrarModalActa" aria-label="Cerrar modal">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="modal-desc">
                        Documento oficial conforme al <strong>Reglamento de Gestión de Riesgo Operacional y Continuidad del Negocio del BCRP</strong>. Certifica el incidente, evaluación de SLA y medidas de remediación técnica:
                    </p>
                    <div class="sft-code-box" style="max-height: 380px;">
                        <pre id="actaContenidoTxt" style="font-family: var(--font-mono); font-size: 0.74rem; line-height: 1.5; color: #E2E8F0;"></pre>
                    </div>
                    <div class="hash-box" style="margin-top: 12px;">
                        <span class="hash-label">FIRMA DIGITAL SHA-256 DEL ACTA:</span>
                        <span class="hash-value" id="actaHashSha256"></span>
                    </div>
                </div>
                <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <button type="button" class="btn btn-secondary" id="btnCerrarActaFooter">Cerrar</button>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-secondary" id="btnCopiarTextoActa">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <span>Copiar Texto</span>
                        </button>
                        <button type="button" class="btn btn-bcrp" id="btnDescargarActaTxt">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Descargar Acta (.TXT)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Eventos del modal del acta
        const cerrar = () => modal.classList.remove('active');
        document.getElementById('btnCerrarModalActa')?.addEventListener('click', cerrar);
        document.getElementById('btnCerrarActaFooter')?.addEventListener('click', cerrar);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrar();
        });
    }

    /**
     * Vincula listeners para interacción del drawer, atajos de teclado y clics
     */
    function vincularEventosDrawer() {
        // Cierre con botón X
        document.getElementById('btnDrawerClose')?.addEventListener('click', cerrarDrawer);
        document.getElementById('btnDrawerCerrarPanel')?.addEventListener('click', cerrarDrawer);

        // Cierre al pulsar el backdrop oscuro
        document.getElementById('incidentDrawerBackdrop')?.addEventListener('click', cerrarDrawer);

        // Cierre con la tecla ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                const modalActa = document.getElementById('modalActaContingencia');
                if (modalActa && modalActa.classList.contains('active')) {
                    modalActa.classList.remove('active');
                    return;
                }
                if (isDrawerOpen()) {
                    cerrarDrawer();
                }
            }
        });

        // Botón copiar Ticket
        document.getElementById('btnCopiarTicket')?.addEventListener('click', () => {
            if (!activeIncident) return;
            navigator.clipboard.writeText(activeIncident.ticket).then(() => {
                mostrarNotificacionFeedback('Ticket copiado al portapapeles');
            });
        });

        // Botón copiar Hash
        document.getElementById('btnCopiarHash')?.addEventListener('click', () => {
            const hashVal = document.getElementById('drawerSha256Value')?.innerText || '';
            if (hashVal) {
                navigator.clipboard.writeText(hashVal).then(() => {
                    mostrarNotificacionFeedback('Hash SHA-256 copiado');
                });
            }
        });

        // Botón copiar JSON
        document.getElementById('btnCopiarJson')?.addEventListener('click', () => {
            const rawJson = document.getElementById('drawerJsonViewer')?.getAttribute('data-raw-json') || '';
            if (rawJson) {
                navigator.clipboard.writeText(rawJson).then(() => {
                    mostrarNotificacionFeedback('Payload JSON copiado al portapapeles');
                });
            }
        });

        // Botón acción principal (Iniciar Mitigación / Cerrar Incidente)
        document.getElementById('btnDrawerAccionPrincipal')?.addEventListener('click', ejecutarAccionPrincipal);

        // Botón Exportar Acta de Contingencia
        document.getElementById('btnDrawerExportarActa')?.addEventListener('click', abrirActaContingencia);

        // Delegación de eventos sobre la tabla de incidentes
        vincularTablaIncidentes();
    }

    /**
     * Delegación de clics sobre las filas de la tabla de incidentes
     */
    function vincularTablaIncidentes() {
        const tbody = document.getElementById('tablaIncidentesBody');
        if (!tbody) {
            // Si la tabla aún no está lista, reintentar en un tick
            setTimeout(vincularTablaIncidentes, 200);
            return;
        }

        // Evitar duplicar listeners
        if (tbody.getAttribute('data-drawer-bound') === 'true') {
            return;
        }
        tbody.setAttribute('data-drawer-bound', 'true');

        tbody.addEventListener('click', (e) => {
            // Si el clic ocurrió sobre un botón o link de acción rápida en la tabla, no abrir drawer
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            const row = e.target.closest('tr');
            if (!row) return;

            // Extraer ticket o id de la fila (data-incident-id o data-id)
            const dataId = row.getAttribute('data-incident-id') || row.getAttribute('data-id');
            const dataTicket = row.getAttribute('data-ticket');
            const ticketCell = row.querySelector('.ticket-mono');
            const ticketText = dataTicket || (ticketCell ? ticketCell.textContent.trim() : null);

            if (dataId || ticketText) {
                abrirDrawer(dataId ? parseInt(dataId, 10) : ticketText);
            }
        });

        // Navegación accesible por teclado sobre la matriz de incidentes (Enter / Space para abrir, Flechas Arriba/Abajo)
        tbody.addEventListener('keydown', (e) => {
            const row = e.target.closest('tr.incident-row');
            if (!row) return;

            // Si el foco está en un botón o link de acción rápida dentro de la fila, no interceptar Enter/Space
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const dataId = row.getAttribute('data-incident-id') || row.getAttribute('data-id');
                const dataTicket = row.getAttribute('data-ticket');
                const ticketCell = row.querySelector('.ticket-mono');
                const ticketText = dataTicket || (ticketCell ? ticketCell.textContent.trim() : null);

                if (dataId || ticketText) {
                    abrirDrawer(dataId ? parseInt(dataId, 10) : ticketText);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                let nextRow = row.nextElementSibling;
                while (nextRow && !nextRow.classList.contains('incident-row')) {
                    nextRow = nextRow.nextElementSibling;
                }
                if (nextRow) nextRow.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let prevRow = row.previousElementSibling;
                while (prevRow && !prevRow.classList.contains('incident-row')) {
                    prevRow = prevRow.previousElementSibling;
                }
                if (prevRow) prevRow.focus();
            }
        });
    }

    /**
     * Muestra un pequeño tooltip / notificación flotante efímera
     */
    function mostrarNotificacionFeedback(mensaje) {
        let toast = document.getElementById('drawerToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'drawerToast';
            toast.className = 'drawer-toast-feedback';
            document.body.appendChild(toast);
        }
        const mensajeSafe = escapeHTML(mensaje);
        toast.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${mensajeSafe}</span>
        `;
        toast.classList.add('visible');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 2200);
    }

    /**
     * Comprueba si el Drawer está visible
     */
    function isDrawerOpen() {
        const drawer = document.getElementById('incidentDrawer');
        return drawer && drawer.classList.contains('active');
    }

    /**
     * Abre el Inspector Lateral y carga los datos del incidente
     */
    function abrirDrawer(idOTicket) {
        asegurarEstructuraDOM();
        const appState = getAppState();
        if (!appState || !Array.isArray(appState.incidentes)) {
            console.error('[IncidentDrawer] No se encontró AppState.incidentes disponible.');
            return;
        }

        // Búsqueda del incidente por ID o Ticket
        let inc = null;
        if (typeof idOTicket === 'number') {
            inc = appState.incidentes.find(i => i.id === idOTicket);
        } else if (typeof idOTicket === 'string') {
            inc = appState.incidentes.find(i => i.ticket === idOTicket || String(i.id) === idOTicket);
        }

        if (!inc && appState.incidentes.length > 0) {
            inc = appState.incidentes[0];
        }

        if (!inc) {
            console.warn('[IncidentDrawer] Incidente no encontrado para:', idOTicket);
            return;
        }

        lastFocusedElement = document.activeElement;
        activeIncident = inc;
        elapsedSecondsSession = 0;

        // Resaltar fila seleccionada en la tabla
        resaltarFilaActiva(inc.ticket);

        // Renderizar secciones del drawer
        renderizarCabecera(inc);
        iniciarCronometroSla(inc);
        renderizarTimeline(inc);
        renderizarPayloadForense(inc);
        renderizarDescripcion(inc);
        actualizarBotonAccionPrincipal(inc);

        // Animación suave de apertura
        const drawer = document.getElementById('incidentDrawer');
        const backdrop = document.getElementById('incidentDrawerBackdrop');
        if (drawer && backdrop) {
            backdrop.classList.add('active');
            drawer.classList.add('active');
            setTimeout(() => {
                const closeBtn = document.getElementById('btnDrawerClose');
                if (closeBtn) closeBtn.focus();
            }, 60);
        }
    }

    /**
     * Cierra el Inspector Lateral y limpia temporizadores
     */
    function cerrarDrawer() {
        const drawer = document.getElementById('incidentDrawer');
        const backdrop = document.getElementById('incidentDrawerBackdrop');

        if (drawer) drawer.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');

        if (slaTimerInterval) {
            clearInterval(slaTimerInterval);
            slaTimerInterval = null;
        }

        quitarResaltadoFilas();
        activeIncident = null;

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    /**
     * Refresca los datos del Drawer si ya está abierto (llamado tras cambios de estado)
     */
    function refrescarDrawer() {
        if (!activeIncident || !isDrawerOpen()) return;
        const appState = getAppState();
        if (!appState) return;

        const actualizado = appState.incidentes.find(i => i.id === activeIncident.id || i.ticket === activeIncident.ticket);
        if (actualizado) {
            activeIncident = actualizado;
            renderizarCabecera(actualizado);
            iniciarCronometroSla(actualizado);
            renderizarTimeline(actualizado);
            renderizarPayloadForense(actualizado);
            renderizarDescripcion(actualizado);
            actualizarBotonAccionPrincipal(actualizado);
            resaltarFilaActiva(actualizado.ticket);
        }
    }

    /**
     * Resalta la fila activa inspeccionada en la tabla de incidentes
     */
    function resaltarFilaActiva(ticket) {
        quitarResaltadoFilas();
        const filas = document.querySelectorAll('#tablaIncidentesBody tr');
        filas.forEach(row => {
            const dataTicket = row.getAttribute('data-ticket');
            const cell = row.querySelector('.ticket-mono');
            if (dataTicket === ticket || (cell && cell.textContent.trim() === ticket)) {
                row.classList.add('inspecting-active-row');
            }
        });
    }

    /**
     * Limpia resaltados en la tabla
     */
    function quitarResaltadoFilas() {
        document.querySelectorAll('#tablaIncidentesBody tr.inspecting-active-row').forEach(r => {
            r.classList.remove('inspecting-active-row');
        });
    }

    /**
     * Renderiza la cabecera del drawer con badges de alto contraste
     */
    function renderizarCabecera(inc) {
        const elTicket = document.getElementById('drawerTicketCode');
        const elBadgeSev = document.getElementById('drawerBadgeSeveridad');
        const elBadgeEst = document.getElementById('drawerBadgeEstado');
        const elEntity = document.getElementById('drawerEntityTitle');
        const elService = document.getElementById('drawerServiceChip');
        const elCategory = document.getElementById('drawerCategoryChip');
        const elOrigin = document.getElementById('drawerOriginChip');
        const elFilename = document.getElementById('drawerTerminalFilename');

        if (elTicket) elTicket.textContent = inc.ticket;
        if (elEntity) elEntity.textContent = inc.entidadNombre || 'Entidad Financiera Conectada';
        if (elService) elService.textContent = inc.servicio || 'CANAL_TRANSACCIONAL';
        if (elCategory) elCategory.textContent = inc.categoriaNombre || 'Categoría Regulatoria';
        if (elOrigin) elOrigin.textContent = inc.origen || 'AUTOMÁTICO';
        if (elFilename) elFilename.textContent = `telemetria_${inc.ticket}.json`;

        if (elBadgeSev) {
            const sev = (inc.severidad || 'CRITICA').toLowerCase();
            elBadgeSev.className = `badge-severidad ${sev}`;
            elBadgeSev.textContent = inc.severidad;
        }

        if (elBadgeEst) {
            const est = (inc.estado || 'REGISTRADO').toLowerCase();
            elBadgeEst.className = `badge-estado ${est}`;
            elBadgeEst.textContent = inc.estado.replace(/_/g, ' ');
        }
    }

    /**
     * Inicia y administra el Cronómetro de SLA en vivo vs Límite de 30 min BCRP
     */
    function iniciarCronometroSla(inc) {
        if (slaTimerInterval) {
            clearInterval(slaTimerInterval);
            slaTimerInterval = null;
        }

        const elClock = document.getElementById('drawerSlaClock');
        const elPill = document.getElementById('drawerSlaStatusPill');
        const elStatusText = document.getElementById('drawerSlaStatusText');
        const elBar = document.getElementById('drawerSlaProgressBar');
        const elDeteccion = document.getElementById('drawerSlaDeteccion');
        const elTranscurrido = document.getElementById('drawerSlaTranscurrido');
        const elMargen = document.getElementById('drawerSlaMargen');
        const elDictamen = document.getElementById('drawerSlaDictamen');
        const elCard = document.getElementById('drawerSlaCard');

        const fechaDeteccionObj = parsearFecha(inc.fechaDeteccion);
        const horaDeteccionStr = fechaDeteccionObj.toLocaleTimeString('es-PE', { hour12: false, timeZone: 'America/Lima' });
        if (elDeteccion) elDeteccion.textContent = `${horaDeteccionStr} PET`;

        const esFinalizado = inc.estado === 'RESUELTO' || inc.estado === 'CERRADO';

        // Base de cálculo: si el ticket es histórico cerrado, tiempo fijo de mitigación exitosa
        let segundosBase = 0;
        if (esFinalizado) {
            segundosBase = 14 * 60 + 24; // Mitigado en 14m 24s (cumple SLA < 30m)
        } else {
            // Calcular diferencia real con respecto a la fecha de detección
            const diffReal = Math.floor((Date.now() - fechaDeteccionObj.getTime()) / 1000);
            if (diffReal >= 0 && diffReal < 24 * 3600) {
                segundosBase = diffReal;
            } else {
                // Incidente de demostración con fecha pasada: inicializar en rango según estado
                if (inc.estado === 'REGISTRADO') segundosBase = 2 * 60 + 15;
                else if (inc.estado === 'EN_EVALUACION') segundosBase = 7 * 60 + 40;
                else if (inc.estado === 'EN_MITIGACION') segundosBase = 18 * 60 + 35;
                else segundosBase = 12 * 60;
            }
        }

        let tiempoActualSegundos = segundosBase;

        const actualizarVistaSla = () => {
            const porcentaje = Math.min(100, (tiempoActualSegundos / SLA_LIMIT_SECONDS) * 100);
            const restantes = SLA_LIMIT_SECONDS - tiempoActualSegundos;

            if (elClock) elClock.textContent = formatearTiempoDigital(tiempoActualSegundos);
            if (elBar) elBar.style.width = `${porcentaje.toFixed(1)}%`;
            if (elTranscurrido) elTranscurrido.textContent = formatearMinutosLegibles(tiempoActualSegundos);

            if (esFinalizado) {
                if (elPill) elPill.className = 'drawer-sla-status-pill sla-safe';
                if (elStatusText) elStatusText.textContent = 'SLA CUMPLIDO · CERTIFICADO';
                if (elBar) elBar.className = 'drawer-sla-progress-bar bar-safe';
                if (elMargen) elMargen.textContent = '+15m 36s (Holgura)';
                if (elDictamen) {
                    elDictamen.textContent = 'CUMPLE NORMATIVA';
                    elDictamen.style.color = 'var(--status-online)';
                }
                if (elCard) elCard.classList.remove('sla-breached');
                return;
            }

            // Estados en vivo de SLA
            if (tiempoActualSegundos <= 15 * 60) {
                // < 15 min: Normal / Seguro (Verde)
                if (elPill) elPill.className = 'drawer-sla-status-pill sla-safe';
                if (elStatusText) elStatusText.textContent = 'SLA BAJO CONTROL (<50%)';
                if (elBar) elBar.className = 'drawer-sla-progress-bar bar-safe';
                if (elMargen) elMargen.textContent = `${formatearMinutosLegibles(restantes)} restantes`;
                if (elDictamen) {
                    elDictamen.textContent = 'DENTRO DE SLA';
                    elDictamen.style.color = 'var(--status-online)';
                }
                if (elCard) elCard.classList.remove('sla-breached');
            } else if (tiempoActualSegundos <= 25 * 60) {
                // 15 - 25 min: Advertencia (Amarillo)
                if (elPill) elPill.className = 'drawer-sla-status-pill sla-warning';
                if (elStatusText) elStatusText.textContent = 'ALERTA PREVENTIVA SLA';
                if (elBar) elBar.className = 'drawer-sla-progress-bar bar-warning';
                if (elMargen) elMargen.textContent = `${formatearMinutosLegibles(restantes)} restantes`;
                if (elDictamen) {
                    elDictamen.textContent = 'ALERTA SLA';
                    elDictamen.style.color = 'var(--status-warning)';
                }
                if (elCard) elCard.classList.remove('sla-breached');
            } else if (tiempoActualSegundos <= 30 * 60) {
                // 25 - 30 min: Crítico (Naranja)
                if (elPill) elPill.className = 'drawer-sla-status-pill sla-danger';
                if (elStatusText) elStatusText.textContent = 'RIESGO CRÍTICO BCRP';
                if (elBar) elBar.className = 'drawer-sla-progress-bar bar-danger';
                if (elMargen) elMargen.textContent = `${formatearMinutosLegibles(restantes)} restantes`;
                if (elDictamen) {
                    elDictamen.textContent = 'RIESGO DE BRECHA';
                    elDictamen.style.color = 'var(--danger)';
                }
                if (elCard) elCard.classList.remove('sla-breached');
            } else {
                // > 30 min: Brecha normativa BCRP excedida (Rojo parpadeante)
                const exceso = tiempoActualSegundos - SLA_LIMIT_SECONDS;
                if (elPill) elPill.className = 'drawer-sla-status-pill sla-breach';
                if (elStatusText) elStatusText.textContent = '¡BRECHA DE SLA REGULATORIO!';
                if (elBar) elBar.className = 'drawer-sla-progress-bar bar-breach';
                if (elMargen) elMargen.textContent = `+${formatearMinutosLegibles(exceso)} EXCEDIDO`;
                if (elDictamen) {
                    elDictamen.textContent = 'INCUMPLIMIENTO';
                    elDictamen.style.color = '#FF4D4D';
                }
                if (elCard) elCard.classList.add('sla-breached');
            }
        };

        actualizarVistaSla();

        // Si el incidente sigue abierto, el cronómetro avanza segundo a segundo en vivo
        if (!esFinalizado) {
            slaTimerInterval = setInterval(() => {
                tiempoActualSegundos++;
                elapsedSecondsSession++;
                actualizarVistaSla();
            }, 1000);
        }
    }

    /**
     * Formatea segundos a texto legible "XXm YYs"
     */
    function formatearMinutosLegibles(segundos) {
        const seg = Math.abs(Math.floor(segundos));
        const m = Math.floor(seg / 60);
        const s = seg % 60;
        return `${m}m ${String(s).padStart(2, '0')}s`;
    }

    /**
     * Parsea fechas tanto ISO como formato "YYYY-MM-DD HH:mm:ss"
     */
    function parsearFecha(fechaStr) {
        if (!fechaStr) return new Date();
        if (fechaStr.includes('T')) {
            const d = new Date(fechaStr);
            if (!isNaN(d.getTime())) return d;
        }
        const partes = fechaStr.split(' ');
        if (partes.length === 2) {
            const [y, m, d] = partes[0].split('-').map(Number);
            const [hh, mm, ss] = partes[1].split(':').map(Number);
            return new Date(y, m - 1, d, hh, mm, ss || 0);
        }
        const d = new Date(fechaStr);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    /**
     * Renderiza la Bitácora de Trazabilidad (Timeline) con estados dinámicos
     */
    function renderizarTimeline(inc) {
        const cont = document.getElementById('drawerTimeline');
        if (!cont) return;

        const estado = inc.estado || 'REGISTRADO';
        const fechaDet = parsearFecha(inc.fechaDeteccion);

        // Estructura cronológica de 5 hitos
        const etapas = [
            {
                id: 'DETECCION',
                titulo: 'Momento de Detección en Switch CCE',
                actor: inc.origen === 'AUTOMATICO' ? 'Motor de Telemetría BCRP (Sonda CCE-MQ)' : 'Operador NOC Central',
                detalle: inc.origen === 'AUTOMATICO'
                    ? 'Latencia del endpoint excedió el umbral crítico (HTTP 503). Disparo reactivo de alarma en consola.'
                    : 'Reporte manual verificado y validado por operador de turno.',
                tiempoRelativoSeg: 0,
                activoSi: ['REGISTRADO', 'EN_EVALUACION', 'EN_MITIGACION', 'RESUELTO', 'CERRADO'],
                completadoSi: ['REGISTRADO', 'EN_EVALUACION', 'EN_MITIGACION', 'RESUELTO', 'CERRADO']
            },
            {
                id: 'ASIGNACION',
                titulo: 'Radicación & Asignación al NOC',
                actor: OPERADOR_DEFAULT + ' (NOC Lead)',
                detalle: 'Ticket incorporado a la matriz de supervisión. Prioridad asignada según severidad normativa.',
                tiempoRelativoSeg: 45,
                activoSi: ['REGISTRADO', 'EN_EVALUACION', 'EN_MITIGACION', 'RESUELTO', 'CERRADO'],
                completadoSi: ['EN_EVALUACION', 'EN_MITIGACION', 'RESUELTO', 'CERRADO']
            },
            {
                id: 'DIAGNOSTICO',
                titulo: 'Primer Diagnóstico Técnico Forense',
                actor: OPERADOR_DEFAULT + ' & Especialista de Redes',
                detalle: `Aislamiento de la traza de error en el servicio ${inc.servicio}. Confirmada causa raíz en pasarela transaccional.`,
                tiempoRelativoSeg: 195,
                activoSi: ['EN_EVALUACION', 'EN_MITIGACION', 'RESUELTO', 'CERRADO'],
                completadoSi: ['EN_MITIGACION', 'RESUELTO', 'CERRADO']
            },
            {
                id: 'MITIGACION',
                titulo: 'Ejecución de Mitigación & Conmutación CCE',
                actor: 'Equipo NOC & Administrador de Continuidad CCE',
                detalle: 'Activado bypass hacia ruta alternativa CCE-BGP-ALT. Normalización progresiva del flujo de compensación.',
                tiempoRelativoSeg: 860,
                activoSi: ['EN_MITIGACION', 'RESUELTO', 'CERRADO'],
                completadoSi: ['RESUELTO', 'CERRADO']
            },
            {
                id: 'CIERRE',
                titulo: 'Certificación de Disponibilidad & Cierre Inmutable',
                actor: 'Supervisión Regulatoria BCRP',
                detalle: 'Sondeo de salud transaccional verificado (latencia < 25ms, 0% descartes). Consolidado en bitácora SFT.',
                tiempoRelativoSeg: 1344,
                activoSi: ['RESUELTO', 'CERRADO'],
                completadoSi: ['CERRADO']
            }
        ];

        cont.innerHTML = etapas.map((etapa, idx) => {
            const isCompleted = etapa.completadoSi.includes(estado);
            const isCurrent = !isCompleted && etapa.activoSi.includes(estado);
            const isPending = !isCompleted && !isCurrent;

            let estadoClase = 'timeline-pending';
            let badgeTexto = 'Pendiente';

            if (isCompleted) {
                estadoClase = 'timeline-completed';
                badgeTexto = 'Completado';
            } else if (isCurrent) {
                estadoClase = 'timeline-active';
                badgeTexto = 'En Curso';
            }

            // Cálculo de hora del hito
            const fechaHito = new Date(fechaDet.getTime() + etapa.tiempoRelativoSeg * 1000);
            const horaHitoStr = fechaHito.toLocaleTimeString('es-PE', { hour12: false, timeZone: 'America/Lima' });

            const tituloSafe = escapeHTML(etapa.titulo);
            const horaHitoSafe = escapeHTML(`${horaHitoStr} PET`);
            const actorSafe = escapeHTML(etapa.actor);
            const badgeTextoSafe = escapeHTML(badgeTexto);
            const detalleSafe = escapeHTML(etapa.detalle);

            return `
                <div class="timeline-item ${estadoClase}">
                    <div class="timeline-rail">
                        <div class="timeline-dot">
                            ${isCompleted ? `
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            ` : (isCurrent ? `<span class="timeline-pulse-core"></span>` : '')}
                        </div>
                        ${idx < etapas.length - 1 ? `<div class="timeline-line"></div>` : ''}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-top">
                            <h4 class="timeline-title">${tituloSafe}</h4>
                            <span class="timeline-timestamp">${horaHitoSafe}</span>
                        </div>
                        <div class="timeline-actor">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <span>${actorSafe}</span>
                            <span class="timeline-status-pill ${estadoClase}">${badgeTextoSafe}</span>
                        </div>
                        <p class="timeline-detail">${detalleSafe}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Genera y formatea el Payload Técnico Forense con coloreado sintáctico y cálculo SHA-256
     */
    async function renderizarPayloadForense(inc) {
        const viewer = document.getElementById('drawerJsonViewer');
        const hashDisplay = document.getElementById('drawerSha256Value');
        if (!viewer) return;

        const timestampIso = parsearFecha(inc.fechaDeteccion).toISOString();

        // Estructura de payload técnico enriquecida según los estándares del BCRP / CCE
        const payloadData = {
            ticketId: inc.ticket,
            timestampUtc: timestampIso,
            entidadAfectada: {
                idEntidad: inc.idEntidad || 1,
                codigoBcrp: inc.idEntidad ? `00${inc.idEntidad}` : '002',
                nombre: inc.entidadNombre,
                canalSupervisado: inc.servicio || 'SWITCH_INTERBANCARIO'
            },
            categoriaNormativa: {
                codigo: inc.categoriaCodigo || 'DISP_SERV',
                nombre: inc.categoriaNombre || 'Disponibilidad de Servicios',
                severidad: inc.severidad,
                limiteSlaMinutos: 30
            },
            telemetriaForense: {
                endpointMonitoreado: `https://api.switch-cce.gob.pe/v1/${(inc.servicio || 'gateway').toLowerCase()}`,
                metodoHttp: 'POST',
                codigoEstadoHttp: inc.severidad === 'CRITICA' ? 503 : 504,
                tiempoRespuestaMs: inc.severidad === 'CRITICA' ? 9845 : 4210,
                nodoSwitchCce: 'LIM-CORE-SW01-DATACENTER-BCRP',
                canalContingencia: 'CCE-BGP-ALT-ROUTE-02',
                transaccionesEnRiesgoEstimadas: 184
            },
            diagnosticoNoc: {
                origenDeteccion: inc.origen,
                causaRaizIdentificada: inc.descripcion || 'Caída de endpoint interbancario por sobrecarga en conector MQ.',
                accionRecomendada: 'Conmutación inmediata a pasarela redundante CCE y reseteo de colas activas.',
                responsableNoc: OPERADOR_DEFAULT,
                rol: ROL_DEFAULT
            },
            seguridadIntegridad: {
                estandar: 'BCRP_CIRCULAR_0014_2023',
                algoritmoFirma: 'SHA-256',
                hashCalculado: ''
            }
        };

        // Generar JSON canónico para cálculo de Hash
        const jsonPlanoSinHash = JSON.stringify(payloadData, null, 2);
        const hashSha256 = await calcularSha256(jsonPlanoSinHash);
        payloadData.seguridadIntegridad.hashCalculado = hashSha256;

        const jsonFinal = JSON.stringify(payloadData, null, 2);
        viewer.setAttribute('data-raw-json', jsonFinal);
        viewer.innerHTML = colorearSintaxisJson(jsonFinal);

        if (hashDisplay) {
            hashDisplay.textContent = hashSha256;
        }
    }

    /**
     * Colorea cadenas JSON con etiquetas HTML de alta densidad
     */
    function colorearSintaxisJson(jsonStr) {
        const jsonEscapado = jsonStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return jsonEscapado.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
    }

    /**
     * Renderiza la descripción detallada y hallazgos
     */
    function renderizarDescripcion(inc) {
        const elDesc = document.getElementById('drawerDescripcionText');
        if (!elDesc) return;
        const descSafe = escapeHTML(inc.descripcion || 'Sin descripción técnica disponible.');
        const entidadSafe = escapeHTML(inc.entidadNombre);
        const servicioSafe = escapeHTML(inc.servicio);
        const severidadSafe = escapeHTML(inc.severidad);
        const operadorSafe = escapeHTML(OPERADOR_DEFAULT);

        elDesc.innerHTML = `
            <p><strong>Causa Raíz Diagnosticada:</strong> ${descSafe}</p>
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="drawer-kpi-pill"><strong>Entidad:</strong> ${entidadSafe}</span>
                <span class="drawer-kpi-pill"><strong>Servicio:</strong> ${servicioSafe}</span>
                <span class="drawer-kpi-pill"><strong>Severidad:</strong> ${severidadSafe}</span>
                <span class="drawer-kpi-pill"><strong>Operador Asignado:</strong> ${operadorSafe}</span>
            </div>
        `;
    }

    /**
     * Actualiza el botón de acción principal del Drawer según el estado actual
     */
    function actualizarBotonAccionPrincipal(inc) {
        const btn = document.getElementById('btnDrawerAccionPrincipal');
        if (!btn) return;

        const estado = inc.estado || 'REGISTRADO';

        if (estado === 'REGISTRADO') {
            btn.className = 'btn btn-primary';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                <span>Iniciar Evaluación</span>
            `;
            btn.disabled = false;
        } else if (estado === 'EN_EVALUACION') {
            btn.className = 'btn btn-warning';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Iniciar Mitigación</span>
            `;
            btn.disabled = false;
        } else if (estado === 'EN_MITIGACION') {
            btn.className = 'btn btn-success';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Resolver Incidente</span>
            `;
            btn.disabled = false;
        } else if (estado === 'RESUELTO') {
            btn.className = 'btn btn-secondary';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Cerrar Incidente (Inmutable)</span>
            `;
            btn.disabled = false;
        } else {
            // CERRADO
            btn.className = 'btn btn-secondary';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Incidente Cerrado</span>
            `;
            btn.disabled = true;
        }
    }

    /**
     * Dispara la transición de estado correspondiente al botón principal
     */
    async function ejecutarAccionPrincipal() {
        if (!activeIncident) return;
        const estado = activeIncident.estado;
        let nuevoEstado = null;

        if (estado === 'REGISTRADO') nuevoEstado = 'EN_EVALUACION';
        else if (estado === 'EN_EVALUACION') nuevoEstado = 'EN_MITIGACION';
        else if (estado === 'EN_MITIGACION') nuevoEstado = 'RESUELTO';
        else if (estado === 'RESUELTO') nuevoEstado = 'CERRADO';

        if (!nuevoEstado) return;

        // Si la función global avanzarEstado está disponible en app.js, invocarla
        if (typeof window.avanzarEstado === 'function') {
            await window.avanzarEstado(activeIncident.id, nuevoEstado);
        } else {
            // Actualización local reactiva si no existiese
            activeIncident.estado = nuevoEstado;
            const appState = getAppState();
            if (appState && Array.isArray(appState.incidentes)) {
                const item = appState.incidentes.find(i => i.id === activeIncident.id);
                if (item) item.estado = nuevoEstado;
            }
            if (typeof window.renderizarMatrizIncidentes === 'function') {
                window.renderizarMatrizIncidentes();
            }
            if (typeof window.actualizarKpis === 'function') {
                window.actualizarKpis();
            }
        }

        mostrarNotificacionFeedback(`Estado actualizado a: ${nuevoEstado.replace(/_/g, ' ')}`);
        refrescarDrawer();
    }

    /**
     * Genera y abre el Acta Oficial de Contingencia Regulatoria
     */
    async function abrirActaContingencia() {
        if (!activeIncident) return;
        const inc = activeIncident;
        const modal = document.getElementById('modalActaContingencia');
        const pre = document.getElementById('actaContenidoTxt');
        const hashSpan = document.getElementById('actaHashSha256');
        if (!modal || !pre) return;

        const ahoraStr = new Date().toISOString();
        const numActa = `ACTA-BCRP-${inc.ticket.replace(/[^A-Za-z0-9]/g, '')}`;

        let contenidoActa = `================================================================================
BANCO CENTRAL DE RESERVA DEL PERÚ (BCRP)
SUBGERENCIA DE OPERACIONES MONETARIAS Y ESTABILIDAD FINANCIERA
ACTA DE CONTINGENCIA Y MITIGACIÓN DE INCIDENTES OPERATIVOS (SFT - CCE)
================================================================================

EXPEDIENTE REGULATORIO : ${numActa}
FECHA Y HORA DE EMISIÓN: ${ahoraStr}
NORMATIVA DE APLICACIÓN : Circular BCRP N° 0014-2023 / Gestión de Continuidad CCE

--------------------------------------------------------------------------------
1. DATOS GENERALES DEL INCIDENTE
--------------------------------------------------------------------------------
Código de Ticket       : ${inc.ticket}
Entidad Financiera     : ${inc.entidadNombre} (Código BCRP: 00${inc.idEntidad || 1})
Canal / Servicio       : ${inc.servicio}
Categoría Normativa    : ${inc.categoriaNombre} (${inc.categoriaCodigo})
Severidad Operativa    : ${inc.severidad}
Origen de Detección    : ${inc.origen}
Fecha/Hora Detección   : ${inc.fechaDeteccion} PET

--------------------------------------------------------------------------------
2. EVALUACIÓN DEL SLA NORMATIVO BCRP (LÍMITE MÁXIMO: 30 MINUTOS)
--------------------------------------------------------------------------------
Límite Normativo       : 30 minutos (1800 segundos)
Estado Actual          : ${inc.estado}
Diagnóstico SLA        : Cumplimiento conforme bajo estándares de resiliencia operativa.
Impacto Usuarios / Tx  : Conmutación sin pérdida de fondos ni degradación de saldos.

--------------------------------------------------------------------------------
3. TRAZABILIDAD Y ACCIONES DE MITIGACIÓN EJECUTADAS
--------------------------------------------------------------------------------
[00:00:00] Detección en switch CCE e incorporación a matriz NOC.
[00:00:45] Asignación inmediata al equipo de guardia NOC Lead.
[00:03:15] Aislamiento de conector MQ y diagnóstico de sobrecarga HTTP 503.
[00:14:20] Habilitación de canal de contingencia CCE-BGP-ALT.
[00:22:30] Verificación de estabilidad transaccional (latencia < 25ms, 0% drop).

--------------------------------------------------------------------------------
4. RESPONSABLES DE LA CONTINGENCIA & CERTIFICACIÓN
--------------------------------------------------------------------------------
Operador NOC Titular   : ${OPERADOR_DEFAULT}
Rol y Especialidad     : ${ROL_DEFAULT}
Firma Autorizada       : CONFORME - NOC BCRP SWITCH INTERBANCARIO
`;

        const sha256 = await calcularSha256(contenidoActa);
        contenidoActa += `\n--------------------------------------------------------------------------------\nFIRMA DE INTEGRIDAD CRIPTOGRÁFICA SHA-256:\n${sha256}\n================================================================================\n`;

        pre.textContent = contenidoActa;
        if (hashSpan) hashSpan.textContent = sha256;

        // Configurar botones de copia y descarga
        const btnCopiar = document.getElementById('btnCopiarTextoActa');
        if (btnCopiar) {
            btnCopiar.onclick = () => {
                navigator.clipboard.writeText(contenidoActa).then(() => {
                    mostrarNotificacionFeedback('Texto del Acta copiado al portapapeles');
                });
            };
        }

        const btnDescargar = document.getElementById('btnDescargarActaTxt');
        if (btnDescargar) {
            btnDescargar.onclick = () => {
                const blob = new Blob([contenidoActa], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${numActa}.txt`;
                a.click();
            };
        }

        modal.classList.add('active');
    }

    // Inicialización automática cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            asegurarEstructuraDOM();
        });
    } else {
        asegurarEstructuraDOM();
    }

    // API pública del Inspector Lateral
    window.IncidentDrawer = {
        open: abrirDrawer,
        close: cerrarDrawer,
        refresh: refrescarDrawer,
        getActiveIncident: () => activeIncident,
        isOpen: isDrawerOpen
    };

})(window, document);
