/* ==========================================================================
   SIGIR - BCRP | Módulo de Reportes Clave & Compilador SFT (APF2)
   Lógica de Métricas (MTTR/MTTD/Uptime), Gráficos Reactivos y Sellado Criptográfico
   Autor: Frank Emiliano Vargas Huamán | Curso Integrador I (UTP)
   ========================================================================== */

const BASE = 'http://localhost:8080/api/v1';
const AUTH = 'Basic ' + btoa('operador.noc:Bcrp2026!');

const MOCK = [
  { idEntidad: 1, codigoBcrp: '002', nombreEntidad: 'BCP (Yape)', totalIncidentes: 2, incidentesCriticos: 2, mttrMinutos: 95.5, mttdMinutos: 1.0, minutosIndisponibles: 191, uptimePct: 99.56 },
  { idEntidad: 2, codigoBcrp: '003', nombreEntidad: 'Interbank (Plim)', totalIncidentes: 1, incidentesCriticos: 1, mttrMinutos: 45.0, mttdMinutos: 1.0, minutosIndisponibles: 45, uptimePct: 99.90 },
  { idEntidad: 3, codigoBcrp: '801', nombreEntidad: 'Caja Cusco (Tunki)', totalIncidentes: 0, incidentesCriticos: 0, mttrMinutos: 0.0, mttdMinutos: 0.0, minutosIndisponibles: 0, uptimePct: 100.00 },
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
  const r = await fetch(BASE + path + qp(), { headers: { Authorization: AUTH } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
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
 * Paleta: Fondo oscuro transparente, línea verde esmeralda con área degradada sutil, etiquetas en JetBrains Mono.
 */
function drawChart(rows) {
  const c = document.getElementById('chartUptime');
  if (!c) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;

  currentViewRows = rows || [];

  // Adaptación de resolución para pantallas Retina / High-DPI
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  const displayWidth = rect.width > 0 ? Math.floor(rect.width) : (c.parentElement ? c.parentElement.clientWidth : 800);
  const displayHeight = 220;

  // Ajustar dimensiones de buffer canvas
  if (c.width !== displayWidth * dpr || c.height !== displayHeight * dpr) {
    c.width = displayWidth * dpr;
    c.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  if (!rows || rows.length === 0) {
    ctx.fillStyle = '#64748B';
    ctx.font = '500 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sin datos de disponibilidad para el período seleccionado', displayWidth / 2, displayHeight / 2);
    ctx.restore();
    return;
  }

  const paddingLeft = 65;
  const paddingRight = 45;
  const paddingTop = 36;
  const paddingBottom = 48;
  const chartWidth = displayWidth - paddingLeft - paddingRight;
  const chartHeight = displayHeight - paddingTop - paddingBottom;

  // Escala vertical dinámica
  const minVal = Math.min(...rows.map(r => r.uptimePct));
  const minScale = Math.min(99.0, Math.floor(minVal * 10) / 10);
  const maxScale = 100.08;
  const scaleRange = maxScale - minScale;

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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
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

      ctx.fillText(g.label, paddingLeft - 8, gy);
    }
  });
  ctx.restore();

  // Línea de referencia normativa SLA BCRP (99.90%)
  const slaTarget = 99.90;
  const slaY = getY(slaTarget);

  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(paddingLeft, slaY);
  ctx.lineTo(displayWidth - paddingRight, slaY);
  ctx.stroke();

  // Etiqueta SLA normativa
  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Meta SLA BCRP (99.90%)', displayWidth - paddingRight, slaY - 4);
  ctx.restore();

  // Cálculo de puntos de datos (X, Y)
  const points = rows.map((r, i) => {
    const x = rows.length === 1 
      ? paddingLeft + chartWidth / 2 
      : paddingLeft + i * (chartWidth / (rows.length - 1));
    const y = getY(r.uptimePct);
    return { x, y, row: r };
  });

  // 1. Área degradada sutil bajo la curva
  ctx.save();
  const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
  areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.32)'); // Verde esmeralda translúcido superior
  areaGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.08)');
  areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.00)'); // Transparente en base

  ctx.beginPath();
  ctx.moveTo(points[0].x, paddingTop + chartHeight);
  ctx.lineTo(points[0].x, points[0].y);

  if (points.length > 1) {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, curr.x, curr.y);
    }
  }

  ctx.lineTo(points[points.length - 1].x, paddingTop + chartHeight);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();
  ctx.restore();

  // 2. Línea ejecutiva verde esmeralda con resplandor sutil
  ctx.save();
  ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#10B981'; // Esmeralda FinTech
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length > 1) {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, curr.x, curr.y);
    }
  }
  ctx.stroke();
  ctx.restore();

  // 3. Nodos de datos, guías verticales y etiquetas en JetBrains Mono
  points.forEach(p => {
    const cumpleSla = p.row.uptimePct >= 99.90;
    const nodeColor = cumpleSla ? '#10B981' : '#F59E0B';
    const textColor = cumpleSla ? '#34D399' : '#FBBF24';

    // Guía vertical punteada hacia el eje X
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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
    ctx.fillStyle = '#0F172A';
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
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = textColor;
    ctx.fillText(`${p.row.uptimePct.toFixed(2)}%`, p.x, p.y - 8);

    // Etiqueta inferior en el eje X: Nombre de Entidad
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.textBaseline = 'top';
    const shortName = p.row.nombreEntidad.split('(')[0].trim();
    ctx.fillText(shortName, p.x, paddingTop + chartHeight + 10);

    // Código BCRP en JetBrains Mono
    ctx.font = '500 10px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`[${p.row.codigoBcrp}]`, p.x, paddingTop + chartHeight + 25);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Carga de datos y KPIs
 */
async function cargar() {
  let rows, kpis;
  try {
    rows = await getJSON('/reportes/indisponibilidad');
    kpis = await getJSON('/reportes/kpis');
    const pill = document.getElementById('backendStatusPill') || document.getElementById('connPill');
    const dot = document.getElementById('backendStatusDot');
    const text = document.getElementById('backendStatusText');
    if (pill) {
      pill.className = 'backend-status-pill online';
      if (text) text.innerText = 'CONECTADO (PostgreSQL)';
      else pill.innerText = 'Backend Conectado (PostgreSQL)';
      if (dot) {
        dot.className = 'status-dot online';
        dot.style.background = '#10B981';
      }
    }
  } catch (e) {
    rows = MOCK;
    kpis = { totalIncidentes: 4, activos: 2, cerrados: 2, mttrGlobalMinutos: 71.8, mttdGlobalMinutos: 1.3, uptimeGlobalPct: 99.76 };
    const pill = document.getElementById('backendStatusPill') || document.getElementById('connPill');
    const dot = document.getElementById('backendStatusDot');
    const text = document.getElementById('backendStatusText');
    if (pill) {
      pill.className = 'backend-status-pill offline';
      if (text) text.innerText = 'MODO DEMO (Local Mock)';
      else pill.innerText = 'Modo Simulación (Autónomo)';
      if (dot) {
        dot.className = 'status-dot';
        dot.style.background = '#F59E0B';
      }
    }
  }

  const ent = document.getElementById('fEntidad')?.value;
  const view = ent ? rows.filter(r => String(r.idEntidad) === ent) : rows;

  const tbody = document.getElementById('tbodyIndisp');
  if (tbody) {
    tbody.innerHTML = view.map(r => {
      const cumpleSla = r.uptimePct >= 99.90;
      const statusClass = cumpleSla ? 'resuelto' : 'en_mitigacion';
      const statusLabel = cumpleSla ? 'SLA OK' : 'SLA EN RIESGO';
      const pctColorClass = cumpleSla ? 'sla-ok' : 'sla-warn';
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
        <td style="font-weight:600;color:var(--text-primary);">${nombreSafe}</td>
        <td class="ticket-mono">${codigoSafe}</td>
        <td>${totalIncSafe}</td>
        <td><span class="badge-severidad ${criticosSafe > 0 ? 'critica' : 'baja'}">${criticosSafe}</span></td>
        <td style="font-family:var(--font-mono);">${mttrSafe}</td>
        <td style="font-family:var(--font-mono);">${mttdSafe}</td>
        <td style="font-family:var(--font-mono);">${minIndispSafe}</td>
        <td>
          <div class="sla-progress-cell" style="display:flex;flex-direction:column;gap:4px;min-width:130px;">
            <div class="sla-progress-header" style="display:flex;justify-content:space-between;align-items:center;">
              <span class="sla-progress-val ${pctColorClass}" style="font-family:var(--font-mono);font-size:0.8rem;font-weight:700;color:${pctColorHex};">${uptimeSafe}%</span>
              <span class="badge-estado ${statusClass}" style="font-size:0.65rem;padding:1px 6px;">${statusLabelSafe}</span>
            </div>
            <div class="sla-progress-track" style="height:5px;width:100%;background:rgba(255,255,255,0.08);border-radius:9999px;overflow:hidden;position:relative;" title="Uptime: ${uptimeSafe}% | Meta SLA: >= 99.90%">
              <div class="sla-progress-fill ${pctColorClass}" style="height:100%;width:${clampedPct}%;background:${barFillGrad};border-radius:9999px;"></div>
            </div>
          </div>
        </td>
      </tr>
      `;
    }).join('');
  }

  // Actualizar KPIs de cabecera
  const kTot = document.getElementById('kTotal');
  const kAct = document.getElementById('kActivos');
  const kCer = document.getElementById('kCerrados');
  const kMttr = document.getElementById('kMttr');
  const kMttd = document.getElementById('kMttd');
  const kUpt = document.getElementById('kUptime');

  if (kTot) kTot.innerText = kpis.totalIncidentes;
  if (kAct) kAct.innerText = kpis.activos;
  if (kCer) kCer.innerText = kpis.cerrados;
  if (kMttr) kMttr.innerText = kpis.mttrGlobalMinutos;
  if (kMttd) kMttd.innerText = kpis.mttdGlobalMinutos;
  if (kUpt) {
    kUpt.innerText = kpis.uptimeGlobalPct + '%';
    kUpt.style.color = kpis.uptimeGlobalPct >= 99.90 ? '#38BDF8' : '#F59E0B';
  }

  drawChart(view);

  // Poblar select si no tiene opciones
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

document.getElementById('fEntidad')?.addEventListener('change', cargar);

document.getElementById('btnCSV')?.addEventListener('click', () => {
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

  const headers = 'Entidad;CodigoBCRP;IncidentesTotales;Criticos;MTTR_min;MTTD_min;MinutosIndisponibles;Uptime_Pct\r\n';
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

document.getElementById('btnPrint')?.addEventListener('click', () => {
  try {
    window.print();
  } catch (err) {
    console.error('Error al invocar impresión de PDF:', err);
    alert('No se pudo abrir el diálogo de impresión: ' + err.message);
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
      document.getElementById('tbodyHist').innerHTML = list.map(x => {
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
    document.getElementById('tbodyHist').innerHTML = mockHist.map(x => {
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
        <td><button class="btn-action-table" data-filename="${nombreArchivoSafe}" onclick="alert('Descargando archivo histórico firmado SHA-256: ' + this.getAttribute('data-filename'))">TXT</button></td>
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
        relojEl.textContent = `${horaStr} PET | ${fechaStr}`;
    };
    actualizar();
    setInterval(actualizar, 1000);
}

// Inicialización
iniciarRelojUtc();
inicializarFechas();
cargar();
