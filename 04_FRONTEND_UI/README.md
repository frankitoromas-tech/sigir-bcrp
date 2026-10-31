# 🖥️ 04_FRONTEND_UI — Consola Web NOC en Tiempo Real

Interfaz de usuario reactiva desarrollada para operadores y supervisores de la **Sala NOC (Network Operations Center)** y la **Mesa de Dinero del BCRP**.

---

## 🎨 1. Características Técnicas de la Interfaz

* **Diseño Visual:** Tema oscuro corporativo BCRP (`#0A192F` / `#0F172A`) con paleta semafórica normada (Verde: Saludable, Amarillo: Alerta, Rojo: Contingencia Crítica).
* **Tipografía:** JetBrains Mono para códigos de tickets, latencias y firmas criptográficas; Plus Jakarta Sans para jerarquía textual.
* **Arquitectura:** Single Page Application (SPA) ligera, sin dependencias pesadas, consumiendo la API REST asíncrona mediante `Fetch API` y JSON.
* **Resiliencia Online/Offline:** Caché en `localStorage` con simulador integrado de contingencias bancarias.

---

## ⚡ 2. Módulos Operativos

1. **Dashboard Telemétrico en Vivo (`index.html`):**
   * Semáforos visuales de salud de pasarelas de pago (BCP/Yape, BBVA/Plin, Interbank, Scotiabank).
   * Actualización periódica en tiempo real cada 30 segundos.
   * KPIs de sistema: MTTD acumulado (< 30s), Disponibilidad mensual (meta $\ge 99.90\%$) y total de tickets abiertos.
2. **Simulador de Contingencias Regulatorias:**
   * Inyección controlada de errores HTTP 503 (Servicio no disponible) y Timeouts para demostrar la detección autónoma del backend.
3. **Registro Asistido de Incidentes Manuales:**
   * Modal interactivo con validación de campos obligatorios, severidades tipadas y asignación automática de ticket correlativo (`INC-YYYYMMDD-XXXXX`).
4. **Módulo de Reportes Normativos SFT (`reportes.html`):**
   * Filtrado mensual de incidencias operacionales.
   * Compilador de archivos planos normativos (.txt) con cabecera 01, detalle 02, pie 03 y cálculo de firma digital **SHA-256**.

---

## 🚀 3. Modo de Uso

Para ejecutar la consola localmente:
1. Abra directamente `index.html` en cualquier navegador web moderno (Microsoft Edge, Google Chrome, Mozilla Firefox).
2. O bien, levante un servidor web estático con Python:
   ```bash
   cd 04_FRONTEND_UI
   python -m http.server 3000
   ```
   Acceda a: `http://localhost:3000`
