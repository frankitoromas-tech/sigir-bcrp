#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
SUITE DEFINITIVA DE AUTOMATIZACIÓN E2E Y AUDITORÍA DE CALIDAD FULLSTACK (SIGIR)
Sistema Integral de Gestión de Incidentes Regulatorios — Switch CCE / BCRP
===============================================================================
Autor: Frank Emiliano Vargas Huamán (Frankosyni / Francus. @frankitoromas-tech)
Curso: Curso Integrador I - Sistemas Software (Sección 57524 - UTP)
Estándares Aplicados:
  - browser-qa (Fase 1 Smoke & CWV, Fase 2 Interactions, Fase 3 Visual, Fase 4 A11y)
  - fullstack-qa (Playwright E2E Resiliencia, Cero Flakiness, Contratos SHA-256)
  - playwright-skill & pytest-skill (Fixtures, Parametrize, Aserciones Deterministas)

Ejecución Dual Soportada:
  1. Directa (CLI):  python 05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py
  2. PyTest Runner:  pytest 05_DESPLIEGUE_Y_SCRIPTS/test_fullstack_sigir_e2e.py -v
===============================================================================
"""

import atexit
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_URL = os.environ.get("SIGIR_BASE_URL", "http://localhost:3000").rstrip("/")

PAGES_ALL: List[str] = [
    "login.html",
    "index.html",
    "infraestructura.html",
    "auditoria.html",
    "reportes.html",
]

PROTECTED_PAGES: List[str] = [
    "index.html",
    "infraestructura.html",
    "auditoria.html",
    "reportes.html",
]

BREAKPOINTS: List[Tuple[str, int, int]] = [
    ("Mobile", 375, 667),
    ("Tablet", 768, 1024),
    ("Laptop", 1366, 768),
    ("FHD", 1920, 1080),
]

FORBIDDEN_TECH_JARGON: List[str] = [
    "TLS 1.3",
    "mTLS",
    "BGP",
    "VPN IPsec",
    "Spring Boot Actuator",
    "HikariPool",
]

SHA256_REGEX = re.compile(r"^[0-9a-f]{64}$", re.IGNORECASE)

# Almacén en memoria para telemetría recolectada durante la ejecución
TELEMETRY_STORE: Dict[str, Any] = {
    "smoke": {},
    "interactions": {},
    "responsive": [],
    "accessibility": {},
}


def seed_authenticated_session(context: BrowserContext, role: str = "ARQUITECTO") -> None:
    """
    Inyecta una sesión RBAC válida con ventana deslizante TTL de 30 minutos
    para evaluar directamente vistas protegidas sin redirección al portal de login.
    """
    now_ms = int(time.time() * 1000)
    ttl_ms = 30 * 60 * 1000
    email_map = {
        "ARQUITECTO": "frank.vargas@bcrp.gob.pe",
        "OPERADOR": "operador.noc@bcrp.gob.pe",
        "AUDITOR": "auditor.zamata@bcrp.gob.pe",
    }
    email = email_map.get(role, "frank.vargas@bcrp.gob.pe")
    script = f"""
    (() => {{
        try {{
            sessionStorage.setItem('sigir_bcrp_authenticated', 'true');
            sessionStorage.setItem('sigir_bcrp_active_role', '{role}');
            sessionStorage.setItem('sigir_bcrp_user_email', '{email}');
            sessionStorage.setItem('sigir_bcrp_session_created_at', '{now_ms}');
            sessionStorage.setItem('sigir_bcrp_session_expires_at', '{now_ms + ttl_ms}');
        }} catch (e) {{}}
    }})();
    """
    context.add_init_script(script)


def attach_error_listeners(page: Page) -> Tuple[List[str], List[str]]:
    """
    Adjunta escuchadores de errores de consola (console.error) y excepciones
    no controladas (pageerror), filtrando avisos nativos del parser de Chromium
    sobre <meta http-equiv="X-Frame-Options"> y sondeos de red hacia el backend
    opcional (:8080 / /api/) cuando opera en modo autónomo.
    """
    console_errors: List[str] = []
    page_errors: List[str] = []

    benign_patterns = (
        "localhost:8080",
        "ERR_CONNECTION_REFUSED",
        "ERR_FAILED",
        "Failed to load resource",
        "X-Frame-Options may only be set via an HTTP header",
    )

    def on_console(msg):
        if msg.type == "error":
            text = msg.text or ""
            if any(pat in text for pat in benign_patterns):
                return
            console_errors.append(text)

    def on_pageerror(err):
        page_errors.append(str(err))

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    return console_errors, page_errors


def measure_web_vitals_and_appsec(page: Page) -> Dict[str, Any]:
    """
    Extrae métricas reales de navegación (Navigation Timing Level 2),
    Cumulative Layout Shift (CLS) y verifica cabeceras meta AppSec + DOMPurify SRI.
    """
    return page.evaluate(
        """() => {
            const navEntries = performance.getEntriesByType('navigation');
            const nav = navEntries && navEntries.length ? navEntries[0] : null;
            const dclMs = nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0;
            const loadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0;

            let clsScore = 0;
            try {
                const layoutShiftEntries = performance.getEntriesByType('layout-shift') || [];
                for (const entry of layoutShiftEntries) {
                    if (!entry.hadRecentInput) {
                        clsScore += (entry.value || 0);
                    }
                }
            } catch (e) {}

            const metaNoSniff = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
            const metaFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
            const metaReferrer = document.querySelector('meta[name="referrer"]');
            const purifyScript = document.querySelector('script[src*="dompurify"]');

            return {
                domContentLoadedMs: Math.max(0, dclMs),
                loadMs: Math.max(0, loadMs),
                cls: Number(clsScore.toFixed(4)),
                xContentTypeOptions: metaNoSniff ? metaNoSniff.getAttribute('content') : null,
                xFrameOptions: metaFrame ? metaFrame.getAttribute('content') : null,
                referrerPolicy: metaReferrer ? metaReferrer.getAttribute('content') : null,
                domPurifySri: purifyScript ? purifyScript.getAttribute('integrity') : null,
                domPurifyReady: Boolean(window.DOMPurify && typeof window.DOMPurify.sanitize === 'function')
            };
        }"""
    )


# ==============================================================================
# FIXTURES DE PYTEST (CONTEXTO COMPARTIDO CON CACHÉ HTTP PARA EJECUCIÓN RÁPIDA)
# ==============================================================================
@pytest.fixture(scope="module")
def pw_browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture(scope="module")
def shared_page(pw_browser: Browser):
    """
    Reutiliza un único BrowserContext y Page con caché de recursos estáticos,
    configurando automáticamente la sesión RBAC para vistas protegidas y limpiándola
    al visitar login.html para evitar redirecciones cruzadas.
    """
    context = pw_browser.new_context(viewport={"width": 1366, "height": 768})
    now_ms = int(time.time() * 1000)
    ttl_ms = 30 * 60 * 1000
    context.add_init_script(
        f"""
        (() => {{
            try {{
                const path = (window.location.pathname || '').toLowerCase();
                if (path.endsWith('login.html')) {{
                    sessionStorage.removeItem('sigir_bcrp_authenticated');
                }} else {{
                    sessionStorage.setItem('sigir_bcrp_authenticated', 'true');
                    sessionStorage.setItem('sigir_bcrp_active_role', 'ARQUITECTO');
                    sessionStorage.setItem('sigir_bcrp_user_email', 'frank.vargas@bcrp.gob.pe');
                    sessionStorage.setItem('sigir_bcrp_session_created_at', '{now_ms}');
                    sessionStorage.setItem('sigir_bcrp_session_expires_at', '{now_ms + ttl_ms}');
                }}
            }} catch (e) {{}}
        }})();
        """
    )
    page = context.new_page()
    yield page
    context.close()


# ==============================================================================
# FASE 1: SMOKE TEST, CORE WEB VITALS & CABECERAS APPSEC
# ==============================================================================
@pytest.mark.parametrize("page_name", PAGES_ALL)
def test_phase1_smoke_and_core_web_vitals(shared_page: Page, page_name: str):
    """
    Fase 1 (Smoke Test & Core Web Vitals):
    - Verifica HTTP 200 en las 5 vistas.
    - Verifica 0 console.error y 0 pageerror.
    - Mide DOMContentLoaded, load y CLS < 0.1.
    - Verifica cabeceras meta AppSec (X-Content-Type-Options, X-Frame-Options, DOMPurify SRI).
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    console_errors, page_errors = attach_error_listeners(shared_page)

    target_url = f"{BASE_URL}/{page_name}"
    response = shared_page.goto(target_url, wait_until="domcontentloaded", timeout=15000)
    shared_page.wait_for_timeout(100)

    assert response is not None, f"No se recibió respuesta HTTP al cargar {target_url}"
    assert response.status in (200, 304), f"Estado HTTP inesperado en {page_name}: {response.status}"
    assert page_name in shared_page.url, f"Redirección inesperada al abrir {page_name} -> {shared_page.url}"

    metrics = measure_web_vitals_and_appsec(shared_page)

    assert len(console_errors) == 0, f"Errores en console.error en {page_name}: {console_errors}"
    assert len(page_errors) == 0, f"Excepciones en pageerror en {page_name}: {page_errors}"
    assert metrics["cls"] < 0.1, f"CLS excede umbral 0.1 en {page_name}: {metrics['cls']}"
    assert metrics["domContentLoadedMs"] < 2500, f"DOMContentLoaded lento en {page_name}: {metrics['domContentLoadedMs']}ms"
    assert metrics["xContentTypeOptions"] == "nosniff", f"Falta X-Content-Type-Options=nosniff en {page_name}"
    assert metrics["xFrameOptions"] == "DENY", f"Falta X-Frame-Options=DENY en {page_name}"
    assert metrics["domPurifySri"] and metrics["domPurifySri"].startswith("sha512-"), (
        f"Falta atributo integrity SRI en DOMPurify en {page_name}"
    )
    assert metrics["domPurifyReady"] is True, f"window.DOMPurify no está activo en {page_name}"

    TELEMETRY_STORE["smoke"][page_name] = {
        "status": 200 if response.status in (200, 304) else response.status,
        "console_errors": len(console_errors),
        "page_errors": len(page_errors),
        **metrics,
    }


# ==============================================================================
# FASE 2: PRUEBAS DE INTERACCIÓN Y FLUJOS CRÍTICOS DE USUARIO
# ==============================================================================
def test_phase2_auth_rbac_flow(pw_browser: Browser):
    """
    Flujo Auth RBAC en login.html:
    - Clic en perfil rápido de demostración (ARQUITECTO).
    - Redirección automática hacia index.html.
    - Verificación de sesión activa con rol ARQUITECTO y ventana deslizante TTL (30 min).
    """
    context = pw_browser.new_context(viewport={"width": 1366, "height": 768})
    page = context.new_page()
    console_errors, page_errors = attach_error_listeners(page)

    page.goto(f"{BASE_URL}/login.html", wait_until="load", timeout=15000)

    btn_arquitecto = page.locator("button.btn-role-architect")
    assert btn_arquitecto.is_visible(), "El botón de acceso rápido ARQUITECTO debe ser visible en login.html"
    btn_arquitecto.click()

    page.wait_for_url("**/index.html*", timeout=8000)
    assert "index.html" in page.url, f"No redirigió a index.html tras login RBAC: {page.url}"

    session_state = page.evaluate(
        """() => ({
            authenticated: sessionStorage.getItem('sigir_bcrp_authenticated'),
            activeRole: sessionStorage.getItem('sigir_bcrp_active_role'),
            userEmail: sessionStorage.getItem('sigir_bcrp_user_email'),
            createdAt: Number(sessionStorage.getItem('sigir_bcrp_session_created_at') || 0),
            expiresAt: Number(sessionStorage.getItem('sigir_bcrp_session_expires_at') || 0)
        })"""
    )

    assert session_state["authenticated"] == "true", "La bandera sigir_bcrp_authenticated debe ser 'true'"
    assert session_state["activeRole"] == "ARQUITECTO", f"Rol activo incorrecto: {session_state['activeRole']}"
    assert session_state["userEmail"] == "frank.vargas@bcrp.gob.pe", "Correo de sesión no coincide con ARQUITECTO"
    assert session_state["expiresAt"] > session_state["createdAt"], "TTL de sesión inválido (expiresAt <= createdAt)"

    ttl_minutes = round((session_state["expiresAt"] - session_state["createdAt"]) / 60000.0, 1)
    assert 29.0 <= ttl_minutes <= 31.0, f"Ventana TTL fuera del estándar de 30 min: {ttl_minutes} min"
    assert len(console_errors) == 0 and len(page_errors) == 0

    TELEMETRY_STORE["interactions"]["auth_rbac"] = {
        "role": session_state["activeRole"],
        "email": session_state["userEmail"],
        "ttl_minutes": ttl_minutes,
        "redirected_to": "index.html",
    }

    context.close()


def test_phase2_noc_console_flow(shared_page: Page):
    """
    Flujo Consola NOC en index.html:
    - Filtrado por entidad (#selectorEntidadNoc).
    - Alternancia de pestañas (Topología / Matriz).
    - Simulación de contingencia (#btnSimularCaida) verificando la actualización
      del hash SHA-256 en el dock inferior (#dockHashSha256).
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    console_errors, page_errors = attach_error_listeners(shared_page)

    shared_page.goto(f"{BASE_URL}/index.html", wait_until="domcontentloaded", timeout=15000)

    # 1. Filtrado por entidad (#selectorEntidadNoc)
    selector_entidad = shared_page.locator("#selectorEntidadNoc")
    assert selector_entidad.is_visible(), "#selectorEntidadNoc debe estar visible"
    selector_entidad.select_option("BCP")
    shared_page.evaluate(
        """() => {
            const sel = document.getElementById('selectorEntidadNoc');
            if (sel && typeof window.filtrarTelemetriaPorEntidad === 'function') {
                window.filtrarTelemetriaPorEntidad(sel.value);
            }
        }"""
    )
    bcp_opacity = shared_page.locator('.telemetry-node[data-entity-key="bcp"]').evaluate("el => getComputedStyle(el).opacity")
    assert float(bcp_opacity) == 1.0, "El nodo BCP filtrado debe permanecer con opacidad 1.0"
    selector_entidad.select_option("TODAS")

    # 2. Alternancia de pestañas (Topología / Matriz)
    tab_matriz = shared_page.locator('.cockpit-tab[data-pane="pane-incidentes"]')
    tab_topologia = shared_page.locator('.cockpit-tab[data-pane="pane-topologia"]')
    tab_matriz.click()
    assert shared_page.locator("#pane-incidentes").evaluate("el => el.classList.contains('active')"), (
        "El panel #pane-incidentes debe activarse al pulsar la pestaña Matriz"
    )
    tab_topologia.click()
    assert shared_page.locator("#pane-topologia").evaluate("el => el.classList.contains('active')"), (
        "El panel #pane-topologia debe activarse al pulsar la pestaña Topología"
    )

    # 3. Simulación de contingencia (#btnSimularCaida) y verificación de #dockHashSha256
    dock_hash_el = shared_page.locator("#dockHashSha256")
    initial_hash = dock_hash_el.inner_text().strip()
    assert SHA256_REGEX.match(initial_hash), f"Hash inicial no es un SHA-256 válido: {initial_hash}"

    shared_page.locator("#btnSimularCaida").click()
    shared_page.wait_for_timeout(150)

    updated_hash = dock_hash_el.inner_text().strip()
    assert SHA256_REGEX.match(updated_hash), f"Hash actualizado no es un SHA-256 válido: {updated_hash}"
    assert updated_hash != initial_hash, (
        f"El hash en #dockHashSha256 debe actualizarse tras simular contingencia (permaneció en {updated_hash})"
    )

    # Verificar que el ticket regulatorio INC-20261031-10001 fue inyectado
    tab_matriz.click()
    matrix_text = shared_page.locator("#tablaIncidentesBody").inner_text()
    assert "INC-20261031-10001" in matrix_text, "El ticket crítico INC-20261031-10001 debe figurar en la matriz"
    assert len(console_errors) == 0 and len(page_errors) == 0

    TELEMETRY_STORE["interactions"]["noc_console"] = {
        "initial_dock_hash": initial_hash,
        "updated_dock_hash": updated_hash,
        "injected_ticket": "INC-20261031-10001",
    }


def test_phase2_infraestructura_flow(shared_page: Page):
    """
    Flujo Infraestructura en infraestructura.html:
    - Filtrado por estado de pasarelas (#btnFiltroOperativas, #btnFiltroContingencia, #btnFiltroTodas).
    - Apertura del modal de detalle forense (#modalDetalleForense).
    - Ejecución del botón de diagnóstico rápido (#btnDiagnosticoRapido).
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    console_errors, page_errors = attach_error_listeners(shared_page)

    shared_page.goto(f"{BASE_URL}/infraestructura.html", wait_until="domcontentloaded", timeout=15000)

    # 1. Filtrado por estado de pasarelas
    shared_page.locator("#btnFiltroOperativas").click()
    visible_operativas = shared_page.locator(".infra-bank-card:visible").count()
    assert visible_operativas == 4, f"Deben mostrarse 4 pasarelas operativas, se encontraron {visible_operativas}"

    shared_page.locator("#btnFiltroContingencia").click()
    no_results_banner = shared_page.locator("#noResultsPasarelas")
    assert no_results_banner.is_visible(), "Debe mostrarse el banner #noResultsPasarelas cuando hay 0 en contingencia"

    shared_page.locator("#btnFiltroTodas").click()
    assert shared_page.locator(".infra-bank-card:visible").count() == 4

    # 2. Botón de diagnóstico rápido (#btnDiagnosticoRapido)
    btn_diag = shared_page.locator("#btnDiagnosticoRapido")
    assert btn_diag.is_visible(), "#btnDiagnosticoRapido debe ser visible"
    btn_diag.click()
    lat_text = shared_page.locator("#latenciaBcpInfra").inner_text().strip()
    assert lat_text.endswith("ms"), f"Latencia BCP tras diagnóstico rápido inválida: {lat_text}"

    # 3. Apertura del modal de detalle forense (#modalDetalleForense)
    btn_forense_bcp = shared_page.locator("#cardPasarelaBcp button.btn-forense")
    btn_forense_bcp.click()

    modal_forense = shared_page.locator("#modalDetalleForense")
    assert modal_forense.evaluate("el => el.classList.contains('active')"), (
        "#modalDetalleForense debe tener la clase 'active' al abrirse"
    )
    forense_hash = shared_page.locator("#modalForenseHash").inner_text().strip()
    assert SHA256_REGEX.match(forense_hash), f"Hash del modal forense inválido: {forense_hash}"

    shared_page.locator("#btnCerrarModalForense").click()
    assert not modal_forense.evaluate("el => el.classList.contains('active')"), (
        "#modalDetalleForense debe cerrarse correctamente"
    )
    assert len(console_errors) == 0 and len(page_errors) == 0

    TELEMETRY_STORE["interactions"]["infraestructura"] = {
        "gateways_verified": 4,
        "bcp_latency_sample": lat_text,
        "forense_modal_hash": forense_hash,
    }


def test_phase2_auditoria_forense_flow(shared_page: Page):
    """
    Flujo Auditoría Forense en auditoria.html:
    - Búsqueda reactiva en #searchInputAudit.
    - Apertura del modal criptográfico (#modalVerificacionCriptografica) al hacer clic en una fila del libro mayor.
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    console_errors, page_errors = attach_error_listeners(shared_page)

    shared_page.goto(f"{BASE_URL}/auditoria.html", wait_until="domcontentloaded", timeout=15000)

    total_rows_initial = shared_page.locator("#tableBodyAudit tr.audit-row:visible").count()
    assert total_rows_initial == 7, f"El libro mayor debe iniciar con 7 filas visibles, tiene {total_rows_initial}"

    # 1. Búsqueda reactiva en #searchInputAudit
    search_input = shared_page.locator("#searchInputAudit")
    search_input.fill("EVT-2026-0041")
    search_input.dispatch_event("input")
    shared_page.wait_for_timeout(100)

    filtered_rows = shared_page.locator("#tableBodyAudit tr.audit-row:visible")
    assert filtered_rows.count() == 1, f"La búsqueda por EVT-2026-0041 debe filtrar a 1 fila, dio {filtered_rows.count()}"

    # 2. Clic en la fila del libro mayor para abrir #modalVerificacionCriptografica
    filtered_rows.first.click()
    modal_cripto = shared_page.locator("#modalVerificacionCriptografica")
    assert modal_cripto.evaluate("el => el.classList.contains('active')"), (
        "#modalVerificacionCriptografica debe abrirse con la clase 'active' al pulsar una fila"
    )

    cur_hash = shared_page.locator("#criptoModalHash").inner_text().strip()
    prev_hash = shared_page.locator("#modalPrevHash").inner_text().strip()
    assert SHA256_REGEX.match(cur_hash), f"Hash actual en modal criptográfico no es SHA-256 válido: {cur_hash}"
    assert SHA256_REGEX.match(prev_hash), f"Hash previo en modal criptográfico no es SHA-256 válido: {prev_hash}"

    shared_page.locator("#btnCerrarModalCripto").click()
    assert not modal_cripto.evaluate("el => el.classList.contains('active')"), (
        "#modalVerificacionCriptografica debe cerrarse al pulsar #btnCerrarModalCripto"
    )

    # Restablecer búsqueda
    shared_page.locator("#btnResetFiltrosAuditoria").click()
    assert shared_page.locator("#tableBodyAudit tr.audit-row:visible").count() == 7
    assert len(console_errors) == 0 and len(page_errors) == 0

    TELEMETRY_STORE["interactions"]["auditoria"] = {
        "total_ledger_events": total_rows_initial,
        "searched_event": "EVT-2026-0041",
        "verified_cur_hash": cur_hash,
    }


def test_phase2_reportes_sft_flow(shared_page: Page):
    """
    Flujo Reportes SFT en reportes.html:
    - Conmutación de las 4 pestañas (pane-curva, pane-eventos, pane-entidades, pane-sft).
    - Filtro por chips de fecha (.chip-btn).
    - Compilación del archivo regulatorio SFT (#btnSFT) verificando la generación del hash SHA-256 en #sftHash.
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    console_errors, page_errors = attach_error_listeners(shared_page)

    shared_page.goto(f"{BASE_URL}/reportes.html", wait_until="domcontentloaded", timeout=15000)

    # 1. Filtro por chips de fecha
    for range_key in ["hoy", "24h", "semana", "mes"]:
        chip = shared_page.locator(f'.chip-btn[data-range="{range_key}"]')
        chip.click()
        assert chip.evaluate("el => el.classList.contains('active')"), f"El chip {range_key} debe quedar activo"

    # 2. Conmutación de las 4 pestañas (pane-curva, pane-eventos, pane-entidades, pane-sft)
    for pane_id in ["pane-curva", "pane-eventos", "pane-entidades", "pane-sft"]:
        tab_btn = shared_page.locator(f'.segment-tab[data-pane="{pane_id}"]')
        tab_btn.click()
        pane_el = shared_page.locator(f"#{pane_id}")
        assert pane_el.evaluate("el => el.classList.contains('active')"), f"El panel #{pane_id} debe estar activo"

    # 3. Compilación del archivo regulatorio SFT (#btnSFT) y validación de #sftHash
    btn_sft = shared_page.locator("#btnSFT")
    assert btn_sft.is_visible(), "#btnSFT debe ser visible dentro de #pane-sft"
    btn_sft.click()

    shared_page.wait_for_function(
        """() => {
            const el = document.getElementById('sftHash');
            return el && /^[0-9a-f]{64}$/i.test(el.textContent.trim());
        }""",
        timeout=5000,
    )

    sft_hash = shared_page.locator("#sftHash").inner_text().strip()
    sft_preview = shared_page.locator("#sftPreview").inner_text().strip()

    assert SHA256_REGEX.match(sft_hash), f"#sftHash no contiene un digest SHA-256 de 64 hex: {sft_hash}"
    assert "HEADER|" in sft_preview or "01|BCRP-SFT" in sft_preview, (
        "La vista previa #sftPreview debe contener la cabecera oficial del archivo SFT"
    )
    assert len(console_errors) == 0 and len(page_errors) == 0

    TELEMETRY_STORE["interactions"]["reportes_sft"] = {
        "panes_verified": ["pane-curva", "pane-eventos", "pane-entidades", "pane-sft"],
        "sft_sha256": sft_hash,
    }


# ==============================================================================
# FASE 3: REGRESIÓN VISUAL Y 0PX OVERFLOW EN 4 BREAKPOINTS
# ==============================================================================
@pytest.mark.parametrize("bp_label,width,height", BREAKPOINTS)
@pytest.mark.parametrize("page_name", PAGES_ALL)
def test_phase3_visual_regression_zero_overflow(
    shared_page: Page, page_name: str, bp_label: str, width: int, height: int
):
    """
    Fase 3 (Regresión Visual y 0px Overflow en 4 Breakpoints):
    Evalúa 375x667 (Mobile), 768x1024 (Tablet), 1366x768 (Laptop) y 1920x1080 (FHD)
    en las 5 páginas, comprobando que overflow == 0.
    """
    shared_page.set_viewport_size({"width": width, "height": height})
    if not shared_page.url.endswith(f"/{page_name}"):
        shared_page.goto(f"{BASE_URL}/{page_name}", wait_until="domcontentloaded", timeout=15000)
    shared_page.wait_for_timeout(40)

    overflow_data = shared_page.evaluate(
        """() => {
            const docEl = document.documentElement;
            const scrollW = docEl.scrollWidth;
            const clientW = docEl.clientWidth;
            const overflowPx = Math.max(0, scrollW - clientW);
            return {
                scrollWidth: scrollW,
                clientWidth: clientW,
                overflowPx: overflowPx
            };
        }"""
    )

    assert overflow_data["overflowPx"] == 0, (
        f"Overflow horizontal detectado en {page_name} @ {bp_label} ({width}x{height}): "
        f"scrollWidth={overflow_data['scrollWidth']}px vs clientWidth={overflow_data['clientWidth']}px "
        f"(+{overflow_data['overflowPx']}px)"
    )

    TELEMETRY_STORE["responsive"].append(
        {
            "page": page_name,
            "breakpoint": bp_label,
            "viewport": f"{width}x{height}",
            "scrollWidth": overflow_data["scrollWidth"],
            "clientWidth": overflow_data["clientWidth"],
            "overflowPx": overflow_data["overflowPx"],
        }
    )


# ==============================================================================
# FASE 4: ACCESIBILIDAD & CRAFT FLOOR AUDIT
# ==============================================================================
@pytest.mark.parametrize("page_name", PAGES_ALL)
def test_phase4_accessibility_and_craft_floor_audit(shared_page: Page, page_name: str):
    """
    Fase 4 (Accesibilidad & Craft Floor Audit):
    - Verifica landmarks ARIA semánticos (main, nav/section, header, footer).
    - Verifica el uso de tipografía numérica tabular (tabular-nums) en métricas.
    - Verifica la ausencia total de términos técnicos prohibidos en el texto visible:
      ('TLS 1.3', 'mTLS', 'BGP', 'VPN IPsec', 'Spring Boot Actuator', 'HikariPool').
    """
    shared_page.set_viewport_size({"width": 1366, "height": 768})
    if not shared_page.url.endswith(f"/{page_name}"):
        shared_page.goto(f"{BASE_URL}/{page_name}", wait_until="domcontentloaded", timeout=15000)

    audit_result = shared_page.evaluate(
        """(forbiddenTerms) => {
            const hasMain = document.querySelectorAll('main, [role="main"]').length > 0;
            const hasHeader = document.querySelectorAll('header, [role="banner"]').length > 0;
            const hasFooter = document.querySelectorAll('footer, [role="contentinfo"]').length > 0;
            const hasNavOrRegion = document.querySelectorAll('nav, [role="navigation"], section[aria-label]').length > 0;

            let tabularNumsCount = 0;
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                const style = window.getComputedStyle(el);
                if (
                    (style.fontVariantNumeric && style.fontVariantNumeric.includes('tabular-nums')) ||
                    (style.fontFeatureSettings && style.fontFeatureSettings.includes('tnum')) ||
                    (style.fontFamily && style.fontFamily.includes('JetBrains Mono'))
                ) {
                    tabularNumsCount++;
                }
            }

            const visibleText = document.body ? document.body.innerText : '';
            const foundForbidden = [];
            for (const term of forbiddenTerms) {
                const regex = new RegExp(term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i');
                if (regex.test(visibleText)) {
                    foundForbidden.push(term);
                }
            }

            return {
                hasMain,
                hasHeader,
                hasFooter,
                hasNavOrRegion,
                tabularNumsCount,
                foundForbidden
            };
        }""",
        FORBIDDEN_TECH_JARGON,
    )

    assert audit_result["hasMain"] is True, f"Falta landmark <main> en {page_name}"
    assert audit_result["hasHeader"] is True, f"Falta landmark <header> en {page_name}"
    assert audit_result["hasFooter"] is True, f"Falta landmark <footer> en {page_name}"
    assert audit_result["hasNavOrRegion"] is True, f"Falta landmark <nav> o región etiquetada en {page_name}"
    assert audit_result["tabularNumsCount"] > 0, f"No se detectó alineación numérica tabular en {page_name}"
    assert len(audit_result["foundForbidden"]) == 0, (
        f"Se encontraron términos técnicos prohibidos en texto visible de {page_name}: {audit_result['foundForbidden']}"
    )

    TELEMETRY_STORE["accessibility"][page_name] = audit_result


def _dump_telemetry_on_exit():
    """
    Exporta las métricas recolectadas al finalizar la sesión de pruebas
    (compatible tanto con ejecución directa en Python como con PyTest CLI).
    """
    out_path = os.environ.get("SIGIR_QA_METRICS_OUT")
    if out_path and TELEMETRY_STORE["smoke"]:
        try:
            Path(out_path).write_text(json.dumps(TELEMETRY_STORE, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass


atexit.register(_dump_telemetry_on_exit)


if __name__ == "__main__":
    print("=" * 82)
    print(" SIGIR - BCRP | SUITE DE VERIFICACIÓN FULLSTACK E2E & BROWSER QA (4 FASES)")
    print(f" Target Endpoint: {BASE_URL}")
    print("=" * 82)
    exit_code = pytest.main([__file__, "-v", "--tb=short"])
    sys.exit(exit_code)
