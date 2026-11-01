/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Motor de Audio Reactivo & Síntesis Web Audio API (Sin Dependencias Externas)
 * Filosofía de Microinteracciones y Respuesta Háptica/Táctil: Emil Kowalski
 * Autor: Frank Emiliano Vargas Huamán (Φranкосyνη / Francus.)
 * ==========================================================================
 */

(function (window) {
    'use strict';

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

    class BcrpSoundFXEngine {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
            this.storageKey = 'sigir_bcrp_audio_muted';
            this.isMuted = this._getSavedMuteState();
            this.isUnlocked = false;

            // Vincular contexto a la primera interacción del usuario (política de autoplay del navegador)
            this._bindUnlockGestures();

            // Sincronizar UI de inmediato si el DOM ya cuenta con el botón
            if (typeof document !== 'undefined') {
                this.updateToggleButtonUI();
            }
        }

        _getSavedMuteState() {
            try {
                return localStorage.getItem(this.storageKey) === 'true';
            } catch (e) {
                console.warn('[SIGIR Audio] No se pudo leer localStorage:', e);
                return false;
            }
        }

        _persistMuteState() {
            try {
                localStorage.setItem(this.storageKey, this.isMuted ? 'true' : 'false');
            } catch (e) {
                console.warn('[SIGIR Audio] No se pudo guardar preferencia en localStorage:', e);
            }
        }

        /**
         * Inicialización perezosa (lazy) del AudioContext en primer clic/tecla
         */
        _ensureContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) {
                    console.warn('[SIGIR Audio] Web Audio API no soportado en este entorno.');
                    return null;
                }
                this.ctx = new AudioCtx();

                // Nodo Master de Ganancia con rampa suave para evitar clics acústicos
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.85, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
            }

            if (this.ctx.state === 'suspended') {
                this.ctx.resume().catch(err => console.debug('[SIGIR Audio] Resumiendo contexto:', err));
            }
            return this.ctx;
        }

        _bindUnlockGestures() {
            const unlockHandler = () => {
                if (this._ensureContext()) {
                    this.isUnlocked = true;
                }
                ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
                    document.removeEventListener(evt, unlockHandler);
                });
            };

            ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
                document.addEventListener(evt, unlockHandler, { once: true, passive: true });
            });
        }

        /**
         * 1. Clic / Pop Táctil Ultra-Suave (12ms @ 750Hz con ganancia atenuada 0.04)
         * Diseñado bajo la directiva de Emil Kowalski y estética bancaria Apple Pay / Mercury:
         * Micro-pop ultrasuave sin estridencias para evitar sobresaltos.
         */
        playClick() {
            if (this.isMuted) return;
            const ctx = this._ensureContext();
            if (!ctx) return;

            const t0 = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Descenso de pitch ultra-rápido: de 750Hz a 220Hz en exactamente 12ms
            osc.type = 'sine';
            osc.frequency.setValueAtTime(750, t0);
            osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.012);

            // Envolvente micro-táctil ultrasuave con ganancia atenuada a 0.04
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.linearRampToValueAtTime(0.04, t0 + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t0);
            osc.stop(t0 + 0.014);
        }

        /**
         * 2. Alerta Financiera / Detección Crítica NOC
         * Acorde menor tenue de dos pulsos sin estridencias (estilo Mercury Bank / Bloomberg).
         * Acorde de A menor (A4: 440Hz, C5: 523.25Hz, E5: 659.25Hz) con filtro lowpass analógico a 1400Hz.
         */
        playAlert() {
            if (this.isMuted) return;
            const ctx = this._ensureContext();
            if (!ctx) return;

            const t0 = ctx.currentTime;

            // Filtro pasa-bajas corporativo a 1400Hz para calidez y eliminación total de asperezas
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, t0);
            filter.connect(this.masterGain);

            // Notas del acorde menor tenue (A menor: A4 = 440 Hz, C5 = 523.25 Hz, E5 = 659.25 Hz)
            const minorChord = [440.00, 523.25, 659.25];

            // Pulso 1: primer toque discreto (duración 75ms, ganancia máx 0.035)
            const p1Start = t0;
            const p1Dur = 0.075;
            minorChord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, p1Start);

                gain.gain.setValueAtTime(0.0001, p1Start);
                gain.gain.linearRampToValueAtTime(0.035, p1Start + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.0001, p1Start + p1Dur);

                osc.connect(gain);
                gain.connect(filter);
                osc.start(p1Start);
                osc.stop(p1Start + p1Dur + 0.01);
            });

            // Pulso 2: segundo toque tenue a los 120ms (duración 110ms, ganancia máx 0.028)
            const p2Start = t0 + 0.120;
            const p2Dur = 0.110;
            minorChord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, p2Start);

                gain.gain.setValueAtTime(0.0001, p2Start);
                gain.gain.linearRampToValueAtTime(0.028, p2Start + 0.010);
                gain.gain.exponentialRampToValueAtTime(0.0001, p2Start + p2Dur);

                osc.connect(gain);
                gain.connect(filter);
                osc.start(p2Start);
                osc.stop(p2Start + p2Dur + 0.01);
            });
        }

        /**
         * 3. Confirmación de Éxito Armónico / Mitigación & Cierre SFT BCRP
         * Acorde mayor suave y ascendente arpegiado (C5 -> E5 -> G5 -> C6).
         * Calibrado estilo Apple Pay / Mercury Bank con envolvente aterciopelada y filtro cálido a 2400Hz.
         */
        playSuccess() {
            if (this.isMuted) return;
            const ctx = this._ensureContext();
            if (!ctx) return;

            const t0 = ctx.currentTime;

            // Filtro pasa-bajas para brillo cálido y sin asperezas (Apple Pay style)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2400, t0);
            filter.connect(this.masterGain);

            const notes = [
                { freq: 523.25, offset: 0.000, dur: 0.24, gain: 0.032 }, // C5
                { freq: 659.25, offset: 0.035, dur: 0.28, gain: 0.035 }, // E5
                { freq: 783.99, offset: 0.075, dur: 0.32, gain: 0.038 }, // G5
                { freq: 1046.50, offset: 0.120, dur: 0.42, gain: 0.030 } // C6
            ];

            notes.forEach(({ freq, offset, dur, gain: targetVol }) => {
                const noteTime = t0 + offset;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.0001, noteTime);
                gain.gain.linearRampToValueAtTime(targetVol, noteTime + 0.014);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + dur);

                osc.connect(gain);
                gain.connect(filter);

                osc.start(noteTime);
                osc.stop(noteTime + dur + 0.01);
            });
        }

        /**
         * Micro-tono para conmutación de estado (Unmute)
         * Tono suave ascendente de 50ms para confirmar activación
         */
        playToggle(unmuting = false) {
            if (this.isMuted && !unmuting) return;
            const ctx = this._ensureContext();
            if (!ctx) return;

            const t0 = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const fStart = unmuting ? 480 : 640;
            const fEnd = unmuting ? 640 : 360;

            osc.frequency.setValueAtTime(fStart, t0);
            osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + 0.05);

            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.linearRampToValueAtTime(0.035, t0 + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.055);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t0);
            osc.stop(t0 + 0.06);
        }

        /**
         * Establece explícitamente el estado de silencio (Mute / Unmute) con persistencia inmediata
         */
        setMuted(muted) {
            this.isMuted = !!muted;
            this._persistMuteState();

            if (this.masterGain && this.ctx) {
                const now = this.ctx.currentTime;
                this.masterGain.gain.cancelScheduledValues(now);
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
                this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0 : 0.85, now + 0.03);
            }

            if (!this.isMuted) {
                this.playToggle(true);
            }

            this.updateToggleButtonUI();
            return this.isMuted;
        }

        /**
         * Alterna el estado de silencio (Mute / Unmute) con persistencia inmediata en localStorage
         */
        toggleMute() {
            return this.setMuted(!this.isMuted);
        }

        /**
         * Actualiza el aspecto visual del botón toggle en la cabecera
         */
        updateToggleButtonUI() {
            const btns = document.querySelectorAll('#btnAudioToggle, .btn-audio-toggle');
            btns.forEach(btn => {
                const iconOn = btn.querySelector('.icon-sound-on');
                const iconOff = btn.querySelector('.icon-sound-off');
                const label = btn.querySelector('.audio-label');

                if (this.isMuted) {
                    btn.classList.add('muted');
                    btn.title = 'Audio silenciado (Clic para activar sonido háptico)';
                    btn.setAttribute('aria-pressed', 'false');
                    if (iconOn) iconOn.style.display = 'none';
                    if (iconOff) iconOff.style.display = 'inline-block';
                    if (label) label.textContent = 'MUTE';
                } else {
                    btn.classList.remove('muted');
                    btn.title = 'Señales Acústicas Bancarias Activas (Clic para silenciar)';
                    btn.setAttribute('aria-pressed', 'true');
                    if (iconOn) iconOn.style.display = 'inline-block';
                    if (iconOff) iconOff.style.display = 'none';
                    if (label) label.textContent = 'AUDIO';
                }
            });
        }

        /**
         * Inyecta o sincroniza el botón toggle discreto en el header corporativo
         */
        mountHeaderToggle() {
            let btn = document.getElementById('btnAudioToggle');
            if (!btn) {
                const headerRight = document.querySelector('.header-right');
                if (!headerRight) return;

                btn = document.createElement('button');
                btn.id = 'btnAudioToggle';
                btn.className = 'btn-audio-toggle' + (this.isMuted ? ' muted' : '');
                btn.type = 'button';
                btn.setAttribute('aria-label', 'Alternar audio háptico BCRP');
                btn.innerHTML = `
                    <svg class="icon-svg icon-sound-on" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${this.isMuted ? 'display:none;' : ''}">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                    <svg class="icon-svg icon-sound-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${this.isMuted ? '' : 'display:none;'}">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                    <span class="audio-label">${this.isMuted ? 'MUTE' : 'AUDIO'}</span>
                `;

                // Insertar justo antes del reloj de hora oficial
                const clockBox = headerRight.querySelector('.header-clock-box');
                if (clockBox) {
                    headerRight.insertBefore(btn, clockBox);
                } else {
                    headerRight.prepend(btn);
                }
            }

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMute();
            };

            this.updateToggleButtonUI();
        }

        /**
         * Vincula automáticamente retroalimentación táctil a elementos interactivos clave
         */
        bindTactileFeedback() {
            // Manejador delegado para respuesta instantánea en pointerdown
            document.addEventListener('pointerdown', (e) => {
                const target = e.target.closest('button, .btn, .nav-tab, .modal-close, .filter-select, .btn-action-table');
                if (target && !target.disabled && !target.closest('#btnAudioToggle, .btn-audio-toggle')) {
                    this.playClick();
                }
            }, { passive: true });
        }
    }

    // ==========================================================================
    // SISTEMA DE TOASTS EJECUTIVOS BCRP (Slide-up elástico Emil Kowalski)
    // ==========================================================================
    class BcrpToastSystem {
        constructor() {
            this.container = null;
        }

        _ensureContainer() {
            if (!this.container) {
                this.container = document.getElementById('bcrpToastContainer');
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = 'bcrpToastContainer';
                    this.container.className = 'bcrp-toast-container';
                    this.container.setAttribute('aria-live', 'polite');
                    document.body.appendChild(this.container);
                }
            }
            return this.container;
        }

        /**
         * Muestra una notificación ejecutiva con física elástica
         * @param {Object} options
         * @param {string} options.title - Título formal
         * @param {string} options.message - Detalle o ticket
         * @param {string} options.type - 'info' | 'warning' | 'critical' | 'success'
         * @param {number} options.duration - Milisegundos visibles (def: 4500)
         */
        show({ title, message, type = 'info', duration = 4500 }) {
            const container = this._ensureContainer();

            const toast = document.createElement('div');
            toast.className = `bcrp-toast toast-${type}`;
            toast.setAttribute('role', 'alert');

            // Iconografía formal SVG según severidad
            let iconSvg = '';
            if (type === 'critical') {
                iconSvg = `<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
            } else if (type === 'warning') {
                iconSvg = `<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
            } else if (type === 'success') {
                iconSvg = `<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            } else {
                iconSvg = `<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
            }

            const titleSafe = escapeHTML(title);
            const messageSafe = escapeHTML(message);

            toast.innerHTML = `
                <div class="toast-indicator"></div>
                <div class="toast-icon-box">${iconSvg}</div>
                <div class="toast-content">
                    <h5 class="toast-title">${titleSafe}</h5>
                    <p class="toast-message">${messageSafe}</p>
                </div>
                <button type="button" class="toast-dismiss" aria-label="Cerrar notificación">
                    <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
            `;

            // Botón de cierre manual
            const dismissBtn = toast.querySelector('.toast-dismiss');
            dismissBtn.onclick = () => this._remove(toast);

            container.appendChild(toast);

            // Disparar audio sincronizado con el tipo de evento
            if (window.SoundFX) {
                if (type === 'critical' || type === 'warning') {
                    window.SoundFX.playAlert();
                } else if (type === 'success') {
                    window.SoundFX.playSuccess();
                } else {
                    window.SoundFX.playClick();
                }
            }

            // Entrada elástica (next frame para activar transición CSS)
            requestAnimationFrame(() => {
                toast.classList.add('toast-visible');
            });

            // Auto-descarte
            if (duration > 0) {
                toast._autoDismissTimeout = setTimeout(() => {
                    this._remove(toast);
                }, duration);
            }

            return toast;
        }

        _remove(toast) {
            if (!toast || toast.classList.contains('toast-exiting')) return;
            clearTimeout(toast._autoDismissTimeout);
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-exiting');

            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 240);
        }
    }

    // ==========================================================================
    // SEGUIMIENTO DE CURSOR PARA GLOW REACTIVO (Hover Glow Borders)
    // ==========================================================================
    function initCursorGlowFollower() {
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const cards = document.querySelectorAll('.telemetry-node, .executive-kpi-card, .table-card, .modal-card');
                    const x = e.clientX;
                    const y = e.clientY;

                    cards.forEach(card => {
                        const rect = card.getBoundingClientRect();
                        // Solo computar si el cursor está relativamente cerca (dentro de 400px)
                        if (
                            x >= rect.left - 150 &&
                            x <= rect.right + 150 &&
                            y >= rect.top - 150 &&
                            y <= rect.bottom + 150
                        ) {
                            const relX = x - rect.left;
                            const relY = y - rect.top;
                            card.style.setProperty('--mouse-x', `${relX}px`);
                            card.style.setProperty('--mouse-y', `${relY}px`);
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Instanciación Global
    const soundEngine = new BcrpSoundFXEngine();
    const toastEngine = new BcrpToastSystem();

    window.SoundFX = soundEngine;
    window.BcrpToast = toastEngine;

    // Inicialización al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            soundEngine.mountHeaderToggle();
            soundEngine.bindTactileFeedback();
            initCursorGlowFollower();
        });
    } else {
        soundEngine.mountHeaderToggle();
        soundEngine.bindTactileFeedback();
        initCursorGlowFollower();
    }

})(window);
