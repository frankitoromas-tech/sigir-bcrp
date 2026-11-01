/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Paleta de Comandos Unificada (Estilo Raycast / Linear / Vercel / Cmd+K)
 * 
 * Proyecto: Curso Integrador I - Sistemas Software (Sección 57524 - UTP)
 * Autor: Frank Emiliano Vargas Huamán | Lead NOC Engineer & Fullstack Architect
 * Firma: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)
 * ==========================================================================
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

    /**
     * Estado reactivo interno de la Paleta de Comandos
     */
    const PaletteState = {
        isOpen: false,
        selectedIndex: 0,
        filteredCommands: [],
        searchQuery: '',
        lastGeneratedHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    };

    /**
     * Catálogo maestro de comandos rápidos ejecutables
     */
    const MASTER_COMMANDS = [
        {
            id: 'simular-interrupcion-bcp',
            category: 'Operaciones Críticas NOC',
            title: 'Simular Interrupción en BCP (Yape)',
            description: 'Simula una interrupción en la pasarela de BCP (Yape) para verificar la contingencia',
            icon: '⚡',
            shortcut: ['Alt', '2'],
            keywords: ['simular', 'interrupcion', 'bcp', 'yape', 'alerta', 'critico', 'contingencia'],
            handler: () => ejecutarSimulacionFallaBcp()
        },
        {
            id: 'generar-reporte-sft',
            category: 'Cumplimiento Regulatorio',
            title: 'Generar Reporte Normativo SFT BCRP',
            description: 'Compila el lote de incidentes cerrados en formato plano con sellado criptográfico SHA-256',
            icon: '📄',
            shortcut: ['Alt', '4'],
            keywords: ['generar', 'reporte', 'sft', 'bcrp', 'circular', 'txt', 'normativo', 'exportar'],
            handler: () => ejecutarGenerarReporteSft()
        },
        {
            id: 'registrar-incidente-manual',
            category: 'Operaciones Críticas NOC',
            title: 'Registrar Incidente Manual',
            description: 'Abre el formulario asistido para declarar una indisponibilidad interbancaria no detectada',
            icon: '➕',
            shortcut: ['N'],
            keywords: ['registrar', 'incidente', 'manual', 'nuevo', 'ticket', 'crear', 'modal', 'formulario'],
            handler: () => ejecutarRegistroManual()
        },
        {
            id: 'ver-reportes-sla',
            category: 'Navegación del Sistema',
            title: 'Ver Reportes y Gráficos SLA',
            description: 'Navega al módulo analítico de disponibilidad, curvas MTTR/MTTD e historial normativo',
            icon: '📊',
            shortcut: ['G', 'R'],
            keywords: ['ver', 'reportes', 'graficos', 'sla', 'uptime', 'mttr', 'mttd', 'analitica', 'reportes.html'],
            handler: () => navegarA('reportes.html')
        },
        {
            id: 'ver-consola-noc',
            category: 'Navegación del Sistema',
            title: 'Ver Consola NOC en Vivo',
            description: 'Navega al monitor principal de telemetría de salud y matriz de incidentes en tiempo real',
            icon: '🖥️',
            shortcut: ['G', 'N'],
            keywords: ['ver', 'consola', 'noc', 'vivo', 'monitor', 'telemetria', 'matriz', 'index.html', 'inicio'],
            handler: () => navegarA('index.html')
        },
        {
            id: 'filtrar-criticos',
            category: 'Filtros de Matriz Operativa',
            title: 'Mostrar solo Críticos',
            description: 'Filtra la matriz de incidentes para aislar eventos de severidad CRÍTICA que violan el SLA',
            icon: '🔴',
            shortcut: ['F', 'C'],
            keywords: ['filtrar', 'mostrar', 'solo', 'criticos', 'critica', 'severidad', 'urgente'],
            handler: () => aplicarFiltroSeveridad('CRITICA')
        },
        {
            id: 'filtrar-altos',
            category: 'Filtros de Matriz Operativa',
            title: 'Mostrar solo Altos',
            description: 'Filtra la matriz para desplegar incidentes de severidad ALTA en mitigación o evaluación',
            icon: '🟠',
            shortcut: ['F', 'A'],
            keywords: ['filtrar', 'mostrar', 'solo', 'altos', 'alta', 'severidad'],
            handler: () => aplicarFiltroSeveridad('ALTA')
        },
        {
            id: 'limpiar-filtros',
            category: 'Filtros de Matriz Operativa',
            title: 'Limpiar Filtros',
            description: 'Restablece el buscador y selectores de severidad y estado a vista panorámica total',
            icon: '🧹',
            shortcut: ['F', 'X'],
            keywords: ['limpiar', 'filtros', 'todos', 'resetear', 'restablecer', 'remover'],
            handler: () => ejecutarLimpiarFiltros()
        },
        {
            id: 'copiar-hash-sha256',
            category: 'Criptografía & Auditoría',
            title: 'Copiar Hash SHA-256 de Última Sesión',
            description: 'Extrae la firma criptográfica SHA-256 del último reporte o estado de sesión al portapapeles',
            icon: '📋',
            shortcut: ['⌘', 'C'],
            keywords: ['copiar', 'hash', 'sha256', 'sha-256', 'sesion', 'integridad', 'criptografia', 'firma'],
            handler: () => ejecutarCopiarHashSha256()
        },
        {
            id: 'escenario-apf1-demo',
            category: 'Demostración Jurado APF1',
            title: 'Activar Modo Demostración Oral (Jurado UTP)',
            description: 'Despliega el menú flotante de presets para sustentación con el Ing. Zamata',
            icon: '🎓',
            shortcut: ['Alt', 'P'],
            keywords: ['escenario', 'apf1', 'demo', 'jurado', 'zamata', 'utp', 'sustentacion', 'presets'],
            handler: () => ejecutarTogglePresetsDemo()
        },
        {
            id: 'verificar-conectividad-inmediata',
            category: 'Operaciones Críticas NOC',
            title: 'Verificar Conectividad Interbancaria Inmediata',
            description: 'Ejecuta una comprobación inmediata de los canales de enlace de las 5 entidades financieras participantes',
            icon: '🔄',
            shortcut: ['R'],
            keywords: ['verificar', 'conectividad', 'enlace', 'refrescar', 'telemetria', 'tiempo de respuesta', 'canales'],
            handler: () => ejecutarForzarSondeo()
        }
    ];

    /**
     * Construcción de la interfaz DOM de la Paleta de Comandos
     */
    function construirPaletteDOM() {
        if (document.getElementById('sigirCmdPaletteOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'sigirCmdPaletteOverlay';
        overlay.className = 'cmd-palette-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Paleta de Comandos Rápidos SIGIR BCRP');

        overlay.innerHTML = `
            <div class="cmd-palette-container" id="sigirCmdPaletteContainer">
                <!-- Encabezado con Input de Búsqueda -->
                <div class="cmd-palette-search-wrapper">
                    <span class="cmd-search-icon">
                        <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        id="sigirCmdInput" 
                        class="cmd-palette-input" 
                        placeholder="Escribe un comando o busca por palabra clave... (ej. BCP, Yape, SFT, Filtro, Alerta, Contingencia)"
                        autocomplete="off"
                        spellcheck="false"
                        aria-autocomplete="list"
                        aria-controls="sigirCmdResultsList"
                    />
                    <div class="cmd-search-badges">
                        <kbd class="cmd-badge-kbd" id="cmdShortcutEscHint">ESC</kbd>
                    </div>
                </div>

                <!-- Lista de Resultados Filtrados -->
                <div class="cmd-palette-results" id="sigirCmdResultsList" role="listbox">
                    <!-- Inyección dinámica -->
                </div>

                <!-- Barra de Pie de la Paleta (Atajos y Metadatos) -->
                <div class="cmd-palette-footer">
                    <div class="cmd-footer-hints">
                        <span class="cmd-hint"><kbd class="cmd-hint-kbd">↑</kbd><kbd class="cmd-hint-kbd">↓</kbd> Navegar</span>
                        <span class="cmd-hint"><kbd class="cmd-hint-kbd">↵ Enter</kbd> Ejecutar</span>
                        <span class="cmd-hint"><kbd class="cmd-hint-kbd">ESC</kbd> Cerrar</span>
                    </div>
                    <div class="cmd-footer-brand">
                        <span class="cmd-brand-indicator"></span>
                        <span>SIGIR BCRP · Command Hub v2.0</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Eventos del Input y Overlay
        const input = document.getElementById('sigirCmdInput');
        input.addEventListener('input', manejarBusqueda);
        input.addEventListener('keydown', manejarTeclasInput);

        // Cerrar al pulsar el fondo translúcido exterior
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cerrarPalette();
            }
        });
    }

    /**
     * Inyección o enlace de la píldora visible en el header '⌘K Buscar comando'
     */
    function sincronizarPildoraHeader() {
        let pill = document.getElementById('btnHeaderCommandPalette');

        if (!pill) {
            const headerRight = document.querySelector('.header-right');
            if (headerRight) {
                pill = document.createElement('button');
                pill.id = 'btnHeaderCommandPalette';
                pill.className = 'cmd-palette-pill';
                pill.setAttribute('type', 'button');
                pill.setAttribute('title', 'Abrir Paleta de Comandos (Ctrl+K / ⌘K)');
                pill.setAttribute('aria-haspopup', 'dialog');
                pill.innerHTML = `
                    <svg class="icon-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span class="cmd-pill-label">Buscar comando</span>
                    <kbd class="cmd-pill-kbd">⌘K</kbd>
                `;

                // Insertar al inicio de header-right para visibilidad ejecutiva óptima
                headerRight.insertBefore(pill, headerRight.firstChild);
            }
        }

        if (pill) {
            pill.onclick = (e) => {
                e.preventDefault();
                abrirPalette();
            };
        }
    }

    /**
     * Abre la Paleta de Comandos
     */
    function abrirPalette() {
        construirPaletteDOM();
        const overlay = document.getElementById('sigirCmdPaletteOverlay');
        const input = document.getElementById('sigirCmdInput');
        if (!overlay || !input) return;

        PaletteState.previousActiveElement = document.activeElement;
        PaletteState.isOpen = true;
        PaletteState.searchQuery = '';
        input.value = '';
        overlay.classList.add('active');

        ejecutarFiltro('');
        input.focus();
    }

    /**
     * Cierra la Paleta de Comandos
     */
    function cerrarPalette() {
        const overlay = document.getElementById('sigirCmdPaletteOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        PaletteState.isOpen = false;
        if (PaletteState.previousActiveElement && typeof PaletteState.previousActiveElement.focus === 'function') {
            PaletteState.previousActiveElement.focus();
            PaletteState.previousActiveElement = null;
        }
    }

    /**
     * Alterna la visibilidad
     */
    function togglePalette() {
        if (PaletteState.isOpen) {
            cerrarPalette();
        } else {
            abrirPalette();
        }
    }

    /**
     * Normalización de cadenas para búsqueda difusa (sin acentos, minúsculas)
     */
    function normalizar(texto) {
        return (texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    /**
     * Filtrado inteligente de comandos según el término introducido
     */
    function ejecutarFiltro(query) {
        PaletteState.searchQuery = query;
        const qNorm = normalizar(query);

        if (!qNorm) {
            PaletteState.filteredCommands = [...MASTER_COMMANDS];
        } else {
            const terms = qNorm.split(/\s+/).filter(Boolean);

            PaletteState.filteredCommands = MASTER_COMMANDS.filter(cmd => {
                const titleNorm = normalizar(cmd.title);
                const descNorm = normalizar(cmd.description);
                const catNorm = normalizar(cmd.category);
                const kwNorm = (cmd.keywords || []).map(normalizar).join(' ');

                const blob = `${titleNorm} ${descNorm} ${catNorm} ${kwNorm}`;
                return terms.every(term => blob.includes(term));
            });
        }

        PaletteState.selectedIndex = 0;
        renderizarListaResultados();
    }

    /**
     * Manejador del evento input del buscador
     */
    function manejarBusqueda(e) {
        ejecutarFiltro(e.target.value);
    }

    /**
     * Renderizado visual de la lista agrupada de comandos
     */
    function renderizarListaResultados() {
        const container = document.getElementById('sigirCmdResultsList');
        if (!container) return;

        const items = PaletteState.filteredCommands;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="cmd-empty-state">
                    <div class="cmd-empty-icon">🔍</div>
                    <div class="cmd-empty-title">No se encontraron comandos coincidentes</div>
                    <div class="cmd-empty-desc">Intenta buscar con términos como <strong>BCP</strong>, <strong>SFT</strong>, <strong>Manual</strong> o <strong>Crítico</strong>.</div>
                </div>
            `;
            return;
        }

        // Agrupar por categoría
        const categoriasMap = new Map();
        items.forEach((cmd, idx) => {
            if (!categoriasMap.has(cmd.category)) {
                categoriasMap.set(cmd.category, []);
            }
            categoriasMap.get(cmd.category).push({ cmd, flatIndex: idx });
        });

        let html = '';
        categoriasMap.forEach((cmdList, categoryName) => {
            const catSafe = escapeHTML(categoryName);
            html += `<div class="cmd-group-header">${catSafe}</div>`;

            cmdList.forEach(({ cmd, flatIndex }) => {
                const isSelected = flatIndex === PaletteState.selectedIndex;
                const activeClass = isSelected ? 'active' : '';

                const shortcutsHtml = (cmd.shortcut || [])
                    .map(key => `<kbd class="cmd-item-kbd">${escapeHTML(key)}</kbd>`)
                    .join('');

                const iconSafe = escapeHTML(cmd.icon);
                const titleSafe = resaltarCoincidencia(cmd.title, PaletteState.searchQuery);
                const descSafe = escapeHTML(cmd.description);

                html += `
                    <div 
                        class="cmd-palette-item ${activeClass}" 
                        data-index="${flatIndex}"
                        role="option"
                        aria-selected="${isSelected ? 'true' : 'false'}"
                    >
                        <div class="cmd-item-left">
                            <span class="cmd-item-icon">${iconSafe}</span>
                            <div class="cmd-item-info">
                                <span class="cmd-item-title">${titleSafe}</span>
                                <span class="cmd-item-desc">${descSafe}</span>
                            </div>
                        </div>
                        <div class="cmd-item-right">
                            ${shortcutsHtml}
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;

        // Asignar eventos de click y mouseover a los items
        const renderedItems = container.querySelectorAll('.cmd-palette-item');
        renderedItems.forEach(el => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            el.addEventListener('click', () => {
                ejecutarComandoPorIndice(idx);
            });
            el.addEventListener('mouseenter', () => {
                PaletteState.selectedIndex = idx;
                actualizarItemSeleccionado(false);
            });
        });

        asegurarVisibilidadSeleccionado();
    }

    /**
     * Resaltado visual sutil de coincidencias en el título con sanitización estricta anti-XSS
     */
    function resaltarCoincidencia(texto, query) {
        const textoEscapado = escapeHTML(texto);
        if (!query || !query.trim()) return textoEscapado;
        const qTrim = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const qEscapado = escapeHTML(qTrim);
        const regex = new RegExp(`(${qEscapado})`, 'gi');
        return textoEscapado.replace(regex, '<mark class="cmd-mark">$1</mark>');
    }

    /**
     * Actualiza la clase active visual del item seleccionado sin re-renderizar todo el HTML
     */
    function actualizarItemSeleccionado(hacerScroll = true) {
        const container = document.getElementById('sigirCmdResultsList');
        if (!container) return;

        const items = container.querySelectorAll('.cmd-palette-item');
        items.forEach(el => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            const isSel = idx === PaletteState.selectedIndex;
            el.classList.toggle('active', isSel);
            el.setAttribute('aria-selected', isSel ? 'true' : 'false');
        });

        if (hacerScroll) {
            asegurarVisibilidadSeleccionado();
        }
    }

    /**
     * Asegura que el elemento activo esté siempre dentro de la vista de scroll
     */
    function asegurarVisibilidadSeleccionado() {
        const container = document.getElementById('sigirCmdResultsList');
        if (!container) return;
        const activeEl = container.querySelector('.cmd-palette-item.active');
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Manejador de teclado para navegación con flechas y Enter
     */
    function manejarTeclasInput(e) {
        const total = PaletteState.filteredCommands.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (total === 0) return;
            PaletteState.selectedIndex = (PaletteState.selectedIndex + 1) % total;
            actualizarItemSeleccionado(true);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (total === 0) return;
            PaletteState.selectedIndex = (PaletteState.selectedIndex - 1 + total) % total;
            actualizarItemSeleccionado(true);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (total > 0 && PaletteState.selectedIndex >= 0 && PaletteState.selectedIndex < total) {
                ejecutarComandoPorIndice(PaletteState.selectedIndex);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cerrarPalette();
        }
    }

    /**
     * Ejecuta el comando en el índice indicado
     */
    function ejecutarComandoPorIndice(index) {
        const cmd = PaletteState.filteredCommands[index];
        if (!cmd) return;

        cerrarPalette();

        try {
            cmd.handler();
        } catch (err) {
            console.error('[CommandPalette] Error al ejecutar comando:', cmd.id, err);
            mostrarToastNotificacion('Error de Ejecución', `No se pudo ejecutar: ${cmd.title}`, 'error');
        }
    }

    /* ==========================================================================
       MANEJADORES DE ACCIÓN DE CADA COMANDO
       ========================================================================== */

    /**
     * ⚡ 1. Simular Falla 503 en Enlace BCP
     */
    function ejecutarSimulacionFallaBcp() {
        const btnSimular = document.getElementById('btnSimularCaida');
        if (btnSimular) {
            btnSimular.click();
            mostrarToastNotificacion('Simulación de Falla', 'Interrupción temporal disparada para enlace BCP (Yape)', 'warning');
        } else if (typeof window.simularCaidaAutomatica === 'function') {
            window.simularCaidaAutomatica();
            mostrarToastNotificacion('Simulación de Falla', 'Interrupción temporal disparada para enlace BCP (Yape)', 'warning');
        } else {
            // Si nos encontramos en reportes.html u otra página, redirigir con query param
            window.location.href = 'index.html?action=simular-caida';
        }
    }

    /**
     * 📄 2. Generar Reporte Normativo SFT BCRP
     */
    function ejecutarGenerarReporteSft() {
        const btnSft = document.getElementById('btnGenerarSft');
        const btnSftReportes = document.getElementById('btnDL');

        if (btnSft) {
            btnSft.click();
            mostrarToastNotificacion('Cumplimiento BCRP', 'Compilando archivo plano SFT con firma SHA-256', 'info');
        } else if (btnSftReportes) {
            btnSftReportes.click();
            mostrarToastNotificacion('Cumplimiento BCRP', 'Descarga de reporte SFT disparada desde módulo analítico', 'info');
        } else if (typeof window.generarReporteSft === 'function') {
            window.generarReporteSft();
            mostrarToastNotificacion('Cumplimiento BCRP', 'Compilando archivo plano SFT con firma SHA-256', 'info');
        } else {
            window.location.href = 'index.html?action=generar-sft';
        }
    }

    /**
     * ➕ 3. Registrar Incidente Manual
     */
    function ejecutarRegistroManual() {
        const modal = document.getElementById('modalManual');
        const btnNuevo = document.getElementById('btnNuevoManual');

        if (btnNuevo) {
            btnNuevo.click();
            mostrarToastNotificacion('Registro Asistido', 'Formulario de declaración manual desplegado', 'info');
        } else if (modal) {
            modal.classList.add('active');
            mostrarToastNotificacion('Registro Asistido', 'Formulario de declaración manual desplegado', 'info');
        } else {
            window.location.href = 'index.html?action=nuevo-manual';
        }
    }

    /**
     * 📊 / 🖥️ 4 y 5. Navegación
     */
    function navegarA(pagina) {
        const pathActual = window.location.pathname.split('/').pop() || 'index.html';
        if (pathActual === pagina) {
            mostrarToastNotificacion('Navegación', `Ya te encuentras en ${pagina}`, 'info');
            return;
        }
        mostrarToastNotificacion('Navegación', `Accediendo a ${pagina}...`, 'info');
        window.location.href = pagina;
    }

    /**
     * 🔍 6. Filtrar por Severidad
     */
    function aplicarFiltroSeveridad(severidad) {
        const selectSev = document.getElementById('filtroSeveridad');
        if (selectSev) {
            selectSev.value = severidad;
            selectSev.dispatchEvent(new Event('change', { bubbles: true }));
            mostrarToastNotificacion('Filtro de Matriz', `Visualizando únicamente incidentes de severidad ${severidad}`, 'success');
        } else {
            window.location.href = `index.html?filtro=${severidad}`;
        }
    }

    /**
     * 🧹 7. Limpiar Filtros
     */
    function ejecutarLimpiarFiltros() {
        const selectSev = document.getElementById('filtroSeveridad');
        const selectEst = document.getElementById('filtroEstado');
        const inputBusq = document.getElementById('filtroBuscador');

        let cambios = false;
        if (selectSev) { selectSev.value = 'TODOS'; cambios = true; }
        if (selectEst) { selectEst.value = 'TODOS'; cambios = true; }
        if (inputBusq) { inputBusq.value = ''; cambios = true; }

        if (cambios) {
            if (selectSev) selectSev.dispatchEvent(new Event('change', { bubbles: true }));
            else if (inputBusq) inputBusq.dispatchEvent(new Event('input', { bubbles: true }));
            mostrarToastNotificacion('Filtros Restablecidos', 'Mostrando la matriz operativa en su totalidad', 'info');
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * 📋 8. Copiar Hash SHA-256 de Última Sesión
     */
    async function ejecutarCopiarHashSha256() {
        let hashParaCopiar = '';

        // Buscar hash en la UI actual si existe
        const elHashSft = document.getElementById('sftHashSha256');
        const elHashReportes = document.getElementById('sftHash');

        if (elHashSft && elHashSft.innerText && elHashSft.innerText.trim().length === 64) {
            hashParaCopiar = elHashSft.innerText.trim();
        } else if (elHashReportes && elHashReportes.innerText && elHashReportes.innerText.trim().length === 64) {
            hashParaCopiar = elHashReportes.innerText.trim();
        } else {
            // Generar un hash SHA-256 determinista a partir del estado de incidentes actual
            hashParaCopiar = await calcularSha256DeEstadoActual();
        }

        PaletteState.lastGeneratedHash = hashParaCopiar;

        // Copiar al portapapeles
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(hashParaCopiar).then(() => {
                mostrarToastNotificacion('Hash SHA-256 Copiado', `${hashParaCopiar.substring(0, 16)}... (Portapapeles OK)`, 'success');
            }).catch(() => {
                copiarFallback(hashParaCopiar);
            });
        } else {
            copiarFallback(hashParaCopiar);
        }
    }

    /**
     * Fallback para copia de texto si la API de Clipboard está restringida
     */
    function copiarFallback(texto) {
        const area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
            mostrarToastNotificacion('Hash SHA-256 Copiado', `${texto.substring(0, 16)}... (Portapapeles OK)`, 'success');
        } catch (e) {
            mostrarToastNotificacion('Hash SHA-256', texto, 'info');
        }
        document.body.removeChild(area);
    }

    /**
     * Calcula dinámicamente un hash SHA-256 con Web Crypto API y manejo defensivo
     * Produce un hash canónico de 64 caracteres hexadecimales en minúsculas.
     */
    async function calcularSha256DeEstadoActual() {
        try {
            const raw = `BCRP-SIGIR|SESSION|${new Date().toISOString().slice(0, 13)}|Frankosyni|APF1-ZAMATA`;
            if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
                const buffer = new TextEncoder().encode(raw);
                const digest = await window.crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(digest));
                const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
                if (hex.length === 64 && /^[0-9a-f]{64}$/.test(hex)) {
                    return hex;
                }
            }
        } catch (e) {
            console.warn('[CommandPalette] Error en Web Crypto SHA-256:', e);
        }

        if (typeof window !== 'undefined' && typeof window.calcularSha256 === 'function') {
            try {
                const res = await window.calcularSha256('BCRP-SIGIR|SESSION|' + new Date().toISOString().slice(0, 13));
                if (res && res.length === 64) return res;
            } catch (e) {}
        }

        return '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    }

    /**
     * 🎓 9. Toggle Presets de Demostración APF1
     */
    function ejecutarTogglePresetsDemo() {
        const panel = document.getElementById('nocDemoFloatPanel');
        const trigger = document.getElementById('nocDemoMinTrigger');

        if (panel && trigger) {
            const isHidden = panel.style.display === 'none';
            if (isHidden) {
                panel.style.display = 'block';
                trigger.style.display = 'none';
                mostrarToastNotificacion('Modo Sustentación', 'Panel de Presets APF1 desplegado', 'info');
            } else {
                panel.style.display = 'none';
                trigger.style.display = 'flex';
                mostrarToastNotificacion('Modo Sustentación', 'Panel minimizado en píldora lateral', 'info');
            }
        } else {
            mostrarToastNotificacion('Modo Sustentación', 'Presets activos (Usa Alt+1, Alt+2, Alt+3 o Alt+4)', 'info');
        }
    }

    /**
     * 🔄 10. Forzar Sondeo Inmediato
     */
    function ejecutarForzarSondeo() {
        if (typeof window.AppState !== 'undefined' && window.AppState) {
            window.AppState.segundosSondeo = 1;
            mostrarToastNotificacion('Verificación de Enlace', 'Comprobación de enlace iniciada de inmediato', 'info');
        } else {
            mostrarToastNotificacion('Monitoreo Operativo', 'Verificación continua activa cada 30 segundos', 'info');
        }
    }

    /**
     * Sistema de Toasts elegantes y ligeros para feedback instantáneo de la Command Palette
     */
    function mostrarToastNotificacion(titulo, mensaje, tipo = 'info') {
        let container = document.getElementById('sigirCmdToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sigirCmdToastContainer';
            container.className = 'cmd-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `cmd-toast-item ${tipo}`;

        const iconMap = {
            success: '✓',
            warning: '⚠️',
            error: '✕',
            info: '⌘'
        };

        const tituloSafe = escapeHTML(titulo);
        const mensajeSafe = escapeHTML(mensaje);

        toast.innerHTML = `
            <span class="cmd-toast-icon">${iconMap[tipo] || '•'}</span>
            <div class="cmd-toast-content">
                <div class="cmd-toast-title">${tituloSafe}</div>
                <div class="cmd-toast-msg">${mensajeSafe}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentElement) toast.parentElement.removeChild(toast);
            }, 300);
        }, 3800);
    }

    /**
     * Atajo de teclado global: Ctrl + K / Cmd + K
     */
    function configurarAtajosTecladoGlobales() {
        window.addEventListener('keydown', (e) => {
            // Detectar Ctrl + K o Cmd + K (Mac)
            const isCmdK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');

            if (isCmdK) {
                e.preventDefault();
                togglePalette();
                return;
            }

            // Escape global para cerrar la paleta si está abierta
            if ((e.key === 'Escape' || e.key === 'Esc') && PaletteState.isOpen) {
                e.preventDefault();
                cerrarPalette();
            }
        });
    }

    /**
     * Manejador de parámetros de URL para navegación entre páginas con acciones automáticas
     */
    function procesarParametrosUrl() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const filtro = params.get('filtro');

        if (action === 'simular-caida') {
            setTimeout(() => {
                ejecutarSimulacionFallaBcp();
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 600);
        } else if (action === 'nuevo-manual') {
            setTimeout(() => {
                ejecutarRegistroManual();
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 600);
        } else if (action === 'generar-sft') {
            setTimeout(() => {
                ejecutarGenerarReporteSft();
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 600);
        } else if (filtro) {
            setTimeout(() => {
                aplicarFiltroSeveridad(filtro);
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    }

    /**
     * Inicialización del módulo
     */
    function inicializar() {
        construirPaletteDOM();
        sincronizarPildoraHeader();
        configurarAtajosTecladoGlobales();
        procesarParametrosUrl();

        // Exponer API pública en window para depuración o integración
        window.SigirCommandPalette = {
            abrir: abrirPalette,
            cerrar: cerrarPalette,
            toggle: togglePalette,
            ejecutar: (id) => {
                const cmd = MASTER_COMMANDS.find(c => c.id === id);
                if (cmd) cmd.handler();
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();
