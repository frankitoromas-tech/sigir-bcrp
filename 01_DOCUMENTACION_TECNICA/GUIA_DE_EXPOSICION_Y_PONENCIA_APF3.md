# 🎤 GUÍA MAESTRA DE SUSTENTACIÓN ORAL — ENTREGABLE III / APF3 (HITO SEMANA 12)
### *Ponencia Didáctica, Pedagógica y Fluidamente Humana para 3 Integrantes*
**Proyecto:** SIGIR - BCRP (Sistema de Gestión de Incidentes Regulatorios para Pagos Digitales)  
**Curso:** Curso Integrador I: Sistemas Software (Sección 57524, 7mo Ciclo)  
**Docente Evaluador:** Ing. Yony Zamata Condori  
**Institución:** Universidad Tecnológica del Perú (UTP) — Facultad de Ingeniería  

---

## 🧭 1. Filosofía Pedagógica: Cómo Ganarse al Jurado en 12 Minutos (Tiempo Máximo)

> [!IMPORTANT]
> **La Regla de Oro del Equipo (Cero Lectura Robótica y Control del Reloj):**  
> El tiempo máximo reglamentario de la sustentación es de **12 minutos**. Un jurado de ingeniería no evalúa la capacidad de un estudiante para leer diapositivas en voz alta; evalúa su **criterio profesional, solvencia técnica, claridad pedagógica, manejo del tiempo y capacidad de trabajo en equipo**.  
> 
> Durante los 12 minutos máximos de la sustentación:
> 1. **Mirada al jurado y a la cámara:** Hablar con convicción técnica, modular la voz y mantener un ritmo dinámico y pausado.
> 2. **Cero lectura literal:** La diapositiva es un soporte visual sintético; la explicación técnica profunda proviene de ustedes.
> 3. **Transiciones naturales entre ponentes:** No decir "le doy pase a mi compañero", sino hilvanar técnicamente: *"Para conectar este requerimiento normativo con la arquitectura técnica que lo hace posible, Frank explicará el desacoplamiento en capas..."*.
> 4. **Demostración respaldada con evidencia:** Cada afirmación debe sustentarse en código compilado (`03_BACKEND_SPRINGBOOT`), pruebas verdes (`mvn test`), commits en GitHub o datos en la base de datos PostgreSQL.

---

## ⏱️ 2. Estructura Cronometrada de la Ponencia (12 Minutos • 3 Integrantes)

```text
[00:00 - 03:30]  BLOQUE 1: FERNANDO ROMERO (3.5 min)  -> Problemática, Objetivos, SRS IEEE 830 y Casos de Uso
[03:30 - 08:00]  BLOQUE 2: FRANK VARGAS    (4.5 min)  -> Arquitectura MVC, DAO, SOLID, Seguridad y Base de Datos Inmutable
[08:00 - 12:00]  BLOQUE 3: JOEL OLAYA      (4.0 min)  -> Pruebas TDD (JUnit 5 8/8), Live Demo Consola NOC y Alcance 55%
```

---

## 🎙️ 3. Guion Detallado Minuto a Minuto por Integrante

### 👤 BLOQUE 1: FERNANDO ROMERO REQUEJO (00:00 – 03:30 | 3.5 Minutos)
**Rol:** Ingeniero de Requisitos & Procesos  
**Objetivo del Bloque:** Captar la atención del jurado con el dolor de negocio real, fundamentar la normativa del BCRP y presentar los requerimientos funcionales y casos de uso del Entregable III.

#### Minuto 00:00 – 01:00 | Apertura y Dolor de Negocio (El Gancho)
> *"Buenos días, estimado profesor Ing. Yony Zamata y compañeros presentes. Imaginen por un segundo un viernes a las 7 de la noche: millones de peruanos intentan pagar su cena, sus compras o el transporte público mediante Yape o Plin, pero la transacción se queda congelada. El dinero sale de la cuenta, no llega al comercio y nadie sabe qué ocurrió.*  
> *Históricamente, en el Banco Central de Reserva del Perú (BCRP), la detección de estas contingencias interbancarias demoraba entre 45 minutos y hasta 3 horas, dependiendo de llamadas telefónicas y correos tardíos de los bancos. Esta asimetría informativa vulnera la confianza pública en el sistema de pagos.*  
> *Para resolver esta brecha crítica, desarrollamos **SIGIR - BCRP**: un Sistema Integral de Gestión de Incidentes Regulatorios que reduce el tiempo de detección de 180 minutos a menos de 30 segundos, supervisando en tiempo real a las entidades bajo la Circular BCRP N° 0011-2023."*

#### Minuto 01:00 – 02:15 | Requisitos Funcionales y No Funcionales (SRS IEEE 830)
> *"Para este Entregable III, formalizamos la especificación bajo el estándar SRS IEEE 830 en el acápite 3.1:*  
> *- **RF-01:** Ingestión de telemetría continua de las entidades financieras reguladas (BCP, BBVA, Interbank, Scotiabank).*  
> *- **RF-02:** Detección autónoma y clasificación de severidad ante caídas de servicio (CRÍTICO, ALTO, MEDIO, BAJO).*  
> *- **RF-03:** Gestión del ciclo de vida de incidentes regulatorios con tickets correlativos (`INC-YYYYMMDD-XXXXX`).*  
> *- **RF-04:** Compilación y sellado de reportes normativos SFT con firma criptográfica SHA-256.*  
> *- **RF-05:** Dashboard analítico en tiempo real para operadores NOC y supervisores BCRP.*  
> *En los atributos no funcionales, garantizamos concurrencia asíncrona, disponibilidad del 99.9% y un manejo formal de errores mediante el estándar RFC 7807 (ProblemDetail)."*

#### Minuto 02:15 – 03:30 | Diagrama de Casos de Uso y Transición Técnica
> *"En el acápite 3.2.2 modelamos las interacciones mediante el Diagrama de Casos de Uso UML 2.5:*  
> *- El **Operador NOC**, que gestiona la consola y registra incidentes manuales asistidos.*  
> *- El **Daemon de Telemetría**, que ejecuta el sondeo continuo sin intervención humana.*  
> *- Y el **Supervisor BCRP**, que audita métricas de SLA y descarga los reportes normativos.*  
> *Ahora bien, ¿cómo logramos que este sistema soporte alta concurrencia, sea tolerante a fallos y cumpla estrictamente con la inmutabilidad que exige el regulador? Para explicar la arquitectura de software, los principios de diseño y la persistencia inmutable, cedo la palabra a nuestro Líder Técnico, Frank Vargas."*

---

### 👤 BLOQUE 2: FRANK EMILIANO VARGAS HUAMÁN (03:30 – 08:00 | 4.5 Minutos)
**Rol:** Líder Técnico & Arquitecto de Software  
**Objetivo del Bloque:** Demostrar maestría en arquitectura de software (Clean Architecture, MVC, DAO, SOLID), explicar los mecanismos de seguridad empresarial y sustentar la inmutabilidad de la base de datos en PostgreSQL 15.

#### Minuto 03:30 – 04:30 | Arquitectura de Software: Clean Architecture y Patrón MVC
> *"Muchas gracias, Fernando. Saludos cordiales, profesor Zamata.*  
> *En el acápite 3.2.1 diseñamos e implementamos una arquitectura desacoplada basada en **Clean Architecture** y el patrón **MVC (Model-View-Controller)** en Java 17 con Spring Boot 3.2.3.*  
> *- **Controlador (C):** `IncidenteController` expone contratos RESTful limpios. Nunca exponemos entidades de base de datos directamente al cliente; utilizamos DTOs inmutables respaldados por `Java Records` y Jakarta Bean Validation.*  
> *- **Servicio / Lógica de Negocio (M):** `IncidenteService` actúa como el motor central que gobierna la máquina de estados de los tickets regulatorios (`REGISTRADO` $\rightarrow$ `EN_EVALUACION` $\rightarrow$ `MITIGADO` $\rightarrow$ `CERRADO`), impidiendo saltos de estado inválidos.*  
> *- **Vista (V):** Desacoplada mediante una Single Page Application (SPA) reactiva que consume la API mediante JSON asíncrono.*  
> *Esta separación garantiza que el núcleo de negocio sea completamente independiente del framework web y del motor de persistencia."*

#### Minuto 04:30 – 05:45 | Patrón DAO, Principios SOLID y Estructura de Paquetes
> *"Como exige la rúbrica del Entregable III en su acápite 3.2.1.1, aplicamos rigurosamente el patrón **DAO (Data Access Object)** y los principios **SOLID**:*  
> *- **Patrón DAO:** Materializado a través de interfaces `IncidenteRepository` y `EntidadFinancieraRepository` extendiendo de `JpaRepository`. Esto encapsula por completo el acceso a datos SQL mediante abstracciones de alto nivel.*  
> *- **Single Responsibility (SRP):** Cada clase tiene una única razón para cambiar. `TelemetriaWorker` solo monitorea; `IncidenteService` solo gobierna reglas de negocio; `SftReportService` solo compila y sella reportes criptográficos.*  
> *- **Open/Closed (OCP):** El sistema es abierto a extensión pero cerrado a modificación mediante el polimorfismo de enumeraciones tipadas (`SeveridadIncidente`, `EstadoIncidente`).*  
> *- **Liskov Substitution (LSP):** Diseñamos contratos claros con `IIncidenteService`, garantizando que cualquier implementación alternativa pueda sustituirla sin romper los controladores.*  
> *- **Interface Segregation (ISP):** Creamos interfaces acotadas evitando métodos innecesarios.*  
> *- **Dependency Inversion (DIP):** Los controladores y servicios dependen exclusivamente de abstracciones mediante inyección de dependencias por constructor vía Spring IoC.*  
> *En la **Figura 14** del informe pueden observar el árbol de paquetes del proyecto, donde `domain`, `repository`, `service`, `web` y `security` reflejan esta pureza arquitectónica."*

#### Minuto 05:45 – 07:00 | Mecanismos de Seguridad (Spring Security + RBAC + Inmutabilidad SQLSTATE 55000)
> *"En el acápite 3.3.5 implementamos una defensa en profundidad en dos capas indispensables para una entidad financiera:*  
> *1. **Capa de Aplicación (Spring Security):** Autenticación HTTP Basic con contraseñas cifradas bajo `BCrypt` y control de acceso basado en roles (RBAC) con dos perfiles estrictos:*  
>    *- `ROLE_OPERADOR_SISTEMA`: facultado para registrar y atender tickets operativos.*  
>    *- `ROLE_SUPERVISOR_BCRP`: con privilegios para auditar, consultar telemetría global y descargar reportes SFT.*  
> *2. **Capa de Base de Datos (Inmutabilidad Absoluta en PostgreSQL):** En regulación bancaria, un incidente jamás puede borrarse ni modificarse para alterar auditorías. Por ello, en [`01_SCHEMA_DDL_POSTGRESQL.sql`](../02_BASE_DE_DATOS/01_SCHEMA_DDL_POSTGRESQL.sql) programamos la función PL/pgSQL `fn_historial_estado_append_only` con un disparador que bloquea todo `UPDATE` o `DELETE` sobre la bitácora de auditoría, disparando la excepción `SQLSTATE '55000'`. Ni siquiera un administrador con permisos DML puede alterar el registro histórico."*

#### Minuto 07:00 – 08:00 | Control de Versiones con GitFlow y Transición
> *"En el acápite 3.4 evidenciamos el control de versiones profesional: repositorio alojado en GitHub bajo la cuenta del equipo, ramas organizadas bajo metodología GitFlow (`main`, `feature/reportes-clave-documentacion`) y commits semánticos (`feat:`, `fix:`, `docs:`, `ci:`) que garantizan trazabilidad total.*  
> *Ahora bien, ¿cómo demostramos que este software funciona bajo rigor de ingeniería y que cumple con el alcance comprometido para este hito? Para presentar la suite de pruebas TDD, la demo en vivo y la validación del 55% de avance, cedo la palabra a nuestro Ingeniero de Software & QA, Joel Olaya."*

---

### 👤 BLOQUE 3: JOEL LEONARDO OLAYA VIVAS (08:00 – 12:00 | 4.0 Minutos)
**Rol:** Ingeniero de Software & QA  
**Objetivo del Bloque:** Validar la calidad del software con pruebas unitarias TDD ejecutándose en verde, demostrar la Consola NOC en tiempo real y certificar el cumplimiento del 55% de alcance funcional (superando el 40% exigido por la rúbrica).

#### Minuto 08:00 – 09:15 | Enfoque TDD con JUnit 5 y Mockito (Acápite 3.5)
> *"Muchas gracias, Frank. Profesor Zamata, buenos días.*  
> *En el acápite 3.5 del entregable aplicamos el enfoque **TDD (Test-Driven Development)** mediante el ciclo clásico: escribir primero la prueba en rojo, implementar la solución mínima en verde y luego refactorizar.*  
> *Desarrollamos una suite automatizada de pruebas unitarias con **JUnit 5, Mockito y AssertJ** en `src/test/java`, cubriendo los componentes neurálgicos:*  
> *1. **`IncidenteServiceTest` (3 tests):** Valida la creación de tickets correlativos, la transición legítima de estados y el rechazo inmediato ante intentos de saltos ilícitos (ej. de REGISTRADO a CERRADO).*  
> *2. **`SftReportServiceTest` (2 tests):** Valida la compilación del archivo plano regulatorio y certifica que el cálculo del hash SHA-256 de 64 caracteres hexadecimales sea determinista y matemáticamente exacto.*  
> *3. **`TelemetriaWorkerTest` (3 tests):** Simula la latencia en condiciones normales, la inyección de caídas HTTP 503 en la API de los bancos y el disparo automático de la alerta BCRP.*  
> *Como se evidencia en la **Figura 16** del informe y en la consola Maven, el resultado es rotundo: **Tests run: 8, Failures: 0, Errors: 0, Skipped: 0**. Un 100% de éxito en ejecución continua."*

#### Minuto 09:15 – 10:45 | Demostración en Vivo: Consola NOC Web y Flujo de Contingencia
> *"Pasemos a ver el producto en funcionamiento.* *(Joel proyecta la pantalla de la Consola NOC)*  
> *Aquí tenemos la Consola NOC Web de SIGIR - BCRP integrada con la API REST:*  
> *1. **Monitoreo en Tiempo Real:** Observen los indicadores de BCP (Yape), BBVA (Plin), Interbank y Scotiabank con latencias inferiores a 200 ms y estado en verde.*  
> *2. **Inyección de Falla (Simulador de Contingencia):** Voy a simular la caída de la pasarela de pagos de una de las entidades. Inyectamos un error HTTP 503.*  
> *3. **Respuesta Automática en < 30 Segundos:** Inmediatamente, el `TelemetriaWorker` detecta la anomalía, el semáforo cambia a rojo parpadeante y el motor de incidentes genera de forma atómica el ticket `INC-20261031-10001` con severidad CRÍTICA.*  
> *4. **Generación del Reporte SFT con SHA-256:** Nos dirigimos al módulo de reportes, filtramos el periodo y compilamos el archivo plano normativo. El sistema exporta la cabecera 01, el detalle 02 con el ticket recién generado y el pie 03 sellado con su firma digital SHA-256 inalterable."*

#### Minuto 10:45 – 11:30 | Validación del Cumplimiento del Alcance Comprometido (55% vs 40%)
> *"Para este Entregable III, el sílabo de Curso Integrador I y la rúbrica docente exigen un avance mínimo del **40%** del producto de software.*  
> *En la **Figura 17** y en la **Tabla 7** de nuestro informe académico, demostramos con evidencia verificable que hemos alcanzado un **55.0% de avance funcional global**, superando ampliamente la meta por 15 puntos porcentuales:*  
> *- Ingesta de Telemetría: **70%** completado.*  
> *- Motor de Incidentes: **65%** completado.*  
> *- Base de Datos PostgreSQL y Triggers: **75%** completado.*  
> *- Seguridad y RBAC: **60%** completado.*  
> *- Reportes Regulatorios SFT: **60%** completado.*  
> *- Frontend SPA: **50%** completado.*  
> *El producto no es una maqueta estática; es un software integrado, compilable, probado y funcional."*

#### Minuto 11:30 – 12:00 | Conclusiones, Recomendaciones y Cierre Ejecutivo
> *"En conclusión:*  
> *1. Demostramos la viabilidad técnica de reducir la detección de contingencias de 180 minutos a menos de 30 segundos.*  
> *2. Aplicamos estándares de ingeniería de software corporativo con Clean Architecture, MVC, DAO, SOLID y TDD.*  
> *3. Garantizamos la inmutabilidad regulatoria mediante disparadores SQLSTATE 55000 y sellado SHA-256.*  
> *Quedamos a su entera disposición para responder a las preguntas técnicas del jurado. Muchas gracias."*

---

## 🧠 4. Banco Estratégico de Preguntas del Jurado y Respuestas Maestras

### P1 (Para Frank): *"¿Por qué implementaron el trigger de inmutabilidad en la base de datos y no únicamente en el código Java con validaciones de Spring Boot?"*
> **Respuesta Maestra (Frank):**  
> *"Excelente pregunta, profesor. Si implementamos la validación únicamente en el servicio Java, cualquier usuario con acceso directo al cliente SQL (por ejemplo, vía pgAdmin o una consola psql) podría ejecutar un `UPDATE` malicioso y alterar el historial sin que Spring Boot se entere. En un entorno bancario y regulatorio como el BCRP, rige el principio de **Defensa en Profundidad**. Al colocar el trigger `BEFORE UPDATE OR DELETE` con `SQLSTATE '55000'` a nivel de motor de PostgreSQL, garantizamos la inmutabilidad física del registro, haciendo matemáticamente imposible la mutación sin importar el origen de la conexión."*

### P2 (Para Frank): *"¿Cómo garantiza la arquitectura el principio de Inversión de Dependencias (DIP) entre el controlador y la base de datos?"*
> **Respuesta Maestra (Frank):**  
> *"El principio DIP establece que los módulos de alto nivel no deben depender de módulos de bajo nivel, sino de abstracciones. En nuestro backend, `IncidenteController` no conoce la clase concreta `IncidenteService`, sino la interfaz `IIncidenteService`. A su vez, el servicio no implementa SQL crudo ni se acopla al driver JDBC, sino que consume la abstracción `IncidenteRepository` mediante inyección por constructor. Esto desacopla el ciclo de vida del negocio de los detalles de infraestructura."*

### P3 (Para Joel): *"¿Qué diferencia hay entre una prueba unitaria con Mockito y una prueba de integración en su proyecto?"*
> **Respuesta Maestra (Joel):**  
> *"En las pruebas unitarias que mostramos con Mockito, aislamos el componente bajo prueba falseando sus dependencias mediante `@Mock` y verificando únicamente la lógica interna con `@InjectMocks`. Por ejemplo, en `IncidenteServiceTest`, simulamos que el repositorio guarda el ticket sin levantar una base de datos real, lo que permite ejecutar 8 pruebas en milisegundos. En cambio, en una prueba de integración levantaríamos el contexto de Spring con Testcontainers o H2 para comprobar la comunicación real entre JPA y PostgreSQL."*

### P4 (Para Fernando): *"¿Qué sucede si un banco sufre interrupciones intermitentes de 5 segundos cada minuto? ¿El sistema colapsa creando cientos de tickets?"*
> **Respuesta Maestra (Fernando):**  
> *"No, profesor. Diseñamos la regla de negocio **RN-01**: el sistema evalúa la persistencia del fallo y comprueba mediante un índice parcial único (`idx_incidente_abierto_unico`) si la entidad ya cuenta con un ticket en estado `REGISTRADO` o `EN_EVALUACION`. Si ya existe una incidencia abierta, las nuevas caídas se anexan como eventos de telemetría a la bitácora sin generar tickets duplicados, evitando la saturación del NOC."*
