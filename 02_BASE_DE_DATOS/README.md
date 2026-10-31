# 🗄️ 02_BASE_DE_DATOS — Modelo Relacional e Inmutabilidad Forense (PostgreSQL 15)

Scripts DDL y de inicialización del modelo de datos para el proyecto **SIGIR - BCRP**, diseñado bajo **Tercera Forma Normal (3FN)** y principios de **Defensa en Profundidad**.

---

## 🏛️ 1. Estructura de Tablas Normalizadas

| Tabla | Propósito y Descripción | Restricciones de Integridad |
| :--- | :--- | :--- |
| `entidades_financieras` | Catálogo oficial de entidades reguladas (BCP, BBVA, Interbank, etc.). | `PRIMARY KEY (id)`, `UNIQUE (codigo_bancario)`. |
| `incidentes` | Registro formal de contingencias y tickets normativos. | `PRIMARY KEY (id)`, `UNIQUE (codigo_ticket)`, `FK (entidad_id)`. |
| `telemetria_pings` | Serie temporal de respuestas HTTP y latencias de sondeo. | `PRIMARY KEY (id)`, `FK (entidad_id)`, `INDEX (fecha_hora)`. |
| `historial_estados` | Bitácora inmutable de transiciones de ciclo de vida del ticket. | `PRIMARY KEY (id)`, `FK (incidente_id)`, **Inmutable (Append-Only)**. |
| `reportes_sft` | Metadata de lotes normativos generados y sellados con SHA-256. | `PRIMARY KEY (id)`, `UNIQUE (codigo_reporte)`. |
| `usuarios_ad` | Cuentas de usuario mapeadas contra Directorio Activo con RBAC. | `PRIMARY KEY (id)`, `UNIQUE (username)`. |

---

## 🔒 2. Inmutabilidad Histórica a Nivel de Motor (Disparador PL/pgSQL)

Para auditorías forenses del BCRP, la bitácora `historial_estados` prohíbe cualquier mutación física. Un intento de ejecutar `UPDATE` o `DELETE` es interceptado a nivel de motor SQL:

```sql
CREATE OR REPLACE FUNCTION fn_historial_estado_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN REGULATORIA BCRP: La tabla historial_estados es estrictamente APPEND-ONLY.'
    USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_estado_inmutable
BEFORE UPDATE OR DELETE ON historial_estados
FOR EACH ROW EXECUTE FUNCTION fn_historial_estado_append_only();
```

---

## ⚡ 3. Control de Concurrencia (Regla RN-01: Índice Parcial Único)

Para impedir condiciones de carrera donde múltiples hilos intenten abrir más de un ticket simultáneo para una entidad caída, se aplica un índice parcial condicional:

```sql
CREATE UNIQUE INDEX idx_incidente_abierto_unico
ON incidentes(entidad_id)
WHERE estado IN ('REGISTRADO', 'EN_EVALUACION', 'EN_MITIGACION');
```

---

## 🚀 4. Ejecución y Carga de Datos

```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE bcrp_incident_db;"

# Ejecutar esquema DDL
psql -U postgres -d bcrp_incident_db -f 01_SCHEMA_DDL_POSTGRESQL.sql

# Insertar datos semilla iniciales
psql -U postgres -d bcrp_incident_db -f 02_SEED_DATA_INICIAL.sql
```
Para detalles de cada columna y tipo de dato, consulte [`DICCIONARIO_DE_DATOS.md`](DICCIONARIO_DE_DATOS.md).

