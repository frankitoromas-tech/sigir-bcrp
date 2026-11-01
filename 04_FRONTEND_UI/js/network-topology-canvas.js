/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Visualización Viva y Cinemática de la Topología Interbancaria BCRP / CCE
 * 
 * Proyecto: Curso Integrador I - Sistemas Software (Sección 57524 - UTP)
 * Autor / NOC Lead: Frank Emiliano Vargas Huamán (AD\frank.vargas@bcrp.local)
 * Firma de Edición: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)
 * ==========================================================================
 * 
 * Especificaciones Técnicas del Motor Canvas:
 * 1. Renderizado de Alta Definición con soporte DPR / Retina (window.devicePixelRatio).
 * 2. Arquitectura de Red Hub-and-Spoke de Compensación y Liquidación CCE.
 * 3. 5 Nodos Institucionales:
 *    - CCE Switch Central (Core Hub central)
 *    - BCP (Yape)
 *    - BBVA / Interbank (Plin)
 *    - Caja Cusco
 *    - Caja de los Andes
 * 4. Flujo continuo de partículas que representan paquetes ISO 20022
 *    (pacs.008, pacs.002, camt.053, pain.001) con estelas lumínicas.
 * 5. Integración reactiva con telemetría: si un nodo entra en contingencia (ej. HTTP 503 BCP),
 *    el enlace pulsa en carmesí #EF4444 con modulación de onda sísmica y partículas dispersas.
 * 6. Interactividad completa: hover con halo táctico e inspección HUD, arrastre (drag-and-drop),
 *    restablecimiento y control de partículas.
 * 7. Paleta corporativa BCRP: Slate profundo, Navy, Gold y Sky Blue. Cero emojis.
 */

(function () {
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

    // Constantes del motor gráfico
    const THEME = {
        bgBase: '#0B0F17',
        bgSurface: '#0F172A',
        bgCard: '#111827',
        borderDim: '#1E293B',
        borderSubtle: 'rgba(255, 255, 255, 0.08)',
        borderStrong: '#334155',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        textTertiary: '#64748B',
        gold: '#E2B357',
        goldGlow: 'rgba(226, 179, 87, 0.35)',
        goldSubtle: 'rgba(226, 179, 87, 0.12)',
        sky: '#38BDF8',
        skyGlow: 'rgba(56, 189, 248, 0.35)',
        skySubtle: 'rgba(56, 189, 248, 0.12)',
        emerald: '#10B981',
        emeraldGlow: 'rgba(16, 185, 129, 0.4)',
        emeraldSubtle: 'rgba(16, 185, 129, 0.12)',
        crimson: '#EF4444',
        crimsonGlow: 'rgba(239, 68, 68, 0.55)',
        crimsonSubtle: 'rgba(239, 68, 68, 0.16)',
        navyDeep: '#1E3A8A',
        navySubtle: 'rgba(30, 58, 138, 0.25)',
        gridLine: 'rgba(56, 189, 248, 0.035)',
        gridCross: 'rgba(56, 189, 248, 0.15)'
    };

    // Definición institucional de los 5 nodos
    const NODE_DEFINITIONS = [
        {
            id: 5,
            key: 'cce',
            nombre: 'CCE Switch Central',
            badge: 'CORE HUB CENTRAL · COD 901',
            canal: 'Switch Interbancario',
            tipo: 'HUB',
            codigoIso: 'CCE-PE-SWITCH',
            protocolo: 'ISO 20022 · MQ Series v9.3',
            mtu: '9000 Jumbo Frame',
            anchoBanda: '40 Gbps Fibra Redundante',
            colorAcento: THEME.gold,
            colorSubtle: THEME.goldSubtle,
            radius: 46,
            isCentral: true
        },
        {
            id: 1,
            key: 'bcp',
            nombre: 'BCP (Yape)',
            badge: 'BILLETERA MOVIL · COD 002',
            canal: 'Billetera Móvil & Banca Móvil',
            tipo: 'SPOKE',
            codigoIso: 'BCPL-PE-YAPE',
            protocolo: 'ISO 20022 pacs.008 · REST TLS 1.3',
            mtu: '1500 Ethernet',
            anchoBanda: '10 Gbps Canal Privado BCRP',
            colorAcento: '#002A8F',
            colorHighlight: '#38BDF8',
            radius: 36,
            isCentral: false,
            preferredAngle: -140 // Cuadrante superior izquierdo
        },
        {
            id: 2,
            key: 'interbank',
            nombre: 'BBVA / Interbank (Plin)',
            badge: 'INTEROPERABILIDAD · COD 003',
            canal: 'Billetera Móvil & Pasarela Plin',
            tipo: 'SPOKE',
            codigoIso: 'BINP-PE-PLIN',
            protocolo: 'ISO 20022 pacs.008 · AS2 / HTTPS',
            mtu: '1500 Ethernet',
            anchoBanda: '10 Gbps Canal Privado BCRP',
            colorAcento: '#0284C7',
            colorHighlight: '#38BDF8',
            radius: 36,
            isCentral: false,
            preferredAngle: -40 // Cuadrante superior derecho
        },
        {
            id: 3,
            key: 'cusco',
            nombre: 'Caja Cusco',
            badge: 'MICROFINANZAS · COD 801',
            canal: 'Banca Móvil & Tunki QR',
            tipo: 'SPOKE',
            codigoIso: 'CMAC-PE-CUSCO',
            protocolo: 'ISO 20022 pacs.008 · VPN IPsec',
            mtu: '1500 Ethernet',
            anchoBanda: '2 Gbps Enlace MPLS Seguro',
            colorAcento: '#D97706',
            colorHighlight: '#F59E0B',
            radius: 34,
            isCentral: false,
            preferredAngle: 140 // Cuadrante inferior izquierdo
        },
        {
            id: 4,
            key: 'andes',
            nombre: 'Caja de los Andes',
            badge: 'BANCA RURAL · COD 812',
            canal: 'Banca Móvil Rural',
            tipo: 'SPOKE',
            codigoIso: 'CRAC-PE-ANDES',
            protocolo: 'ISO 20022 pacs.008 · SD-WAN BCRP',
            mtu: '1500 Ethernet',
            anchoBanda: '1 Gbps Enlace Satelital/MPLS',
            colorAcento: '#059669',
            colorHighlight: '#10B981',
            radius: 34,
            isCentral: false,
            preferredAngle: 40 // Cuadrante inferior derecho
        }
    ];

    // Tipos de paquetes ISO 20022 para simular transaccionalidad bancaria real
    const ISO_PACKET_TYPES = [
        { code: 'pacs.008', name: 'Transferencia Inmediata', color: THEME.sky, priority: 'HIGH', size: 3.4 },
        { code: 'pacs.002', name: 'Confirmación ACK', color: THEME.emerald, priority: 'HIGH', size: 2.8 },
        { code: 'camt.053', name: 'Extracto / Liquidación', color: THEME.gold, priority: 'NORMAL', size: 3.0 },
        { code: 'pain.001', name: 'Inicio de Pago', color: '#818CF8', priority: 'NORMAL', size: 2.6 }
    ];

    /**
     * Motor Principal del Canvas de Topología
     */
    class NetworkTopologyCanvas {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.viewport = null;
            this.tooltip = null;
            this.dpr = 1;
            this.width = 0;
            this.height = 0;

            this.nodes = [];
            this.links = [];
            this.particles = [];
            this.scatteredParticles = [];
            this.shockwaveRings = [];

            this.animationFrameId = null;
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
            this.fps = 60;
            this.globalTime = 0;

            this.showParticles = true;
            this.isDragging = false;
            this.draggedNode = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.hoveredNode = null;
            this.hoveredLink = null;
            this.mousePos = { x: -1000, y: -1000 };

            this.radarAngle = 0;
            this.tpsCurrent = 1480;
            this.tpsTarget = 1480;

            this.init();
        }

        init() {
            this.canvas = document.getElementById('networkTopologyCanvas') || document.getElementById('cceTopologyCanvas');
            this.viewport = document.getElementById('topologyCanvasViewport') || document.getElementById('cceTopologyCanvasViewport');
            this.tooltip = document.getElementById('topologyNodeTooltip');

            if (!this.canvas || !this.viewport) {
                console.warn('[TopologyCanvas] Elementos del canvas no encontrados en el DOM actual.');
                return;
            }

            this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
            if (!this.ctx) return;

            this.setupNodes();
            this.setupLinks();
            this.handleResize();

            // Listeners de redimensionamiento
            window.addEventListener('resize', () => this.handleResize());
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => this.handleResize());
                ro.observe(this.viewport);
            }

            // Listeners de interactividad mouse / touch
            this.setupInteractionListeners();

            // Listeners de controles UI
            this.setupToolbarControls();

            // Generar paquete inicial de partículas
            this.populateInitialParticles();

            // Arrancar bucle cinemático
            this.lastFrameTime = performance.now();
            this.renderLoop = this.renderLoop.bind(this);
            this.animationFrameId = requestAnimationFrame(this.renderLoop);

            console.log('[TopologyCanvas] Motor de Topología Interbancaria BCRP/CCE inicializado con soporte Retina DPR:', this.dpr);
        }

        /**
         * Inicializa los nodos con su estado y geometrías
         */
        setupNodes() {
            this.nodes = NODE_DEFINITIONS.map(def => ({
                ...def,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                baseX: 0,
                baseY: 0,
                vx: 0,
                vy: 0,
                isHovered: false,
                isDragging: false,
                pulsePhase: Math.random() * Math.PI * 2,
                // Estado dinámico sincronizado con AppState
                telemetria: {
                    estado: 'SALUDABLE',
                    latencia: 18,
                    incidentes: 0,
                    tps: 340,
                    uptime: 99.98
                }
            }));
        }

        /**
         * Conecta cada banco con el CCE Switch Central (Arquitectura Hub-and-Spoke)
         */
        setupLinks() {
            const centralNode = this.nodes.find(n => n.isCentral);
            if (!centralNode) return;

            this.links = this.nodes
                .filter(n => !n.isCentral)
                .map(spoke => ({
                    source: spoke,
                    target: centralNode,
                    idEntidad: spoke.id,
                    isDegraded: false,
                    seismicPhase: Math.random() * Math.PI * 2,
                    seismicIntensity: 0,
                    throughputTps: Math.floor(250 + Math.random() * 200)
                }));
        }

        /**
         * Cálculo de dimensiones nítidas para Retina / DPR
         */
        handleResize() {
            if (!this.canvas || !this.viewport) return;

            const rect = this.viewport.getBoundingClientRect();
            this.dpr = Math.max(1, window.devicePixelRatio || 1);
            this.width = Math.max(320, Math.floor(rect.width));
            this.height = Math.max(260, Math.floor(rect.height || 360));

            // Dimensionar buffer del canvas en píxeles físicos
            this.canvas.width = Math.floor(this.width * this.dpr);
            this.canvas.height = Math.floor(this.height * this.dpr);

            // Dimensionar estilo CSS en píxeles lógicos
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;

            // Escalar contexto para que todas las coordenadas se piensen en píxeles lógicos
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            // Reubicar nodos en el espacio según la nueva geometría
            this.positionNodesGeometrically();
        }

        /**
         * Posiciona los nodos respetando un esquema estético de topología estrella balanceada
         */
        positionNodesGeometrically() {
            const cx = this.width / 2;
            const cy = this.height / 2;

            // Radio de la órbita de los bancos hacia el Switch Central
            const minDim = Math.min(this.width, this.height);
            const orbitRadiusX = Math.min(this.width * 0.38, Math.max(180, minDim * 0.44));
            const orbitRadiusY = Math.min(this.height * 0.38, Math.max(105, minDim * 0.34));

            this.nodes.forEach(node => {
                if (node.isCentral) {
                    node.baseX = cx;
                    node.baseY = cy;
                } else {
                    const rad = (node.preferredAngle * Math.PI) / 180;
                    node.baseX = cx + Math.cos(rad) * orbitRadiusX;
                    node.baseY = cy + Math.sin(rad) * orbitRadiusY;
                }

                // Si no se está arrastrando, asignar posición
                if (!node.isDragging) {
                    node.x = node.baseX;
                    node.y = node.baseY;
                }
            });
        }

        /**
         * Poblar partículas iniciales de tráfico ISO 20022
         */
        populateInitialParticles() {
            this.particles = [];
            const particleCount = 28;

            for (let i = 0; i < particleCount; i++) {
                const link = this.links[i % this.links.length];
                const type = ISO_PACKET_TYPES[Math.floor(Math.random() * ISO_PACKET_TYPES.length)];
                const reverse = Math.random() > 0.5;

                this.particles.push({
                    link: link,
                    progress: Math.random(),
                    speed: 0.0035 + Math.random() * 0.0055,
                    reverse: reverse,
                    type: type,
                    trail: []
                });
            }
        }

        /**
         * Configuración de interacciones táctiles y de ratón
         */
        setupInteractionListeners() {
            const getCanvasCoords = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            };

            // Mouse move
            this.canvas.addEventListener('mousemove', (e) => {
                const pos = getCanvasCoords(e);
                this.mousePos = pos;

                if (this.isDragging && this.draggedNode) {
                    this.draggedNode.x = Math.max(40, Math.min(this.width - 40, pos.x - this.dragOffsetX));
                    this.draggedNode.y = Math.max(40, Math.min(this.height - 40, pos.y - this.dragOffsetY));
                    this.canvas.style.cursor = 'grabbing';
                    this.hideTooltip();
                    return;
                }

                // Detectar hover sobre nodo
                const foundNode = this.getNodeAtPosition(pos.x, pos.y);
                if (foundNode) {
                    this.canvas.style.cursor = 'grab';
                    this.hoveredNode = foundNode;
                    this.showNodeTooltip(foundNode, pos.x, pos.y);
                } else {
                    this.hoveredNode = null;
                    this.hideTooltip();

                    // Detectar hover sobre enlaces
                    const foundLink = this.getLinkAtPosition(pos.x, pos.y);
                    if (foundLink) {
                        this.canvas.style.cursor = 'crosshair';
                        this.hoveredLink = foundLink;
                    } else {
                        this.canvas.style.cursor = 'default';
                        this.hoveredLink = null;
                    }
                }
            });

            // Mouse down
            this.canvas.addEventListener('mousedown', (e) => {
                const pos = getCanvasCoords(e);
                const foundNode = this.getNodeAtPosition(pos.x, pos.y);
                if (foundNode) {
                    this.isDragging = true;
                    this.draggedNode = foundNode;
                    foundNode.isDragging = true;
                    this.dragOffsetX = pos.x - foundNode.x;
                    this.dragOffsetY = pos.y - foundNode.y;
                    this.canvas.style.cursor = 'grabbing';
                    this.hideTooltip();
                }
            });

            // Mouse up & leave
            const stopDrag = () => {
                if (this.isDragging && this.draggedNode) {
                    this.draggedNode.isDragging = false;
                    this.isDragging = false;
                    this.draggedNode = null;
                    this.canvas.style.cursor = 'default';
                }
            };

            window.addEventListener('mouseup', stopDrag);
            this.canvas.addEventListener('mouseleave', () => {
                this.mousePos = { x: -1000, y: -1000 };
                this.hoveredNode = null;
                this.hoveredLink = null;
                this.hideTooltip();
                stopDrag();
            });

            // Soporte Touch básico para pantallas táctiles
            this.canvas.addEventListener('touchstart', (e) => {
                const pos = getCanvasCoords(e);
                const foundNode = this.getNodeAtPosition(pos.x, pos.y);
                if (foundNode) {
                    this.isDragging = true;
                    this.draggedNode = foundNode;
                    foundNode.isDragging = true;
                    this.dragOffsetX = pos.x - foundNode.x;
                    this.dragOffsetY = pos.y - foundNode.y;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (this.isDragging && this.draggedNode) {
                    const pos = getCanvasCoords(e);
                    this.draggedNode.x = Math.max(40, Math.min(this.width - 40, pos.x - this.dragOffsetX));
                    this.draggedNode.y = Math.max(40, Math.min(this.height - 40, pos.y - this.dragOffsetY));
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', stopDrag, { passive: true });
        }

        /**
         * Configura botones de acción del toolbar del canvas
         */
        setupToolbarControls() {
            const btnToggle = document.getElementById('btnToggleParticles');
            if (btnToggle) {
                btnToggle.addEventListener('click', () => {
                    this.showParticles = !this.showParticles;
                    btnToggle.classList.toggle('active', this.showParticles);
                    const span = btnToggle.querySelector('span');
                    if (span) span.textContent = this.showParticles ? 'Animar Flujo' : 'Detener Flujo';
                });
            }

            const btnReset = document.getElementById('btnResetTopology');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    this.positionNodesGeometrically();
                    // Pulso visual en botón
                    btnReset.style.transform = 'scale(0.92)';
                    setTimeout(() => { btnReset.style.transform = 'scale(1)'; }, 150);
                });
            }
        }

        /**
         * Detecta si hay un nodo en las coordenadas de ratón (tolerancia +10px)
         */
        getNodeAtPosition(x, y) {
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const n = this.nodes[i];
                const dx = x - n.x;
                const dy = y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= n.radius + 12) {
                    return n;
                }
            }
            return null;
        }

        /**
         * Detecta cercanía a un enlace de conexión
         */
        getLinkAtPosition(x, y) {
            const threshold = 10;
            for (const link of this.links) {
                const x1 = link.source.x;
                const y1 = link.source.y;
                const x2 = link.target.x;
                const y2 = link.target.y;

                const lineLen = Math.hypot(x2 - x1, y2 - y1);
                if (lineLen === 0) continue;

                // Distancia de punto a segmento
                const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLen * lineLen)));
                const projX = x1 + t * (x2 - x1);
                const projY = y1 + t * (y2 - y1);
                const dist = Math.hypot(x - projX, y - projY);

                if (dist <= threshold) {
                    return link;
                }
            }
            return null;
        }

        /**
         * Muestra el tooltip con telemetría operativa
         */
        showNodeTooltip(node, mouseX, mouseY) {
            if (!this.tooltip) return;

            const isCaido = node.telemetria.estado === 'CAIDO';
            const estadoLabel = isCaido ? 'CONTINGENCIA ACTIVA' : 'OPERATIVO';
            const estadoColor = isCaido ? THEME.crimson : THEME.emerald;

            const nombreSafe = escapeHTML(node.nombre);
            const badgeSafe = escapeHTML(node.badge);
            const isoSafe = escapeHTML(node.codigoIso);
            const protoSafe = escapeHTML(node.protocolo);
            const latenciaVal = typeof node.telemetria.latencia === 'number' ? node.telemetria.latencia : escapeHTML(node.telemetria.latencia);
            const latenciaUnit = typeof node.telemetria.latencia === 'number' ? 'ms' : '';
            const bandaSafe = escapeHTML(node.anchoBanda);
            const tpsVal = parseInt(node.telemetria.tps, 10) || 0;

            this.tooltip.innerHTML = `
                <div class="tt-header">
                    <span class="tt-title">${nombreSafe}</span>
                    <span class="tt-badge" style="color: ${estadoColor}; border-color: ${estadoColor}; background: ${isCaido ? THEME.crimsonSubtle : THEME.emeraldSubtle}">
                        ${estadoLabel}
                    </span>
                </div>
                <div class="tt-meta-code">${badgeSafe} · ISO: ${isoSafe}</div>
                <div class="tt-metrics-grid">
                    <div class="tt-metric-item">
                        <span class="tt-metric-k">Protocolo</span>
                        <span class="tt-metric-v">${protoSafe}</span>
                    </div>
                    <div class="tt-metric-item">
                        <span class="tt-metric-k">Latencia Sonda</span>
                        <span class="tt-metric-v" style="color: ${estadoColor}">${latenciaVal} ${latenciaUnit}</span>
                    </div>
                    <div class="tt-metric-item">
                        <span class="tt-metric-k">Enlace de Red</span>
                        <span class="tt-metric-v">${bandaSafe}</span>
                    </div>
                    <div class="tt-metric-item">
                        <span class="tt-metric-k">Flujo en Tiempo Real</span>
                        <span class="tt-metric-v">${tpsVal} pagos/seg</span>
                    </div>
                </div>
                ${isCaido ? `<div class="tt-alert-box">INTERRUPCIÓN DETECTADA: Enrutamiento por canal de emergencia hacia CCE.</div>` : ''}
            `;

            this.tooltip.style.display = 'block';

            // Posicionar evitando desbordar el contenedor
            const tipRect = this.tooltip.getBoundingClientRect();
            let left = mouseX + 18;
            let top = mouseY - tipRect.height / 2;

            if (left + tipRect.width > this.width - 15) {
                left = mouseX - tipRect.width - 18;
            }
            if (top < 10) top = 10;
            if (top + tipRect.height > this.height - 10) {
                top = this.height - tipRect.height - 10;
            }

            this.tooltip.style.left = `${left}px`;
            this.tooltip.style.top = `${top}px`;
        }

        hideTooltip() {
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
        }

        /**
         * Sincroniza el estado de los nodos con AppState global de SIGIR
         */
        syncTelemetryState() {
            const appState = window.AppState;
            if (!appState || !Array.isArray(appState.entidades)) return;

            let hayContingenciaGlobal = false;
            let totalIncidentes = 0;

            this.nodes.forEach(node => {
                const ent = appState.entidades.find(e => e.id === node.id);
                if (ent) {
                    node.telemetria.estado = ent.estado || 'SALUDABLE';
                    node.telemetria.latencia = ent.latencia;
                    node.telemetria.incidentes = ent.incidentes || 0;
                    totalIncidentes += node.telemetria.incidentes;

                    if (ent.estado === 'CAIDO') {
                        hayContingenciaGlobal = true;
                        node.telemetria.tps = 0;
                    } else {
                        // Fluctuación estética de TPS
                        node.telemetria.tps = Math.floor(280 + Math.sin(this.globalTime * 2 + node.id) * 60);
                    }
                }
            });

            // Sincronizar estado de los enlaces
            this.links.forEach(link => {
                const sourceCaido = link.source.telemetria.estado === 'CAIDO';
                link.isDegraded = sourceCaido;

                if (sourceCaido) {
                    link.seismicIntensity = Math.min(1, link.seismicIntensity + 0.08);
                    // Disparar onda sísmica periódica si está en contingencia
                    if (Math.random() < 0.04) {
                        this.triggerShockwave(link.source.x, link.source.y);
                    }
                } else {
                    link.seismicIntensity = Math.max(0, link.seismicIntensity - 0.05);
                }
            });

            // Actualizar píldora de estado de la barra superior
            const statusPill = document.getElementById('topologiaStatusPill');
            const statusDot = document.getElementById('topologiaStatusDot');
            const statusText = document.getElementById('topologiaStatusText');

            if (statusPill && statusDot && statusText) {
                if (hayContingenciaGlobal) {
                    statusPill.className = 'topology-status-pill contingency';
                    statusDot.className = 'status-dot critical';
                    statusText.textContent = 'ALERTA: ENLACE EN CONTINGENCIA DE EMERGENCIA';
                } else {
                    statusPill.className = 'topology-status-pill online';
                    statusDot.className = 'status-dot online';
                    statusText.textContent = 'Canal Central CCE: Operativo y Estable';
                }
            }

            // Actualizar TPS Global con fluidez
            const tpsVal = document.getElementById('topologiaTpsVal');
            if (tpsVal) {
                const targetTps = hayContingenciaGlobal ? 920 : 1480 + Math.floor(Math.sin(this.globalTime * 3) * 80);
                this.tpsCurrent += (targetTps - this.tpsCurrent) * 0.05;
                tpsVal.textContent = `${Math.round(this.tpsCurrent).toLocaleString()} pagos/seg`;
            }
        }

        /**
         * Dispara una onda de choque sísmica desde el nodo afectado
         */
        triggerShockwave(x, y) {
            this.shockwaveRings.push({
                x,
                y,
                radius: 12,
                maxRadius: 140,
                opacity: 0.9,
                speed: 2.2,
                color: THEME.crimson
            });
        }

        /**
         * Genera partículas dispersas erráticas cuando el paquete choca con un canal roto
         */
        emitScatteredSparks(x, y, count = 4) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.2 + Math.random() * 3.4;
                this.scatteredParticles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 1.5 + Math.random() * 2.5,
                    alpha: 1.0,
                    decay: 0.025 + Math.random() * 0.035,
                    color: Math.random() > 0.4 ? THEME.crimson : '#FCA5A5'
                });
            }
        }

        /**
         * Actualiza el cálculo físico de partículas y ondas sísmicas
         */
        updatePhysics(dt) {
            this.globalTime += dt;
            this.radarAngle = (this.radarAngle + dt * 0.8) % (Math.PI * 2);

            // 1. Actualizar partículas normales de tráfico
            if (this.showParticles) {
                for (let i = 0; i < this.particles.length; i++) {
                    const p = this.particles[i];
                    const link = p.link;

                    // Si el enlace está en contingencia severa, el tráfico se ve alterado
                    if (link.isDegraded) {
                        // Partículas erráticas que se dispersan
                        p.progress += p.speed * 0.7;
                        if (p.progress > 0.55 && Math.random() < 0.25) {
                            // Punto de ruptura en el enlace
                            const currPos = this.getPointOnLink(link, p.progress, 0);
                            this.emitScatteredSparks(currPos.x, currPos.y, 3);
                            p.progress = 0; // Reiniciar
                        }
                    } else {
                        p.progress += p.speed;
                    }

                    if (p.progress >= 1.0) {
                        p.progress = 0;
                        p.reverse = !p.reverse;
                        p.type = ISO_PACKET_TYPES[Math.floor(Math.random() * ISO_PACKET_TYPES.length)];
                    }

                    // Guardar rastro lumínico
                    const pos = this.getPointOnLink(link, p.progress, link.seismicIntensity);
                    p.trail.unshift({ x: pos.x, y: pos.y, alpha: 1.0 });
                    if (p.trail.length > 5) {
                        p.trail.pop();
                    }
                }
            }

            // 2. Actualizar partículas dispersas
            for (let i = this.scatteredParticles.length - 1; i >= 0; i--) {
                const sp = this.scatteredParticles[i];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.vx *= 0.95;
                sp.vy *= 0.95;
                sp.alpha -= sp.decay;

                if (sp.alpha <= 0) {
                    this.scatteredParticles.splice(i, 1);
                }
            }

            // 3. Actualizar anillos de onda sísmica
            for (let i = this.shockwaveRings.length - 1; i >= 0; i--) {
                const ring = this.shockwaveRings[i];
                ring.radius += ring.speed;
                ring.opacity = Math.max(0, 0.9 * (1 - ring.radius / ring.maxRadius));

                if (ring.radius >= ring.maxRadius || ring.opacity <= 0.01) {
                    this.shockwaveRings.splice(i, 1);
                }
            }

            // Sincronizar telemetría cada frame de manera ligera
            this.syncTelemetryState();
        }

        /**
         * Obtiene la posición de un punto a lo largo del enlace con modulación sísmica
         */
        getPointOnLink(link, t, seismicIntensity = 0) {
            const p1 = link.reverse ? link.target : link.source;
            const p2 = link.reverse ? link.source : link.target;

            const straightX = p1.x + (p2.x - p1.x) * t;
            const straightY = p1.y + (p2.y - p1.y) * t;

            if (seismicIntensity <= 0.01) {
                return { x: straightX, y: straightY };
            }

            // Vector perpendicular para modulación transversal sísmica
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;

            // Onda sísmica: superposición armónica con jitter
            const envelope = Math.sin(t * Math.PI); // Amortiguada en los extremos
            const wave1 = Math.sin(this.globalTime * 24 + t * 18);
            const wave2 = Math.cos(this.globalTime * 14 + t * 32) * 0.5;
            const jitter = (Math.random() - 0.5) * 4;

            const displacement = (wave1 + wave2) * 8 * seismicIntensity * envelope + jitter * seismicIntensity;

            return {
                x: straightX + nx * displacement,
                y: straightY + ny * displacement
            };
        }

        /**
         * Bucle Principal de Renderizado a 60 FPS
         */
        renderLoop(timestamp) {
            const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
            this.lastFrameTime = timestamp;

            // Medición de FPS
            this.frameCount++;
            if (this.frameCount % 30 === 0) {
                this.fps = Math.round(1 / (dt || 0.016));
                const fpsLabel = document.getElementById('hudEngineFps');
                if (fpsLabel) {
                    fpsLabel.textContent = `RENDER: ${this.fps} FPS · DPR ${this.dpr.toFixed(1)}`;
                }
                const packetLabel = document.getElementById('hudPacketCount');
                if (packetLabel) {
                    const activeCount = this.showParticles ? this.particles.length + this.scatteredParticles.length : 0;
                    packetLabel.textContent = `PAQUETES ACTIVOS: ${activeCount}`;
                }
            }

            // 1. Actualizar física
            this.updatePhysics(dt);

            // 2. Limpieza de pantalla con fondo Deep Slate
            this.renderBackground();

            // 3. Dibujar enlaces y ondas sísmicas
            this.renderLinks();

            // 4. Dibujar partículas de tráfico ISO 20022
            if (this.showParticles) {
                this.renderParticles();
            }

            // 5. Dibujar partículas dispersas
            this.renderScatteredSparks();

            // 6. Dibujar anillos sísmicos
            this.renderShockwaves();

            // 7. Dibujar nodos y badges institucionales
            this.renderNodes();

            // Continuar bucle
            this.animationFrameId = requestAnimationFrame(this.renderLoop);
        }

        /**
         * Fondo técnico de alta resolución: rejilla sutil y retículas
         */
        renderBackground() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;

            // Fondo base
            ctx.fillStyle = THEME.bgBase;
            ctx.fillRect(0, 0, w, h);

            // Rejilla nanométrica de alta tecnología (espaciado 40px)
            const gridSize = 40;
            ctx.lineWidth = 1;
            ctx.strokeStyle = THEME.gridLine;

            ctx.beginPath();
            for (let x = 0; x <= w; x += gridSize) {
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, h);
            }
            for (let y = 0; y <= h; y += gridSize) {
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(w, y + 0.5);
            }
            ctx.stroke();

            // Cruces de retícula en intersecciones (cada 120px)
            ctx.strokeStyle = THEME.gridCross;
            ctx.beginPath();
            for (let x = gridSize; x < w; x += gridSize * 3) {
                for (let y = gridSize; y < h; y += gridSize * 3) {
                    const s = 3;
                    ctx.moveTo(x - s, y);
                    ctx.lineTo(x + s, y);
                    ctx.moveTo(x, y - s);
                    ctx.lineTo(x, y + s);
                }
            }
            ctx.stroke();

            // Círculos concéntricos de telemetría alrededor del CCE Switch Central
            const central = this.nodes.find(n => n.isCentral);
            if (central) {
                const cx = central.x;
                const cy = central.y;

                ctx.save();
                ctx.setLineDash([2, 4]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(226, 179, 87, 0.12)';

                [80, 150, 230].forEach(r => {
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                });

                // Línea de barrido de radar tenue
                ctx.setLineDash([]);
                ctx.strokeStyle = 'rgba(226, 179, 87, 0.08)';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(this.radarAngle) * 230, cy + Math.sin(this.radarAngle) * 230);
                ctx.stroke();
                ctx.restore();
            }
        }

        /**
         * Renderiza las líneas de conexión entre nodos (Nominales o con Onda Sísmica Carmesí)
         */
        renderLinks() {
            const ctx = this.ctx;

            for (const link of this.links) {
                const isDegraded = link.isDegraded;
                const intensity = link.seismicIntensity;
                const steps = 60;

                ctx.save();

                if (isDegraded && intensity > 0.05) {
                    // ==========================================================
                    // ENLACE EN CONTINGENCIA SÍSMICA (#EF4444)
                    // ==========================================================
                    // Brillo sísmico exterior
                    ctx.shadowColor = THEME.crimson;
                    ctx.shadowBlur = 12 * intensity;
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(this.globalTime * 12) * 0.25})`;

                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        const pt = this.getPointOnLink(link, t, intensity);
                        if (i === 0) ctx.moveTo(pt.x, pt.y);
                        else ctx.lineTo(pt.x, pt.y);
                    }
                    ctx.stroke();

                    // Núcleo brillante de la descarga
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#FCA5A5';
                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        const pt = this.getPointOnLink(link, t, intensity);
                        if (i === 0) ctx.moveTo(pt.x, pt.y);
                        else ctx.lineTo(pt.x, pt.y);
                    }
                    ctx.stroke();

                    // Etiqueta flotante de contingencia en el punto medio del enlace
                    const midPt = this.getPointOnLink(link, 0.5, intensity);
                    this.renderLinkWarningBadge(ctx, midPt.x, midPt.y, 'CONTINGENCIA · ENLACE ALTERNO');

                } else {
                    // ==========================================================
                    // ENLACE NOMINAL (SLATE / NAVY / CYAN)
                    // ==========================================================
                    const isHovered = (this.hoveredLink === link);

                    // Gradiente del enlace
                    const grad = ctx.createLinearGradient(link.source.x, link.source.y, link.target.x, link.target.y);
                    grad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
                    grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.45)');
                    grad.addColorStop(1, 'rgba(226, 179, 87, 0.35)');

                    ctx.lineWidth = isHovered ? 2.5 : 1.5;
                    ctx.strokeStyle = isHovered ? THEME.sky : grad;
                    if (isHovered) {
                        ctx.shadowColor = THEME.sky;
                        ctx.shadowBlur = 8;
                    }

                    ctx.beginPath();
                    ctx.moveTo(link.source.x, link.source.y);
                    ctx.lineTo(link.target.x, link.target.y);
                    ctx.stroke();

                    // Micro-guiones direccionales hacia CCE
                    ctx.save();
                    ctx.setLineDash([3, 12]);
                    ctx.lineDashOffset = -this.globalTime * 28;
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
                    ctx.beginPath();
                    ctx.moveTo(link.source.x, link.source.y);
                    ctx.lineTo(link.target.x, link.target.y);
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.restore();
            }
        }

        /**
         * Insignia técnica flotante sobre un canal en falla
         */
        renderLinkWarningBadge(ctx, x, y, text) {
            ctx.save();
            ctx.font = "600 9px 'JetBrains Mono', monospace";
            const textWidth = ctx.measureText(text).width;
            const padX = 7;
            const padY = 3;
            const bw = textWidth + padX * 2;
            const bh = 16;

            ctx.fillStyle = '#0B0F17';
            ctx.strokeStyle = THEME.crimson;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 3);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#EF4444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, y);
            ctx.restore();
        }

        /**
         * Renderiza el flujo continuo de paquetes ISO 20022 con estela lumínica
         */
        renderParticles() {
            const ctx = this.ctx;

            for (const p of this.particles) {
                const link = p.link;
                const pos = this.getPointOnLink(link, p.progress, link.seismicIntensity);
                const color = link.isDegraded ? THEME.crimson : p.type.color;
                const size = p.type.size;

                ctx.save();

                // Estela lumínica
                if (p.trail && p.trail.length > 1) {
                    for (let i = 0; i < p.trail.length; i++) {
                        const tr = p.trail[i];
                        const alpha = (1 - (i / p.trail.length)) * 0.45;
                        ctx.fillStyle = color;
                        ctx.globalAlpha = alpha;
                        ctx.beginPath();
                        ctx.arc(tr.x, tr.y, size * (1 - i * 0.14), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Cabeza del paquete
                ctx.globalAlpha = 1.0;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, size * 0.7, 0, Math.PI * 2);
                ctx.fill();

                // Anillo exterior de color
                ctx.shadowBlur = 0;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        /**
         * Renderiza partículas dispersas provocadas por la ruptura sísmica
         */
        renderScatteredSparks() {
            if (this.scatteredParticles.length === 0) return;
            const ctx = this.ctx;

            ctx.save();
            for (const sp of this.scatteredParticles) {
                ctx.globalAlpha = sp.alpha;
                ctx.fillStyle = sp.color;
                ctx.shadowColor = sp.color;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        /**
         * Renderiza las ondas de choque concéntricas (Shockwaves)
         */
        renderShockwaves() {
            if (this.shockwaveRings.length === 0) return;
            const ctx = this.ctx;

            ctx.save();
            for (const ring of this.shockwaveRings) {
                ctx.globalAlpha = ring.opacity;
                ctx.strokeStyle = ring.color;
                ctx.lineWidth = 1.5;
                ctx.shadowColor = ring.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        /**
         * Renderiza los 5 nodos con badges institucionales y estilos ejecutivos
         */
        renderNodes() {
            const ctx = this.ctx;

            for (const node of this.nodes) {
                const isHovered = (this.hoveredNode === node);
                const isCentral = node.isCentral;
                const isCaido = (node.telemetria.estado === 'CAIDO');
                const x = node.x;
                const y = node.y;
                const r = node.radius;

                ctx.save();

                // ==========================================================
                // HALO TÁCTICO EXTERNO (Pulsante o Hover)
                // ==========================================================
                if (isCaido) {
                    // Pulso carmesí agresivo de contingencia
                    const pulse = 1 + Math.sin(this.globalTime * 8) * 0.12;
                    ctx.strokeStyle = THEME.crimson;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = THEME.crimson;
                    ctx.shadowBlur = 16;
                    ctx.beginPath();
                    ctx.arc(x, y, (r + 8) * pulse, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (isCentral) {
                    // Halo dorado institucional del Switch CCE
                    const pulse = 1 + Math.sin(this.globalTime * 3) * 0.05;
                    ctx.strokeStyle = THEME.gold;
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = THEME.gold;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(x, y, (r + 6) * pulse, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (isHovered) {
                    // Halo táctico al apuntar con mouse
                    ctx.strokeStyle = THEME.sky;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = THEME.sky;
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(x, y, r + 7, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.shadowBlur = 0; // Reset sombra

                // ==========================================================
                // CUERPO DEL NODO (Disco Principal)
                // ==========================================================
                // Relleno degradado metálico corporativo
                const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 4, x, y, r);
                if (isCaido) {
                    grad.addColorStop(0, '#7F1D1D');
                    grad.addColorStop(1, '#1E0B0B');
                } else if (isCentral) {
                    grad.addColorStop(0, '#1E3A8A');
                    grad.addColorStop(0.7, '#0F172A');
                    grad.addColorStop(1, '#0B0F17');
                } else {
                    grad.addColorStop(0, '#1E293B');
                    grad.addColorStop(0.8, '#0F172A');
                    grad.addColorStop(1, '#0B0F17');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();

                // Borde perimétrico de precisión
                ctx.lineWidth = isCentral ? 2.5 : 1.8;
                if (isCaido) {
                    ctx.strokeStyle = THEME.crimson;
                } else if (isCentral) {
                    ctx.strokeStyle = THEME.gold;
                } else {
                    ctx.strokeStyle = isHovered ? THEME.sky : THEME.borderStrong;
                }
                ctx.stroke();

                // Anillo concéntrico interno decorativo
                ctx.lineWidth = 1;
                ctx.strokeStyle = isCaido ? 'rgba(239, 68, 68, 0.4)' : (isCentral ? 'rgba(226, 179, 87, 0.4)' : 'rgba(255, 255, 255, 0.08)');
                ctx.beginPath();
                ctx.arc(x, y, r - 5, 0, Math.PI * 2);
                ctx.stroke();

                // ==========================================================
                // ICONOGRAFÍA VECTORIAL DENTRO DEL NODO (CERO EMOJIS)
                // ==========================================================
                this.renderNodeVectorEmblem(ctx, node, x, y, isCaido, isCentral);

                // ==========================================================
                // TARJETA DE NOMBRE Y BADGE INSTITUCIONAL INFERIOR
                // ==========================================================
                this.renderNodeLabelBadge(ctx, node, x, y + r + 14, isCaido, isCentral);

                ctx.restore();
            }
        }

        /**
         * Emblema vectorial institucional dentro del círculo
         */
        renderNodeVectorEmblem(ctx, node, x, y, isCaido, isCentral) {
            ctx.save();
            ctx.fillStyle = isCaido ? THEME.crimson : (isCentral ? THEME.gold : THEME.textPrimary);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1.4;

            if (isCentral) {
                // Emblema Central: Core Switch Hub (Rombo y Router)
                const s = 11;
                ctx.beginPath();
                ctx.moveTo(x, y - s);
                ctx.lineTo(x + s, y);
                ctx.lineTo(x, y + s);
                ctx.lineTo(x - s, y);
                ctx.closePath();
                ctx.stroke();

                // Núcleo concéntrico
                ctx.beginPath();
                ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (node.key === 'bcp') {
                // Emblema BCP: Siglas BCP nítidas en JetBrains Mono
                ctx.font = "800 11px 'JetBrains Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('BCP', x, y);
            } else if (node.key === 'interbank') {
                // Emblema Interbank / Plin: Siglas IBK
                ctx.font = "800 11px 'JetBrains Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('IBK', x, y);
            } else if (node.key === 'cusco') {
                // Emblema Caja Cusco: C-CSK
                ctx.font = "800 10px 'JetBrains Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('CSK', x, y);
            } else if (node.key === 'andes') {
                // Emblema Caja de los Andes: AND
                ctx.font = "800 10px 'JetBrains Mono', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('AND', x, y);
            }

            // Semáforo LED miniatura en la esquina superior derecha del nodo
            const dotR = 3.5;
            const dotX = x + node.radius * 0.707;
            const dotY = y - node.radius * 0.707;

            ctx.fillStyle = isCaido ? THEME.crimson : THEME.emerald;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();
        }

        /**
         * Renderiza la tarjeta inferior con nombre institucional y badge técnico
         */
        renderNodeLabelBadge(ctx, node, x, y, isCaido, isCentral) {
            ctx.save();
            ctx.textAlign = 'center';

            // 1. Nombre de la Entidad
            ctx.font = isCentral ? "700 11.5px 'Plus Jakarta Sans', sans-serif" : "600 10.5px 'Plus Jakarta Sans', sans-serif";
            ctx.fillStyle = isCaido ? '#FCA5A5' : THEME.textPrimary;
            ctx.fillText(node.nombre, x, y);

            // 2. Badge Técnico Institucional (ej: BILLETERA MOVIL · COD 002)
            const badgeY = y + 13;
            ctx.font = "600 8px 'JetBrains Mono', monospace";
            const badgeText = isCaido ? 'CONTINGENCIA · TIMEOUT' : node.badge;
            const textWidth = ctx.measureText(badgeText).width;
            const bw = textWidth + 12;
            const bh = 14;

            // Fondo del badge
            ctx.fillStyle = isCaido ? THEME.crimsonSubtle : (isCentral ? THEME.goldSubtle : 'rgba(15, 23, 42, 0.85)');
            ctx.strokeStyle = isCaido ? 'rgba(239, 68, 68, 0.4)' : (isCentral ? 'rgba(226, 179, 87, 0.35)' : THEME.borderDim);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - bw / 2, badgeY - bh / 2, bw, bh, 3);
            ctx.fill();
            ctx.stroke();

            // Texto del badge
            ctx.fillStyle = isCaido ? THEME.crimson : (isCentral ? THEME.gold : THEME.textSecondary);
            ctx.textBaseline = 'middle';
            ctx.fillText(badgeText, x, badgeY);

            ctx.restore();
        }

        /**
         * Limpieza y destrucción del motor si fuese necesario
         */
        destroy() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.networkTopologyInstance = new NetworkTopologyCanvas();
        });
    } else {
        window.networkTopologyInstance = new NetworkTopologyCanvas();
    }

})();
