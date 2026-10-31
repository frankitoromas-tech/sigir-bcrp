# ⚙️ 03_BACKEND_SPRINGBOOT — API Core & Motor Regulador BCRP

Módulo backend empresarial desarrollado bajo **Java 17 LTS** y **Spring Boot 3.2.3**, aplicando principios de **Clean Architecture**, el patrón **MVC**, el patrón **DAO** y los principios **SOLID**.

---

## 🏛️ 1. Arquitectura de Paquetes (`pe.gob.bcrp.sigir`)

```text
pe.gob.bcrp.sigir/
├── 📁 domain/                 # Entidades JPA y Enumeraciones del Dominio
│   ├── Incidente.java         # Entidad principal con ciclo de vida y SLA
│   ├── EntidadFinanciera.java # Catálogo regulatorio de participantes (BCP, BBVA, etc.)
│   ├── HistorialEstado.java   # Bitácora inmutable append-only
│   ├── EstadoIncidente.java   # Enum: REGISTRADO, EN_EVALUACION, MITIGADO, CERRADO
│   └── SeveridadIncidente.java# Enum: CRITICO, ALTO, MEDIO, BAJO
├── 📁 repository/             # Capa DAO (Data Access Object) con Spring Data JPA
│   ├── IncidenteRepository.java
│   ├── EntidadFinancieraRepository.java
│   └── HistorialEstadoRepository.java
├── 📁 service/                # Lógica de Negocio y Reglas Normativas
│   ├── IIncidenteService.java # Contrato de servicio desacoplado
│   ├── IncidenteService.java  # Implementación de transiciones y SLA
│   └── SftReportService.java  # Compilador plano SFT con firma SHA-256
├── 📁 web/                    # Capa de Presentación REST (MVC - Controller)
│   ├── controller/
│   │   ├── IncidenteController.java    # Endpoints /api/v1/incidentes
│   │   └── GlobalExceptionHandler.java # Manejo formal RFC 7807 ProblemDetail
│   └── dto/
│       ├── IncidenteRequestDTO.java    # Record inmutable con validación Jakarta
│       └── IncidenteResponseDTO.java   # Proyección limpia hacia clientes
├── 📁 worker/                 # Telemetría Concurrente Asíncrona
│   └── TelemetriaWorker.java  # ScheduledExecutorService (Polling cada 30s)
└── 📁 security/               # Seguridad y Control de Acceso
    └── SecurityConfig.java    # HTTP Basic + BCrypt + RBAC (OPERADOR / SUPERVISOR)
```

---

## 🔒 2. Seguridad y Perfiles de Acceso (RBAC)

* **Autenticación:** HTTP Basic respaldado por `BCryptPasswordEncoder` (factor de costo 10).
* **Roles de Acceso:**
  * `ROLE_OPERADOR_SISTEMA`: Acceso a operaciones de registro y transición de incidentes.
  * `ROLE_SUPERVISOR_BCRP`: Acceso irrestricto a auditoría, telemetría global y exportación de reportes SFT.
* **Manejo de Errores Estándar:** Respuestas bajo **RFC 7807** (`ProblemDetail`) con códigos de estado semánticos (400, 401, 403, 404, 409, 500).

---

## 🧪 3. Suite Automatizada de Pruebas (TDD con JUnit 5 & Mockito)

El módulo cuenta con cobertura total de los caminos críticos de negocio:

```bash
# Ejecutar todas las pruebas unitarias
mvn clean test
```

### Resultados de Ejecución:
* **`IncidenteServiceTest` (3 tests):** Creación manual, transición secuencial válida y rechazo de saltos inválidos de estado.
* **`SftReportServiceTest` (2 tests):** Compilación de lotes normativos y sellado criptográfico determinista **SHA-256 (64 caracteres hex)**.
* **`TelemetriaWorkerTest` (3 tests):** Simulación de latencia normal, detección de error HTTP 503 y manejo de timeout de pasarela bancaria.

```text
[INFO] Results:
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 🚀 4. Compilación y Ejecución Local

### Prerrequisitos:
* **JDK:** Java Development Kit 17 LTS instalado (`java -version`).
* **Maven:** Apache Maven 3.9+ (`mvn -version`).
* **Base de Datos:** PostgreSQL 15 en ejecución en `localhost:5432` con esquema `bcrp_incident_db`.

### Comandos:
```bash
# Compilar proyecto sin tests
mvn clean package -DskipTests

# Ejecutar aplicación Spring Boot en puerto 8080
mvn spring-boot:run
```
Acceso a la API: `http://localhost:8080/api/v1/incidentes`

