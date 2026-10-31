# -*- coding: utf-8 -*-
"""
Generador Automatizado de Diapositivas Ejecutivas APF3 (Semana 12)
Formato 16:9 Widescreen - Tema Corporativo Moderno de Alto Impacto
Sin figuras geométricas toscas ni bordes redondeados llamativos.
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

    # Paleta de colores ejecutiva de alto contraste
    BG_DARK       = RGBColor(11, 15, 25)       # #0B0F19 (Dark Canvas)
    BG_CARD       = RGBColor(17, 24, 39)       # #111827 (Card Surface)
    BORDER_SUBTLE = RGBColor(30, 41, 59)       # #1E293B (Subtle slate border)
    TEXT_WHITE    = RGBColor(248, 250, 252)    # #F8FAFC
    TEXT_MUTED    = RGBColor(148, 163, 184)    # #94A3B8
    ACCENT_CYAN   = RGBColor(56, 189, 248)     # #38BDF8
    ACCENT_BLUE   = RGBColor(59, 130, 246)     # #3B82F6
    ACCENT_GOLD   = RGBColor(245, 158, 11)     # #F59E0B
    ACCENT_GREEN  = RGBColor(34, 197, 94)      # #22C55E
    ACCENT_RED    = RGBColor(239, 68, 68)      # #EF4444
    ACCENT_PURPLE = RGBColor(168, 85, 247)     # #A855F7
    UTP_RED       = RGBColor(200, 16, 46)      # #C8102E

    img_dir = os.path.join(os.path.dirname(__file__), "..", "imagenes")

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="CURSO INTEGRADOR I :: AVANCE DE PROYECTO FINAL 3 (SEMANA 12)"):
        # Categoría
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.5), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_CYAN

        # Título
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.5), Inches(0.75))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        # Línea de separación sutil
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.42), Inches(11.7), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_SUBTLE
        line.line.fill.background()

    def add_flat_card(slide, left, top, width, height, accent_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = BORDER_SUBTLE
        card.line.width = Pt(1.0)
        
        # Barra lateral izquierda de acento (4px)
        if accent_color:
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(0.06), height)
            bar.fill.solid()
            bar.fill.fore_color.rgb = accent_color
            bar.line.fill.background()
            
        return card

    # -------------------------------------------------------------
    # SLIDE 1: Portada Ejecutiva Full-Bleed
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Accent top bar UTP Red
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = UTP_RED
    top_bar.line.fill.background()

    # Logo UTP
    logo_path = os.path.join(img_dir, "logo_utp.png")
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(0.8), Inches(0.8), width=Inches(2.6))

    # Header institucional
    inst_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.7), Inches(0.4))
    tf_inst = inst_box.text_frame
    p_i = tf_inst.paragraphs[0]
    p_i.text = "UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP) :: FACULTAD DE INGENIERÍA"
    p_i.font.size = Pt(12)
    p_i.font.bold = True
    p_i.font.color.rgb = ACCENT_CYAN

    # Título Principal
    tit_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.7), Inches(1.6))
    tf_tit = tit_box.text_frame
    tf_tit.word_wrap = True
    p_t = tf_tit.paragraphs[0]
    p_t.text = "SIGIR - BCRP"
    p_t.font.size = Pt(36)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE
    p_sub = tf_tit.add_paragraph()
    p_sub.text = "Sistema Integrado de Gestión de Incidentes Regulatorios y Supervisión de Interoperabilidad"
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = ACCENT_GOLD
    p_hito = tf_tit.add_paragraph()
    p_hito.text = "Avance de Proyecto Final 3 (Semana 12) | Curso Integrador I: Sistemas Software (Sección 57524)"
    p_hito.font.size = Pt(13)
    p_hito.font.color.rgb = TEXT_MUTED

    # Docente
    doc_box = s1.shapes.add_textbox(Inches(0.8), Inches(4.3), Inches(11.7), Inches(0.4))
    tf_doc = doc_box.text_frame
    p_d = tf_doc.paragraphs[0]
    p_d.text = "Docente Evaluador: Ing. Yony Zamata Condori"
    p_d.font.size = Pt(13)
    p_d.font.bold = True
    p_d.font.color.rgb = TEXT_WHITE

    # 3 Member Cards
    team_members = [
        ("Frank Emiliano Vargas Huamán", "Líder Técnico & Arquitecto de Software", "U23243651 | Backend & DevOps Lead"),
        ("Fernando Alber Alfredo Romero Requejo", "Ingeniero de Requisitos & Procesos", "U21216410 | Frontend & UX Lead"),
        ("Joel Leonardo Olaya Vivas", "Ingeniero de Software & QA", "U21221688 | Base de Datos & Negocio")
    ]
    cur_x = 0.8
    for name, role, details in team_members:
        card = add_flat_card(s1, Inches(cur_x), Inches(4.9), Inches(3.7), Inches(1.8), ACCENT_BLUE)
        tf = card.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = name
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf.add_paragraph()
        p2.text = role
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_CYAN
        p3 = tf.add_paragraph()
        p3.text = details
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED
        cur_x += 4.0

    # -------------------------------------------------------------
    # SLIDE 2: Problemática y Dolor de Negocio (Bloque 1)
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "1. Definición del Problema: Asimetría Informativa en Pagos Digitales")

    c_left = add_flat_card(s2, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), ACCENT_RED)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = "PROCESO ACTUAL (AS-IS) :: CRÍTICO"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED

    items_l = [
        "• Detección Tardía: De 45 a 180 minutos para confirmar caídas de billeteras digitales (Yape, Plin).",
        "• Canales No Estructurados: Notificaciones por correo o llamadas informales de los bancos.",
        "• Asimetría Informativa: El BCRP se entera por redes sociales o quejas ciudadanas.",
        "• Hojas Mutables: Registros en Excel con riesgo de adulteración y falta de trazabilidad legal.",
        "• Incumplimiento de la Circular Nº 0011-2023 sobre interoperabilidad obligatoria."
    ]
    for it in items_l:
        pi = tf_l.add_paragraph()
        pi.text = it
        pi.font.size = Pt(12)
        pi.font.color.rgb = TEXT_MUTED

    c_right = add_flat_card(s2, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), ACCENT_GREEN)
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

    c_rf = add_flat_card(s3, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), ACCENT_BLUE)
    tf_rf = c_rf.text_frame
    tf_rf.word_wrap = True
    p = tf_rf.paragraphs[0]
    p.text = "REQUISITOS FUNCIONALES CLAVE (SRS)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    rf_pts = [
        ("RF-01: Ingesta de Telemetría", "Demonio @Scheduled cada 30 segundos sobre endpoints de salud."),
        ("RF-02: Auto-Apertura de Tickets", "Disparo de incidentes con código TKT-YYYY-XXXX al detectar caídas."),
        ("RF-03: Mitigación y SLA", "Cálculo en línea de indisponibilidad y porcentaje de cumplimiento."),
        ("RF-04: Reporte SFT", "Compilación de archivo plano normativo con hash SHA-256 inviolable."),
        ("RF-05: Consola Web NOC", "Tablero de control en tiempo real con semáforos por entidad.")
    ]
    for title, desc in rf_pts:
        p1 = tf_rf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_rf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    img_cu = os.path.join(img_dir, "figura2_casos_de_uso.png")
    if os.path.exists(img_cu):
        s3.shapes.add_picture(img_cu, Inches(6.7), Inches(1.6), Inches(5.8), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 4: Arquitectura del Sistema: Clean Architecture (Bloque 2)
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "3. Diseño del Sistema: Clean Architecture y Patrón MVC")

    c_mvc = add_flat_card(s4, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), ACCENT_PURPLE)
    tf_mvc = c_mvc.text_frame
    tf_mvc.word_wrap = True
    p = tf_mvc.paragraphs[0]
    p.text = "DESACOPLAMIENTO DE RESPONSABILIDADES"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    mvc_pts = [
        ("Capa Controladora (REST Web)", "Endpoints HTTP /api/v1/incidentes serializan DTOs inmutables."),
        ("Capa de Negocio (Service / Hexagonal)", "Orquestación de lógica pura, cálculo de SLA y reglas regulatorias."),
        ("Capa de Datos (DAO / Repository)", "Spring Data JPA con HikariCP e interfaces desacopladas."),
        ("Capa de Dominio Puro", "Entidades de negocio independientes de frameworks web."),
        ("Seguridad y RBAC", "Filtros Stateless y autenticación de roles para operadores NOC.")
    ]
    for title, desc in mvc_pts:
        p1 = tf_mvc.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_mvc.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    img_hex = os.path.join(img_dir, "figura6_arquitectura_hexagonal.png")
    if os.path.exists(img_hex):
        s4.shapes.add_picture(img_hex, Inches(6.7), Inches(1.6), Inches(5.8), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 5: Principios SOLID y Patrón DAO (Bloque 2 - Frank)
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "4. Rigor de Diseño: Principios SOLID y Patrón DAO")

    solid_items = [
        ("S - Single Responsibility", "TelemetriaWorker solo ingesta; IncidenteService solo orquesta; SftReportService solo sella reportes.", ACCENT_BLUE),
        ("O - Open / Closed", "Máquina de estados extensible mediante enumeraciones polimórficas sin modificar clases existentes.", ACCENT_GREEN),
        ("L - Liskov Substitution", "IIncidenteService define contratos seguros sustituibles por cualquier implementación mock o real.", ACCENT_CYAN),
        ("I - Interface Segregation", "Interfaces especializadas y acotadas evitando dependencias innecesarias para clientes REST.", ACCENT_PURPLE),
        ("D - Dependency Inversion", "Inyección por constructor (@RequiredArgsConstructor) sobre abstracciones desacopladas de frameworks.", ACCENT_GOLD)
    ]
    top_pos = 1.6
    for name, desc, col in solid_items:
        card = add_flat_card(s5, Inches(0.8), Inches(top_pos), Inches(11.7), Inches(0.9), col)
        tf = card.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = name
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_WHITE
        top_pos += 1.05

    # -------------------------------------------------------------
    # SLIDE 6: Jerarquía de Paquetes en el IDE (Bloque 2 - Frank)
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "5. Estructura de Paquetes en Java 17 y Spring Boot 3")

    c_pkg = add_flat_card(s6, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2), ACCENT_BLUE)
    tf_pkg = c_pkg.text_frame
    tf_pkg.word_wrap = True
    p = tf_pkg.paragraphs[0]
    p.text = "MODULARIDAD EN pe.bcrp.sigir"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    pkg_items = [
        ("pe.bcrp.sigir.web", "Controladores REST para incidentes, telemetría y reportes normativos."),
        ("pe.bcrp.sigir.service", "Lógica de negocio, orquestador de estados y motor de reportes SFT."),
        ("pe.bcrp.sigir.repository", "Acceso a datos mediante Spring Data JPA e interfaces DAO."),
        ("pe.bcrp.sigir.domain", "Entidades JPA inmutables, Records DTO y Value Objects."),
        ("pe.bcrp.sigir.config", "Seguridad Spring Security, CORS y documentación OpenAPI Swagger.")
    ]
    for pkg_name, pkg_desc in pkg_items:
        p1 = tf_pkg.add_paragraph()
        p1.text = pkg_name
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_pkg.add_paragraph()
        p2.text = pkg_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    img_ide = os.path.join(img_dir, "figura14_arbol_paquetes_ide.png")
    if os.path.exists(img_ide):
        s6.shapes.add_picture(img_ide, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 7: Seguridad Empresarial y Persistencia Inmutable (Frank)
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, "6. Seguridad Empresarial y Persistencia Inmutable en BD")

    c_sec = add_flat_card(s7, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), ACCENT_PURPLE)
    tf_sec = c_sec.text_frame
    tf_sec.word_wrap = True
    p = tf_sec.paragraphs[0]
    p.text = "SEGURIDAD DE APLICACIÓN Y RIESGOS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    sec_items = [
        ("Mitigación OWASP Top 10", "Parámetros tipados contra SQL Injection; escape estricto de payloads."),
        ("Mecanismos RBAC", "Roles definidos: OPERADOR_NOC, AUDITOR_BCRP y ADMIN_SISTEMA."),
        ("Modelo de Amenazas STRIDE", "Defensas contra Spoofing, Tampering, Repudiation y Denial of Service."),
        ("Control Transaccional", "Aislamiento READ COMMITTED contra Dirty Reads en telemetría."),
        ("Validación Bean Validation", "Anotaciones @NotNull, @Size y @Pattern en DTOs de entrada.")
    ]
    for title, desc in sec_items:
        p1 = tf_sec.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_sec.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    c_db = add_flat_card(s7, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2), ACCENT_GOLD)
    tf_db = c_db.text_frame
    tf_db.word_wrap = True
    p = tf_db.paragraphs[0]
    p.text = "DISPARADOR DE INMUTABILIDAD POSTGRESQL"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    db_items = [
        ("Garantía Probatoria Legal", "Las bitácoras regulatorias no admiten mutaciones ni borrados."),
        ("Disparador en PL/pgSQL", "Trigger BEFORE UPDATE OR DELETE lanza excepción explícita:"),
        ("SQLSTATE 55000 (Object Not Modifiable)", "'VIOLACIÓN: La bitácora de auditoría es inmutable'."),
        ("Integridad Referencial", "Claves foráneas estrictas y tipos monetarios en NUMERIC(15,2)."),
        ("Firma Criptográfica SHA-256", "Reportes planos SFT con hash determinista de verificación.")
    ]
    for title, desc in db_items:
        p1 = tf_db.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_db.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 8: Control de Versiones: GitFlow y Repositorio (Frank)
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, "7. Control de Versiones: GitFlow y Repositorio GitHub")

    c_git = add_flat_card(s8, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2), ACCENT_GREEN)
    tf_git = c_git.text_frame
    tf_git.word_wrap = True
    p = tf_git.paragraphs[0]
    p.text = "ESTRATEGIA DE VERSIONAMIENTO"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    git_pts = [
        ("Rama main (Producción / Hitos)", "Solo versiones aprobadas y testeables: v0.4.0 (APF1), v0.8.0 (APF2), v1.0.0 (APF3)."),
        ("Rama develop (Línea Base)", "Integración continua donde convergen las características."),
        ("Ramas feature/* (Desarrollo Atómico)", "feature/telemetria, feature/incidente-service-sla, feature/reporte-sft."),
        ("Conventional Commits", "Formato estándar: feat, fix, docs, test, refactor con trazabilidad atómica."),
        ("GitHub Remoto Sincronizado", "https://github.com/frankitoromas-tech/sigir-bcrp.git")
    ]
    for title, desc in git_pts:
        p1 = tf_git.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_git.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    img_git = os.path.join(img_dir, "figura15_gitflow_ramas_github.png")
    if os.path.exists(img_git):
        s8.shapes.add_picture(img_git, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 9: Pruebas y Validación: Enfoque TDD con JUnit 5 (Frank)
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_header(s9, "8. Pruebas y Validación: Enfoque TDD con JUnit 5 y Mockito")

    c_tdd = add_flat_card(s9, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2), ACCENT_CYAN)
    tf_td = c_tdd.text_frame
    tf_td.word_wrap = True
    p = tf_td.paragraphs[0]
    p.text = "COBERTURA DE PRUEBAS AUTOMATIZADAS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    tdd_pts = [
        ("Enfoque Red-Green-Refactor", "Desarrollo guiado por pruebas antes de codificar la lógica de negocio."),
        ("IncidenteServiceTest (3 tests)", "Valida creación de tickets, transición de estados y cálculo de SLA."),
        ("SftReportServiceTest (3 tests)", "Verifica estructura HEADER/DETALLE/FOOTER y hash SHA-256."),
        ("TelemetriaWorkerTest (2 tests)", "Simula pérdida de heartbeat y emisión de alerta en <30 s."),
        ("Resultado Maven Surefire", "8 pruebas ejecutadas, 0 fallos, 0 errores (100% de éxito).")
    ]
    for title, desc in tdd_pts:
        p1 = tf_td.add_paragraph()
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p2 = tf_td.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    img_tdd = os.path.join(img_dir, "figura16_evidencias_junit5_tests.png")
    if os.path.exists(img_tdd):
        s9.shapes.add_picture(img_tdd, Inches(6.6), Inches(1.6), Inches(5.9), Inches(5.2))

    # -------------------------------------------------------------
    # SLIDE 10: Demostración en Vivo: Consola NOC Web (Bloque 3)
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_header(s10, "9. Demostración en Vivo: Consola NOC Web en Tiempo Real")

    c_demo = add_flat_card(s10, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2), ACCENT_BLUE)
    tf_dm = c_demo.text_frame
    tf_dm.word_wrap = True
    p = tf_dm.paragraphs[0]
    p.text = "FLUJO OPERATIVO EN VIVO"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    dm_pts = [
        "1. Semáforo Telemétrico en Vivo: Health check cada 30 segundos sobre entidades financieras.",
        "2. Inyección de Contingencia: Simulación de caída HTTP 503 en pasarela de pagos.",
        "3. Creación Atómica de Ticket: Detección en < 30s generando ticket formal correlativo.",
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
    # SLIDE 11: Validación del Alcance Comprometido 55% vs 40%
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "10. Construcción del Producto: Alcance 55% vs 40% Exigido")

    c_alc = add_flat_card(s11, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.2), ACCENT_GOLD)
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

    c_concl = add_flat_card(s12, Inches(1.5), Inches(1.6), Inches(10.333), Inches(5.2), ACCENT_CYAN)
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
    print(f"SUCCESS: Presentacion ejecutiva guardada en: {out_path}")

if __name__ == "__main__":
    create_deck()
