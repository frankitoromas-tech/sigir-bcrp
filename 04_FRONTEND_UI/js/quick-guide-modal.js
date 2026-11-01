/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Módulo Modal: Guía de Sustentación para el Jurado Calificador APF1
 * 
 * Proyecto: Curso Integrador I - Sistemas Software (Sección 57524 - UTP)
 * Catedrático / Jurado: Ing. Zamata
 * Autor / NOC Lead: Frank Emiliano Vargas Huamán (AD\frank.vargas@bcrp.local)
 * Firma de Edición: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)
 * ==========================================================================
 * 
 * Estructura de Demostración Operativa en 4 Etapas (100% Lenguaje Bancario):
 * 1. Operación Nominal en Tiempo Real (5 pasarelas, 1,531 pagos/seg, SLA 99.98%)
 * 2. Inyección y Simulación de Interrupción en BCP (Yape) (Detección < 30s, contingencia)
 * 3. Gestión y Mitigación en el Drawer Forense (Ficha técnica digital, SHA-256, En Mitigación)
 * 4. Compilación y Sellado del Archivo Normativo SFT (Lotes BCRP, firma digital SHA-256)
 * 
 * Atajos de Teclado:
 *   [Alt + G] -> Abrir / Cerrar esta Guía de Demostración
 *   [Escape]  -> Cerrar Guía
 */

(function (window, document) {
    'use strict';

    /**
     * Sanitización estricta anti-XSS DOM para interpolación segura
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

    // Configuración de la Guía Ejecutiva
    const GUIDE_CONFIG = {
        version: '2.0.0-APF1-BCRP',
        totalSteps: 4,
        activeStep: 1,
        evaluador: 'Prof. Zamata',
        curso: 'Curso Integrador I - Sistemas Software (Sección 57524 - UTP)',
        institucion: 'Banco Central de Reserva del Perú (BCRP)'
    };

    /**
     * Genera la plantilla HTML completa de las 4 etapas en lenguaje 100% bancario y operativo
     */
    function generarContenidoGuiaHTML() {
        return `
        <div class="modal-card modal-demo-guide" style="border: 1px solid rgba(226, 179, 87, 0.45); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(226, 179, 87, 0.18);">
            <!-- Cabecera Institucional BCRP -->
            <div class="modal-header" style="background: linear-gradient(180deg, rgba(10, 25, 47, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%); border-bottom: 1px solid rgba(226, 179, 87, 0.35);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="modal-demo-header-badge" style="background: rgba(226, 179, 87, 0.15); border: 1px solid rgba(226, 179, 87, 0.5); color: #E2B357;">
                        ⚖️ JURADO APF1 · SECCIÓN 57524
                    </span>
                    <div>
                        <h3 style="margin:0; font-size:1.05rem; color:#F8FAFC; letter-spacing:-0.01em;">
                            Guía Interactiva de Sustentación Ejecutiva — BCRP
                        </h3>
                        <div style="font-size:0.72rem; color:#94A3B8; font-family:'JetBrains Mono',monospace;">
                            Evaluador: Prof. Zamata · Sustentante: Frank Vargas Huamán (NOC Lead)
                        </div>
                    </div>
                </div>
                <button class="modal-close" id="btnCerrarModalGuiaDemo" aria-label="Cerrar guía" style="color:#94A3B8;">
                    <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Cuerpo Desplazable de la Guía -->
            <div class="demo-guide-scroll">
                
                <!-- Banner de Metadatos & Atajos de Navegación -->
                <div class="demo-guide-intro" style="background: rgba(226, 179, 87, 0.08); border: 1px solid rgba(226, 179, 87, 0.3); border-left: 4px solid #E2B357;">
                    <div>
                        <strong style="color:#F8FAFC;">Ruta de Sustentación Oficial para Frank Vargas Huamán:</strong> Tiempo total de <strong>8 a 10 minutos</strong>. Cuatro etapas operativas secuenciales diseñadas para el jurado calificador del BCRP. Use los botones directos de 1 clic para ejecutar la simulación en pantalla.
                    </div>
                    <span class="kpi-tag" style="background:rgba(226,179,87,0.18); color:#E2B357; border:1px solid rgba(226,179,87,0.4); font-weight:700; white-space:nowrap; font-family:'JetBrains Mono',monospace;">
                        Atajo: Alt + G
                    </span>
                </div>

                <!-- Grid de las 4 Etapas Operativas -->
                <div class="demo-stepper-grid">
                    
                    <!-- ETAPA 1 -->
                    <div class="demo-step-card" id="stepCard1" style="border-left: 4px solid #10B981;">
                        <div class="demo-step-header">
                            <div class="demo-step-title-group">
                                <span class="demo-step-num-badge" style="background:rgba(16,185,129,0.18); color:#34D399; border-color:rgba(16,185,129,0.4);">ETAPA 1</span>
                                <span class="demo-step-title">Operación Nominal en Tiempo Real: Supervisión de 5 Pasarelas y Flujo de 1,531 Pagos/seg</span>
                            </div>
                            <span class="demo-step-time">00:00 - 02:00 (120s) · SLA 99.98%</span>
                        </div>
                        <div class="demo-step-points">
                            <div class="demo-point-row">
                                <span class="demo-point-icon">🖥️</span>
                                <div>
                                    <strong>En Consola de Supervisión:</strong> Monitoreo activo y continuo de 5 pasarelas interoperables de pagos minoristas: <strong>BCP (Yape)</strong>, <strong>Interbank (Plim)</strong>, <strong>Caja Cusco (Tunki)</strong>, <strong>Caja de los Andes</strong> y <strong>Switch Central CCE</strong>. Flujo transaccional continuo de <strong>1,531 pagos/segundo</strong>, disponibilidad consolidada del <strong>99.98%</strong> (exigencia BCRP &ge; 99.90%) y latencias sub-25 milisegundos con reloj sincronizado a la Hora Oficial del Perú (<code>PET / UTC-5</code>).
                                </div>
                            </div>
                            <div class="demo-speech-box" style="border-left-color: #10B981;">
                                <strong>🎙️ Guion Verbal para Frank Vargas Huamán:</strong>
                                "Buenos días, profesor Zamata y señores miembros del jurado calificador del BCRP. Doy inicio a la sustentación del Sistema Integral de Supervisión y Continuidad de Pagos Interbancarios (SIGIR). En esta primera etapa apreciamos la operación nominal de la infraestructura nacional: supervisamos en tiempo real las 5 pasarelas del ecosistema, procesando un flujo estable de 1,531 pagos por segundo con una disponibilidad del 99.98%, superando holgadamente el estándar regulatorio de la Circular BCRP 0014-2023 con latencias de enlace inferiores a 25 milisegundos."
                            </div>
                        </div>
                        <div class="demo-step-action-bar">
                            <span style="font-size:0.7rem; color:var(--text-tertiary);">Acción interactiva de 1 clic:</span>
                            <div style="display:flex; gap:8px;">
                                <button type="button" class="demo-trigger-btn btn-gold-demo" id="btnGuiaPaso1TráficoNormal" title="Restablecer todos los bancos a estado óptimo y disponibilidad 99.98% (Alt+1)">
                                    <span>⚡ Ejecutar este paso en vivo: Restablecer Operación Nominal (Alt+1)</span>
                                </button>
                                <button type="button" class="demo-trigger-btn" id="btnGuiaPaso2ResaltarKpis" title="Resaltar tarjetas de disponibilidad y latencias en pantalla">
                                    <span>🔍 Resaltar Tarjetas KPI</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ETAPA 2 -->
                    <div class="demo-step-card" id="stepCard2" style="border-left: 4px solid #EF4444;">
                        <div class="demo-step-header">
                            <div class="demo-step-title-group">
                                <span class="demo-step-num-badge" style="background:rgba(239,68,68,0.18); color:#F87171; border-color:rgba(239,68,68,0.4);">ETAPA 2</span>
                                <span class="demo-step-title">Inyección y Simulación de Interrupción en BCP (Yape): Detección Inmediata &lt; 30s</span>
                            </div>
                            <span class="demo-step-time">02:00 - 04:00 (120s) · Contingencia Activa</span>
                        </div>
                        <div class="demo-step-points">
                            <div class="demo-point-row">
                                <span class="demo-point-icon">🚨</span>
                                <div>
                                    <strong>En Consola de Supervisión:</strong> Inyección de interrupción en la pasarela de mayor impacto: BCP (Yape). La plataforma activa la alerta temprana en <strong>menos de 30 segundos</strong> conforme al SLA BCRP, genera de forma desatendida el ticket regulatorio <code>INC-20261031-10001</code> con <strong>Severidad CRÍTICA</strong> y conmuta de inmediato el flujo transaccional hacia el canal alterno de contingencia para impedir el rechazo de órdenes de transferencias. El nodo entra en parpadeo de alerta estroboscópico y la disponibilidad temporal se ajusta a 98.74%.
                                </div>
                            </div>
                            <div class="demo-speech-box" style="border-left-color: #EF4444; background: rgba(239, 68, 68, 0.06);">
                                <strong style="color:#EF4444;">🎙️ Guion Verbal para Frank Vargas Huamán:</strong>
                                "Procedo ahora a la inyección y simulación de una contingencia sobre la pasarela de mayor volumen: BCP (Yape). Como observa en la consola, el sistema detecta la anomalía de manera inmediata en menos de 30 segundos, emite el ticket regulatorio oficial INC-20261031-10001 catalogado con severidad crítica y ejecuta la conmutación al canal alterno de contingencia. Esta maniobra técnica resguarda el flujo monetario de los usuarios, evitando cancelaciones masivas de transferencias mientras se notifica la incidencia a la mesa de compensación."
                            </div>
                        </div>
                        <div class="demo-step-action-bar">
                            <span style="font-size:0.7rem; color:var(--text-tertiary);">Acción interactiva de 1 clic:</span>
                            <div style="display:flex; gap:8px;">
                                <button type="button" class="demo-trigger-btn btn-warning-demo" id="btnGuiaPaso3DispararFalla" title="Simular caída en BCP (Yape), auto-ticket INC-20261031-10001 y canal alterno (Alt+2)">
                                    <span>⚡ Ejecutar este paso en vivo: Simular Interrupción en BCP (Yape) (Alt+2)</span>
                                </button>
                                <button type="button" class="demo-trigger-btn" id="btnGuiaPaso4AbrirModalManual" title="Abrir formulario asistido de registro normativo de contingencias">
                                    <span>📝 Formulario de Contingencia</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ETAPA 3 -->
                    <div class="demo-step-card" id="stepCard3" style="border-left: 4px solid #38BDF8;">
                        <div class="demo-step-header">
                            <div class="demo-step-title-group">
                                <span class="demo-step-num-badge" style="background:rgba(56,189,248,0.18); color:#38BDF8; border-color:rgba(56,189,248,0.4);">ETAPA 3</span>
                                <span class="demo-step-title">Gestión y Mitigación en el Drawer Forense: Ficha Técnica Digital y Estado 'En Mitigación'</span>
                            </div>
                            <span class="demo-step-time">04:00 - 06:30 (150s) · Remediación BCRP</span>
                        </div>
                        <div class="demo-step-points">
                            <div class="demo-point-row">
                                <span class="demo-point-icon">🛡️</span>
                                <div>
                                    <strong>En Consola de Supervisión:</strong> Despliegue del Inspector Forense Lateral (Drawer Forense) con la ficha técnica digital inalterable del incidente <code>INC-20261031-10001</code>. Verificación de la línea de tiempo auditada con sellos de tiempo oficiales (PET / UTC-5) y hash criptográfico SHA-256. Ejecución de la acción de remediación: transición formal a estado <strong>'En Mitigación'</strong>, balanceo por el switch secundario de la CCE y restablecimiento progresivo de la latencia del enlace a 18 milisegundos con recuperación de la disponibilidad hacia el 99.98%.
                                </div>
                            </div>
                            <div class="demo-speech-box" style="border-left-color: #38BDF8; background: rgba(56, 189, 248, 0.06);">
                                <strong style="color:#38BDF8;">🎙️ Guion Verbal para Frank Vargas Huamán:</strong>
                                "En esta tercera etapa abrimos el Drawer Forense del incidente. Aquí el oficial de supervisión dispone de la ficha técnica digital inalterable con sellado cronológico y hash criptográfico SHA-256. Al accionar la mitigación, el incidente transiciona de manera trazable al estado EN MITIGACIÓN, enrutando las operaciones por la infraestructura de respaldo y restituyendo la conexión de BCP a 18 milisegundos, normalizando la latencia y recuperando la disponibilidad global de pagos al 99.98%."
                            </div>
                        </div>
                        <div class="demo-step-action-bar">
                            <span style="font-size:0.7rem; color:var(--text-tertiary);">Acción interactiva de 1 clic:</span>
                            <button type="button" class="demo-trigger-btn btn-gold-demo" id="btnGuiaPaso4AvanzarMitigacion" title="Abrir Drawer Forense, revisar ficha técnica y avanzar a En Mitigación (Alt+3)">
                                <span>⚡ Ejecutar este paso en vivo: Abrir Drawer Forense &amp; Mitigar (Alt+3)</span>
                            </button>
                        </div>
                    </div>

                    <!-- ETAPA 4 -->
                    <div class="demo-step-card" id="stepCard4" style="border-left: 4px solid #E2B357;">
                        <div class="demo-step-header">
                            <div class="demo-step-title-group">
                                <span class="demo-step-num-badge" style="background:rgba(226,179,87,0.18); color:#E2B357; border-color:rgba(226,179,87,0.4);">ETAPA 4</span>
                                <span class="demo-step-title">Compilación y Sellado del Archivo Normativo SFT: Estructura Oficial BCRP &amp; Firma SHA-256</span>
                            </div>
                            <span class="demo-step-time">06:30 - 08:30 (120s) · No Repudio Legal</span>
                        </div>
                        <div class="demo-step-points">
                            <div class="demo-point-row">
                                <span class="demo-point-icon">📜</span>
                                <div>
                                    <strong>En Consola de Supervisión:</strong> Compilación del archivo de texto plano para el Sistema de Facturación y Transferencia de Información del Banco Central (SFT), delimitado por tuberías en lotes estrictos: <code>HEADER</code> (identificador de remisión y timestamp), <code>DETALLE</code> (código de entidad, tipificación de interrupción y minutos de indisponibilidad) y <code>FOOTER</code> con el resumen de control. Sellado digital criptográfico mediante función hash <strong>SHA-256 de 64 caracteres hexadecimales</strong> para garantizar inmutabilidad, no repudio y validez legal ante auditorías de la SBS y el BCRP.
                                </div>
                            </div>
                            <div class="demo-speech-box" style="border-left-color: #E2B357; background: rgba(226, 179, 87, 0.06);">
                                <strong style="color:#E2B357;">🎙️ Guion Verbal para Frank Vargas Huamán:</strong>
                                "Culminamos la demostración con la compilación y sellado del archivo normativo SFT para el BCRP. El sistema genera la estructura oficial delimitada por tuberías con cabecera de lote, detalles de incidencias resueltas y pie de control, sellando el reporte con un hash criptográfico SHA-256 inmutable de 64 caracteres. Este procedimiento asegura el no repudio y certifica ante el regulador la total transparencia de la operación. Quedo a su disposición para sus preguntas, profesor Zamata."
                            </div>
                        </div>
                        <div class="demo-step-action-bar">
                            <span style="font-size:0.7rem; color:var(--text-tertiary);">Acción interactiva de 1 clic:</span>
                            <button type="button" class="demo-trigger-btn btn-gold-demo" id="btnGuiaPaso6AbrirSft" title="Compilar paquete normativo SFT y calcular firma digital SHA-256 (Alt+4)">
                                <span>⚡ Ejecutar este paso en vivo: Compilar y Sellar Archivo SFT (Alt+4)</span>
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Sección: Argumentación Operativa y Normativa ante Preguntas del Jurado -->
                <div class="demo-faq-card" style="background: rgba(10, 21, 40, 0.85); border: 1px solid rgba(226, 179, 87, 0.35);">
                    <h4 style="display:flex; align-items:center; gap:8px; margin-top:0; color:#E2B357;">
                        <svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2B357" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span>🛡️ Respuestas Maestras de Continuidad Operativa ante Preguntas del Jurado Calificador</span>
                    </h4>
                    <div class="demo-faq-list" style="display:flex; flex-direction:column; gap:10px; font-size:0.74rem;">
                        <div class="demo-faq-item" style="padding:6px 10px; background:rgba(255,255,255,0.02); border-radius:4px; border-left:3px solid #10B981;">
                            <strong style="color:#34D399;">1. ¿Cómo se previene la duplicidad o pérdida de transferencias durante la conmutación a contingencia?</strong><br>
                            <span style="color:#CBD5E1;">&rarr; "Mediante protocolos de idempotencia transaccional y conmutación transparente en la capa de compensación de la CCE, respaldados por bitácoras sincronizadas con la Hora Oficial del Perú (PET / UTC-5) que aseguran la conciliación precisa de órdenes en vuelo."</span>
                        </div>
                        <div class="demo-faq-item" style="padding:6px 10px; background:rgba(255,255,255,0.02); border-radius:4px; border-left:3px solid #EF4444;">
                            <strong style="color:#F87171;">2. ¿Por qué la normativa del BCRP fija la detección de caídas en menos de 30 segundos?</strong><br>
                            <span style="color:#CBD5E1;">&rarr; "En infraestructuras de pagos sistémicamente importantes, una interrupción no detectada en 30 segundos represa miles de transacciones y genera riesgo de liquidez en cascada entre las entidades financieras participantes."</span>
                        </div>
                        <div class="demo-faq-item" style="padding:6px 10px; background:rgba(255,255,255,0.02); border-radius:4px; border-left:3px solid #38BDF8;">
                            <strong style="color:#38BDF8;">3. ¿Cuál es el valor regulatorio y probatorio de la firma digital SHA-256 en el Archivo SFT?</strong><br>
                            <span style="color:#CBD5E1;">&rarr; "Garantiza integridad absoluta y no repudio ante la Gerencia de Operaciones Monetarias y Estabilidad Financiera del BCRP y la SBS, impidiendo cualquier alteración retroactiva de tiempos o categorización de incidentes."</span>
                        </div>
                        <div class="demo-faq-item" style="padding:6px 10px; background:rgba(255,255,255,0.02); border-radius:4px; border-left:3px solid #E2B357;">
                            <strong style="color:#E2B357;">4. ¿Cómo se sustenta el cumplimiento de disponibilidad del 99.98%?</strong><br>
                            <span style="color:#CBD5E1;">&rarr; "A través del cómputo ponderado de minutos fuera de servicio sobre la ventana operativa mensual (43,200 minutos), demostrando cumplimiento holgado del SLA normativo del 99.90% estipulado en la Circular BCRP 0014-2023."</span>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Pie de Modal con Atajos Globales -->
            <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; background:rgba(10,21,40,0.95); border-top:1px solid rgba(226,179,87,0.3);">
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#94A3B8;">
                    Atajos de Sustentación: <strong style="color:#34D399;">Alt+1</strong> (Operación Nominal) · <strong style="color:#F87171;">Alt+2</strong> (Interrupción BCP) · <strong style="color:#38BDF8;">Alt+3</strong> (Drawer y Mitigación) · <strong style="color:#E2B357;">Alt+4</strong> (Compilación SFT) · <strong>Alt+G</strong> (Guía)
                </div>
                <button type="button" class="btn btn-primary" id="btnCerrarModalGuiaDemoFooter" style="background:#E2B357; color:#0A1528; font-weight:700; border:none; padding:6px 14px; border-radius:6px; cursor:pointer;">
                    <span>Entendido · Volver a la Consola</span>
                </button>
            </div>
        </div>
        `;
    }

    /**
     * Asegura o inyecta el contenedor del modal en el DOM
     */
    function asegurarModalGuiaDOM() {
        let modalEl = document.getElementById('modalGuiaDemo');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'modalGuiaDemo';
            modalEl.className = 'modal-overlay';
            modalEl.innerHTML = generarContenidoGuiaHTML();
            document.body.appendChild(modalEl);
        } else {
            // Actualizar su contenido interno para asegurar las 4 etapas y textos bancarios
            modalEl.innerHTML = generarContenidoGuiaHTML();
        }

        vincularEventosGuia();
    }

    /**
     * Vincula listeners a los botones de acción dentro de la guía y eventos de teclado
     */
    function vincularEventosGuia() {
        const modal = document.getElementById('modalGuiaDemo');
        if (!modal) return;

        // Botones de cierre
        const cerrarGuia = () => {
            modal.classList.remove('active');
        };

        document.getElementById('btnCerrarModalGuiaDemo')?.addEventListener('click', cerrarGuia);
        document.getElementById('btnCerrarModalGuiaDemoFooter')?.addEventListener('click', cerrarGuia);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarGuia();
        });

        // ==================================================================
        // ACCIONES INTERACTIVAS DE 1 CLIC ('EJECUTAR ESTE PASO EN VIVO')
        // ==================================================================

        // ETAPA 1: Operación Nominal en Tiempo Real
        document.getElementById('btnGuiaPaso1TráficoNormal')?.addEventListener('click', () => {
            cerrarGuia();
            ejecutarEtapa(1);
        });

        // Resaltar KPIs (Acción complementaria Etapa 1)
        document.getElementById('btnGuiaPaso2ResaltarKpis')?.addEventListener('click', () => {
            cerrarGuia();
            const grid = document.querySelector('.executive-kpi-grid') || document.querySelector('.kpis-container');
            if (grid) {
                grid.classList.add('row-highlight-active');
                setTimeout(() => grid.classList.remove('row-highlight-active'), 2500);
            }
        });

        // ETAPA 2: Inyección y Simulación de Interrupción en BCP (Yape)
        document.getElementById('btnGuiaPaso3DispararFalla')?.addEventListener('click', () => {
            cerrarGuia();
            ejecutarEtapa(2);
        });

        // Formulario manual de contingencia
        document.getElementById('btnGuiaPaso4AbrirModalManual')?.addEventListener('click', () => {
            cerrarGuia();
            const modalManual = document.getElementById('modalIncidente');
            if (modalManual) modalManual.classList.add('active');
        });

        // ETAPA 3: Gestión y Mitigación en el Drawer Forense
        document.getElementById('btnGuiaPaso4AvanzarMitigacion')?.addEventListener('click', () => {
            cerrarGuia();
            ejecutarEtapa(3);
        });

        // ETAPA 4: Compilación y Sellado del Archivo Normativo SFT
        document.getElementById('btnGuiaPaso6AbrirSft')?.addEventListener('click', () => {
            cerrarGuia();
            ejecutarEtapa(4);
        });
    }

    /**
     * Ejecuta una etapa de demostración operativa en vivo
     */
    function ejecutarEtapa(etapaNum) {
        switch (etapaNum) {
            case 1:
                if (window.NocDemo && typeof window.NocDemo.escenario1 === 'function') {
                    window.NocDemo.escenario1();
                } else if (typeof window.renderizarTelemetria === 'function') {
                    if (window.AppState && window.AppState.entidades) {
                        window.AppState.entidades.forEach(e => { e.estado = 'SALUDABLE'; e.incidentes = 0; });
                    }
                    window.renderizarTelemetria();
                    if (typeof window.actualizarKpis === 'function') window.actualizarKpis();
                }
                break;

            case 2:
                if (window.NocDemo && typeof window.NocDemo.escenario2 === 'function') {
                    window.NocDemo.escenario2();
                } else if (typeof window.simularCaidaAutomatica === 'function') {
                    window.simularCaidaAutomatica();
                }
                break;

            case 3:
                // Abrir Drawer Forense sobre ticket objetivo y conmutar a EN_MITIGACION
                if (window.NocDemo && typeof window.NocDemo.escenario3 === 'function') {
                    window.NocDemo.escenario3();
                } else if (window.IncidentDrawer && typeof window.IncidentDrawer.open === 'function') {
                    window.IncidentDrawer.open('INC-20261031-10001');
                }
                break;

            case 4:
                if (window.NocDemo && typeof window.NocDemo.escenario4 === 'function') {
                    window.NocDemo.escenario4();
                } else if (typeof window.generarReporteSft === 'function') {
                    window.generarReporteSft();
                }
                break;

            default:
                console.warn('[QuickGuideModal] Etapa no reconocida:', etapaNum);
        }
    }

    /**
     * Alternar apertura y cierre del modal de la guía
     */
    function toggleModalGuia() {
        const modal = document.getElementById('modalGuiaDemo');
        if (!modal) {
            asegurarModalGuiaDOM();
        }
        const modalRef = document.getElementById('modalGuiaDemo');
        if (!modalRef) return;

        const willOpen = !modalRef.classList.contains('active');
        modalRef.classList.toggle('active');

        if (willOpen) {
            if (window.SoundFX && typeof window.SoundFX.playPop === 'function') {
                window.SoundFX.playPop();
            }
            setTimeout(() => document.getElementById('btnCerrarModalGuiaDemo')?.focus(), 50);
        }
    }

    /**
     * Inicialización del módulo
     */
    function init() {
        asegurarModalGuiaDOM();

        // Botón en la cabecera del sistema
        document.getElementById('btnAbrirGuiaModal')?.addEventListener('click', toggleModalGuia);

        // Atajos de teclado globales
        window.addEventListener('keydown', (e) => {
            if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'g' || e.key === 'G')) {
                e.preventDefault();
                toggleModalGuia();
            } else if (e.key === 'Escape') {
                const modal = document.getElementById('modalGuiaDemo');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exportación de la API pública
    window.QuickGuideModal = {
        version: GUIDE_CONFIG.version,
        evaluador: GUIDE_CONFIG.evaluador,
        open: () => {
            const m = document.getElementById('modalGuiaDemo');
            if (m) m.classList.add('active');
        },
        close: () => {
            const m = document.getElementById('modalGuiaDemo');
            if (m) m.classList.remove('active');
        },
        toggle: toggleModalGuia,
        ejecutarEtapa: ejecutarEtapa,
        getConfig: () => ({ ...GUIDE_CONFIG })
    };

    // Exportar función global para interoperabilidad con app.js y demo-presets.js
    window.toggleModalGuiaDemo = toggleModalGuia;

})(window, document);
