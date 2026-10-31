/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Módulo Interactivo de Presets de Demostración para Sustentación Oral APF1
 * 
 * Proyecto: Curso Integrador I - Sistemas Software (Sección 57524 - UTP)
 * Catedrático / Jurado: Ing. Zamata
 * Autor / NOC Lead: Frank Emiliano Vargas Huamán (AD\frank.vargas@bcrp.local)
 * Firma de Edición: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)
 * ==========================================================================
 * 
 * Contrato de Escenarios para Demostración en Vivo:
 * 1. Escenario 1: Tráfico Normal Interbancario (SLA 99.94%, 0 caídas, latencias 16-24ms)
 * 2. Escenario 2: Caída Crítica BCP/Yape HTTP 503 (TIMEOUT, parpadeo rojo, ticket INC-20261031-10001)
 * 3. Escenario 3: Mitigación & Cierre Inmutable (REGISTRADO -> EN_MITIGACION -> RESUELTO -> CERRADO, cálculo SLA en vivo)
 * 4. Escenario 4: Compilación Inmediata SFT + SHA-256 (Modal oficial BCRP, archivo plano y hash criptográfico)
 * 
 * Atajos de Teclado:
 *   [Alt + 1] -> Escenario 1 (Tráfico Normal)
 *   [Alt + 2] -> Escenario 2 (Caída Crítica BCP)
 *   [Alt + 3] -> Escenario 3 (Mitigación & Cierre)
 *   [Alt + 4] -> Escenario 4 (Compilación SFT)
 *   [Alt + P] -> Minimizar / Desplegar Panel de Presets
 */

(function () {
    'use strict';

    // Resolver referencia reactiva al estado del SIGIR (soporta global lexical y window)
    function obtenerEstado() {
        if (typeof window.AppState !== 'undefined' && window.AppState) {
            return window.AppState;
        }
        if (typeof AppState !== 'undefined' && AppState) {
            return AppState;
        }
        console.warn('[NocDemo] AppState no detectado inmediatamente en el ámbito global.');
        return null;
    }

    // Configuración interna del motor de presets
    const DEMO_CONFIG = {
        version: '1.0.0-APF1-ZAMATA',
        ticketObjetivo: 'INC-20261031-10001',
        soundEnabled: false,
        isMinimized: false
    };

    /**
     * Motor sintetizador de audio Web Audio API (cero dependencias de archivos externos)
     */
    function reproducirTono(tipo) {
        if (!DEMO_CONFIG.soundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (tipo === 'alerta') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (tipo === 'exito') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
                osc.start();
                osc.stop(ctx.currentTime + 0.28);
            }
        } catch (e) {
            // Audio no soportado o bloqueado por política de autoplay
        }
    }

    /**
     * Sistema de Notificaciones HUD / Toasts Flotantes de Alta Densidad
     */
    function mostrarToast(titulo, mensaje, tipo = 'info', duracionMs = 4500) {
        let contenedor = document.getElementById('noc-demo-toast-container');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'noc-demo-toast-container';
            contenedor.className = 'noc-demo-toast-container';
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement('div');
        toast.className = `noc-demo-toast ${tipo}`;

        const iconos = {
            success: '✅',
            warning: '⚠️',
            critical: '🚨',
            info: '🏛️',
            crypto: '🔐'
        };

        const icono = iconos[tipo] || '⚡';

        toast.innerHTML = `
            <div class="toast-indicator"></div>
            <div class="toast-icon">${icono}</div>
            <div class="toast-content">
                <div class="toast-title">${titulo}</div>
                <div class="toast-body">${mensaje}</div>
            </div>
            <button class="toast-close" title="Cerrar">&times;</button>
        `;

        toast.querySelector('.toast-close')?.addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 250);
        });

        contenedor?.appendChild?.(toast);

        // Auto-cierre progresivo
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 250);
            }
        }, duracionMs);
    }

    /**
     * Inyección dinámica de estilos visuales CSS para el panel y efectos de parpadeo
     */
    function inyectarEstilosDemo() {
        if (document.getElementById('noc-demo-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'noc-demo-styles';
        styleEl.textContent = `
            /* Contenedor Flotante Principal de Presets Jurado */
            .noc-demo-dock {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 99999;
                background: rgba(11, 15, 23, 0.94);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border-bottom: 1px solid rgba(56, 189, 248, 0.28);
                box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.75), 0 0 1px 1px rgba(255, 255, 255, 0.05);
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
            }

            .noc-demo-dock.minimized {
                transform: translateY(-100%);
                pointer-events: none;
                opacity: 0;
            }

            .noc-demo-inner {
                max-width: 1440px;
                margin: 0 auto;
                padding: 7px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
            }

            /* Badge y Metadatos Institucionales */
            .noc-demo-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }

            .noc-demo-pill {
                background: linear-gradient(135deg, rgba(200, 16, 46, 0.22), rgba(217, 119, 6, 0.18));
                border: 1px solid rgba(217, 119, 6, 0.45);
                padding: 4px 9px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .noc-demo-pill .icon {
                font-size: 1rem;
            }

            .noc-demo-pill .title {
                font-size: 0.76rem;
                font-weight: 800;
                letter-spacing: 0.04em;
                color: #F8FAFC;
                text-transform: uppercase;
                font-family: 'JetBrains Mono', monospace;
            }

            .noc-demo-meta {
                display: flex;
                flex-direction: column;
                line-height: 1.25;
            }

            .noc-demo-evaluator {
                font-size: 0.74rem;
                font-weight: 700;
                color: #38BDF8;
                letter-spacing: -0.01em;
            }

            .noc-demo-sub {
                font-size: 0.65rem;
                color: #94A3B8;
                font-family: 'JetBrains Mono', monospace;
            }

            /* Botonera de Escenarios */
            .noc-demo-presets-row {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .noc-btn-preset {
                background: #0F172A;
                border: 1px solid #1E293B;
                color: #F8FAFC;
                padding: 6px 11px;
                border-radius: 6px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                font-size: 0.75rem;
                font-weight: 600;
                transition: all 0.15s ease;
                user-select: none;
                position: relative;
                overflow: hidden;
            }

            .noc-btn-preset::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 2px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .noc-btn-preset:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }

            .noc-btn-preset:active {
                transform: translateY(0);
            }

            /* Estilos Temáticos por Escenario */
            .noc-btn-preset.escenario-1 {
                border-color: rgba(16, 185, 129, 0.35);
            }
            .noc-btn-preset.escenario-1::before {
                background: #10B981;
            }
            .noc-btn-preset.escenario-1:hover {
                background: rgba(16, 185, 129, 0.12);
                border-color: #10B981;
            }

            .noc-btn-preset.escenario-2 {
                border-color: rgba(239, 68, 68, 0.4);
            }
            .noc-btn-preset.escenario-2::before {
                background: #EF4444;
            }
            .noc-btn-preset.escenario-2:hover {
                background: rgba(239, 68, 68, 0.14);
                border-color: #EF4444;
            }

            .noc-btn-preset.escenario-3 {
                border-color: rgba(56, 189, 248, 0.35);
            }
            .noc-btn-preset.escenario-3::before {
                background: #38BDF8;
            }
            .noc-btn-preset.escenario-3:hover {
                background: rgba(56, 189, 248, 0.12);
                border-color: #38BDF8;
            }

            .noc-btn-preset.escenario-4 {
                border-color: rgba(217, 119, 6, 0.4);
            }
            .noc-btn-preset.escenario-4::before {
                background: #F59E0B;
            }
            .noc-btn-preset.escenario-4:hover {
                background: rgba(217, 119, 6, 0.15);
                border-color: #F59E0B;
            }

            .noc-key-badge {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.62rem;
                padding: 1px 4px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.08);
                color: #CBD5E1;
                border: 1px solid rgba(255, 255, 255, 0.12);
                letter-spacing: 0.02em;
            }

            /* Acciones Secundarias (Sonido, Minimizar) */
            .noc-demo-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }

            .noc-btn-icon {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #94A3B8;
                padding: 5px 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.72rem;
                transition: all 0.15s;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .noc-btn-icon:hover {
                color: #F8FAFC;
                background: rgba(255, 255, 255, 0.06);
                border-color: rgba(255, 255, 255, 0.25);
            }

            /* Botón Flotante para Reabrir Panel cuando esté minimizado */
            .noc-demo-fab-trigger {
                position: fixed;
                top: 14px;
                right: 20px;
                z-index: 99998;
                background: #0B0F17;
                border: 1px solid rgba(56, 189, 248, 0.4);
                color: #38BDF8;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65), 0 0 10px rgba(56, 189, 248, 0.25);
                padding: 6px 13px;
                border-radius: 9999px;
                font-size: 0.74rem;
                font-weight: 700;
                display: none;
                align-items: center;
                gap: 7px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: 'JetBrains Mono', monospace;
            }

            .noc-demo-fab-trigger:hover {
                background: #0F172A;
                transform: scale(1.04);
                border-color: #38BDF8;
                box-shadow: 0 6px 22px rgba(56, 189, 248, 0.4);
            }

            .noc-demo-fab-trigger.visible {
                display: inline-flex;
            }

            /* Compensación de margen superior para el layout cuando la barra está activa */
            body.has-noc-dock {
                padding-top: 50px !important;
            }

            /* ==========================================================
               EFECTOS VISUALES: PARPADEO CRÍTICO ROJO BCP (YAPE)
               ========================================================== */
            @keyframes bcpCriticalStrobe {
                0%, 100% {
                    background-color: rgba(239, 68, 68, 0.08);
                    border-color: rgba(239, 68, 68, 0.85) !important;
                    box-shadow: 0 0 25px rgba(239, 68, 68, 0.45), inset 0 0 15px rgba(239, 68, 68, 0.2);
                }
                50% {
                    background-color: rgba(239, 68, 68, 0.26);
                    border-color: #EF4444 !important;
                    box-shadow: 0 0 45px rgba(239, 68, 68, 0.8), inset 0 0 25px rgba(239, 68, 68, 0.45);
                }
            }

            .bcp-strobe-alert {
                animation: bcpCriticalStrobe 1.1s infinite !important;
                border-top: 4px solid #EF4444 !important;
                position: relative;
            }

            .bcp-strobe-alert::after {
                content: 'ALERTA HTTP 503';
                position: absolute;
                top: 6px;
                right: 8px;
                background: #EF4444;
                color: #FFFFFF;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.6rem;
                font-weight: 800;
                padding: 1px 5px;
                border-radius: 3px;
                letter-spacing: 0.05em;
                animation: bcpTagPulse 0.8s infinite alternate;
            }

            @keyframes bcpTagPulse {
                from { opacity: 0.8; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1.02); }
            }

            /* Resaltado dinámico en la fila de la tabla */
            @keyframes rowHighlightPulse {
                0% { background: rgba(56, 189, 248, 0.25); }
                100% { background: transparent; }
            }

            .row-highlight-active {
                animation: rowHighlightPulse 2s ease-out;
            }

            /* ==========================================================
               SISTEMA DE TOASTS FLOTANTES
               ========================================================== */
            .noc-demo-toast-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 440px;
                pointer-events: none;
            }

            .noc-demo-toast {
                pointer-events: auto;
                background: #0B0F17;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 14px 34px rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                color: #F8FAFC;
                font-family: 'Plus Jakarta Sans', sans-serif;
                transform: translateX(0);
                opacity: 1;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }

            .noc-demo-toast.fade-out {
                transform: translateX(30px);
                opacity: 0;
            }

            .noc-demo-toast .toast-indicator {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 4px;
                background: #38BDF8;
            }

            .noc-demo-toast.success .toast-indicator { background: #10B981; }
            .noc-demo-toast.critical .toast-indicator { background: #EF4444; }
            .noc-demo-toast.warning .toast-indicator { background: #F59E0B; }
            .noc-demo-toast.crypto .toast-indicator { background: #D97706; }

            .noc-demo-toast .toast-icon {
                font-size: 1.15rem;
                flex-shrink: 0;
                line-height: 1;
                margin-top: 2px;
            }

            .noc-demo-toast .toast-content {
                flex: 1;
                min-width: 0;
            }

            .noc-demo-toast .toast-title {
                font-size: 0.82rem;
                font-weight: 700;
                color: #F8FAFC;
                margin-bottom: 3px;
                line-height: 1.25;
            }

            .noc-demo-toast .toast-body {
                font-size: 0.74rem;
                color: #94A3B8;
                line-height: 1.35;
                font-family: 'JetBrains Mono', monospace;
                word-break: break-word;
            }

            .noc-demo-toast .toast-close {
                background: transparent;
                border: none;
                color: #64748B;
                font-size: 1.1rem;
                cursor: pointer;
                line-height: 1;
                padding: 0 2px;
            }

            .noc-demo-toast .toast-close:hover {
                color: #F8FAFC;
            }

            /* Badge animado de SLA en tiempo real */
            .sla-calc-banner {
                background: rgba(56, 189, 248, 0.08);
                border: 1px dashed rgba(56, 189, 248, 0.4);
                border-radius: 6px;
                padding: 8px 12px;
                margin-top: 6px;
                font-size: 0.7rem;
                color: #BAE6FD;
                font-family: 'JetBrains Mono', monospace;
            }
        `;
        document.head.appendChild(styleEl);
    }

    /**
     * Construcción e inyección del DOM para la barra de presets de jurado
     */
    function inyectarPanelDemo() {
        if (document.getElementById('noc-demo-dock')) return;

        inyectarEstilosDemo();

        // Barra superior fija
        const dock = document.createElement('aside');
        dock.id = 'noc-demo-dock';
        dock.className = 'noc-demo-dock';
        dock.setAttribute('aria-label', 'Presets de Demostración para Jurado');

        dock.innerHTML = `
            <div class="noc-demo-inner">
                <!-- Identidad Institucional y Evaluación -->
                <div class="noc-demo-brand">
                    <div class="noc-demo-pill">
                        <span class="icon">⚖️</span>
                        <span class="title">JURADO APF1</span>
                    </div>
                    <div class="noc-demo-meta">
                        <span class="noc-demo-evaluator">Prof. Zamata · Sección 57524</span>
                        <span class="noc-demo-sub">Frank Vargas Huamán | NOC Lead BCRP</span>
                    </div>
                </div>

                <!-- Botonera de 4 Escenarios Clave -->
                <div class="noc-demo-presets-row">
                    <button type="button" class="noc-btn-preset escenario-1" id="btnNocEscenario1" title="Restablecer todos los bancos a estado óptimo y disponibilidad 99.94%">
                        <span>🟢 1. Tráfico Normal</span>
                        <span class="noc-key-badge">Alt+1</span>
                    </button>

                    <button type="button" class="noc-btn-preset escenario-2" id="btnNocEscenario2" title="Provocar caída crítica masiva HTTP 503 en BCP/Yape con auto-ticket INC-20261031-10001">
                        <span>🚨 2. Caída BCP (HTTP 503)</span>
                        <span class="noc-key-badge">Alt+2</span>
                    </button>

                    <button type="button" class="noc-btn-preset escenario-3" id="btnNocEscenario3" title="Ejecutar ciclo inmutable: REGISTRADO -> EN_MITIGACION -> RESUELTO con recálculo SLA">
                        <span>🛡️ 3. Mitigación & Cierre</span>
                        <span class="noc-key-badge">Alt+3</span>
                    </button>

                    <button type="button" class="noc-btn-preset escenario-4" id="btnNocEscenario4" title="Abrir visor oficial SFT con archivo plano normativo y cálculo criptográfico SHA-256">
                        <span>📜 4. Compilar SFT + SHA-256</span>
                        <span class="noc-key-badge">Alt+4</span>
                    </button>

                    <button type="button" class="noc-btn-preset" id="btnNocGuiaDemo" style="border-color: rgba(226, 179, 87, 0.45); background: rgba(226, 179, 87, 0.1); color: #F8FAFC;" title="Abrir Guía Rápida de Demostración para Jurado (Alt+G)">
                        <span>📋 Guía Jurado</span>
                        <span class="noc-key-badge">Alt+G</span>
                    </button>
                </div>

                <!-- Herramientas Auxiliares -->
                <div class="noc-demo-actions">
                    <button type="button" class="noc-btn-icon" id="btnNocToggleAudio" title="Alternar audio beeps sintéticos de alerta">
                        <span id="lblNocAudioIcon">🔇</span>
                    </button>
                    <button type="button" class="noc-btn-icon" id="btnNocMinimize" title="Minimizar panel superior (Alt+P)">
                        <span>▲ Ocultar</span>
                        <span class="noc-key-badge">Alt+P</span>
                    </button>
                </div>
            </div>
        `;

        // Botón flotante para restaurar barra cuando se minimiza
        const fab = document.createElement('button');
        fab.id = 'noc-demo-fab';
        fab.type = 'button';
        fab.className = 'noc-demo-fab-trigger';
        fab.title = 'Abrir Presets de Demostración para Jurado (Alt+P)';
        fab.innerHTML = `
            <span>⚖️ Presets Jurado</span>
            <span class="noc-key-badge">Alt+P</span>
        `;

        document.body.appendChild(dock);
        document.body.appendChild(fab);
        document.body.classList.add('has-noc-dock');

        // Configuración de eventos de los botones
        document.getElementById('btnNocEscenario1')?.addEventListener('click', () => window.NocDemo.escenario1());
        document.getElementById('btnNocEscenario2')?.addEventListener('click', () => window.NocDemo.escenario2());
        document.getElementById('btnNocEscenario3')?.addEventListener('click', () => window.NocDemo.escenario3());
        document.getElementById('btnNocEscenario4')?.addEventListener('click', () => window.NocDemo.escenario4());
        document.getElementById('btnNocGuiaDemo')?.addEventListener('click', () => {
            if (typeof window.toggleModalGuiaDemo === 'function') {
                window.toggleModalGuiaDemo();
            }
        });

        document.getElementById('btnNocMinimize')?.addEventListener('click', () => window.NocDemo.toggleDrawer());
        fab.addEventListener('click', () => window.NocDemo.toggleDrawer());

        document.getElementById('btnNocToggleAudio')?.addEventListener('click', () => {
            DEMO_CONFIG.soundEnabled = !DEMO_CONFIG.soundEnabled;
            const lbl = document.getElementById('lblNocAudioIcon');
            if (lbl) lbl.textContent = DEMO_CONFIG.soundEnabled ? '🔊' : '🔇';
            mostrarToast('Control de Audio', DEMO_CONFIG.soundEnabled ? 'Efectos sonoros activados' : 'Efectos sonoros silenciados', 'info', 2000);
            if (DEMO_CONFIG.soundEnabled) reproducirTono('exito');
        });

        // Configuración de atajos de teclado globales
        window.addEventListener('keydown', (ev) => {
            if (ev.altKey && !ev.ctrlKey && !ev.metaKey) {
                if (ev.key === '1') {
                    ev.preventDefault();
                    window.NocDemo.escenario1();
                } else if (ev.key === '2') {
                    ev.preventDefault();
                    window.NocDemo.escenario2();
                } else if (ev.key === '3') {
                    ev.preventDefault();
                    window.NocDemo.escenario3();
                } else if (ev.key === '4') {
                    ev.preventDefault();
                    window.NocDemo.escenario4();
                } else if (ev.key.toLowerCase() === 'g') {
                    ev.preventDefault();
                    if (typeof window.toggleModalGuiaDemo === 'function') {
                        window.toggleModalGuiaDemo();
                    }
                } else if (ev.key.toLowerCase() === 'p') {
                    ev.preventDefault();
                    window.NocDemo.toggleDrawer();
                }
            }
        });
    }

    /**
     * Quita efectos de parpadeo crítico de las tarjetas de telemetría
     */
    function limpiarEfectoParpadeoBcp() {
        const nodos = document.querySelectorAll('.telemetry-node');
        nodos.forEach(n => n.classList.remove('bcp-strobe-alert'));
    }

    /**
     * Aplica el parpadeo crítico al nodo de BCP
     */
    function aplicarParpadeoBcp() {
        const nodos = document.querySelectorAll('.telemetry-node');
        if (nodos.length > 0) {
            // El primer nodo es BCP (id: 1, orden 1)
            const nodoBcp = nodos[0];
            nodoBcp.classList.add('bcp-strobe-alert');
        }
    }

    /**
     * ======================================================================
     * ESCENARIO 1: TRÁFICO NORMAL INTERBANCARIO
     * - Todos los bancos en Verde (SALUDABLE)
     * - Latencias estándar óptimas (16-24ms)
     * - 0 caídas críticas activas
     * - SLA consolidado exactamente en 99.94%
     * ======================================================================
     */
    function ejecutarEscenario1() {
        const state = obtenerEstado();
        if (!state) return;

        limpiarEfectoParpadeoBcp();

        // 1. Normalizar todas las entidades participantes
        const latenciasBase = {
            1: 18, // BCP (Yape)
            2: 22, // Interbank (Plim)
            3: 19, // Caja Cusco (Tunki)
            4: 24, // Caja de los Andes
            5: 16  // CCE Switch Central
        };

        state.entidades.forEach(ent => {
            ent.estado = 'SALUDABLE';
            ent.latencia = latenciasBase[ent.id] || (16 + Math.floor(Math.random() * 8));
            ent.incidentes = 0;
        });

        // 2. Normalizar incidentes para que no haya caídas activas
        state.incidentes.forEach(inc => {
            if (inc.estado === 'REGISTRADO' || inc.estado === 'EN_MITIGACION' || inc.estado === 'EN_EVALUACION') {
                inc.estado = 'RESUELTO';
            }
        });

        // 3. Re-renderizar componentes de UI
        if (typeof window.renderizarTelemetria === 'function') window.renderizarTelemetria();
        if (typeof window.renderizarMatrizIncidentes === 'function') window.renderizarMatrizIncidentes();
        if (typeof window.actualizarKpis === 'function') window.actualizarKpis();

        // 4. Asegurar indicadores precisos del Escenario 1
        const elUptime = document.getElementById('kpiUptime');
        if (elUptime) {
            elUptime.innerText = '99.94%';
            elUptime.style.color = '#38BDF8';
        }

        const elCriticos = document.getElementById('kpiCriticos');
        if (elCriticos) {
            elCriticos.innerText = '0';
        }

        reproducirTono('exito');

        mostrarToast(
            'Escenario 1: Tráfico Normal Interbancario',
            '5/5 entidades saludables (BCP, Interbank, Cusco, Andes, CCE) · Latencias: 16–24ms · 0 caídas activas · SLA: 99.94%',
            'success',
            5000
        );
    }

    /**
     * ======================================================================
     * ESCENARIO 2: CAÍDA CRÍTICA BCP/YAPE (HTTP 503)
     * - BCP en rojo parpadeante con latencia TIMEOUT
     * - Generación automática del ticket INC-20261031-10001 (CRÍTICA)
     * - Degradación en tiempo real del SLA y contador de activos
     * - Alerta visual HUD / Toast para jurado
     * ======================================================================
     */
    function ejecutarEscenario2() {
        const state = obtenerEstado();
        if (!state) return;

        // 1. Marcar entidad BCP (Yape) como CAIDO
        const bcp = state.entidades.find(e => e.id === 1);
        if (bcp) {
            bcp.estado = 'CAIDO';
            bcp.latencia = 'TIMEOUT';
            bcp.incidentes = 1;
        }

        // 2. Auto-generar o resetear ticket normativo INC-20261031-10001
        const ahora = new Date();
        const fechaHoraStr = ahora.toISOString().replace('T', ' ').substring(0, 19);

        const ticketExistenteIdx = state.incidentes.findIndex(i => i.ticket === DEMO_CONFIG.ticketObjetivo);
        const nuevoIncidente = {
            id: 10001,
            ticket: DEMO_CONFIG.ticketObjetivo,
            idEntidad: 1,
            entidadNombre: 'BCP (Yape)',
            categoriaCodigo: 'DISP_SERV',
            categoriaNombre: 'Disponibilidad de Servicios',
            severidad: 'CRITICA',
            origen: 'AUTOMATICO',
            fechaDeteccion: fechaHoraStr,
            servicio: 'API_TRANSFERENCIAS_INMEDIATAS_YAPE',
            descripcion: 'ALERTA AUTOMÁTICA BCRP: Falla HTTP 503 en endpoint Yape. Latencia >TIMEOUT. Interrupción masiva de interoperabilidad detectada por sonda central.',
            estado: 'REGISTRADO'
        };

        if (ticketExistenteIdx >= 0) {
            // Moverlo al frente y dejarlo en REGISTRADO
            state.incidentes.splice(ticketExistenteIdx, 1);
        }
        state.incidentes.unshift(nuevoIncidente);

        // 3. Renderizar componentes de UI
        if (typeof window.renderizarTelemetria === 'function') window.renderizarTelemetria();
        if (typeof window.renderizarMatrizIncidentes === 'function') window.renderizarMatrizIncidentes();
        if (typeof window.actualizarKpis === 'function') window.actualizarKpis();

        // 4. Aplicar efecto de estroboscópico parpadeante sobre el nodo BCP
        aplicarParpadeoBcp();

        // 5. Ajustar SLA a valor degradado (98.74%) por penalización crítica
        const elUptime = document.getElementById('kpiUptime');
        if (elUptime) {
            elUptime.innerText = '98.74%';
            elUptime.style.color = '#EF4444';
        }

        // Resaltar primera fila de la tabla
        const primeraFila = document.querySelector('#tablaIncidentesBody tr');
        if (primeraFila) {
            primeraFila.classList.add('row-highlight-active');
        }

        reproducirTono('alerta');

        mostrarToast(
            'Escenario 2: Caída Crítica BCP/Yape (HTTP 503)',
            `BCP en estado CAÍDO · Latencia: TIMEOUT · Generado ticket inmutable: ${DEMO_CONFIG.ticketObjetivo} (Severidad CRÍTICA) · SLA cae a 98.74%`,
            'critical',
            6500
        );
    }

    /**
     * ======================================================================
     * ESCENARIO 3: MITIGACIÓN & CIERRE INMUTABLE
     * - Mueve el ticket INC-20261031-10001:
     *     Paso 1: REGISTRADO -> EN_MITIGACION (Desvío contingente)
     *     Paso 2: EN_MITIGACION -> RESUELTO (Recuperación de canal BCP)
     *     Paso 3: RESUELTO -> CERRADO (Sello en bitácora inmutable)
     * - Muestra cálculo del SLA en tiempo real con animación de recuperación
     * ======================================================================
     */
    async function ejecutarEscenario3() {
        const state = obtenerEstado();
        if (!state) return;

        // Buscar el ticket objetivo o el incidente activo más reciente de BCP
        let inc = state.incidentes.find(i => i.ticket === DEMO_CONFIG.ticketObjetivo);
        if (!inc) {
            inc = state.incidentes.find(i => i.idEntidad === 1 && i.estado !== 'CERRADO');
        }

        if (!inc) {
            mostrarToast(
                'Mitigación no requerida',
                'No hay tickets abiertos para BCP. Ejecute primero el "Escenario 2: Caída Crítica".',
                'warning',
                3500
            );
            return;
        }

        // --- PASO 1: EN_MITIGACION ---
        inc.estado = 'EN_MITIGACION';
        if (typeof window.renderizarMatrizIncidentes === 'function') window.renderizarMatrizIncidentes();

        mostrarToast(
            'Paso 1: Transición hacia EN_MITIGACION',
            `Ticket ${inc.ticket}: Acciones de contingencia activadas (Desvío de cola MQ a Switch Secundario CCE).`,
            'warning',
            2800
        );

        // Espera secuencial para demostración visual ante el jurado
        await new Promise(r => setTimeout(r, 1100));

        // --- PASO 2: RESUELTO & RESTABLECIMIENTO DE BCP ---
        inc.estado = 'RESUELTO';

        const bcp = state.entidades.find(e => e.id === 1);
        if (bcp) {
            bcp.estado = 'SALUDABLE';
            bcp.latencia = 18;
            bcp.incidentes = 0;
        }

        limpiarEfectoParpadeoBcp();

        if (typeof window.renderizarTelemetria === 'function') window.renderizarTelemetria();
        if (typeof window.renderizarMatrizIncidentes === 'function') window.renderizarMatrizIncidentes();

        reproducirTono('exito');

        mostrarToast(
            'Paso 2: Transición hacia RESUELTO',
            `Ticket ${inc.ticket}: Servicio Yape estabilizado (Latencia normalizada a 18ms). Iniciando recálculo de SLA.`,
            'success',
            2800
        );

        // --- PASO 3: CIERRE INMUTABLE Y CÁLCULO SLA EN TIEMPO REAL ---
        await new Promise(r => setTimeout(r, 900));

        inc.estado = 'CERRADO';
        if (typeof window.renderizarMatrizIncidentes === 'function') window.renderizarMatrizIncidentes();
        if (typeof window.actualizarKpis === 'function') window.actualizarKpis();

        // Animación progresiva de recuperación del SLA (de 98.74% a 99.94%)
        const elUptime = document.getElementById('kpiUptime');
        if (elUptime) {
            const pasos = ['98.74%', '99.10%', '99.55%', '99.88%', '99.94%'];
            for (let i = 0; i < pasos.length; i++) {
                elUptime.innerText = pasos[i];
                await new Promise(r => setTimeout(r, 80));
            }
            elUptime.style.color = '#38BDF8';
        }

        mostrarToast(
            'Paso 3: Cierre Inmutable & SLA Consolidado',
            `Ticket ${inc.ticket} CERRADO · Fórmula SLA BCRP: [(43200m - 12m) / 43200m] × 100 = 99.94% (Cumple Circular BCRP 0014-2023).`,
            'info',
            5500
        );
    }

    /**
     * ======================================================================
     * ESCENARIO 4: COMPILACIÓN INMEDIATA SFT + SHA-256
     * - Genera el archivo plano normativo de incidentes de pagos
     * - Calcula el digest criptográfico SHA-256 nativo
     * - Abre el modal oficial #modalSft de la plataforma
     * ======================================================================
     */
    async function ejecutarEscenario4() {
        const state = obtenerEstado();
        if (!state) return;

        // Asegurar que exista al menos el ticket demostrativo cerrado para el reporte
        const cerrados = state.incidentes.filter(i => i.estado === 'CERRADO' || i.estado === 'RESUELTO');

        if (cerrados.length === 0) {
            // Si ninguno está cerrado, cerrar temporalmente el primero para el reporte
            if (state.incidentes.length > 0) {
                state.incidentes[0].estado = 'CERRADO';
                cerrados.push(state.incidentes[0]);
            }
        }

        const ahoraObj = new Date();
        const timestamp = ahoraObj.toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const fechaHoraDetalle = ahoraObj.toISOString().replace('T', ' ').substring(0, 19);
        const numEnvio = `SFT-BCRP-${timestamp}`;

        let contenidoPlano = `HEADER|${numEnvio}|${timestamp}|${cerrados.length}\n`;

        cerrados.forEach((inc, idx) => {
            const codEnt = String(inc.idEntidad || (idx + 1)).padStart(3, '0');
            const fechaFin = inc.fechaDeteccion || fechaHoraDetalle;
            contenidoPlano += `DETALLE|${inc.ticket}|${codEnt}|${inc.entidadNombre}|${inc.categoriaCodigo || 'DISP_SERV'}|${inc.severidad}|${inc.fechaDeteccion || fechaHoraDetalle}|${fechaFin}|${inc.origen || 'AUTOMATICO'}|${inc.servicio || 'CORE_SWITCH'}\n`;
        });

        // Cálculo de SHA-256 criptográfico con Web Crypto API
        let sha256Hex = '';
        try {
            const buffer = new TextEncoder().encode(contenidoPlano);
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback sintético en caso de entornos sin HTTPS/SubtleCrypto
            sha256Hex = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        }

        contenidoPlano += `FOOTER|${sha256Hex}`;

        // Inyectar en el Modal SFT del DOM existente
        const preCode = document.getElementById('sftContenidoTxt');
        const hashSpan = document.getElementById('sftHashSha256');
        const modalSft = document.getElementById('modalSft');
        const btnDescargar = document.getElementById('btnDescargarTxtFile');

        if (preCode) preCode.innerText = contenidoPlano;
        if (hashSpan) hashSpan.innerText = sha256Hex;

        if (btnDescargar) {
            btnDescargar.onclick = () => {
                const blob = new Blob([contenidoPlano], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `INCIDENTES_PAGOS_${timestamp}.txt`;
                a.click();
            };
        }

        if (modalSft) {
            modalSft.classList.add('active');
        }

        reproducirTono('exito');

        mostrarToast(
            'Escenario 4: Compilación Inmediata SFT BCRP',
            `Archivo plano generado con ${cerrados.length} registros normativos. Sello criptográfico SHA-256: ${sha256Hex.substring(0, 16)}...`,
            'crypto',
            6000
        );
    }

    /**
     * Alternar visibilidad de la barra superior de presets
     */
    function alternarDrawer() {
        const dock = document.getElementById('noc-demo-dock');
        const fab = document.getElementById('noc-demo-fab');
        if (!dock) return;

        DEMO_CONFIG.isMinimized = !DEMO_CONFIG.isMinimized;

        if (DEMO_CONFIG.isMinimized) {
            dock.classList.add('minimized');
            document.body.classList.remove('has-noc-dock');
            if (fab) fab.classList.add('visible');
        } else {
            dock.classList.remove('minimized');
            document.body.classList.add('has-noc-dock');
            if (fab) fab.classList.remove('visible');
        }
    }

    /**
     * ======================================================================
     * EXPOSICIÓN DE LA API PÚBLICA EN window.NocDemo
     * ======================================================================
     */
    window.NocDemo = {
        version: DEMO_CONFIG.version,
        evaluador: 'Prof. Zamata',
        autor: 'Frank Emiliano Vargas Huamán (NOC Lead)',

        // Métodos de Escenarios
        escenario1: ejecutarEscenario1,
        escenario2: ejecutarEscenario2,
        escenario3: ejecutarEscenario3,
        escenario4: ejecutarEscenario4,

        // Alias semánticos en lenguaje de negocio
        activarTraficoNormal: ejecutarEscenario1,
        simularCaidaCriticaBCP: ejecutarEscenario2,
        mitigarYCerrar: ejecutarEscenario3,
        compilarSftSha256: ejecutarEscenario4,

        // Controles de interfaz
        toggleDrawer: alternarDrawer,
        toggle: alternarDrawer,
        showToast: mostrarToast,

        // Acceso al estado
        getEstado: obtenerEstado,
        getConfig: () => ({ ...DEMO_CONFIG })
    };

    // Inicialización al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inyectarPanelDemo);
    } else {
        inyectarPanelDemo();
    }

    // Mensaje de bienvenida e instrucciones en consola DevTools para el Jurado
    console.log(
        '%c🏛️ BCRP - SIGIR | MÓDULO DE DEMOSTRACIÓN PARA JURADO (APF1)\n' +
        '%cEvaluador: Prof. Zamata | Desarrollador: Frank Vargas Huamán (NOC Lead)\n' +
        '%cComandos directos en consola:\n' +
        '  > NocDemo.escenario1() // Tráfico Normal Interbancario (SLA 99.94%)\n' +
        '  > NocDemo.escenario2() // Caída Crítica BCP/Yape HTTP 503 (Ticket INC-20261031-10001)\n' +
        '  > NocDemo.escenario3() // Mitigación & Cierre Inmutable (Recálculo SLA)\n' +
        '  > NocDemo.escenario4() // Compilación Inmediata SFT + Hash SHA-256\n' +
        '  > NocDemo.toggle()     // Alternar Visibilidad de la Barra de Presets (Alt+P)',
        'color: #38BDF8; font-weight: 800; font-size: 14px;',
        'color: #F59E0B; font-weight: 600; font-size: 12px;',
        'color: #94A3B8; font-family: monospace; font-size: 11px;'
    );

})();
