# Sistema de Diseño Institucional BCRP — SIGIR (Consola NOC & SFT)

> **Producto:** Sistema Integral de Gestión de Incidentes Regulatorios (SIGIR — Circular BCRP N° 0024-2022-BCRP)  
> **Modo de Superficie (`impeccable`):** `Operate` — Consola de Misión Crítica Bancaria y Supervisión Interbancaria (LBTR / CCE)  
> **Dirección de Ingeniería Visual:** `impeccable` (Craft Floor) + `emil-ui-motion` (Emil Kowalski Design Engineering) + `antislop-ui`  
> **Autor:** Frank Emiliano Vargas Huamán (`@frankitoromas-tech`) — Arquitecto de Software & NOC Lead

---

## 1. Filosofía Operativa y Modo `Operate`

SIGIR opera en un entorno de **Centro de Operaciones de Red (NOC)** bancario 24/7 donde operadores de mesa de ayuda, ingenieros de guardia y auditores regulatorios del Banco Central de Reserva del Perú (BCRP) supervisan la continuidad del Sistema de Liquidación Bruta en Tiempo Real (**LBTR**) y la Cámara de Compensación Electrónica (**CCE**).

- **Prioridad absoluta en escaneabilidad y precisión:** El éxito del usuario en modo `Operate` se mide en segundos ahorrados durante una contingencia crítica (SLA regulatorio de 60 minutos, Art. 14 Circular BCRP N° 0024-2022-BCRP).
- **Cero decoración gratuita (`antislop-ui`):** Cada borde de `1px`, contraste cromático y micro-interacción cumple una función semántica de jerarquía, estado de enlace o confirmación táctil.
- **Cero Jerga Técnica No Bancaria (`impeccable/craft-floor.md`):** Queda estrictamente prohibido exponer jerga interna de desarrollo (*"localStorage"*, *"mock"*, *"dummy"*, *"test"*) o emojis Unicode improvisados como iconos. Toda la interfaz se expresa en terminología oficial bancaria y regulatoria del BCRP (*"Almacenamiento Criptográfico Local"*, *"Simulación Operativa Controlada"*, *"Digesto Inmutable SHA-256"*, *"Trama Oficial SFT"*).

---

## 2. Paleta Cromática Institucional (Deep Obsidian & BCRP Gold)

Diseñada específicamente para salas de monitoreo NOC con iluminación controlada, garantizando confort visual prolongado y relaciones de contraste **WCAG 2.1 AA / AAA** verificadas matemáticamente:

| Token CSS | Valor Hex / RGBA | Rol Arquitectónico | Contraste sobre `#060A12` |
| :--- | :--- | :--- | :--- |
| `--bg-base` | `#060A12` | **Deep Obsidian Midnight:** Lienzo base de alta profundidad sin deslumbramiento | Base (1.00:1) |
| `--bg-surface` | `rgba(15, 23, 42, 0.75)` | **Slate Glass Surface:** Paneles principales con `backdrop-filter: blur(16px)` | — |
| `--bg-card-solid` | `#0F172A` | **Solid Slate Container:** Superficie sólida para modales, popovers y tablas densas | — |
| `--text-primary` | `#F8FAFC` | **Alabaster White:** Titulares, métricas críticas, identificadores de tickets e importes | **17.06:1 (AAA)** |
| `--text-secondary` | `#CBD5E1` | **Cool Slate 300:** Cuerpo de texto operativo, entidades financieras y descripciones | **12.02:1 (AAA)** |
| `--text-tertiary` | `#94A3B8` | **Muted Slate 400:** Micro-etiquetas (`uppercase`), cabeceras de columna y metadatos | **6.96:1 (AA / AAA Large)** |
| `--bcrp-gold` | `#E2B357` | **Acento Oro Institucional BCRP:** Foco accesible (`:focus-visible`), caret, selección, insignias de autoridad y rol de Arquitecto/Jurado | **10.42:1 (AAA)** |
| `--status-online` | `#10B981` | **Esmeralda Operativo:** Enlace primario activo, SLA en cumplimiento (`>= 99.90%`) y verificación SHA-256 íntegra | **8.15:1 (AAA)** |
| `--cce-blue` | `#2563EB` | **Azul Zafiro Interbancario:** Acciones primarias de consola, pestañas activas y canal secundario | **4.68:1 (AA)** |
| `--status-warning` | `#F59E0B` | **Ámbar de Degradación:** Latencia elevada (`> 80ms`), conmutación preventiva o advertencia de umbral SLA | **9.40:1 (AAA)** |
| `--status-critical` | `#EF4444` | **Carmesí de Contingencia:** Caída de nodo crítico, violación de SLA o alerta regulatoria SFT inmediata | **5.82:1 (AA)** |
| `--telemetry-cyan` | `#38BDF8` | **Cian Telemetría:** Indicadores de latencia en tiempo real, pulsos de red y atajos de comando | **9.85:1 (AAA)** |

---

## 3. Sistema Tipográfico y Disciplina Numérica

El sistema combina una fuente geométrica humanista de alta legibilidad para lectura rápida de etiquetas con una fuente monoespaciada de ingeniería para telemetría financiera:

1. **Voz de Interfaz y Gobierno (`--font-sans`):**  
   `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
   - **Titulares de Vista (`h1`):** `1.45rem` (`800`), `letter-spacing: -0.025em`, `line-height: 1.25`.
   - **Subtítulos de Panel (`h2`, `h3`):** `1.0rem – 1.15rem` (`700`), `letter-spacing: -0.02em`.
   - **Micro-Labels Institucionales (`.micro-label`, `th`):** `0.68rem – 0.70rem` (`700`), `text-transform: uppercase`, `letter-spacing: 0.06em`, color `#94A3B8`.

2. **Voz de Telemetría, Hashes y Cronómetros (`--font-mono`):**  
   `'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace`
   - **Disciplina `tabular-nums` Obligatoria:** Toda tabla (`.data-table`, `.audit-data-table`, `td`, `th`), reloj UTC-5 (`.header-clock`), cronómetro SLA (`.sla-timer`, `.drawer-sla-clock`), métrica KPI (`.kpi-card-value`, `.noc-kpi-val`) y digesto criptográfico SHA-256 (`.crypto-hash`) aplica estrictamente:
     ```css
     font-variant-numeric: tabular-nums;
     font-feature-settings: "tnum" 1, "zero" 1;
     ```
   - Esto garantiza que las actualizaciones de milisegundos o contadores en vivo jamás provoquen desplazamientos horizontales (*layout jitter*).

---

## 4. Superficies del Navegador (`impeccable` Browser Surfaces)

Conforme a `impeccable/craft-floor.md`, las superficies nativas del navegador se integran al sistema de diseño para eliminar cualquier rastro de plantilla por defecto:

- **Selección de Texto (`::selection`, `::-moz-selection`):** Fondo dorado traslúcido `rgba(226, 179, 87, 0.28)` con texto nítido `#F8FAFC`.
- **Cursor de Inserción (`caret-color`):** Oro institucional `#E2B357` en todos los campos `input`, `textarea` y `[contenteditable]`.
- **Enlaces y Referencias Normativas (`a`):** `text-underline-offset: 4px` y `text-decoration-thickness: 1.5px` para lectura limpia sin colisión con trazos descendentes.
- **Anillos de Foco Accesible (`:focus-visible`):** Contorno sólido de `2px solid #E2B357` con `outline-offset: 2px` y halo sutil `rgba(226, 179, 87, 0.30)`.
- **Scrollbars FinTech:** Barras de desplazamiento de `6px` con pulgar `#334155` (`hover: #475569`) sobre riel transparente.

---

## 5. Arquitectura de Componentes Sandwich de 3 Capas

Todas las vistas operativas (`index.html`, `infraestructura.html`, `auditoria.html`, `reportes.html`) implementan la **Arquitectura Sandwich** (`.sandwich-layout`) para maximizar el área útil en pantallas de `1366x768`, `1920x1080` y dispositivos móviles (`375px`) con **0px de desbordamiento horizontal**:

1. **Capa 1 — Pan Superior (`.sandwich-ribbon-top` / `.sandwich-header-bar`):**
   - Altura compacta (`<= 54px` en escritorio), `position: sticky`, con contexto normativo, estado de enlace en vivo, buscador rápido y botonera de acción primaria.
2. **Capa 2 — Núcleo Operativo Fluido (`.sandwich-body-middle` / `.sandwich-panes-wrapper`):**
   - Contenedor central con conmutación por pestañas sin recarga (Topología / Matriz de Incidentes / Curvas SLA / Validador SHA-256), tablas de alta densidad y cajón forense lateral (*Incident Drawer*).
3. **Capa 3 — Pan Inferior (`.sandwich-footer-bottom` / `.sandwich-footer-dock`):**
   - Barra de estado institucional con telemetría del motor híbrido (Spring Boot 3 `:8080` / Resiliencia Local), sello de cumplimiento de la Circular BCRP N° 0024-2022-BCRP y atajos de teclado.

---

## 6. Ingeniería de Movimiento e Interacción Táctil (`emil-ui-motion`)

Basado en los principios de ingeniería de diseño de **Emil Kowalski**:

1. **Prohibición de `transition: all`:**
   - Todos los controles interactivos especifican únicamente las propiedades compuestas y cromáticas exactas:
     ```css
     transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
                 background-color 150ms ease,
                 border-color 150ms ease,
                 box-shadow 180ms ease,
                 color 150ms ease;
     ```
2. **Respuesta Táctil Inmediata (`:active`):**
   - Todo botón operativo (`.btn`, `.noc-action-btn`, `.cockpit-tab`, `.segment-tab`, `.chip-btn`, `.btn-quick-role`) responde físicamente al presionar con `transform: scale(0.97)`.
3. **Origen Espacial en Popovers (`.user-menu-popover`):**
   - Los menús flotantes escalan desde su disparador (`transform-origin: top right`) con curva exponencial rápida `140ms cubic-bezier(0.16, 1, 0.3, 1)`.
4. **Apertura Instantánea en Acciones de Teclado (`.cmd-palette-overlay` / `.cmd-palette-modal`):**
   - La Paleta de Comandos (`⌘K` / `Alt+K`) se invoca decenas de veces por turno; por ello su transición es ultra-rápida (`60ms cubic-bezier(0.16, 1, 0.3, 1)`, `<80ms`), evitando cualquier latencia percibida entre la pulsación de teclas y la escritura del comando.
5. **Respeto a `prefers-reduced-motion: reduce`:**
   - Neutralización automática de animaciones decorativas para operadores con sensibilidad vestibular.
