# -*- coding: utf-8 -*-
"""
Generador Automatizado de Diapositivas Ejecutivas APF3 (Semana 12)
Formato 16:9 Widescreen - Tema Corporativo Deep Navy / Tech Blueprint
Autor: Frank Vargas Huamán (Frankosyni)
"""
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Paleta de colores ejecutiva
    BG_DARK = RGBColor(10, 25, 47)       # #0A192F
    BG_CARD = RGBColor(23, 42, 69)       # #172A45
    TEXT_WHITE = RGBColor(248, 250, 252) # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8
    ACCENT_CYAN = RGBColor(56, 189, 248) # #38BDF8
    ACCENT_GOLD = RGBColor(245, 158, 11) # #F59E0B
    ACCENT_GREEN = RGBColor(34, 197, 94) # #22C55E

    img_dir = os.path.join(os.path.dirname(__file__), "..", "imagenes")

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="CURSO INTEGRADOR I • AVANCE DE PROYECTO FINAL 3 (SEMANA 12)"):
        # Categoría
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_CYAN

        # Título
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 1: Portada
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Card central
    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.0), Inches(10.333), Inches(5.5))
    card1.fill.solid()
    card1.fill.fore_color.rgb = BG_CARD
    card1.line.color.rgb = ACCENT_CYAN
    card1.line.width = Pt(1.5)

    tf1 = card1.text_frame
    tf1.word_wrap = True
    
    p = tf1.paragraphs[0]
    p.text = "UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP) • FACULTAD DE INGENIERÍA"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    p2 = tf1.add_paragraph()
    p2.text = "SIGIR - BCRP: SISTEMA DE GESTIÓN DE INCIDENTES REGULATORIOS"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.size = Pt(26)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE

    p3 = tf1.add_paragraph()
    p3.text = "Avance de Proyecto Final 3 (Semana 12) • Curso Integrador I: Sistemas Software (Sección 57524)"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.size = Pt(14)
    p3.font.color.rgb = ACCENT_GOLD

    p4 = tf1.add_paragraph()
    p4.text = "\nDocente Evaluador: Ing. Yony Zamata Condori\n"
    p4.alignment = PP_ALIGN.CENTER
    p4.font.size = Pt(13)
    p4.font.color.rgb = TEXT_MUTED

    p5 = tf1.add_paragraph()
    p5.text = "INTEGRANTES DEL EQUIPO (7mo Ciclo):\n" \
              "• Frank Emiliano Vargas Huamán (U23243651) — Líder Técnico & Arquitecto de Software\n" \
              "• Fernando Alber Alfredo Romero Requejo (U21216410) — Ingeniero de Requisitos & Procesos\n" \
              "• Joel Leonardo Olaya Vivas (U21221688) — Ingeniero de Software & QA"
    p5.alignment = PP_ALIGN.CENTER
    p5.font.size = Pt(13)
    p5.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 2: Problemática y Dolor de Negocio (Bloque 1)
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "1. Definición del Problema: Asimetría Informativa en Pagos Digitales")

    c_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = BG_CARD
    c_left.line.color.rgb = RGBColor(239, 68, 68)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = "PROCESO ACTUAL (AS-IS) — CRÍTICO"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = RGBColor(239, 68, 68)

    items_l = [
        "• Detección Tardía: De 45 a 180 minutos para confirmar caídas de billeteras digitales (Yape, Plin).",
        "• Canales No Estructurados: Notificaciones por correo o llamadas informales de los bancos.",
        "• Asimetría Informativa: El BCRP se entera por redes sociales o quejas ciudadanas.",
        "• Hojas Mutables: Registros en Excel con riesgo de adulteración y falta de trazabilidad legal.",
        "• Incumplimiento de la Circular N° 0011-2023 sobre interoperabilidad obligatoria."
    ]
    for it in items_l:
        pi = tf_l.add_paragraph()
        pi.text = it
        pi.font.size = Pt(12)
        pi.font.color.rgb = TEXT_MUTED

    c_right = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = BG_CARD
    c_right.line.color.rgb = ACCENT_GREEN
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = "SOLUCIÓN PROPUESTA: SIGIR - BCRP (TO-BE)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    items_r = [
        "• Detección en Tiempo Real: Reducción del MTTD a < 30 segundos mediante sondeo asíncrono.",
        "• Alertas Automáticas: Daemon multihilo detecta HTTP 5xx y timeouts al instante.",
        "• Ticket Correlativo Inmutable: Generación atómica de tickets sin duplicidad (Regla RN-01).",
        "• Base de Datos Inmutable: Trigger PostgreSQL 15 rechaza mutaciones (SQLSTATE 55000).",
        "• Sellado Criptográfico: Reportes normativos SFT con hash determinista SHA-256."
    ]
    for it in items_r:
        pi = tf_r.add_paragraph()
        pi.text = it
        pi.font.size = Pt(12)
        pi.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 3: Requisitos Funcionales y Casos de Uso (Bloque 1)
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "2. Análisis del Sistema: Requisitos SRS IEEE 830 y Casos de Uso")

    c_rf = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    c_rf.fill.solid()
    c_rf.fill.fore_color.rgb = BG_CARD
    c_rf.line.color.rgb = ACCENT_CYAN
    tf_rf = c_rf.text_frame
    tf_rf.word_wrap = True
    p = tf_rf.paragraphs[0]
    p.text = "REQUISITOS FUNCIONALES CLAVE (SRS)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    rf_list = [
        "• RF-01 (Ingesta de Telemetría): Sondeo continuo a BCP, BBVA, Interbank y Scotiabank.",
        "• RF-02 (Detección y Clasificación): Severidades CRÍTICA, ALTA, MEDIA, BAJA.",
        "• RF-03 (Ciclo de Vida de Incidentes): REGISTRADO -> EN_EVALUACION -> MITIGADO -> CERRADO.",
        "• RF-04 (Compilador SFT): Generación de archivo plano normativo con firma SHA-256.",
        "• RF-05 (Consola NOC Web): Visualización reactiva en tiempo real para operadores BCRP."
    ]
    for r in rf_list:
        pi = tf_rf.add_paragraph()
        pi.text = r
        pi.font.size = Pt(12)
        pi.font.color.rgb = TEXT_WHITE

    # Embed Figura Casos de Uso si existe
    img_cu = os.path.join(img_dir, "figura2_casos_de_uso.png")
    if os.path.exists(img_cu):
        s3.shapes.add_picture(img_cu, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.2))
    else:
        c_cu = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.2))
        c_cu.fill.solid()
        c_cu.fill.fore_color.rgb = BG_CARD
        c_cu.text_frame.text = "Diagrama de Casos de Uso UML 2.5\n(Operador NOC, Daemon Telemetría, Supervisor BCRP)"

    # -------------------------------------------------------------
    # SLIDE 4: Arquitectura Clean y Patrón MVC (Bloque 2 - Frank)
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "3. Diseño del Sistema: Clean Architecture y Patrón MVC")

    c_mvc = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    c_mvc.fill.solid()
    c_mvc.fill.fore_color.rgb = BG_CARD
    c_mvc.line.color.rgb = ACCENT_GOLD
    tf_m = c_mvc.text_frame
    tf_m.word_wrap = True
    p = tf_m.paragraphs[0]
    p.text = "DESACOPLAMIENTO POR CAPAS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    mvc_list = [
        "• Controlador (C): IncidenteController expone endpoints REST bajo estándar RFC 7807 (ProblemDetail). Cero entidades expuestas; uso de Records DTO inmutables.",
        "• Servicio / Dominio (M): IncidenteService gobierna la máquina de estados y las reglas de negocio regulatorias (SLA 99.9%).",
        "• Acceso a Datos (DAO): IncidenteRepository extiende JpaRepository encapsulando la interacción con PostgreSQL 15.",
        "• Vista (V): SPA reactiva desacoplada consumiendo contratos REST asíncronos vía JSON."
    ]
    for m in mvc_list:
        pi = tf_m.add_paragraph()
        pi.text = m
        pi.font.size = Pt(12)
        pi.font.color.rgb = TEXT_WHITE

    img_hex = os.path.join(img_dir, "figura6_arquitectura_hexagonal.png")
    if os.path.exists(img_hex):
        s4.shapes.add_picture(img_hex, Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 5: Principios SOLID y Patrón DAO (Bloque 2 - Frank)
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "4. Rigor de Diseño: Principios SOLID y Patrón DAO")

    solid_items = [
        ("S - Single Responsibility", "TelemetriaWorker solo ingesta; IncidenteService solo orquesta; SftReportService solo sella reportes."),
        ("O - Open / Closed", "Máquina de estados extensible mediante enumeraciones polimórficas sin modificar clases existentes."),
        ("L - Liskov Substitution", "IIncidenteService define contratos seguros sustituibles por cualquier implementación mock o real."),
        ("I - Interface Segregation", "Interfaces especializadas y acotadas evitando dependencias innecesarias para clientes REST."),
        ("D - Dependency Inversion", "Inyección por constructor (@RequiredArgsConstructor) sobre abstracciones desacopladas de frameworks.")
    ]
    top_pos = 1.6
    for name, desc in solid_items:
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(top_pos), Inches(11.7), Inches(0.9))
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = ACCENT_CYAN
        tf = card.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = name
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = ACCENT_CYAN
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_WHITE
        top_pos += 1.05

    # -------------------------------------------------------------
    # SLIDE 6: Jerarquía de Paquetes en el IDE (Figura 14 - Frank)
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "5. Estructura de Paquetes en Java 17 y Spring Boot 3")

    c_pkg = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2))
    c_pkg.fill.solid()
    c_pkg.fill.fore_color.rgb = BG_CARD
    c_pkg.line.color.rgb = ACCENT_CYAN
    tf_pkg = c_pkg.text_frame
    tf_pkg.word_wrap = True
    p = tf_pkg.paragraphs[0]
    p.text = "PAQUETIZACIÓN LIMPIA (pe.gob.bcrp.sigir)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    pkgs = [
        "• domain/: Entidades JPA (Incidente, EntidadFinanciera, HistorialEstado) y enumeraciones de negocio.",
        "• repository/: Interfaces DAO extendiendo Spring Data JpaRepository.",
        "• service/: Contratos e implementaciones de lógica de negocio (IncidenteService, SftReportService).",
        "• web.controller/: Endpoints REST documentados.",
        "• web.dto/: Records DTO inmutables con validación Jakarta.",
        "• worker/: TelemetriaWorker concurrente multihilo.",
        "• security/: Configuración Spring Security y RBAC."
    ]
    for pk in pkgs:
        pi = tf_pkg.add_paragraph()
        pi.text = pk
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    img_ide = os.path.join(img_dir, "figura14_arbol_paquetes_ide.png")
    if os.path.exists(img_ide):
        s6.shapes.add_picture(img_ide, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 7: Seguridad y Base de Datos Inmutable (Bloque 2 - Frank)
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, "6. Seguridad Empresarial y Persistencia Inmutable en BD")

    c_sec = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    c_sec.fill.solid()
    c_sec.fill.fore_color.rgb = BG_CARD
    c_sec.line.color.rgb = ACCENT_GOLD
    tf_s = c_sec.text_frame
    tf_s.word_wrap = True
    p = tf_s.paragraphs[0]
    p.text = "SEGURIDAD EN APLICACIÓN (SPRING SECURITY)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    sec_pts = [
        "• Autenticación HTTP Basic con contraseñas cifradas bajo BCryptPasswordEncoder.",
        "• Control de Acceso Basado en Roles (RBAC):",
        "  - ROLE_OPERADOR_SISTEMA: Gestión de incidentes y registro asistido.",
        "  - ROLE_SUPERVISOR_BCRP: Auditoría global, telemetría y reportes SFT.",
        "• Cabeceras de Hardening: Protección CSRF, XSS y Content-Security-Policy."
    ]
    for sp in sec_pts:
        pi = tf_s.add_paragraph()
        pi.text = sp
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    c_db = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    c_db.fill.solid()
    c_db.fill.fore_color.rgb = BG_CARD
    c_db.line.color.rgb = RGBColor(239, 68, 68)
    tf_d = c_db.text_frame
    tf_d.word_wrap = True
    p = tf_d.paragraphs[0]
    p.text = "INMUTABILIDAD EN BD (TRIGGER SQLSTATE 55000)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(239, 68, 68)

    db_pts = [
        "• Principio de Auditoría Forense: Los registros de historial_estados jamás pueden alterarse.",
        "• Trigger PL/pgSQL fn_historial_estado_append_only():",
        "  - Dispara excepción SQLSTATE '55000' ante cualquier intento de UPDATE o DELETE.",
        "  - Bloqueo físico a nivel motor de base de datos.",
        "• Índice Parcial Único (Regla RN-01): Evita duplicación de incidentes abiertos simultáneos para la misma entidad."
    ]
    for dp in db_pts:
        pi = tf_d.add_paragraph()
        pi.text = dp
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 8: Control de Versiones GitFlow y GitHub (Figura 15 - Frank)
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, "7. Control de Versiones: GitFlow y Repositorio GitHub")

    c_git = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2))
    c_git.fill.solid()
    c_git.fill.fore_color.rgb = BG_CARD
    c_git.line.color.rgb = ACCENT_CYAN
    tf_git = c_git.text_frame
    tf_git.word_wrap = True
    p = tf_git.paragraphs[0]
    p.text = "ESTRATEGIA GITFLOW Y CONVENCIONES"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    git_pts = [
        "• Repositorio Oficial en GitHub: https://github.com/frankitoromas-tech/sigir-bcrp",
        "• Ramas de Trabajo:",
        "  - main: Código productivo y estable verificado por pruebas.",
        "  - feature/reportes-clave-documentacion: Desarrollo de funcionalidades específicas.",
        "• Commits Semánticos Trazables: feat:, fix:, docs:, test:, ci:.",
        "• Integración Continua (CI): Pipeline automatizado para compilación y ejecución de tests Maven."
    ]
    for gp in git_pts:
        pi = tf_git.add_paragraph()
        pi.text = gp
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    img_git = os.path.join(img_dir, "figura15_gitflow_ramas_github.png")
    if os.path.exists(img_git):
        s8.shapes.add_picture(img_git, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 9: Enfoque TDD con JUnit 5 y Mockito (Bloque 3 - Joel)
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_header(s9, "8. Pruebas y Validación: Enfoque TDD con JUnit 5 y Mockito")

    c_tdd = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2))
    c_tdd.fill.solid()
    c_tdd.fill.fore_color.rgb = BG_CARD
    c_tdd.line.color.rgb = ACCENT_GREEN
    tf_tdd = c_tdd.text_frame
    tf_tdd.word_wrap = True
    p = tf_tdd.paragraphs[0]
    p.text = "SUITE DE PRUEBAS UNITARIAS (8/8 PASANDO)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    tdd_pts = [
        "• Metodología Red-Green-Refactor aplicada rigurosamente en src/test/java.",
        "• IncidenteServiceTest (3 tests):",
        "  - testCrearIncidenteManual_Exitoso",
        "  - testActualizarEstado_TransicionValida",
        "  - testActualizarEstado_TransicionInvalida (valida excepción de negocio)",
        "• SftReportServiceTest (2 tests):",
        "  - testCompilarReporteSft_Exitoso",
        "  - testVerificarIntegridadSha256_ReporteValido (hash determinista)",
        "• TelemetriaWorkerTest (3 tests):",
        "  - Latencia normal, falla HTTP 503 y timeout de conexión."
    ]
    for tp in tdd_pts:
        pi = tf_tdd.add_paragraph()
        pi.text = tp
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    img_tdd = os.path.join(img_dir, "figura16_evidencias_junit5_tests.png")
    if os.path.exists(img_tdd):
        s9.shapes.add_picture(img_tdd, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 10: Demostración en Vivo: Consola NOC Web (Bloque 3 - Joel)
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_header(s10, "9. Demostración en Vivo: Consola NOC Web en Tiempo Real")

    c_demo = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2))
    c_demo.fill.solid()
    c_demo.fill.fore_color.rgb = BG_CARD
    c_demo.line.color.rgb = ACCENT_CYAN
    tf_dm = c_demo.text_frame
    tf_dm.word_wrap = True
    p = tf_dm.paragraphs[0]
    p.text = "FLUJO OPERATIVO EN VIVO"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    dm_pts = [
        "1. Semáforo Telemétrico en Vivo: Health check cada 30 segundos sobre entidades financieras.",
        "2. Inyección de Contingencia: Simulación de caída HTTP 503 en la pasarela de pagos.",
        "3. Creación Atómica de Ticket: Detección en < 30s generando ticket correlativo formal.",
        "4. Bitácora de Transiciones: Actualización segura de estados con trazabilidad horaria.",
        "5. Exportador SFT: Compilación inmediata del reporte regulatorio con firma digital SHA-256."
    ]
    for dp in dm_pts:
        pi = tf_dm.add_paragraph()
        pi.text = dp
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    img_noc = os.path.join(img_dir, "figura7_dashboard_noc_web.png")
    if os.path.exists(img_noc):
        s10.shapes.add_picture(img_noc, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 11: Validación del Alcance Comprometido 55% vs 40% (Joel)
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "10. Construcción del Producto: Alcance 55% vs 40% Exigido")

    c_alc = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2))
    c_alc.fill.solid()
    c_alc.fill.fore_color.rgb = BG_CARD
    c_alc.line.color.rgb = ACCENT_GOLD
    tf_al = c_alc.text_frame
    tf_al.word_wrap = True
    p = tf_al.paragraphs[0]
    p.text = "CUMPLIMIENTO DE RÚBRICA ACADÉMICA"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    al_pts = [
        "• Meta Sílabo Semana 12: Mínimo 40% de alcance funcional.",
        "• Alcance Real Implementado: 55.0% global (+15.0% de superávit).",
        "• Desglose por Módulo:",
        "  - Ingesta de Telemetría: 70% (Worker concurrente testeado)",
        "  - Motor de Incidentes: 65% (CRUD REST y SLA gobernado)",
        "  - Base de Datos DDL: 75% (DDL PostgreSQL y trigger 55000)",
        "  - Seguridad y RBAC: 60% (Spring Security + BCrypt)",
        "  - Reportes Regulatorios: 60% (Exportador SFT con SHA-256)",
        "  - Frontend SPA: 50% (Consola reactiva en tiempo real)"
    ]
    for ap in al_pts:
        pi = tf_al.add_paragraph()
        pi.text = ap
        pi.font.size = Pt(11)
        pi.font.color.rgb = TEXT_WHITE

    img_mat = os.path.join(img_dir, "figura17_matriz_alcance_40_porciento.png")
    if os.path.exists(img_mat):
        s11.shapes.add_picture(img_mat, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 12: Conclusiones y Ronda de Preguntas
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_header(s12, "11. Conclusiones y Ronda de Preguntas Técnicas")

    c_concl = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.5), Inches(10.333), Inches(5.3))
    c_concl.fill.solid()
    c_concl.fill.fore_color.rgb = BG_CARD
    c_concl.line.color.rgb = ACCENT_CYAN
    tf_c = c_concl.text_frame
    tf_c.word_wrap = True

    p = tf_c.paragraphs[0]
    p.text = "CONCLUSIONES DE INGENIERÍA"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    c_items = [
        "1. Se demostró la viabilidad técnica de reducir la asimetría informativa en pagos de 180 min a < 30 seg.",
        "2. Se aplicaron rigurosamente los principios de Clean Architecture, MVC, DAO, SOLID y TDD con cobertura probada.",
        "3. Se garantizó la inmutabilidad física en base de datos mediante disparadores PL/pgSQL SQLSTATE 55000.",
        "4. El avance funcional del 55% supera ampliamente la meta académica exigida para la Semana 12."
    ]
    for ci in c_items:
        pi = tf_c.add_paragraph()
        pi.text = ci
        pi.font.size = Pt(13)
        pi.font.color.rgb = TEXT_WHITE

    p_end = tf_c.add_paragraph()
    p_end.text = "\n¡MUCHAS GRACIAS POR SU ATENCIÓN!\nQuedamos a su disposición para las preguntas del jurado."
    p_end.alignment = PP_ALIGN.CENTER
    p_end.font.size = Pt(15)
    p_end.font.bold = True
    p_end.font.color.rgb = ACCENT_GOLD

    out_path = os.path.join(os.path.dirname(__file__), "..", "PRESENTACION_EJECUTIVA_APF3.pptx")
    prs.save(out_path)
    print(f"Presentacion guardada exitosamente en: {out_path}")

if __name__ == "__main__":
    create_deck()
