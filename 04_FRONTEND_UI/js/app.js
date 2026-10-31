/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Lógica Reactiva de Consola NOC & Cliente API Híbrido (Online / Offline Fallback)
 * Autor: Frank Emiliano Vargas Huamán | Curso Integrador I (UTP)
 * ==========================================================================
 */

// Configuración de integración con Backend Spring Boot
const API_CONFIG = {
    baseUrl: 'http://localhost:8080/api/v1',
    healthUrl: 'http://localhost:8080/actuator/health',
    authHeader: 'Basic ' + btoa('operador.noc:Bcrp2026!')
};

let isBackendConnected = false;

// Estado global de la aplicación (Sincronizado con PostgreSQL cuando online, o mock local offline)
const AppState = {
    entidades: [
        { id: 1, codigo: '002', nombre: 'BCP (Yape)', canal: 'Billetera Móvil', estado: 'SALUDABLE', latencia: 18, incidentes: 0 },
        { id: 2, codigo: '003', nombre: 'Interbank (Plim)', canal: 'Billetera Móvil', estado: 'SALUDABLE', latencia: 24, incidentes: 1 },
        { id: 3, codigo: '801', nombre: 'Caja Cusco (Tunki)', canal: 'Billetera Móvil', estado: 'SALUDABLE', latencia: 32, incidentes: 0 },
        { id: 4, codigo: '812', nombre: 'Caja de los Andes', canal: 'Banca Móvil', estado: 'SALUDABLE', latencia: 45, incidentes: 0 },
        { id: 5, codigo: '901', nombre: 'CCE (Switch Central)', canal: 'Switch Interbancario', estado: 'SALUDABLE', latencia: 12, incidentes: 1 }
    ],
    incidentes: [
        {
            id: 1,
            ticket: 'INC-20260903-10045',
            idEntidad: 1,
            entidadNombre: 'BCP (Yape)',
            categoriaCodigo: 'DISP_SERV',
            categoriaNombre: 'Disponibilidad de Servicios',
            severidad: 'CRITICA',
            origen: 'AUTOMATICO',
            fechaDeteccion: '2026-09-03 09:30:15',
            servicio: 'API_TRANSFERENCIAS_INMEDIATAS',
            descripcion: 'Caída de endpoint interbancario: HTTP 503 mitigado satisfactoriamente.',
            estado: 'RESUELTO'
        },
        {
            id: 2,
            ticket: 'INC-20260903-10046',
            idEntidad: 2,
            entidadNombre: 'Interbank (Plim)',
            categoriaCodigo: 'FRAUDE_FIN',
            categoriaNombre: 'Fraude Financiero',
            severidad: 'ALTA',
            origen: 'MANUAL_OPERADOR',
            fechaDeteccion: '2026-09-03 08:15:00',
            servicio: 'PASARELA_QR_DINAMICO',
            descripcion: 'Reporte de QR adulterados concurrentes en comercios mitigado con bloqueo de cuentas.',
            estado: 'CERRADO'
        },
        {
            id: 3,
            ticket: 'INC-20260902-09912',
            idEntidad: 5,
            entidadNombre: 'CCE (Switch Central)',
            categoriaCodigo: 'DISP_SERV',
            categoriaNombre: 'Disponibilidad de Servicios',
            severidad: 'ALTA',
            origen: 'AUTOMATICO',
            fechaDeteccion: '2026-09-02 18:40:22',
            servicio: 'SWITCH_MQ_CCE',
            descripcion: 'Retardo extremo >4500ms en cola MQ. Mitigado con reinicio de canal.',
            estado: 'CERRADO'
        }
    ],
    segundosSondeo: 30
};

// Inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
    iniciarRelojUtc();
    inicializarTelemetria();
    renderizarMatrizIncidentes();
    actualizarKpis();
    configurarEventosUI();
    verificarConectividadBackend();

    // Verificación recurrente de conectividad con Backend cada 15 segundos
    setInterval(verificarConectividadBackend, 15000);
});

/**
 * Reloj Digital en Tiempo Real (PET - America/Lima UTC-5)
 * Formato oficial: HH:MM:SS PET | DD/MM/YYYY
 */
function iniciarRelojUtc() {
    const relojEl = document.getElementById('relojUtc');
    if (!relojEl) return;
    const actualizar = () => {
        const ahora = new Date();
        const opcionesHora = { hour12: false, timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const opcionesFecha = { timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric' };
        
        const horaStr = ahora.toLocaleTimeString('es-PE', opcionesHora);
        const fechaStr = ahora.toLocaleDateString('es-PE', opcionesFecha);
        relojEl.textContent = `${horaStr} PET | ${fechaStr}`;
    };
    actualizar();
    setInterval(actualizar, 1000);
}

/**
 * Verifica si el backend Spring Boot está disponible y sincroniza datos reales
 */
async function verificarConectividadBackend() {
    const pill = document.getElementById('backendStatusPill');
    const dot = document.getElementById('backendStatusDot');
    const text = document.getElementById('backendStatusText');

    try {
        const response = await fetch(API_CONFIG.healthUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
            isBackendConnected = true;
            if (pill) {
                pill.className = 'backend-status-pill online';
                pill.title = 'Conectado a Spring Boot REST API & PostgreSQL (bcrp_incident_db)';
            }
            if (dot) dot.style.background = '#10B981';
            if (text) text.innerText = 'Backend Conectado (PostgreSQL)';

            // Sincronizar catálogo e incidentes reales desde PostgreSQL
            await sincronizarConBackend();
            return;
        }
    } catch (e) {
        // Modo offline / mock
    }

    isBackendConnected = false;
    if (pill) {
        pill.className = 'backend-status-pill offline';
        pill.title = 'Ejecutando en Modo Autónomo / Simulación Local. Inicie Docker Compose o RUN_APF1_LOCAL para sincronizar.';
    }
    if (dot) dot.style.background = '#F59E0B';
    if (text) text.innerText = 'Modo Simulación (Local Mock)';
}

/**
 * Sincroniza entidades e incidentes directamente desde la base de datos a través de la API REST
 */
async function sincronizarConBackend() {
    try {
        const resIncidentes = await fetch(`${API_CONFIG.baseUrl}/incidentes`, {
            headers: { 'Authorization': API_CONFIG.authHeader }
        });

        if (resIncidentes.ok) {
            const data = await resIncidentes.json();
            if (Array.isArray(data) && data.length > 0) {
                AppState.incidentes = data.map(dto => ({
                    id: dto.idIncidente,
                    ticket: dto.codigoTicket,
                    idEntidad: dto.idEntidad,
                    entidadNombre: dto.nombreEntidad,
                    categoriaCodigo: dto.codigoCategoria,
                    categoriaNombre: dto.nombreCategoria,
                    severidad: dto.severidad,
                    origen: dto.origenDeteccion,
                    fechaDeteccion: dto.fechaHoraDeteccion ? dto.fechaHoraDeteccion.replace('T', ' ').substring(0, 19) : '',
                    servicio: dto.servicioAfectado,
                    descripcion: dto.descripcionDetallada,
                    estado: dto.estadoActual
                }));
                renderizarMatrizIncidentes();
                actualizarKpis();
            }
        }
    } catch (err) {
        console.warn('Fallo en sincronización con backend:', err);
    }
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

if (typeof window !== 'undefined') {
    window.escapeHTML = escapeHTML;
}

/**
 * Renderiza los nodos de telemetría de cada entidad financiera participante
 * Incluye canal, código BCRP, latencia dinámica y micro-indicadores de salud NOC.
 * Si una entidad está en falla (simulación de caída), activa badge de CONTINGENCIA ACTIVA y latencia en rojo (> 3500 ms / TIMEOUT).
 */
function renderizarTelemetria() {
    const grid = document.getElementById('telemetryGrid');
    if (!grid) return;

    grid.innerHTML = AppState.entidades.map(ent => {
        const esCaido = ent.estado === 'CAIDO';
        const badgeTexto = esCaido ? 'CONTINGENCIA' : 'OPERATIVO';
        const badgeClase = esCaido ? 'caido' : 'saludable';
        const nodeClase = esCaido ? 'node-caido' : '';
        
        let latenciaTexto;
        if (esCaido) {
            latenciaTexto = 'TIMEOUT (> 3500 ms)';
        } else {
            const latVal = typeof ent.latencia === 'number' ? ent.latencia : 18;
            latenciaTexto = `${latVal} ms`;
        }
        const latenciaColor = esCaido ? '#F87171' : '#34D399';

        const nombreSeguro = escapeHTML(ent.nombre);
        const canalSeguro = escapeHTML(ent.canal);
        const codigoSeguro = escapeHTML(ent.codigo);
        const latenciaSegura = escapeHTML(latenciaTexto);

        return `
        <div class="telemetry-node ${nodeClase}">
            <div class="node-header">
                <div>
                    <h4 class="node-name">${nombreSeguro}</h4>
                    <span class="node-code">${canalSeguro} &bull; Cod. BCRP ${codigoSeguro}</span>
                </div>
                <span class="node-status-pill ${badgeClase}">
                    ${badgeTexto}
                </span>
            </div>
            <div class="node-metrics">
                <span>Latencia de Canal</span>
                <span class="node-latency" style="color: ${latenciaColor}">
                    ${latenciaSegura}
                </span>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Control del temporizador de sondeo de telemetría en tiempo real
 */
function inicializarTelemetria() {
    renderizarTelemetria();
    const timerLabel = document.getElementById('timerSondeo');

    setInterval(() => {
        AppState.segundosSondeo--;
        if (AppState.segundosSondeo <= 0) {
            AppState.segundosSondeo = 30;
            // Fluctuación natural de latencias en sondeo
            AppState.entidades.forEach(e => {
                if (e.estado !== 'CAIDO') {
                    e.latencia = Math.floor(14 + Math.random() * 20);
                }
            });
            renderizarTelemetria();

            // Si el backend está online, refrescar datos desde PostgreSQL
            if (isBackendConnected) {
                sincronizarConBackend();
            }
        }
        if (timerLabel) {
            timerLabel.innerText = `Sondeo: ${AppState.segundosSondeo}s`;
        }
    }, 1000);
}

/**
 * Renderiza la tabla de incidentes aplicando filtros
 */
function renderizarMatrizIncidentes() {
    const tbody = document.getElementById('tablaIncidentesBody');
    if (!tbody) return;

    const texto = (document.getElementById('filtroBuscador')?.value || '').toLowerCase();
    const filtroSev = document.getElementById('filtroSeveridad')?.value || 'TODOS';
    const filtroEst = document.getElementById('filtroEstado')?.value || 'TODOS';

    const filtrados = AppState.incidentes.filter(inc => {
        const ticketStr = String(inc.ticket || '').toLowerCase();
        const entidadStr = String(inc.entidadNombre || '').toLowerCase();
        const servStr = String(inc.servicio || '').toLowerCase();
        const matchTexto = ticketStr.includes(texto) ||
                           entidadStr.includes(texto) ||
                           servStr.includes(texto);
        const matchSev = (filtroSev === 'TODOS') || (inc.severidad === filtroSev);
        const matchEst = (filtroEst === 'TODOS') || (inc.estado === filtroEst);
        return matchTexto && matchSev && matchEst;
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 36px 20px; font-size: 0.85rem;">No se encontraron incidentes con los filtros seleccionados.</td></tr>`;
        return;
    }

    // Diccionarios de traducción humana para usuarios no técnicos y jurado
    const DICCIONARIO_HUMANO = {
        servicios: {
            'API_TRANSFERENCIAS_INMEDIATAS': 'Transferencias Inmediatas 24/7',
            'PASARELA_QR_DINAMICO': 'Pagos QR Interbancarios',
            'SWITCH_TRANSACCIONAL_CCE': 'Switch Central de Pagos CCE',
            'ENLACE_CORE_HOST': 'Enlace Central de Banco',
            'FALLA_HTTP_503': 'Interrupción Temporal de Enlace'
        },
        origenes: {
            'AUTOMATICO': 'Detección por Telemetría',
            'MANUAL_OPERADOR': 'Reporte Manual Operador',
            'MONITOREO_RED': 'Sondeo Automático',
            'FALLA_SIMULADA': 'Simulación de Demostración'
        },
        severidades: {
            'CRITICA': 'Prioridad Crítica',
            'ALTA': 'Prioridad Alta',
            'MEDIA': 'Prioridad Media',
            'BAJA': 'Prioridad Baja'
        },
        estados: {
            'REGISTRADO': 'Registrado (En espera)',
            'EN_EVALUACION': 'En Evaluación',
            'EN_MITIGACION': 'En Mitigación Activa',
            'RESUELTO': 'Solucionado con Éxito',
            'CERRADO': 'Cerrado y Archivado'
        }
    };

    function traducirAHumano(valor, mapa, porDefecto) {
        if (!valor) return porDefecto || '-';
        const clave = String(valor).toUpperCase().trim();
        return mapa[clave] || valor.replace(/_/g, ' ');
    }

    tbody.innerHTML = filtrados.map(inc => {
        const ticketSafe = escapeHTML(inc.ticket);
        const entidadSafe = escapeHTML(inc.entidadNombre);
        const servicioHumano = traducirAHumano(inc.servicio, DICCIONARIO_HUMANO.servicios, 'Servicio Bancario');
        const servicioSafe = escapeHTML(servicioHumano);
        const categoriaSafe = escapeHTML(inc.categoriaNombre);
        const sevClass = String(inc.severidad || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
        const sevHumana = traducirAHumano(inc.severidad, DICCIONARIO_HUMANO.severidades, inc.severidad);
        const sevSafe = escapeHTML(sevHumana);
        const origenHumano = traducirAHumano(inc.origen, DICCIONARIO_HUMANO.origenes, inc.origen);
        const origenSafe = escapeHTML(origenHumano);
        const fechaSafe = escapeHTML(inc.fechaDeteccion);
        const estClass = String(inc.estado || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
        const estHumano = traducirAHumano(inc.estado, DICCIONARIO_HUMANO.estados, inc.estado);
        const estSafe = escapeHTML(estHumano);

        return `
        <tr class="incident-row" data-incident-id="${inc.id}" style="cursor:pointer;" title="Haz clic para ver detalles y auditoría completa">
            <td class="ticket-mono">${ticketSafe}</td>
            <td>
                <div class="entidad-cell">${entidadSafe}</div>
                <span class="servicio-tag">${servicioSafe}</span>
            </td>
            <td style="color: var(--text-secondary);">${categoriaSafe}</td>
            <td><span class="badge-severidad ${sevClass}">${sevSafe}</span></td>
            <td><span style="font-size: 0.72rem; color: var(--text-tertiary);">${origenSafe}</span></td>
            <td style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-tertiary);">${fechaSafe}</td>
            <td><span class="badge-estado ${estClass}">${estSafe}</span></td>
            <td>
                ${renderBotonesAccion(inc)}
            </td>
        </tr>
        `;
    }).join('');
}

/**
 * Genera botones de transición según la máquina de estados
 */
function renderBotonesAccion(inc) {
    const safeId = parseInt(inc.id, 10);
    if (isNaN(safeId)) return '<span style="font-size: 0.72rem; color: var(--text-muted);">-</span>';

    if (inc.estado === 'REGISTRADO') {
        return `<button class="btn-action-table" onclick="avanzarEstado(${safeId}, 'EN_EVALUACION')">Evaluar</button>`;
    } else if (inc.estado === 'EN_EVALUACION') {
        return `<button class="btn-action-table" onclick="avanzarEstado(${safeId}, 'EN_MITIGACION')">Mitigar</button>`;
    } else if (inc.estado === 'EN_MITIGACION') {
        return `<button class="btn-action-table btn-resolve" onclick="avanzarEstado(${safeId}, 'RESUELTO')">Resolver</button>`;
    } else if (inc.estado === 'RESUELTO') {
        return `<button class="btn-action-table" onclick="avanzarEstado(${safeId}, 'CERRADO')">Cerrar</button>`;
    } else {
        return `<span style="font-size: 0.72rem; color: var(--text-muted);">Cerrado</span>`;
    }
}

/**
 * Avanza el estado del incidente cumpliendo las reglas de negocio (con persistencia real si backend activo)
 */
window.avanzarEstado = async function(idIncidente, nuevoEstado) {
    const inc = AppState.incidentes.find(i => i.id === idIncidente);
    if (!inc) return;

    if (isBackendConnected) {
        try {
            const resp = await fetch(`${API_CONFIG.baseUrl}/incidentes/${idIncidente}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_CONFIG.authHeader
                },
                body: JSON.stringify({
                    nuevoEstado: nuevoEstado,
                    comentarioTecnico: `Transición autorizada desde Consola Web NOC hacia ${nuevoEstado}.`,
                    fechaHoraSolucion: (nuevoEstado === 'RESUELTO' || nuevoEstado === 'CERRADO') ? new Date().toISOString() : null
                })
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                alert(`Error en Backend Spring Boot: ${errorData.message || 'Transición inválida en máquina de estados'}`);
                return;
            }
        } catch (err) {
            console.error('Error enviando PATCH a Spring Boot:', err);
        }
    }

    // Actualización reactiva local
    inc.estado = nuevoEstado;

    // Si se resuelve o cierra, normalizar estado de salud de la entidad
    if (nuevoEstado === 'RESUELTO' || nuevoEstado === 'CERRADO') {
        const ent = AppState.entidades.find(e => e.id === inc.idEntidad);
        if (ent) {
            ent.estado = 'SALUDABLE';
            ent.latencia = 16;
            ent.incidentes = Math.max(0, ent.incidentes - 1);
        }
    }

    renderizarTelemetria();
    renderizarMatrizIncidentes();
    actualizarKpis();
};

/**
 * Actualiza los contadores de la barra de KPIs
 */
function actualizarKpis() {
    const total = AppState.incidentes.length;
    const criticos = AppState.incidentes.filter(i => 
        i.estado !== 'CERRADO' && i.estado !== 'RESUELTO' && (i.severidad === 'CRITICA' || i.severidad === 'ALTA')
    ).length;
    const resueltos = AppState.incidentes.filter(i => i.estado === 'RESUELTO' || i.estado === 'CERRADO').length;

    const elTotal = document.getElementById('kpiTotal');
    const elCriticos = document.getElementById('kpiCriticos');
    const elResueltos = document.getElementById('kpiResueltos');
    const elUptime = document.getElementById('kpiUptime');

    if (elTotal) elTotal.innerText = total;
    if (elCriticos) {
        elCriticos.innerText = criticos;
        elCriticos.style.color = criticos > 0 ? '#F87171' : '#F8FAFC';
    }
    if (elResueltos) {
        elResueltos.innerText = resueltos;
        elResueltos.style.color = '#34D399';
    }

    if (elUptime) {
        let uptimeVal;
        if (criticos === 0) {
            uptimeVal = '99.98';
        } else if (criticos === 1) {
            uptimeVal = '99.74';
        } else {
            const penalidad = criticos * 0.24;
            uptimeVal = Math.max(98.50, (99.98 - penalidad)).toFixed(2);
        }
        elUptime.innerText = `${uptimeVal}%`;
        elUptime.style.color = Number(uptimeVal) >= 99.90 ? '#38BDF8' : '#F87171';
    }
}

/**
 * Simulación de caída de servicio automática por telemetría (Demostración en 1 Clic)
 * Simula la caída de BCP (Yape) inyectando HTTP 503, genera en < 1 segundo el ticket INC-20261031-10001
 * con severidad CRÍTICA, activa semáforo en rojo parpadeante con CONTINGENCIA ACTIVA y actualiza los KPIs
 * a Disponibilidad: 99.74% y Activos: 1.
 */
function simularCaidaAutomatica() {
    // 1. Identificar BCP (Yape) como entidad objetivo
    const bcp = AppState.entidades.find(e => e.id === 1 || e.codigo === '002') || AppState.entidades[0];
    bcp.estado = 'CAIDO';
    bcp.latencia = 3850; // Latencia crítica > 3500 ms (TIMEOUT)
    bcp.incidentes = (bcp.incidentes || 0) + 1;

    // 2. Generar ticket normativo específico: INC-20261031-10001
    const ticketId = 'INC-20261031-10001';
    const ahoraObj = new Date();
    const ahora = ahoraObj.toISOString().replace('T', ' ').substring(0, 19);

    // Evitar duplicación si se presiona varias veces durante la demo
    const idxExistente = AppState.incidentes.findIndex(i => i.ticket === ticketId);
    if (idxExistente !== -1) {
        AppState.incidentes.splice(idxExistente, 1);
    }

    const nuevoIncidente = {
        id: Date.now(),
        ticket: ticketId,
        idEntidad: bcp.id,
        entidadNombre: bcp.nombre,
        categoriaCodigo: 'DISP_SERV',
        categoriaNombre: 'Disponibilidad de Servicios',
        severidad: 'CRITICA',
        origen: 'AUTOMATICO',
        fechaDeteccion: ahora,
        servicio: 'API_TRANSFERENCIAS_INMEDIATAS',
        descripcion: 'ALERTA AUTOMÁTICA BCRP: Falla HTTP 503 Service Unavailable detectada en pasarela interoperable BCP (Yape). Inyección de contingencia regulatoria.',
        estado: 'REGISTRADO'
    };

    AppState.incidentes.unshift(nuevoIncidente);

    // 3. Renderizado y actualización reactiva inmediata en < 1 segundo
    renderizarTelemetria();
    renderizarMatrizIncidentes();
    actualizarKpis();

    // 4. Toast banner de notificación visual de alta fidelidad
    mostrarToastNotificacion(`⚡ ALERTA AUTOMÁTICA BCRP: Inyección HTTP 503 en ${bcp.nombre}. Ticket ${ticketId} [CRÍTICA] generado. Contingencia operativa activada.`, 'critica');
}

/**
 * Compila y genera el archivo plano oficial normativo SFT BCRP con firma criptográfica SHA-256
 * Estructura oficial BCRP:
 * - Registro Cabecera (HEADER / 01)
 * - Registros Detalle (DETALLE / 02)
 * - Registro Cierre (FOOTER / 03) con Hash SHA-256 de 64 caracteres
 */
async function generarReporteSft() {
    // Si el backend está disponible, compilar el reporte oficial desde el servidor Spring Boot
    if (isBackendConnected) {
        try {
            const resp = await fetch(`${API_CONFIG.baseUrl}/reportes/generar-sft`, {
                method: 'POST',
                headers: { 'Authorization': API_CONFIG.authHeader }
            });

            if (resp.ok) {
                const reporteBD = await resp.json();
                document.getElementById('sftContenidoTxt').innerText = reporteBD.contenidoPlano;
                document.getElementById('sftHashSha256').innerText = reporteBD.hashSha256;

                document.getElementById('btnDescargarTxtFile').onclick = () => {
                    const blob = new Blob([reporteBD.contenidoPlano], { type: 'text/plain;charset=utf-8' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = reporteBD.nombreArchivo || `INCIDENTES_PAGOS_SFT.txt`;
                    a.click();
                };

                document.getElementById('modalSft').classList.add('active');
                return;
            }
        } catch (err) {
            console.warn('Fallback a compilador SFT local normativo:', err);
        }
    }

    // Modo autónomo local con compilación normativa BCRP
    const pad = (n) => String(n).padStart(2, '0');
    const ahora = new Date();
    const timestampNorm = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}-${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`;
    const numEnvio = `SFT-BCRP-${timestampNorm}`;

    // Obtener incidentes para el reporte (priorizar CERRADOS, o RESUELTOS para la demostración)
    let registrosReporte = AppState.incidentes.filter(i => i.estado === 'CERRADO');
    if (registrosReporte.length === 0) {
        registrosReporte = AppState.incidentes.filter(i => i.estado === 'RESUELTO');
    }
    if (registrosReporte.length === 0) {
        registrosReporte = AppState.incidentes;
    }

    // 1. REGISTRO CABECERA (HEADER / 01): HEADER|NUM_ENVIO|TIMESTAMP|CANTIDAD
    let contenido = `HEADER|${numEnvio}|${timestampNorm}|${registrosReporte.length}\n`;

    // 2. REGISTROS DETALLE (DETALLE / 02): DETALLE|TICKET|COD_ENTIDAD|ENTIDAD|CATEGORIA|SEVERIDAD|FECHA_INI|FECHA_FIN|ORIGEN|SERVICIO
    registrosReporte.forEach(inc => {
        const ent = AppState.entidades.find(e => e.id === inc.idEntidad);
        const codBcrp = ent ? ent.codigo : '002';
        const fechaIniNorm = (inc.fechaDeteccion || '').replace(/[- :]/g, '').slice(0, 14);
        const fechaIniFmt = fechaIniNorm.length >= 8 
            ? `${fechaIniNorm.slice(0, 8)}-${fechaIniNorm.slice(8, 14) || '000000'}`
            : timestampNorm;
        
        const fechaFinFmt = (inc.estado === 'CERRADO' || inc.estado === 'RESUELTO')
            ? timestampNorm
            : 'NO_RESUELTO';

        contenido += `DETALLE|${inc.ticket}|${codBcrp}|${inc.entidadNombre}|${inc.categoriaCodigo}|${inc.severidad}|${fechaIniFmt}|${fechaFinFmt}|${inc.origen}|${inc.servicio}\n`;
    });

    // 3. REGISTRO PIE (FOOTER / 03) con Hash SHA-256 criptográfico real de 64 caracteres
    const sha256 = await calcularSha256(contenido);
    contenido += `FOOTER|${sha256}`;

    // Despliegue en interfaz y apertura del modal
    const txtBox = document.getElementById('sftContenidoTxt');
    const hashBox = document.getElementById('sftHashSha256');
    const modal = document.getElementById('modalSft');

    if (txtBox) txtBox.innerText = contenido;
    if (hashBox) hashBox.innerText = sha256;

    const btnDescargar = document.getElementById('btnDescargarTxtFile');
    if (btnDescargar) {
        btnDescargar.onclick = () => {
            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `INCIDENTES_SFT_${timestampNorm}.txt`;
            a.click();
        };
    }

    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Muestra notificación flotante sin bloquear el hilo de ejecución del navegador
 */
function mostrarToastNotificacion(mensaje, tipo = 'info') {
    let toast = document.getElementById('sigirGlobalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sigirGlobalToast';
        toast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: rgba(11, 15, 23, 0.96);
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-left: 4px solid #EF4444;
            color: #F87171;
            padding: 14px 22px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-family: var(--font-mono);
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 18px rgba(239, 68, 68, 0.25);
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(12px);
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 520px;
        `;
        document.body.appendChild(toast);
    }
    toast.innerText = mensaje;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-12px)';
    }, 4500);
}

/**
 * Implementación determinista en JavaScript puro de SHA-256 (FIPS 180-4 / RFC 6234)
 * Utilizada como fallback de alta seguridad bancaria cuando Web Crypto API no está disponible
 * (por ejemplo: ejecución local offline, protocolo file://, o contextos no seguros).
 */
function sha256Fallback(ascii) {
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
            for (let i = candidate * candidate; i < 313; i += candidate) {
                isComposite[i] = true;
            }
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
            const s0 = i < 16 ? w[i] : (
                w[i] = (
                    (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                    w[i - 7] +
                    (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) +
                    w[i - 16]
                ) | 0
            );
            const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
            const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
            const s0_round = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
            const t1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
            const t2 = (s0_round + maj) | 0;

            hash = [(t1 + t2) | 0].concat(hash);
            hash[4] = (hash[4] + t1) | 0;
        }

        for (let i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
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
 * Función criptográfica auxiliar SHA-256 nativa del navegador con fallback universal determinista
 * Garantiza digest defensivo canónico de exactamente 64 caracteres hexadecimales en minúsculas.
 */
async function calcularSha256(str) {
    const raw = String(str || '');
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
        try {
            const buffer = new TextEncoder().encode(raw);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
            if (hex.length === 64 && /^[0-9a-f]{64}$/.test(hex)) {
                return hex;
            }
        } catch (e) {
            console.warn('[SHA-256] Crypto.subtle falló, usando motor criptográfico local:', e);
        }
    }
    const fallbackHex = String(sha256Fallback(raw) || '').toLowerCase();
    return fallbackHex.padStart(64, '0').slice(0, 64);
}

/**
 * Configuración de eventos y modales
 */
function configurarEventosUI() {
    // Filtros
    document.getElementById('filtroBuscador')?.addEventListener('input', renderizarMatrizIncidentes);
    document.getElementById('filtroSeveridad')?.addEventListener('change', renderizarMatrizIncidentes);
    document.getElementById('filtroEstado')?.addEventListener('change', renderizarMatrizIncidentes);

    // Acciones
    document.getElementById('btnSimularCaida')?.addEventListener('click', simularCaidaAutomatica);
    document.getElementById('btnGenerarSft')?.addEventListener('click', generarReporteSft);

    // Modal Manual
    const modalManual = document.getElementById('modalManual');
    document.getElementById('btnNuevoManual')?.addEventListener('click', () => {
        modalManual.classList.add('active');
    });
    document.getElementById('btnCerrarModalManual')?.addEventListener('click', () => {
        modalManual.classList.remove('active');
    });
    document.getElementById('btnCancelarManual')?.addEventListener('click', () => {
        modalManual.classList.remove('active');
    });

    // Envío Formulario Manual con Validación Operativa Bancaria Real
    document.getElementById('formRegistroManual')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEnt = parseInt(document.getElementById('manualEntidad').value);
        const entidad = AppState.entidades.find(en => en.id === idEnt);
        const cat = document.getElementById('manualCategoria').value;
        const sev = document.getElementById('manualSeveridad').value;
        const serv = document.getElementById('manualServicio').value;
        const desc = (document.getElementById('manualDescripcion').value || '').trim();

        // Validación estricta de campos para trazabilidad BCRP
        if (!idEnt || isNaN(idEnt)) {
            alert('⚠️ Validación BCRP: Debe seleccionar una entidad financiera participante.');
            document.getElementById('manualEntidad')?.focus();
            return;
        }

        if (!desc || desc.length < 15) {
            alert('⚠️ Validación BCRP: La descripción del incidente debe tener al menos 15 caracteres para cumplir con la trazabilidad normativa.');
            document.getElementById('manualDescripcion')?.focus();
            return;
        }

        const ahoraISO = new Date().toISOString();

        if (isBackendConnected) {
            try {
                const resp = await fetch(`${API_CONFIG.baseUrl}/incidentes/manual`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': API_CONFIG.authHeader
                    },
                    body: JSON.stringify({
                        idEntidad: idEnt,
                        codigoCategoria: cat,
                        severidad: sev,
                        fechaHoraInicio: ahoraISO,
                        servicioAfectado: serv,
                        descripcionDetallada: desc,
                        impactoEstimadoUsuarios: 50
                    })
                });

                if (resp.ok) {
                    const nuevo = await resp.json();
                    AppState.incidentes.unshift({
                        id: nuevo.idIncidente,
                        ticket: nuevo.codigoTicket,
                        idEntidad: nuevo.idEntidad,
                        entidadNombre: nuevo.nombreEntidad,
                        categoriaCodigo: nuevo.codigoCategoria,
                        categoriaNombre: nuevo.nombreCategoria,
                        severidad: nuevo.severidad,
                        origen: nuevo.origenDeteccion,
                        fechaDeteccion: nuevo.fechaHoraDeteccion.replace('T', ' ').substring(0, 19),
                        servicio: nuevo.servicioAfectado,
                        descripcion: nuevo.descripcionDetallada,
                        estado: nuevo.estadoActual
                    });
                    modalManual.classList.remove('active');
                    document.getElementById('formRegistroManual').reset();
                    renderizarMatrizIncidentes();
                    actualizarKpis();
                    alert(`✅ Incidente registrado y persistido en PostgreSQL con Ticket: ${nuevo.codigoTicket}`);
                    return;
                } else {
                    const errObj = await resp.json().catch(() => ({}));
                    alert(`Error en persistencia: ${errObj.message || 'La entidad ya posee un ticket activo.'}`);
                    return;
                }
            } catch (err) {
                console.warn('Falla en llamada API backend:', err);
            }
        }

        // Modo offline / fallback
        const nuevoId = AppState.incidentes.length + 1;
        const ahoraObj = new Date();
        const ahora = ahoraObj.toISOString().replace('T', ' ').substring(0, 19);
        const fechaPrefix = ahoraObj.toISOString().slice(0, 10).replace(/-/g, '');
        const ticket = `INC-${fechaPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

        AppState.incidentes.unshift({
            id: nuevoId,
            ticket: ticket,
            idEntidad: idEnt,
            entidadNombre: entidad ? entidad.nombre : 'Entidad',
            categoriaCodigo: cat,
            categoriaNombre: cat === 'FRAUDE_FIN' ? 'Fraude Financiero' : 'Manipulación de Información',
            severidad: sev,
            origen: 'MANUAL_OPERADOR',
            fechaDeteccion: ahora,
            servicio: serv,
            descripcion: desc,
            estado: 'REGISTRADO'
        });

        modalManual.classList.remove('active');
        document.getElementById('formRegistroManual').reset();
        renderizarMatrizIncidentes();
        actualizarKpis();
    });

    // Modal SFT
    const modalSft = document.getElementById('modalSft');
    document.getElementById('btnCerrarModalSft')?.addEventListener('click', () => modalSft.classList.remove('active'));
    document.getElementById('btnCerrarSft')?.addEventListener('click', () => modalSft.classList.remove('active'));

    // Modal Guía Interactiva para Jurado (Frank Vargas)
    const modalGuia = document.getElementById('modalGuiaDemo');
    function toggleModalGuia() {
        if (!modalGuia) return;
        modalGuia.classList.toggle('active');
    }
    window.toggleModalGuiaDemo = toggleModalGuia;

    document.getElementById('btnAbrirGuiaModal')?.addEventListener('click', toggleModalGuia);
    document.getElementById('btnCerrarModalGuiaDemo')?.addEventListener('click', () => modalGuia?.classList.remove('active'));
    document.getElementById('btnCerrarModalGuiaDemoFooter')?.addEventListener('click', () => modalGuia?.classList.remove('active'));
    modalGuia?.addEventListener('click', (e) => {
        if (e.target === modalGuia) modalGuia.classList.remove('active');
    });

    // Atajo global de teclado Alt + G
    window.addEventListener('keydown', (ev) => {
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && (ev.key.toLowerCase() === 'g' || ev.code === 'KeyG')) {
            ev.preventDefault();
            toggleModalGuia();
        }
        if (ev.key === 'Escape' && modalGuia?.classList.contains('active')) {
            modalGuia.classList.remove('active');
        }
    });

    // Acciones interactivas directas dentro de la Guía Modal
    document.getElementById('btnGuiaPaso1TráficoNormal')?.addEventListener('click', () => {
        if (window.NocDemo && typeof window.NocDemo.escenario1 === 'function') {
            window.NocDemo.escenario1();
        } else {
            AppState.entidades.forEach(e => { e.estado = 'SALUDABLE'; e.incidentes = 0; });
            renderizarTelemetria();
            actualizarKpis();
        }
    });

    document.getElementById('btnGuiaPaso2ResaltarKpis')?.addEventListener('click', () => {
        const grid = document.querySelector('.executive-kpi-grid');
        if (grid) {
            grid.classList.add('row-highlight-active');
            setTimeout(() => grid.classList.remove('row-highlight-active'), 2000);
        }
    });

    document.getElementById('btnGuiaPaso3DispararFalla')?.addEventListener('click', () => {
        if (window.NocDemo && typeof window.NocDemo.escenario2 === 'function') {
            window.NocDemo.escenario2();
        } else {
            simularCaidaAutomatica();
        }
    });

    document.getElementById('btnGuiaPaso4AbrirModalManual')?.addEventListener('click', () => {
        modalGuia?.classList.remove('active');
        modalManual?.classList.add('active');
    });

    document.getElementById('btnGuiaPaso4AvanzarMitigacion')?.addEventListener('click', () => {
        if (window.NocDemo && typeof window.NocDemo.escenario3 === 'function') {
            window.NocDemo.escenario3();
        }
    });

    document.getElementById('btnGuiaPaso6AbrirSft')?.addEventListener('click', () => {
        modalGuia?.classList.remove('active');
        generarReporteSft();
    });
}

// ==========================================================================
// EXPOSICIÓN GLOBAL DE REFERENCIAS PARA CONTROL DE SUSTENTACIÓN Y NOC-DEMO
// ==========================================================================
window.AppState = AppState;
window.renderizarTelemetria = renderizarTelemetria;
window.renderizarMatrizIncidentes = renderizarMatrizIncidentes;
window.actualizarKpis = actualizarKpis;
window.generarReporteSft = generarReporteSft;
window.simularCaidaAutomatica = simularCaidaAutomatica;
window.calcularSha256 = calcularSha256;
window.escapeHTML = escapeHTML;
