/* ==========================================================================
   SIGIR - BCRP | Módulo de Reportes Clave & Compilador SFT (APF2)
   Lógica de Métricas (MTTR/MTTD/Uptime), Gráficos Reactivos y Sellado Criptográfico
   Autor: Frank Emiliano Vargas Huamán | Curso Integrador I (UTP)
   ========================================================================== */

const BASE = 'http://localhost:8080/api/v1';
const AUTH = 'Basic ' + btoa('operador.noc:Bcrp2026!');

const MOCK = [
  { idEntidad: 1, codigoBcrp: '002', nombreEntidad: 'Banco de Crédito (BCP)', totalIncidentes: 2, incidentesCriticos: 2, mttrMinutos: 95.5, mttdMinutos: 1.0, minutosIndisponibles: 191, uptimePct: 99.56 },
  { idEntidad: 2, codigoBcrp: '003', nombreEntidad: 'BBVA Perú / Interbank', totalIncidentes: 1, incidentesCriticos: 1, mttrMinutos: 45.0, mttdMinutos: 1.0, minutosIndisponibles: 45, uptimePct: 99.90 },
  { idEntidad: 3, codigoBcrp: '801', nombreEntidad: 'Caja Cusco', totalIncidentes: 0, incidentesCriticos: 0, mttrMinutos: 0.0, mttdMinutos: 0.0, minutosIndisponibles: 0, uptimePct: 100.00 },
  { idEntidad: 4, codigoBcrp: '812', nombreEntidad: 'Caja de los Andes', totalIncidentes: 0, incidentesCriticos: 0, mttrMinutos: 0.0, mttdMinutos: 0.0, minutosIndisponibles: 0, uptimePct: 100.00 },
  { idEntidad: 5, codigoBcrp: '901', nombreEntidad: 'CCE (Switch Central)', totalIncidentes: 1, incidentesCriticos: 1, mttrMinutos: 120.0, mttdMinutos: 2.0, minutosIndisponibles: 120, uptimePct: 99.72 }
];

let lastSFT = '', lastHash = '', lastName = 'INCIDENTES_PAGOS_SFT.txt';
let currentViewRows = [];

function qp() {
  const d = document.getElementById('fDesde')?.value;
  const h = document.getElementById('fHasta')?.value;
  if (d && h) {
    return `?desde=${encodeURIComponent(d)}:00&hasta=${encodeURIComponent(h)}:00`;
  }
  return '';
}

async function getJSON(path) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 800);
  try {
    const r = await fetch(BASE + path + qp(), { 
      headers: { Authorization: AUTH },
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
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

if (typeof window !== 'undefined' && !window.escapeHTML) {
  window.escapeHTML = escapeHTML;
}

/**
 * Sanitización de filas de tabla (tr/td) compatible con DOMParser de DOMPurify
 */
function sanitizeTableHtml(htmlRows) {
  if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
    const wrapped = `<table><tbody>${htmlRows}</tbody></table>`;
    const clean = window.DOMPurify.sanitize(wrapped, { ADD_ATTR: ['style', 'title', 'data-filename', 'target'] });
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    return doc.querySelector('tbody')?.innerHTML || htmlRows;
  }
  return htmlRows;
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
 * Función criptográfica defensiva SHA-256 nativa con verificación de 64 caracteres hex
 */
async function calcularSha256(str) {
  const raw = String(str || '');
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
    try {
      const buffer = new TextEncoder().encode(raw);
      const buf = await window.crypto.subtle.digest('SHA-256', buffer);
      const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
      if (hash.length === 64 && /^[0-9a-f]{64}$/.test(hash)) {
        return hash;
      }
    } catch (e) {
      console.warn('[SHA-256] Crypto.subtle fallo en reportes:', e);
    }
  }
  if (typeof window !== 'undefined' && typeof window.calcularSha256 === 'function') {
    try {
      const res = await window.calcularSha256(raw);
      if (res && res.length === 64) return res;
    } catch (e) {}
  }
  const fallbackHex = String(sha256PureFallback(raw) || '').toLowerCase();
  return fallbackHex.padStart(64, '0').slice(0, 64);
}

/**
 * Renderizado de gráfico de líneas ejecutiva moderna de disponibilidad Uptime con umbral SLA 99.90%
 * Soporte Retina / High-DPI, curvas Bézier suaves, gradiente sutil y badge flotante de meta SLA.
 */
function drawChart(rows, isPrintMode = false) {
  const c = document.getElementById('chartUptime');
  if (!c) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;

  const isPrint = isPrintMode || (typeof window !== 'undefined' && Boolean(window.__isPrinting));
  currentViewRows = rows || [];

  // Adaptación de resolución para pantallas Retina / High-DPI con window.devicePixelRatio
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = c.getBoundingClientRect();
  const displayWidth = rect.width > 0 ? Math.floor(rect.width) : (c.parentElement ? c.parentElement.clientWidth : 800);
  const displayHeight = isPrint ? 200 : 260;

  // Dimensiones físicas de buffer vs estilo CSS
  c.width = Math.floor(displayWidth * dpr);
  c.height = Math.floor(displayHeight * dpr);
  c.style.width = displayWidth + 'px';
  c.style.height = displayHeight + 'px';

  ctx.save();
  ctx.scale(dpr, dpr);
  
  if (isPrint) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
  } else {
    ctx.clearRect(0, 0, displayWidth, displayHeight);
  }

  if (!rows || rows.length === 0) {
    ctx.fillStyle = isPrint ? '#475569' : '#64748B';
    ctx.font = '500 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sin datos de disponibilidad para el período seleccionado', displayWidth / 2, displayHeight / 2);
    ctx.restore();
    return;
  }

  // Márgenes internos calibrados para evitar cualquier recorte en bordes
  const paddingLeft = 70;
  const paddingRight = 60;
  const paddingTop = isPrint ? 36 : 44;
  const paddingBottom = isPrint ? 46 : 54;
  const chartWidth = Math.max(10, displayWidth - paddingLeft - paddingRight);
  const chartHeight = Math.max(10, displayHeight - paddingTop - paddingBottom);

  // Escala vertical dinámica con holgura para etiquetas
  const minVal = Math.min(...rows.map(r => r.uptimePct));
  const minScale = Math.min(99.0, Math.floor((minVal - 0.2) * 10) / 10);
  const maxScale = 100.12; // Headroom superior para que 100.00% no toque el borde superior
  const scaleRange = Math.max(0.1, maxScale - minScale);

  const getY = (val) => {
    const clamped = Math.max(minScale, Math.min(maxScale, val));
    return paddingTop + chartHeight - ((clamped - minScale) / scaleRange) * chartHeight;
  };

  // Líneas de grilla de fondo y etiquetas de eje Y en JetBrains Mono
  const gridLevels = [
    { val: minScale, label: `${minScale.toFixed(1)}%` },
    { val: 99.50, label: '99.50%' },
    { val: 100.00, label: '100.00%' }
  ];

  ctx.save();
  ctx.strokeStyle = isPrint ? '#E2E8F0' : 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = isPrint ? '#475569' : '#64748B';
  ctx.font = '500 10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  gridLevels.forEach(g => {
    if (g.val >= minScale && g.val <= maxScale) {
      const gy = getY(g.val);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, gy);
      ctx.lineTo(displayWidth - paddingRight, gy);
      ctx.stroke();

      ctx.fillText(g.label, paddingLeft - 10, gy);
    }
  });
  ctx.restore();

  // Línea de referencia normativa SLA BCRP (99.90%) punteada roja con etiqueta flotante clara
  const slaTarget = 99.90;
  const slaY = getY(slaTarget);

  ctx.save();
  ctx.strokeStyle = isPrint ? '#DC2626' : 'rgba(239, 68, 68, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(paddingLeft, slaY);
  ctx.lineTo(displayWidth - paddingRight, slaY);
  ctx.stroke();

  // Etiqueta flotante con micro-badge de alta legibilidad
  const slaBadgeText = 'META BCRP 99.90%';
  ctx.font = '700 9px JetBrains Mono, monospace';
  const textMetrics = ctx.measureText(slaBadgeText);
  const pillW = textMetrics.width + 20;
  const pillH = 20;
  const pillX = displayWidth - paddingRight - pillW;
  const pillY = slaY - pillH / 2;

  ctx.setLineDash([]);
  ctx.fillStyle = isPrint ? '#FEF2F2' : '#0B132B';
  ctx.strokeStyle = isPrint ? '#DC2626' : 'rgba(239, 68, 68, 0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pillX, pillY, pillW, pillH, 4);
  } else {
    ctx.rect(pillX, pillY, pillW, pillH);
  }
  ctx.fill();
  ctx.stroke();

  // Punto indicador rojo en el badge
  ctx.beginPath();
  ctx.arc(pillX + 9, slaY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();

  // Texto del badge
  ctx.fillStyle = isPrint ? '#991B1B' : '#FCA5A5';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(slaBadgeText, pillX + 16, slaY);
  ctx.restore();

  // Cálculo de puntos de datos (X, Y)
  const points = rows.map((r, i) => {
    const x = rows.length === 1 
      ? paddingLeft + chartWidth / 2 
      : paddingLeft + i * (chartWidth / (rows.length - 1));
    const y = getY(r.uptimePct);
    return { x, y, row: r };
  });

  // Trazado de curva Bézier suave y armónica (Catmull-Rom spline con tensión controlada 0.18)
  function traceSmoothPath(pts) {
    if (!pts || pts.length === 0) return;
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 1) return;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) * 0.18;
      const cp1y = p1.y + (p2.y - p0.y) * 0.18;
      const cp2x = p2.x - (p3.x - p1.x) * 0.18;
      const cp2y = p2.y - (p3.y - p1.y) * 0.18;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  // 1. Área degradada inferior suave bajo la curva Bézier
  ctx.save();
  const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
  if (isPrint) {
    areaGrad.addColorStop(0, 'rgba(5, 150, 105, 0.14)');
    areaGrad.addColorStop(0.7, 'rgba(5, 150, 105, 0.04)');
    areaGrad.addColorStop(1, 'rgba(5, 150, 105, 0.00)');
  } else {
    areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
    areaGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.03)');
    areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, paddingTop + chartHeight);
  ctx.lineTo(points[0].x, points[0].y);
  traceSmoothPath(points);
  ctx.lineTo(points[points.length - 1].x, paddingTop + chartHeight);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();
  ctx.restore();

  // 2. Línea ejecutiva verde esmeralda con curva Bézier suave
  ctx.save();
  if (!isPrint) {
    ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
    ctx.shadowBlur = 8;
  }
  ctx.strokeStyle = isPrint ? '#059669' : '#10B981';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  traceSmoothPath(points);
  ctx.stroke();
  ctx.restore();

  // 3. Nodos de datos, guías verticales y etiquetas en JetBrains Mono y Plus Jakarta Sans
  points.forEach(p => {
    const cumpleSla = p.row.uptimePct >= 99.90;
    const nodeColor = cumpleSla ? (isPrint ? '#059669' : '#10B981') : (isPrint ? '#D97706' : '#F59E0B');
    const textColor = isPrint ? '#0F172A' : (cumpleSla ? '#34D399' : '#FBBF24');

    // Guía vertical punteada hacia el eje X
    ctx.save();
    ctx.strokeStyle = isPrint ? '#CBD5E1' : 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 6);
    ctx.lineTo(p.x, paddingTop + chartHeight);
    ctx.stroke();
    ctx.restore();

    // Halo y punto exterior
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = isPrint ? '#FFFFFF' : '#0B132B';
    ctx.fill();
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Punto central
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    ctx.restore();

    // Etiqueta superior nítida en JetBrains Mono
    ctx.save();
    ctx.font = '700 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = textColor;
    ctx.fillText(`${p.row.uptimePct.toFixed(2)}%`, p.x, p.y - 8);

    // Etiqueta inferior en el eje X: Nombre de Entidad
    ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = isPrint ? '#0F172A' : '#CBD5E1';
    ctx.textBaseline = 'top';
    const shortName = p.row.nombreEntidad.split('(')[0].trim();
    ctx.fillText(shortName, p.x, paddingTop + chartHeight + 10);

    // Código BCRP en JetBrains Mono
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.fillStyle = isPrint ? '#475569' : '#64748B';
    ctx.fillText(`[${p.row.codigoBcrp}]`, p.x, paddingTop + chartHeight + 24);
    ctx.restore();
  });

  ctx.restore();

  // Guardar puntos calculados para interactividad y tooltip flotante
  window.__chartPoints = points;
  if (!isPrint) {
    setupChartHoverTooltip(c);
  }
}

/**
 * Configuración del Tooltip Interactivo Flotante sobre el Canvas del Gráfico
 */
function setupChartHoverTooltip(canvas) {
  if (!canvas || canvas.__hasHoverListener) return;
  canvas.__hasHoverListener = true;

  const tooltip = document.getElementById('chartTooltip');

  canvas.addEventListener('mousemove', (e) => {
    if (!window.__chartPoints || !window.__chartPoints.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closest = null;
    let minDist = 48; // Radio de detección en píxeles

    window.__chartPoints.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    if (closest && tooltip) {
      const r = closest.row;
      const cumpleSla = r.uptimePct >= 99.90;
      const statusPillClass = cumpleSla ? 'badge-reg-status resuelto' : 'badge-reg-status atencion';
      const statusText = cumpleSla ? '🟢 Conforme BCRP' : '🟡 Observación SLA';
      const diff = (r.uptimePct - 99.90).toFixed(2);
      const diffLabel = cumpleSla ? `+${diff}% sobre meta` : `${diff}% bajo meta`;

      tooltip.innerHTML = `
        <div class="chart-tooltip-header">
          <span class="tooltip-entity">${escapeHTML(r.nombreEntidad)}</span>
          <span class="tooltip-code">${escapeHTML(r.codigoBcrp)}</span>
        </div>
        <div class="tooltip-row">
          <span>Disponibilidad:</span>
          <span class="tooltip-val ${cumpleSla ? 'ok' : 'warn'}">${r.uptimePct.toFixed(2)}%</span>
        </div>
        <div class="tooltip-row">
          <span>Estado Normativo:</span>
          <span class="${statusPillClass}">${statusText}</span>
        </div>
        <div class="tooltip-row">
          <span>Brecha SLA BCRP:</span>
          <span style="font-size:0.68rem; font-weight:700; color:${cumpleSla ? '#34D399' : '#FBBF24'};">${diffLabel}</span>
        </div>
        <div class="tooltip-row">
          <span>Tiempo Solución:</span>
          <span class="tooltip-val">${(Number(r.mttrMinutos) || 0).toFixed(1)} min</span>
        </div>
        <div class="tooltip-row">
          <span>Tiempo Detección:</span>
          <span class="tooltip-val">${(Number(r.mttdMinutos) || 0).toFixed(1)} min</span>
        </div>
      `;

      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y}px`;
      tooltip.classList.add('active');
    } else if (tooltip) {
      tooltip.classList.remove('active');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.remove('active');
  });
}

/**
 * Registro Canónico de Eventos Regulatorios Oficiales (Circular BCRP N° 0014-2023)
 */
const EVENTOS_REGULATORIOS = [
  {
    ticket: 'INC-20261031-10001',
    idEntidad: 1,
    codigoBcrp: '002',
    entidadNombre: 'Banco de Crédito (BCP)',
    categoria: 'Disponibilidad de Servicios',
    severidad: 'CRITICA',
    tiempoDeteccion: 1.0,
    tiempoSolucion: 95.5,
    estado: 'EN_ATENCION',
    descripcion: 'Interrupción en canal de pagos inmediatos. Contingencia de enrutamiento activada.',
    hashCert: 'e3b0c44298fc1c14'
  },
  {
    ticket: 'INC-20261031-10002',
    idEntidad: 5,
    codigoBcrp: '901',
    entidadNombre: 'CCE (Switch Central)',
    categoria: 'Canal de Compensación',
    severidad: 'ALTA',
    tiempoDeteccion: 2.0,
    tiempoSolucion: 120.0,
    estado: 'EN_ATENCION',
    descripcion: 'Latencia transitoria en cámara compensatoria; canal secundario operando.',
    hashCert: '7f83b1657ff1fc53'
  },
  {
    ticket: 'INC-20261028-09945',
    idEntidad: 2,
    codigoBcrp: '003',
    entidadNombre: 'BBVA Perú / Interbank',
    categoria: 'Autenticación y Liquidación',
    severidad: 'MEDIA',
    tiempoDeteccion: 1.0,
    tiempoSolucion: 45.0,
    estado: 'RESUELTO',
    descripcion: 'Restablecido al 100% con conformidad técnica y validación de saldos BCRP.',
    hashCert: '185f8db32271fe25'
  },
  {
    ticket: 'INC-20261015-09820',
    idEntidad: 1,
    codigoBcrp: '002',
    entidadNombre: 'Banco de Crédito (BCP)',
    categoria: 'Pasarela Inmediata',
    severidad: 'BAJA',
    tiempoDeteccion: 1.2,
    tiempoSolucion: 26.5,
    estado: 'RESUELTO',
    descripcion: 'Cierre auditado sin afectación a saldos de participantes ni reintentos fallidos.',
    hashCert: '2c26b46b68ffc68e'
  }
];

let currentEventFilterStatus = 'todos';
let currentEventSearchQuery = '';

/**
 * Renderizado de Tabla de Eventos Regulatorios (Pestaña 2) con Búsqueda y Filtros
 */
function renderEventosRegulatorios() {
  const tbody = document.getElementById('tbodyEventosRegulatorios');
  if (!tbody) return;

  const ent = document.getElementById('fEntidad')?.value;
  let filtered = EVENTOS_REGULATORIOS;

  if (ent) {
    filtered = filtered.filter(e => String(e.idEntidad) === ent);
  }

  if (currentEventFilterStatus === 'atencion') {
    filtered = filtered.filter(e => e.estado === 'EN_ATENCION');
  } else if (currentEventFilterStatus === 'resuelto') {
    filtered = filtered.filter(e => e.estado === 'RESUELTO');
  }

  if (currentEventSearchQuery.trim()) {
    const q = currentEventSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(e => 
      e.ticket.toLowerCase().includes(q) ||
      e.entidadNombre.toLowerCase().includes(q) ||
      e.categoria.toLowerCase().includes(q) ||
      e.descripcion.toLowerCase().includes(q)
    );
  }

  const badgeCount = document.getElementById('badgeEventosCount');
  if (badgeCount) {
    badgeCount.textContent = `${filtered.length} Registros`;
  }

  const paginationText = document.getElementById('eventsPaginationText');
  if (paginationText) {
    paginationText.textContent = `Mostrando 1 - ${filtered.length} de ${filtered.length} eventos regulatorios`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:22px; color:#64748B;">
          No se encontraron eventos regulatorios para el filtro seleccionado.
        </td>
      </tr>
    `;
    return;
  }

  const html = filtered.map(ev => {
    const isAtencion = ev.estado === 'EN_ATENCION';
    const statusBadge = isAtencion
      ? `<span class="badge-reg-status atencion"><span class="sla-dot" style="background:#EF4444;"></span>EN ATENCIÓN</span>`
      : `<span class="badge-reg-status resuelto"><span class="sla-dot" style="background:#10B981;"></span>RESUELTO &amp; AUDITADO</span>`;

    let sevBadge = `<span class="badge-reg-sev baja">BAJA</span>`;
    if (ev.severidad === 'CRITICA') sevBadge = `<span class="badge-reg-sev critica">CRÍTICA</span>`;
    else if (ev.severidad === 'ALTA') sevBadge = `<span class="badge-reg-sev alta">ALTA</span>`;
    else if (ev.severidad === 'MEDIA') sevBadge = `<span class="badge-reg-sev media">MEDIA</span>`;

    return `
      <tr>
        <td style="font-family:'JetBrains Mono', monospace; font-weight:700; color:#38BDF8;">${escapeHTML(ev.ticket)}</td>
        <td style="font-weight:600; color:var(--text-primary); font-family:var(--font-sans);">
          ${escapeHTML(ev.entidadNombre)} <span style="font-family:'JetBrains Mono'; font-size:0.68rem; color:#64748B;">[${escapeHTML(ev.codigoBcrp)}]</span>
        </td>
        <td>${escapeHTML(ev.categoria)}</td>
        <td style="text-align:center;">${sevBadge}</td>
        <td style="font-family:'JetBrains Mono'; font-weight:600; text-align:right;">${ev.tiempoDeteccion.toFixed(1)} min</td>
        <td style="font-family:'JetBrains Mono'; font-weight:600; text-align:right;">${ev.tiempoSolucion.toFixed(1)} min</td>
        <td style="text-align:center;">${statusBadge}</td>
        <td>
          <span style="font-family:'JetBrains Mono'; font-size:0.68rem; color:#E2B357; background:rgba(226,179,87,0.1); padding:2px 6px; border-radius:4px;" title="Hash SHA-256 verificado: ${ev.hashCert}">
            ${ev.hashCert}…
          </span>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = sanitizeTableHtml(html);
}

/**
 * Renderizado de Tarjetas de Resumen Comparativo por Entidad (Pestaña 3)
 */
function renderEntityDistributionCards(rows) {
  const container = document.getElementById('entityDistributionCards');
  if (!container || !rows) return;

  const cardsHtml = rows.map(r => {
    const cumpleSla = r.uptimePct >= 99.90;
    const barGrad = cumpleSla ? 'linear-gradient(90deg, #059669, #10B981)' : 'linear-gradient(90deg, #D97706, #F59E0B)';
    const pctColor = cumpleSla ? '#34D399' : '#FBBF24';
    const clamped = Math.min(100, Math.max(0, Number(r.uptimePct) || 0));

    return `
      <div class="entity-card-mini">
        <div class="entity-card-header">
          <span class="entity-card-name">${escapeHTML(r.nombreEntidad)}</span>
          <span class="entity-card-code">[${escapeHTML(r.codigoBcrp)}]</span>
        </div>
        <div class="entity-card-bar-track" title="${r.uptimePct.toFixed(2)}% de disponibilidad">
          <div class="entity-card-bar-fill" style="width:${clamped}%; background:${barGrad};"></div>
        </div>
        <div class="entity-card-footer">
          <span style="color:${pctColor}; font-weight:700;" class="entity-uptime-val">${r.uptimePct.toFixed(2)}% SLA</span>
          <span style="font-size:0.67rem; color:${cumpleSla ? '#10B981' : '#F59E0B'}; font-weight:600;">
            ${cumpleSla ? '🟢 Conforme' : '🟡 Observado'}
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

/**
 * Inicialización de Chips de Rango Rápido de Fechas (Bread Top)
 */
function initQuickDateChips() {
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const range = chip.getAttribute('data-range');
      const now = new Date();
      const toLocalISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      const fD = document.getElementById('fDesde');
      const fH = document.getElementById('fHasta');

      if (range === 'hoy') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        if (fD) fD.value = toLocalISO(startOfDay);
        if (fH) fH.value = toLocalISO(now);
      } else if (range === '24h') {
        const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (fD) fD.value = toLocalISO(h24);
        if (fH) fH.value = toLocalISO(now);
      } else if (range === 'semana') {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (fD) fD.value = toLocalISO(weekStart);
        if (fH) fH.value = toLocalISO(now);
      } else if (range === 'mes') {
        if (fD) fD.value = '2026-10-01T00:00';
        if (fH) fH.value = '2026-10-31T23:59';
      }

      if (window.SoundFX && typeof window.SoundFX.playClick === 'function') {
        window.SoundFX.playClick();
      }
      cargar();
    });
  });
}

/**
 * Inicialización de Filtros y Búsqueda de Eventos Regulatorios (Pestaña 2)
 */
function initEventFilters() {
  const chips = document.querySelectorAll('.event-filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentEventFilterStatus = chip.getAttribute('data-status') || 'todos';
      renderEventosRegulatorios();
      if (window.SoundFX && typeof window.SoundFX.playClick === 'function') {
        window.SoundFX.playClick();
      }
    });
  });

  const searchInput = document.getElementById('inputSearchEvents');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentEventSearchQuery = e.target.value || '';
      renderEventosRegulatorios();
    });
  }
}

const DEFAULT_KPIS = { totalIncidentes: 4, activos: 2, cerrados: 2, mttrGlobalMinutos: 71.8, mttdGlobalMinutos: 1.3, uptimeGlobalPct: 99.76 };
let lastLoadedRows = MOCK;
let lastLoadedKpis = DEFAULT_KPIS;

/**
 * Aplicación de datos a componentes visuales (Ribbon de KPIs, tablas, cards y gráficos)
 */
function aplicarDatos(rows, kpis) {
  if (!rows || !kpis) return;
  lastLoadedRows = rows;
  lastLoadedKpis = kpis;
  const ent = document.getElementById('fEntidad')?.value;
  const view = ent ? rows.filter(r => String(r.idEntidad) === ent) : rows;

  // Cálculo dinámico de KPIs según la entidad seleccionada o vista global
  let effectiveKpis = { ...kpis };
  if (ent) {
    const selectedRow = rows.find(r => String(r.idEntidad) === ent);
    if (selectedRow) {
      const entEvents = EVENTOS_REGULATORIOS.filter(ev => String(ev.idEntidad) === ent);
      const activosCount = entEvents.filter(ev => ev.estado === 'EN_ATENCION').length;
      const cerradosCount = entEvents.filter(ev => ev.estado === 'RESUELTO').length;
      effectiveKpis = {
        totalIncidentes: selectedRow.totalIncidentes,
        activos: activosCount,
        cerrados: cerradosCount,
        mttrGlobalMinutos: selectedRow.mttrMinutos,
        mttdGlobalMinutos: selectedRow.mttdMinutos,
        uptimeGlobalPct: selectedRow.uptimePct
      };
    }
  }

  // Renderizar tabla de desglose por entidad en Pestaña 3
  const tbody = document.getElementById('tbodyIndisp');
  if (tbody) {
    const rawRows = view.map(r => {
      const cumpleSla = r.uptimePct >= 99.90;
      const statusClass = cumpleSla ? 'badge-sla-ok' : 'badge-sla-warn';
      const statusLabel = cumpleSla ? 'CUMPLE META' : 'EN ATENCIÓN';
      const pctColorHex = cumpleSla ? '#34D399' : '#FBBF24';
      const barFillGrad = cumpleSla ? 'linear-gradient(90deg, #059669, #10B981)' : 'linear-gradient(90deg, #D97706, #F59E0B)';
      const clampedPct = Math.min(100, Math.max(0, Number(r.uptimePct) || 0));

      const nombreSafe = escapeHTML(r.nombreEntidad);
      const codigoSafe = escapeHTML(r.codigoBcrp);
      const totalIncSafe = parseInt(r.totalIncidentes, 10) || 0;
      const criticosSafe = parseInt(r.incidentesCriticos, 10) || 0;
      const mttrSafe = escapeHTML((Number(r.mttrMinutos) || 0).toFixed(1));
      const mttdSafe = escapeHTML((Number(r.mttdMinutos) || 0).toFixed(1));
      const minIndispSafe = parseInt(r.minutosIndisponibles, 10) || 0;
      const uptimeSafe = escapeHTML((Number(r.uptimePct) || 0).toFixed(2));
      const statusLabelSafe = escapeHTML(statusLabel);

      return `
      <tr>
        <td style="font-weight:600; color:var(--text-primary); font-family:var(--font-sans);">${nombreSafe}</td>
        <td class="ticket-mono">${codigoSafe}</td>
        <td style="font-family:var(--font-mono); font-weight:600; text-align:center;">${totalIncSafe}</td>
        <td style="text-align:center;"><span class="badge-severidad ${criticosSafe > 0 ? 'critica' : 'baja'}">${criticosSafe}</span></td>
        <td style="font-family:var(--font-mono); font-weight:600; text-align:right;">${mttrSafe}</td>
        <td style="font-family:var(--font-mono); font-weight:600; text-align:right;">${mttdSafe}</td>
        <td style="font-family:var(--font-mono); font-weight:600; text-align:right;">${minIndispSafe}</td>
        <td>
          <div class="sla-progress-cell">
            <div class="sla-progress-header">
              <span class="sla-progress-val" style="color:${pctColorHex};">${uptimeSafe}%</span>
              <span class="badge-sla ${statusClass}">
                <span class="sla-dot"></span>
                <span>${statusLabelSafe}</span>
              </span>
            </div>
            <div class="sla-progress-track" title="Disponibilidad: ${uptimeSafe}% | Meta BCRP: >= 99.90%">
              <div class="sla-progress-fill" style="width:${clampedPct}%; background:${barFillGrad};"></div>
            </div>
          </div>
        </td>
      </tr>
      `;
    }).join('');
    tbody.innerHTML = sanitizeTableHtml(rawRows);
  }

  // Actualizar los 6 KPIs del Ribbon Continuo de Métricas en Vidrio Esmerilado
  const kTot = document.getElementById('kTotal');
  const kAct = document.getElementById('kActivos');
  const kCer = document.getElementById('kCerrados');
  const kMttr = document.getElementById('kMttr');
  const kMttd = document.getElementById('kMttd');
  const kUpt = document.getElementById('kUptime');

  if (kTot) kTot.innerText = effectiveKpis.totalIncidentes;
  if (kAct) kAct.innerText = effectiveKpis.activos;
  if (kCer) kCer.innerText = effectiveKpis.cerrados;
  if (kMttr) kMttr.innerText = (Number(effectiveKpis.mttrGlobalMinutos) || 0).toFixed(1);
  if (kMttd) kMttd.innerText = (Number(effectiveKpis.mttdGlobalMinutos) || 0).toFixed(1);

  const uptimeVal = Number(effectiveKpis.uptimeGlobalPct) || 99.76;
  if (kUpt) {
    kUpt.innerText = uptimeVal.toFixed(2) + '%';
    kUpt.style.color = uptimeVal >= 99.90 ? '#38BDF8' : '#F59E0B';
  }

  const kUptStatus = document.getElementById('kUptimeStatus');
  if (kUptStatus) {
    if (uptimeVal >= 99.90) {
      kUptStatus.innerText = '🟢 Operación Estable';
      kUptStatus.className = 'kpi-meta-sub success';
    } else {
      kUptStatus.innerText = '🟡 Observación SLA';
      kUptStatus.className = 'kpi-meta-sub warn';
    }
  }

  // Renderizar tarjetas de resumen por entidad en Pestaña 3
  renderEntityDistributionCards(rows);

  // Renderizar tabla de eventos regulatorios en Pestaña 2
  renderEventosRegulatorios();

  // Sincronizar Scorecard de Impresión Oficial BCRP
  sincronizarMetadatosImpresion(effectiveKpis);

  // Redibujar gráfico de disponibilidad
  drawChart(view);

  // Poblar select si no tiene opciones cargadas
  const sel = document.getElementById('fEntidad');
  if (sel && sel.options.length <= 1) {
    rows.forEach(r => {
      const o = document.createElement('option');
      o.value = r.idEntidad;
      o.text = `${r.nombreEntidad} (${r.codigoBcrp})`;
      sel.appendChild(o);
    });
  }
}

/**
 * Carga de datos y Ribbon Continuo de KPIs
 */
async function cargar() {
  // Pre-renderizado inmediato con MOCK para visualización instantánea (Zero UI Latency)
  if (!window.__hasInitialRender) {
    aplicarDatos(MOCK, DEFAULT_KPIS);
    window.__hasInitialRender = true;
  }

  let rows, kpis;
  try {
    rows = await getJSON('/reportes/indisponibilidad');
    kpis = await getJSON('/reportes/kpis');
    const pill = document.getElementById('backendStatusPill') || document.getElementById('connPill');
    const dot = document.getElementById('backendStatusDot');
    const text = document.getElementById('backendStatusText');
    if (pill) {
      pill.classList.remove('offline');
      pill.classList.add('online');
      if (text) text.innerText = 'Supervisión Activa (Switch Central CCE)';
      if (dot) {
        dot.className = 'status-dot online';
        dot.style.background = '#10B981';
      }
    }
    aplicarDatos(rows, kpis);
  } catch (e) {
    rows = MOCK;
    kpis = DEFAULT_KPIS;
    const pill = document.getElementById('backendStatusPill') || document.getElementById('connPill');
    const dot = document.getElementById('backendStatusDot');
    const text = document.getElementById('backendStatusText');
    if (pill) {
      pill.classList.remove('online');
      pill.classList.add('offline');
      if (text) text.innerText = 'Modo Demostración Regulatoria';
      if (dot) {
        dot.className = 'status-dot';
        dot.style.background = '#F59E0B';
      }
    }
    aplicarDatos(rows, kpis);
  }
}

// Configurar fechas por defecto al inicio del mes corriente
function inicializarFechas() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0);
  const toLocalISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  
  const fD = document.getElementById('fDesde');
  const fH = document.getElementById('fHasta');
  if (fD && !fD.value) fD.value = toLocalISO(firstDay);
  if (fH && !fH.value) fH.value = toLocalISO(now);
}

// Eventos de usuario
document.getElementById('btnAplicar')?.addEventListener('click', cargar);

document.getElementById('fEntidad')?.addEventListener('change', () => {
  aplicarDatos(lastLoadedRows, lastLoadedKpis);
  if (window.SoundFX && typeof window.SoundFX.playClick === 'function') {
    window.SoundFX.playClick();
  }
});

document.getElementById('btnCSV')?.addEventListener('click', () => {
  const activePane = document.querySelector('.sandwich-pane.active');
  const isEventosActive = activePane && activePane.id === 'pane-eventos';

  if (isEventosActive) {
    const tableRows = [...document.querySelectorAll('#tbodyEventosRegulatorios tr')];
    if (!tableRows.length) {
      alert('No hay eventos regulatorios para exportar.');
      return;
    }
    const rows = tableRows.map(tr => {
      return [...tr.children].map(td => td.innerText.replace(/[\r\n]+/g, ' ').replace(/;/g, ',').replace(/\s+/g, ' ').trim()).join(';');
    }).join('\r\n');
    const headers = 'Ticket;Entidad;Categoria;Severidad;TiempoDeteccion_min;TiempoSolucion_min;Estado;SelloSHA256\r\n';
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `EVENTOS_REGULATORIOS_BCRP_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    return;
  }

  const tableRows = [...document.querySelectorAll('#tbodyIndisp tr')];
  if (!tableRows.length) {
    alert('No hay registros de indisponibilidad para exportar.');
    return;
  }
  const rows = tableRows.map(tr => {
    return [...tr.children].map(td => {
      // Extraer texto limpio de la celda, priorizando el valor de la barra de progreso SLA
      const slaVal = td.querySelector('.sla-progress-val');
      if (slaVal) {
        return slaVal.innerText.trim();
      }
      return td.innerText.replace(/[\r\n]+/g, ' ').replace(/;/g, ',').replace(/\s+/g, ' ').trim();
    }).join(';');
  }).join('\r\n');

  const headers = 'Entidad;CodigoBCRP;TotalIncidentes;CasosCriticos;TiempoSolucion_min;TiempoDeteccion_min;MinutosFueraServicio;Disponibilidad_Pct\r\n';
  // UTF-8 BOM (\uFEFF) para visualización inmediata y correcta en Microsoft Excel sin problemas de codificación
  const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `INDISPONIBILIDAD_BCRP_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
});

/**
 * Sincronización de indicadores del Scorecard de Impresión Oficial BCRP
 */
function sincronizarMetadatosImpresion(kpis) {
  if (!kpis) return;
  const scoreUpt = document.getElementById('printScoreUptime');
  if (scoreUpt) {
    const val = kpis.uptimeGlobalPct !== undefined ? kpis.uptimeGlobalPct : 99.76;
    scoreUpt.innerText = (Number(val) || 99.76).toFixed(2) + '%';
  }
  const scoreTot = document.getElementById('printScoreTotal');
  if (scoreTot) scoreTot.innerText = kpis.totalIncidentes !== undefined ? kpis.totalIncidentes : '4';

  const scoreMttd = document.getElementById('printScoreMttd');
  if (scoreMttd) {
    const val = kpis.mttdGlobalMinutos !== undefined ? kpis.mttdGlobalMinutos : 1.3;
    scoreMttd.innerText = (Number(val) || 1.3).toFixed(1);
  }

  const scoreMttr = document.getElementById('printScoreMttr');
  if (scoreMttr) {
    const val = kpis.mttrGlobalMinutos !== undefined ? kpis.mttrGlobalMinutos : 71.8;
    scoreMttr.innerText = (Number(val) || 71.8).toFixed(1);
  }

  // Actualizar fecha PET
  const ahora = new Date();
  const fechaPet = ahora.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const elFecha = document.getElementById('printEmissionDate');
  if (elFecha) elFecha.innerText = `${fechaPet} PET`;
  const elCertTime = document.getElementById('printCertTimestamp');
  if (elCertTime) elCertTime.innerText = `${fechaPet} PET`;
}

/**
 * Preparación del Documento Formal de Impresión y Certificación BCRP
 * Sincroniza metadatos oficiales, fecha PET, Scorecard y Sello SHA-256 inmutable
 */
async function prepararImpresionOficial() {
  window.__isPrinting = true;

  // 1. Fecha y hora oficial en PET (Hora Legal del Perú: UTC-5)
  const ahora = new Date();
  const fechaPet = ahora.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const textoFechaPet = `${fechaPet} PET (UTC-5)`;

  const elFecha = document.getElementById('printEmissionDate');
  if (elFecha) elFecha.innerText = textoFechaPet;

  const elCertTime = document.getElementById('printCertTimestamp');
  if (elCertTime) elCertTime.innerText = textoFechaPet;

  // 2. Sincronizar Scorecard de Impresión desde los KPIs actuales
  const kUpt = document.getElementById('kUptime')?.innerText || '99.76%';
  const kTot = document.getElementById('kTotal')?.innerText || '4';
  const kMttd = document.getElementById('kMttd')?.innerText || '1.3';
  const kMttr = document.getElementById('kMttr')?.innerText || '71.8';

  const scoreUpt = document.getElementById('printScoreUptime');
  if (scoreUpt) scoreUpt.innerText = kUpt.endsWith('%') ? kUpt : kUpt + '%';

  const scoreTot = document.getElementById('printScoreTotal');
  if (scoreTot) scoreTot.innerText = kTot;

  const scoreMttd = document.getElementById('printScoreMttd');
  if (scoreMttd) scoreMttd.innerText = kMttd;

  const scoreMttr = document.getElementById('printScoreMttr');
  if (scoreMttr) scoreMttr.innerText = kMttr;

  // 3. Generar Hash SHA-256 canónico inmutable de certificación
  try {
    const fD = document.getElementById('fDesde')?.value || '2026-10-01';
    const fH = document.getElementById('fHasta')?.value || '2026-10-31';
    const payloadCert = [
      'BCRP_CERTIFICACION_OFICIAL_SWITCH_CCE',
      'CIRCULAR_BCRP_N_0014_2023',
      `RANGO_EVALUACION:${fD}_A_${fH}`,
      `UPTIME_GLOBAL:${scoreUpt?.innerText || '99.76%'}`,
      'META_EXIGIDA:99.90%',
      `TOTAL_INCIDENTES:${scoreTot?.innerText || '4'}`,
      `TIEMPO_DETECCION_MIN:${scoreMttd?.innerText || '1.3'}`,
      `TIEMPO_SOLUCION_MIN:${scoreMttr?.innerText || '71.8'}`,
      'ENTIDADES:BCP(002)|INTERBANK_BBVA(003)|CAJA_CUSCO(801)|CAJA_DE_LOS_ANDES(812)|CCE_SWITCH(901)',
      'AUTOR_LEAD:Frank Emiliano Vargas Huaman (Frankosyni / Francus.)',
      'JURADO_REVISOR:Prof. Juan Antonio Zamata Mendoza',
      'MARCO_ACADEMICO:Curso Integrador I - Sistemas Software - Seccion 57524 (UTP)',
      `TIMESTAMP_PET:${textoFechaPet}`
    ].join('||');

    const shaHash = await calcularSha256(payloadCert);
    const elCertHash = document.getElementById('printCertHash');
    if (elCertHash) {
      elCertHash.innerText = shaHash;
    }

    // Sincronizar tabla de eventos regulatorios de imprenta
    const printTbody = document.getElementById('printTbodyEventos');
    if (printTbody) {
      const ent = document.getElementById('fEntidad')?.value;
      let evs = EVENTOS_REGULATORIOS;
      if (ent) {
        evs = evs.filter(e => String(e.idEntidad) === ent);
      }
      printTbody.innerHTML = evs.map(ev => `
        <tr style="border-bottom:1px solid #E2E8F0;">
          <td style="padding:4px; font-family:monospace; font-weight:700;">${escapeHTML(ev.ticket)}</td>
          <td style="padding:4px; font-weight:600;">${escapeHTML(ev.entidadNombre)} [${escapeHTML(ev.codigoBcrp)}]</td>
          <td style="padding:4px;">${escapeHTML(ev.categoria)}</td>
          <td style="padding:4px; text-align:center; color:${ev.severidad === 'CRITICA' ? '#DC2626' : (ev.severidad === 'ALTA' ? '#D97706' : '#2563EB')}; font-weight:700;">${escapeHTML(ev.severidad)}</td>
          <td style="padding:4px; text-align:right; font-family:monospace;">${ev.tiempoDeteccion.toFixed(1)} min</td>
          <td style="padding:4px; text-align:right; font-family:monospace;">${ev.tiempoSolucion.toFixed(1)} min</td>
          <td style="padding:4px; text-align:center; color:${ev.estado === 'EN_ATENCION' ? '#DC2626' : '#16A34A'}; font-weight:700;">${ev.estado === 'EN_ATENCION' ? 'EN ATENCIÓN' : 'RESUELTO & AUDITADO'}</td>
          <td style="padding:4px; font-family:monospace; font-size:6pt;">${ev.hashCert}…</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn('[Print Studio] Error al calcular hash de certificación:', err);
  }

  // 4. Redibujar gráfico en modo de alta fidelidad para imprenta
  if (currentViewRows && currentViewRows.length > 0) {
    drawChart(currentViewRows, true);
  }
}

// Invocación del Diálogo de Impresión y Exportación Oficial en PDF
document.getElementById('btnPrint')?.addEventListener('click', async () => {
  try {
    await prepararImpresionOficial();
    setTimeout(() => {
      window.print();
    }, 120);
  } catch (err) {
    console.error('Error al invocar impresión de PDF:', err);
    alert('No se pudo abrir el diálogo de impresión: ' + err.message);
  }
});

// Sincronización con el ciclo de vida nativo de impresión del navegador
window.addEventListener('beforeprint', async () => {
  await prepararImpresionOficial();
});

window.addEventListener('afterprint', () => {
  window.__isPrinting = false;
  if (currentViewRows && currentViewRows.length > 0) {
    drawChart(currentViewRows, false);
  }
});

// Redibujar responsivamente el gráfico al cambiar resolución de pantalla o zoom
window.addEventListener('resize', () => {
  if (currentViewRows && currentViewRows.length > 0) {
    drawChart(currentViewRows);
  }
});

document.getElementById('btnSFT')?.addEventListener('click', async () => {
  const ent = document.getElementById('fEntidad')?.value;
  let url = BASE + '/reportes/generar-sft';
  const query = qp();
  if (query) {
    url += query;
    if (ent) url += `&idEntidad=${ent}`;
  } else if (ent) {
    url += `?idEntidad=${ent}`;
  }

  try {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: AUTH } });
    if (r.ok) {
      const j = await r.json();
      lastSFT = j.contenidoPlano;
      lastHash = j.hashSha256;
      lastName = j.nombreArchivo || 'SFT_BCRP_PAGOS.txt';
    } else {
      throw new Error('Fallback local');
    }
  } catch (e) {
    // Generación matemática real en modo simulación
    const pad = (n) => String(n).padStart(2, '0');
    const ahora = new Date();
    const timestampNorm = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}-${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`;
    const numEnvio = `SFT-BCRP-${timestampNorm}`;
    const entFilter = document.getElementById('fEntidad')?.value;
    const view = entFilter ? MOCK.filter(r => String(r.idEntidad) === entFilter) : MOCK.filter(r => r.totalIncidentes > 0);

    // Formato oficial normativo BCRP: HEADER 01 | DETALLE 02 | FOOTER 03
    let raw = `HEADER|${numEnvio}|${timestampNorm}|${view.length}\n`;
    view.forEach((r, idx) => {
      raw += `DETALLE|INC-20261003-${10001 + idx}|${r.codigoBcrp}|${r.nombreEntidad}|DISP_SERV|CRITICA|20261003-093000|20261003-110500|AUTOMATICO|SWITCH_PAGOS\n`;
    });

    // Calcular hash SHA-256 criptográfico con Web Crypto API defensivo (64 caracteres hex)
    const hash = await calcularSha256(raw);
    raw += `FOOTER|${hash}`;

    lastSFT = raw;
    lastHash = hash;
    lastName = `SFT_BCRP_PAGOS_${timestampNorm}.txt`;
  }

  document.getElementById('sftPreview').innerText = lastSFT;
  document.getElementById('sftHash').innerText = lastHash;
});

document.getElementById('btnDL')?.addEventListener('click', () => {
  if (!lastSFT) {
    alert('Primero genere el archivo SFT haciendo clic en "Generar SFT con filtros".');
    return;
  }
  const blob = new Blob([lastSFT], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = lastName;
  a.click();
});

document.getElementById('btnHist')?.addEventListener('click', async () => {
  try {
    const r = await fetch(BASE + '/reportes', { headers: { Authorization: AUTH } });
    if (r.ok) {
      const list = await r.json();
      const rawList = list.map(x => {
        const idSafe = parseInt(x.idReporte ?? x.id, 10) || 0;
        const numEnvioSafe = escapeHTML(x.numeroEnvio);
        const nombreArchivoSafe = escapeHTML(x.nombreArchivo);
        const totalRegSafe = parseInt(x.totalRegistros, 10) || 0;
        const hashRaw = String(x.hashSha256 || '');
        const hashDisplay = escapeHTML(hashRaw.slice(0, 16));
        return `
        <tr>
          <td>${idSafe}</td>
          <td class="ticket-mono">${numEnvioSafe}</td>
          <td>${nombreArchivoSafe}</td>
          <td>${totalRegSafe}</td>
          <td style="font-family:var(--font-mono);font-size:.7rem;color:#38BDF8">${hashDisplay}…</td>
          <td><button class="btn-action-table" onclick="window.open('${BASE}/reportes/${idSafe}/descargar-txt')">TXT</button></td>
        </tr>
      `}).join('');
      return;
    }
    throw new Error('Fallback');
  } catch (e) {
    // Historial simulado para demostración sin backend activo
    const mockHist = [
      { idReporte: 1, numeroEnvio: 'SFT-BCRP-20260901-0800', nombreArchivo: 'SFT_BCRP_PAGOS_20260901.txt', totalRegistros: 3, hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
      { idReporte: 2, numeroEnvio: 'SFT-BCRP-20260915-1830', nombreArchivo: 'SFT_BCRP_PAGOS_20260915.txt', totalRegistros: 2, hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
      { idReporte: 3, numeroEnvio: 'SFT-BCRP-20261001-0900', nombreArchivo: 'SFT_BCRP_PAGOS_20261001.txt', totalRegistros: 4, hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' }
    ];
    const rawMock = mockHist.map(x => {
      const idSafe = parseInt(x.idReporte, 10) || 0;
      const numEnvioSafe = escapeHTML(x.numeroEnvio);
      const nombreArchivoSafe = escapeHTML(x.nombreArchivo);
      const totalRegSafe = parseInt(x.totalRegistros, 10) || 0;
      const hashRaw = String(x.hashSha256 || '');
      const hashDisplay = escapeHTML(hashRaw.slice(0, 16));
      return `
      <tr>
        <td>${idSafe}</td>
        <td class="ticket-mono">${numEnvioSafe}</td>
        <td>${nombreArchivoSafe}</td>
        <td>${totalRegSafe}</td>
        <td style="font-family:var(--font-mono);font-size:.7rem;color:#38BDF8">${hashDisplay}…</td>
        <td><button class="btn-action-table" data-filename="${nombreArchivoSafe}" onclick="alert('Descargando archivo oficial firmado SHA-256: ' + this.getAttribute('data-filename'))">TXT</button></td>
      </tr>
    `}).join('');
  }
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
        relojEl.innerHTML = `<span class="clock-time">${horaStr} PET</span><span class="clock-date"> | ${fechaStr}</span>`;
    };
    actualizar();
    setInterval(actualizar, 1000);
}

// Inicialización del Tablero de Inteligencia Regulatoria
iniciarRelojUtc();
inicializarFechas();
initQuickDateChips();
initEventFilters();
cargar();
