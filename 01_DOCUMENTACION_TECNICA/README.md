# 📚 01_DOCUMENTACION_TECNICA — Índice Maestro de Entregables (APF3 - Semana 12)

Este directorio consolida los documentos académicos y artefactos formales del proyecto **SIGIR - BCRP** para el **Curso Integrador I: Sistemas Software (Sección 57524, 7mo Ciclo - UTP)**, estructurados bajo la rúbrica oficial de cátedra del **Ing. Yony Zamata Condori** para el **Entregable III (Semana 12)**.

---

## 🏆 Entregable III Oficial (Avance de Proyecto Final 3 — Semana 12)

| Formato | Documento Oficial | Descripción y Cobertura Académica | Enlace Directo |
| :---: | :--- | :--- | :---: |
| 📕 | **Informe Académico Entregable III (PDF)** | Documento oficial consolidado bajo norma **APA 7ma Edición** (26 páginas, 8 tablas APA 7 sin bordes verticales, 16 figuras técnicas en alta resolución y 8 anexos). Listo para Canvas UTP. | [Descargar PDF](INFORME_ACADEMICO_ENTREGABLE_III_SIGIR_BCRP.pdf) |
| 📄 | **Informe Académico Entregable III (Word)** | Versión editable oficial (.docx, 4.5 MB) con estilos corporativos UTP, tipografía Times New Roman y metadatos formales. | [Descargar DOCX](INFORME_ACADEMICO_ENTREGABLE_III_SIGIR_BCRP.docx) |
| 📝 | **Informe Académico Entregable III (Markdown)** | Versión técnica Markdown para lectura y diffs en repositorio con fórmulas KaTeX y diagramas Mermaid. | [Ver Markdown](INFORME_ACADEMICO_ENTREGABLE_III_SIGIR_BCRP.md) |
| 📽️ | **Presentación Ejecutiva Oficial APF3 (PPTX)** | Diapositivas ejecutivas oficiales en formato 16:9 widescreen (12 láminas de alto impacto con figuras técnicas y diagramas). | [Descargar PPTX](PRESENTACION_EJECUTIVA_APF3.pptx) |
| 🎤 | **Guía Maestra de Sustentación Oral APF3** | Guion pedagógico cronometrado a 12 minutos máximos para 3 integrantes (Fernando 3.5 min, Frank 4.5 min, Joel 4.0 min) y banco de preguntas del jurado. | [Ver Guía Oral](GUIA_DE_EXPOSICION_Y_PONENCIA_APF3.md) |
| 📋 | **Guía Oficial de Estructura de Cátedra** | Documento base de requisitos y rúbrica emitido por la universidad (`Contenido entregable III.pdf`). | [Ver Guía PDF](Contenido%20entregable%20III.pdf) |

---

## 🗺️ Matriz de Cumplimiento del Capítulo 3 — Entregable III

| Acápite de Rúbrica | Criterio Técnico Exigido | Evidencia Implementada en el Repositorio | Estado |
| :--- | :--- | :--- | :---: |
| **3.1 Análisis del Sistema** | 5 Requisitos Funcionales (RF-01 a RF-05) y 4 No Funcionales (RNF-01 a RNF-04). | `INFORME_ACADEMICO_ENTREGABLE_III_SIGIR_BCRP.md` (Sección 3.1) y especificaciones en `ESPECIFICACION_REQUISITOS_IEEE830.md`. | **100% Cumplido** |
| **3.2 Diseño del Sistema** | Arquitectura Clean / Hexagonal aplicando MVC, TDD, DAO y SOLID, más mecanismos de seguridad. | `IncidenteController` (MVC), `IncidenteRepository` (DAO), `SecurityConfig` (RBAC + BCrypt) y disparadores PL/pgSQL inmutables `55000`. | **100% Cumplido** |
| **3.3 Implementación** | Estructura Maven, Java 17, Spring Boot 3, librerías oficiales y módulos funcionales. | Proyecto completo en `03_BACKEND_SPRINGBOOT` (`pom.xml`, entities, services, controllers, workers). | **100% Cumplido** |
| **3.4 Control de Versiones** | Repositorio GitHub, ramas GitFlow (`main`, `feature/*`), commits semánticos y sincronización. | Historial Git trazable, remote sincronizado en `https://github.com/frankitoromas-tech/sigir-bcrp`. | **100% Cumplido** |
| **3.5 Pruebas TDD** | Suite de pruebas unitarias automatizadas con JUnit 5 y Mockito bajo ciclo Red-Green-Refactor. | 8/8 pruebas unitarias pasando al 100% en `03_BACKEND_SPRINGBOOT/src/test/java/pe/gob/bcrp/sigir/`. | **100% Cumplido** |
| **3.6 Construcción Final** | Integración SPA + API REST + DB y validación de alcance mínimo (40% requerido). | Integración completa en tiempo real con **55% de alcance funcional alcanzado** (+15% sobre la meta). | **SUPERADO (+15%)** |

---

## 📁 Especificaciones de Ingeniería de Soporte

* [`ESPECIFICACION_REQUISITOS_IEEE830.md`](ESPECIFICACION_REQUISITOS_IEEE830.md): SRS formal IEEE 830 (12 RFs y 8 RNFs bajo ISO/IEC 25010).
* [`PLANIFICACION_SCRUM_CRONOGRAMA.md`](PLANIFICACION_SCRUM_CRONOGRAMA.md): Gestión ágil Scrum, WBS/EDT a 3 niveles y Cronograma Gantt.
* [`MODELO_PROCESOS_BPMN_2_0.md`](MODELO_PROCESOS_BPMN_2_0.md): Diagramación de procesos As-Is y To-Be con notación BPMN 2.0.
* [`ARQUITECTURA_Y_DISENO_SISTEMA.md`](ARQUITECTURA_Y_DISENO_SISTEMA.md): Desacoplamiento hexagonal, puertos, adaptadores y seguridad.
* [`REPORTES_CLAVE_Y_API.md`](REPORTES_CLAVE_Y_API.md): Fórmulas matemáticas de SLA, endpoints REST analíticos y especificación del formato normativo SFT.

---

## 🖼️ Galería de Figuras Técnicas Incorporadas (`01_DOCUMENTACION_TECNICA/imagenes/`)

1. `figura1_bpmn_flujo_proceso.png`: Modelado de procesos As-Is vs To-Be en notación BPMN 2.0.
2. `figura2_casos_de_uso.png`: Diagrama de casos de uso UML 2.5 con los 4 actores del sistema.
3. `figura6_arquitectura_hexagonal.png`: Arquitectura de software por capas (Clean Architecture / Ports & Adapters).
4. `figura7_dashboard_noc_web.png`: Consola Web NOC en tiempo real con semáforos de telemetría.
5. `figura9_mockups_alt2_clean_api.png`: Mockups de interfaz de la Alternativa 2 seleccionada.
6. `figura11_der_fisico_logico_postgresql.png`: Diagrama Entidad-Relación Físico/Lógico en 3FN para PostgreSQL 15.
7. `figura12_clases_diseno_hexagonal.png`: Diagrama de clases de diseño en Spring Boot 3.
8. `figura13_gantt_avance_apf2.png`: Cronograma visual Gantt del proyecto.
9. `figura14_arbol_paquetes_ide.png`: Jerarquía de paquetes y estructura Clean Architecture en el IDE.
10. `figura15_gitflow_ramas_github.png`: Estrategia de ramas GitFlow y trazabilidad de commits en GitHub.
11. `figura16_evidencias_junit5_tests.png`: Reporte de ejecución de pruebas unitarias Maven Surefire (8/8 tests exitosos).
12. `figura17_matriz_alcance_40_porciento.png`: Matriz visual de alcance funcional (55% alcanzado vs 40% meta sílabo).
13. `anexo1_project_charter.png`: Acta de constitución formal del proyecto (Project Charter).
14. `anexo2_modelo_lean_canvas.png`: Modelo Lean Canvas formal de 9 cuadrantes.
