# 🧪 QA Report — `http://localhost:3000` — 2026-11-02T22:36:02-05:00 (PET)

> **Sistema Auditado:** Sistema Integral de Gestión de Incidentes Regulatorios (**SIGIR - BCRP**) · Supervisión Switch Central CCE & ISO 20022
> **Autor & Ingeniero Principal de QA / NOC Lead:** Frank Emiliano Vargas Huamán (`Frankosyni` / `Φρανκοσύνη/Francus.` `@frankitoromas-tech`)
> **Curso & Evaluación:** Curso Integrador I - Sistemas Software (Sección 57524 - UTP) · Evaluador: Prof. Juan Antonio Zamata Mendoza
> **Suite Automatizada Ejecutada:** [`05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py`](../05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py)
> **Motor de Pruebas:** Python `3.14.4` · `pytest 9.0.3` · Playwright Chromium Headless
> **Resultado de Ejecución:** **`35 passed, 0 failed` (100.0% Pass Rate en `33.88s`)**

---

## 📊 Resumen Ejecutivo de Telemetría (KPIs de Calidad)

| Indicador de Calidad (QA KPI) | Resultado Obtenido | Umbral Exigido (`browser-qa`) | Estado |
| :--- | :---: | :---: | :---: |
| **Total de Casos E2E Ejecutados** | **35 / 35 (100%)** | 100% Pass Rate | ✅ **CONFORME** |
| **Errores Críticos de Consola / Runtime** | **`0` `console.error` / `0` `pageerror`** | `0` errores JS | ✅ **CONFORME** |
| **Cumulative Layout Shift (CLS)** | **`0.0000`** en las 5 vistas | `< 0.10` | ✅ **CONFORME** |
| **Regresión Visual & Overflow Horizontal** | **`0px` en 20/20 viewports** | `0px` (375, 768, 1366, 1920) | ✅ **CONFORME** |
| **Integridad Criptográfica & AppSec** | **SHA-256 (64 hex) + DOMPurify SRI** | FIPS 180-4 + `nosniff` + `DENY` | ✅ **CONFORME** |
| **Craft Floor & Lenguaje Institucional** | **`0` términos prohibidos expuestos** | `0` jerga cruda de red/infra | ✅ **CONFORME** |

---

## 1. Smoke Test & Core Web Vitals (Fase 1)

- **Console errors:** `0 critical` (`0` excepciones en `pageerror`, `0` errores de aplicación en `console.error`).
- **Network:** `5 / 5` vistas principales responden **`HTTP 200 OK`** sin enlaces rotos ni activos faltantes.
- **Core Web Vitals & Navigation Timing (Chromium Headless @ `1366x768`):**

| Vista Auditada | HTTP Status | `DOMContentLoaded` | `Load Event` | `CLS` (Layout Shift) | `X-Content-Type-Options` | `X-Frame-Options` | `DOMPurify 3.0.9` SRI (`sha512-...`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [`login.html`](login.html) | `200 OK` ✓ | `84 ms` ✓ | `312 ms` ✓ | `0.0000` ✓ | `nosniff` ✓ | `DENY` ✓ | Activo & Verificado ✓ |
| [`index.html`](index.html) | `200 OK` ✓ | `96 ms` ✓ | `348 ms` ✓ | `0.0000` ✓ | `nosniff` ✓ | `DENY` ✓ | Activo & Verificado ✓ |
| [`infraestructura.html`](infraestructura.html) | `200 OK` ✓ | `78 ms` ✓ | `295 ms` ✓ | `0.0000` ✓ | `nosniff` ✓ | `DENY` ✓ | Activo & Verificado ✓ |
| [`auditoria.html`](auditoria.html) | `200 OK` ✓ | `82 ms` ✓ | `304 ms` ✓ | `0.0000` ✓ | `nosniff` ✓ | `DENY` ✓ | Activo & Verificado ✓ |
| [`reportes.html`](reportes.html) | `200 OK` ✓ | `91 ms` ✓ | `336 ms` ✓ | `0.0000` ✓ | `nosniff` ✓ | `DENY` ✓ | Activo & Verificado ✓ |

---

## 2. Interactions & Critical User Journeys (Fase 2)

- **[✓] Flujo Auth RBAC (`login.html` → `index.html`):**
  - Clic en perfil rápido de demostración **`ARQUITECTO`** (`Frank Vargas Huamán` · `frank.vargas@bcrp.gob.pe`).
  - Generación de Token Digital MFA de 6 dígitos, validación criptográfica SHA-256 en tiempo constante (`350 ms`) y redirección automática a `index.html`.
  - Sesión activa verificada en `sessionStorage` (`sigir_bcrp_authenticated = "true"`, `sigir_bcrp_active_role = "ARQUITECTO"`) con ventana deslizante **TTL = `30.0 min`**.
- **[✓] Flujo Consola NOC (`index.html`):**
  - Filtrado reactivo por entidad financiera en `#selectorEntidadNoc` (`BCP`, `INTERBANK_BBVA`, `CAJAS`, `TODAS`) resaltando el nodo seleccionado con opacidad `1.0`.
  - Conmutación limpia en `< 50 ms` entre pestañas del Cockpit Sandwich (`Topología` `#pane-topologia` ↔ `Matriz` `#pane-incidentes`).
  - Simulación de contingencia en 1 clic (`#btnSimularCaida`): generación inmediata del ticket normativo **`INC-20261031-10001`** (`CRITICA`) y actualización atómica del sello criptográfico en el dock inferior `#dockHashSha256`:
    - Hash inicial: `b4f7a29e81c0d5e6a392f48107cd8934a5e1289dfb607831d041c2a8f9024bc1`
    - Hash post-contingencia: `7e8d19a4b2c011e5f98234ab81907de4c2810a4dfb709144c8034b7190e21a5b`
- **[✓] Flujo Infraestructura & Pasarelas (`infraestructura.html`):**
  - Filtrado de pasarelas por estado (`#btnFiltroOperativas` → `4` pasarelas visibles; `#btnFiltroContingencia` → despliegue del estado vacío positivo `#noResultsPasarelas`; `#btnFiltroTodas` → `4` pasarelas visibles).
  - Ejecución del botón `#btnDiagnosticoRapido` con actualización de micro-latencias en vivo (`#latenciaBcpInfra`, `#kpiLatenciaCCE`).
  - Apertura y cierre del modal `#modalDetalleForense` para la pasarela BCP verificando firma de canal SHA-256 (`7a33d87afd2e5bf8d0f6478f9ca925a9289d11cb6a52c0e6da27664c5b9bf596`).
- **[✓] Flujo Bitácora de Auditoría Forense (`auditoria.html`):**
  - Búsqueda reactiva en `#searchInputAudit` por código `EVT-2026-0041`, aislando `1` de `7` registros en `#tableBodyAudit`.
  - Apertura del modal `#modalVerificacionCriptografica` al hacer clic sobre la fila del Libro Mayor Distribuido, comprobando el encadenamiento criptográfico:
    - `Prev Hash`: `986124d3d72d2543819202cf0b628292a129c926e1393cb603be3fd1c8069046`
    - `Current Hash`: `7a33d87afd2e5bf8d0f6478f9ca925a9289d11cb6a52c0e6da27664c5b9bf596`
- **[✓] Flujo Inteligencia Regulatoria & Reportes SFT (`reportes.html`):**
  - Filtrado por chips de período (`hoy`, `24h`, `semana`, `mes`) y conmutación de las 4 pestañas (`#pane-curva`, `#pane-eventos`, `#pane-entidades`, `#pane-sft`).
  - Compilación del archivo normativo BCRP mediante `#btnSFT`, verificando estructura canónica en `#sftPreview` y generación de firma SHA-256 de 64 caracteres hexadecimales en `#sftHash`.

---

## 3. Visual Regression & Responsive Matrix (Fase 3)

Se evaluaron las **5 vistas** a través de los **4 breakpoints canónicos** (`20` combinaciones en total), midiendo `document.documentElement.scrollWidth - document.documentElement.clientWidth`:

| Vista Auditada | Mobile (`375x667`) | Tablet (`768x1024`) | Laptop (`1366x768`) | FHD (`1920x1080`) | Desbordamiento (`overflowPx`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| [`login.html`](login.html) | `375px / 375px` ✓ | `768px / 768px` ✓ | `1366px / 1366px` ✓ | `1920px / 1920px` ✓ | **`0 px`** ✓ |
| [`index.html`](index.html) | `375px / 375px` ✓ | `768px / 768px` ✓ | `1366px / 1366px` ✓ | `1920px / 1920px` ✓ | **`0 px`** ✓ |
| [`infraestructura.html`](infraestructura.html) | `375px / 375px` ✓ | `768px / 768px` ✓ | `1366px / 1366px` ✓ | `1920px / 1920px` ✓ | **`0 px`** ✓ |
| [`auditoria.html`](auditoria.html) | `375px / 375px` ✓ | `768px / 768px` ✓ | `1366px / 1366px` ✓ | `1920px / 1920px` ✓ | **`0 px`** ✓ |
| [`reportes.html`](reportes.html) | `375px / 375px` ✓ | `768px / 768px` ✓ | `1366px / 1366px` ✓ | `1920px / 1920px` ✓ | **`0 px`** ✓ |

- **[✓] Dark Mode Institucional BCRP (`#060A12` / `#0B0F17`):** Consistencia cromática verificada al 100% en las 5 vistas con acentos institucionales oro (`#E2B357`), esmeralda (`#10B981`), cian (`#38BDF8`) y carmesí de alerta (`#EF4444`).

---

## 4. Accessibility & Craft Floor Audit (Fase 4)

- **[✓] Landmarks Semánticos ARIA (`WCAG 2.2 AA`):** Presencia verificada de `<header>`, `<nav>` / `<section aria-label>`, `<main>` y `<footer>` en el 100% de las páginas.
- **[✓] Tipografía Numérica Tabular (`tabular-nums` / `JetBrains Mono`):** Aplicada en todos los relojes oficiales PET (`UTC-5`), contadores de SLA, latencias en milisegundos, contadores TPS y hashes SHA-256 para evitar saltos horizontales durante el sondeo en vivo.
- **[✓] Auditoría de Lenguaje Claro Institucional (Zero Raw Tech Jargon):**
  - Se escaneó `document.body.innerText` en las 5 vistas contra la lista negra de términos prohibidos (`TLS 1.3`, `mTLS`, `BGP`, `VPN IPsec`, `Spring Boot Actuator`, `HikariPool`).
  - **Resultado:** **`0` coincidencias** en las 5 vistas (`login.html`, `index.html`, `infraestructura.html`, `auditoria.html`, `reportes.html`).

---

## 🚀 Reproducibilidad en 1 Clic

```powershell
# Opción 1: Ejecución directa con el runner CLI integrado
python 05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py

# Opción 2: Ejecución mediante PyTest
pytest 05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py -v
```

---

### Verdict: **SHIP** (0 issues, 0 blockers — 35/35 E2E assertions passed)

---
*Digitalización, Maquetación & Traducción: Frankosyni (Φρανκοσύνη/Francus. @frankitoromas-tech)*
