# 🎤 GUÍA MAESTRA DE SUSTENTACIÓN ORAL — ENTREGABLE III / APF3 (HITO SEMANA 12)
### *Ponencia Didáctica, Pedagógica y Fluidamente Humana para 3 Integrantes*
**Proyecto:** SIGIR - BCRP (Sistema de Gestión de Incidentes Regulatorios para Pagos Digitales)  
**Curso:** Curso Integrador I: Sistemas Software (Sección 57524, 7mo Ciclo)  
**Docente Evaluador:** Ing. Yony Zamata Condori  
**Institución:** Universidad Tecnológica del Perú (UTP) — Facultad de Ingeniería  

---

## 🧭 1. Recomendaciones Clave para la Exposición (12 Minutos Máximo)

> [!IMPORTANT]
> **La Regla de Oro (Hablar con naturalidad y controlar el reloj):**  
> El jurado busca ver **criterio, seguridad técnica y trabajo en equipo**.  
> - **Lenguaje claro y directo:** Hablar pausado, con frases cortas y sencillas.
> - **No memorizar de memoria:** Explicar las ideas con sus propias palabras apoyándose en las diapositivas.
> - **Transición fluida:** Dar pase al compañero conectando los temas de forma natural.
> - **Demostrar con hechos:** Respaldar con el código funcionando, pruebas en verde y base de datos.

---

## ⏱️ 2. Distribución del Tiempo (12 Minutos en Total)

```text
[00:00 - 03:30]  BLOQUE 1: FERNANDO ROMERO REQUEJO (3.5 min)  -> El problema real, la norma BCRP, requisitos y casos de uso
[03:30 - 08:00]  BLOQUE 2: FRANK VARGAS HUAMÁN    (4.5 min)  -> Arquitectura limpia, MVC, DAO, SOLID, seguridad y BD inmutable
[08:00 - 12:00]  BLOQUE 3: JOEL OLAYA VIVAS       (4.0 min)  -> Pruebas con JUnit 5 (8/8 verdes), demo en vivo y avance del 55%
```

---

## 🎙️ 3. Guion Paso a Paso por Integrante

---

### 👤 BLOQUE 1: FERNANDO ALBER ALFREDO ROMERO REQUEJO (00:00 – 03:30 | 3.5 Minutos)
**Rol:** Ingeniero de Requisitos & Procesos  
**Objetivo:** Explicar el problema de forma sencilla, la necesidad de la norma del BCRP y qué funciones cubre el sistema.

#### Minuto 00:00 – 01:00 | Apertura y el Problema Real (Lenguaje Sencillo)
> *"Buenos días, profesor Zamata y compañeros.*  
> *Para entender nuestro proyecto, pongámonos en una situación cotidiana: es viernes por la noche, y millones de personas intentan pagar con Yape o Plin en una tienda o restaurante. De pronto, la aplicación se congela, el dinero sale de la cuenta, pero al comercio no le llega nada.*  
> *¿Qué pasaba antes? El Banco Central se enteraba 45 minutos o hasta 3 horas después, porque dependía de correos o llamadas manuales entre los bancos.*  
> *Para solucionar este problema creamos **SIGIR - BCRP**: un sistema que detecta cualquier caída interbancaria en menos de 30 segundos, supervisando en tiempo real y cumpliendo la Circular 0011-2023 del BCRP."*

#### Minuto 01:00 – 02:15 | Requisitos del Sistema (SRS IEEE 830)
> *"Para este Entregable III definimos 5 requisitos funcionales claros:*  
> *1. **Monitoreo continuo:** Revisar cada 30 segundos la salud de las pasarelas de BCP, BBVA, Interbank y Scotiabank.*  
> *2. **Detección automática:** Identificar caídas y clasificarlas según su gravedad (crítica, alta, media o baja).*  
> *3. **Gestión de tickets:** Abrir un ticket formal por cada incidente para darle seguimiento.*  
> *4. **Reportes oficiales:** Generar archivos de texto normativos con un código de seguridad SHA-256 para que nadie los altere.*  
> *5. **Consola en vivo:** Un panel web donde los operadores ven de inmediato si algún banco tiene problemas.*  
> *Además, cuidamos la rapidez del sistema, la disponibilidad del 99.9% y un control ordenado de errores."*

#### Minuto 02:15 – 03:30 | Casos de Uso y Pase a Frank
> *"En los casos de uso definimos tres actores principales:*  
> *- El **Operador**, que atiende las alertas desde la pantalla web.*  
> *- El **Agente automático**, que sondea a los bancos en segundo plano sin descanso.*  
> *- Y el **Supervisor del BCRP**, que revisa los reportes y las métricas de cumplimiento.*  
> *Ahora, ¿cómo construimos este sistema para que sea rápido, seguro y no falle? Para explicar la arquitectura y la base de datos, le doy la palabra a nuestro Líder Técnico, Frank Vargas."*

---

### 👤 BLOQUE 2: FRANK EMILIANO VARGAS HUAMÁN (03:30 – 08:00 | 4.5 Minutos)
**Rol:** Líder Técnico & Arquitecto de Software  
**Objetivo:** Explicar de forma clara cómo está organizado el software (Clean Architecture, MVC), las buenas prácticas aplicadas y por qué la base de datos no permite trampas ni borrados.

#### Minuto 03:30 – 04:30 | Arquitectura del Software (Capas Limpias y MVC)
> *"Gracias, Fernando. Buenos días, profesor.*  
> *Para que el sistema sea fácil de mantener y escalar, aplicamos **Clean Architecture** y el patrón **MVC** con Java 17 y Spring Boot 3:*  
> *- **Controladores:** Reciben las peticiones web y validan los datos de entrada con Java Records.*  
> *- **Servicios:** Contienen toda la lógica de negocio. Por ejemplo, controlan que un incidente pase correctamente de REGISTRADO a EN EVALUACIÓN, luego a MITIGADO y finalmente a CERRADO, sin saltarse pasos.*  
> *- **Vistas:** Una interfaz web moderna que consulta la API de forma rápida e interactiva.*  
> *Lo importante de esta estructura es que si mañana cambiamos la base de datos o la interfaz web, la lógica de negocio del BCRP no se toca."*

#### Minuto 04:30 – 05:45 | Patrón DAO, Principios SOLID y Organización de Código
> *"Para cumplir con las exigencias del curso, aplicamos el patrón DAO y principios SOLID:*  
> *- **Patrón DAO:** Usamos interfaces de Spring Data JPA. Esto nos permite consultar la base de datos sin ensuciar la lógica con código SQL manual.*  
> *- **Responsabilidad Única:** Cada clase hace una sola cosa bien. Un componente solo monitorea, otro gestiona incidentes y otro genera los reportes normativos.*  
> *- **Inversión de Dependencias:** Los controladores no dependen de implementaciones rígidas, sino de interfaces mediante inyección de dependencias.*  
> *En la **Figura 11** del informe se puede apreciar la estructura de carpetas en el IDE, perfectamente ordenada por dominios."*

#### Minuto 05:45 – 07:00 | Seguridad Empresarial y Base de Datos Inmutable (PostgreSQL)
> *"En seguridad implementamos dos candados fundamentales:*  
> *1. **En la aplicación:** Usamos Spring Security con contraseñas encriptadas en BCrypt y permisos por roles: los operadores solo gestionan tickets y los auditores del BCRP supervisan y descargan reportes.*  
> *2. **En la base de datos:** En el sector bancario los registros de fallas son evidencia legal y jamás se deben alterar. Por eso en PostgreSQL 15 creamos un trigger especial: si alguien intenta hacer un `UPDATE` o un `DELETE` sobre la bitácora de auditoría, la base de datos lo bloquea de inmediato con un error de seguridad (`SQLSTATE 55000`). Ni siquiera un administrador puede borrar el historial."*

#### Minuto 07:00 – 08:00 | Repositorio GitHub y Pase a Joel
> *"Todo el proyecto está versionado en GitHub con buenas prácticas: ramas de trabajo ordenadas con GitFlow y commits semánticos que explican cada cambio realizado.*  
> *Ahora bien, ¿cómo comprobamos que todo esto funciona de verdad y qué porcentaje de avance tenemos? Para ver las pruebas automatizadas y la demostración en vivo, le doy el pase a nuestro Ingeniero de QA, Joel Olaya."*

---

### 👤 BLOQUE 3: JOEL LEONARDO OLAYA VIVAS (08:00 – 12:00 | 4.0 Minutos)
**Rol:** Ingeniero de Software & QA  
**Objetivo:** Demostrar con pruebas reales que el sistema funciona (8/8 pruebas verdes), mostrar la pantalla web operando y certificar el 55% de avance.

#### Minuto 08:00 – 09:15 | Pruebas Automatizadas con JUnit 5 y TDD
> *"Muchas gracias, Frank. Profesor Zamata, buenos días.*  
> *Para garantizar que el software no tenga errores, aplicamos la metodología **TDD**: primero diseñamos los casos de prueba y luego escribimos el código que los resuelve.*  
> *Creamos una suite automatizada con **JUnit 5 y Mockito** con 8 pruebas fundamentales:*  
> *- Probamos la creación de tickets y validamos que no se permitan cambios de estado inválidos.*  
> *- Comprobamos que el reporte normativo se genere exactamente con el formato del BCRP y con su firma SHA-256 correcta.*  
> *- Simulamos caídas de red para asegurar que el sistema alerte al instante.*  
> *Como se ve en la **Figura 13** del informe y en la consola de Maven, obtuvimos **8 de 8 pruebas exitosas**, con cero errores y cero fallas."*

#### Minuto 09:15 – 10:45 | Demostración en Vivo: Consola Web en Funcionamiento
> *(Joel comparte pantalla de la Consola NOC)*  
> *"Ahora veamos el sistema en vivo:*  
> *1. **Monitoreo:** Aquí vemos el panel web con los semáforos de BCP, BBVA, Interbank y Scotiabank en verde, con tiempos de respuesta normales.*  
> *2. **Simulación de Falla:** Voy a simular que uno de los bancos deja de responder.*  
> *3. **Reacción Rápida:** En menos de 30 segundos, el sistema detecta la caída, el indicador se pone en rojo y se abre automáticamente un ticket con código único y severidad crítica.*  
> *4. **Reporte Oficial:** Pasamos a la sección de reportes, presionamos compilar y se genera el archivo plano normativo del BCRP con su código de seguridad SHA-256 listo para ser auditado."*

#### Minuto 10:45 – 11:30 | Validación del Avance (55% Alcanzado vs 40% Exigido)
> *"Para este Entregable III, la rúbrica del curso pide un mínimo del **40%** de avance.*  
> *En la **Figura 14** y en la **Tabla 8** de nuestro informe demostramos que hemos alcanzado un **55.0% de avance real**, superando la meta por 15 puntos:*  
> *- El monitoreo automático está al 70%.*  
> *- La gestión de incidentes al 65%.*  
> *- La base de datos blindada en PostgreSQL al 75%.*  
> *- La seguridad y los reportes al 60%.*  
> *- Y la consola web al 50%.*  
> *Esto demuestra que no tenemos solo teoría, sino un sistema real, probado y funcionando."*

#### Minuto 11:30 – 12:00 | Conclusión y Cierre
> *"Para concluir:*  
> *1. Demostramos que es posible pasar de 45 minutos a menos de 30 segundos para detectar fallas financieras.*  
> *2. Construimos una arquitectura profesional, limpia y fácil de mantener.*  
> *3. Y garantizamos la seguridad absoluta de los datos con auditoría inmutable.*  
> *Muchas gracias por su atención, quedamos listos para responder las preguntas del jurado."*

---

## 🧠 4. Preguntas Típicas del Jurado y Respuestas Claras

### Pregunta 1 (Para Frank): *"¿Por qué pusieron el bloqueo en la base de datos y no solo en el código Java?"*
> **Respuesta sencilla (Frank):**  
> *"Porque si alguien entra directamente a la base de datos con un programa como pgAdmin, podría saltarse las validaciones de Java y cambiar o borrar un registro. Al poner el trigger directamente en PostgreSQL con `SQLSTATE 55000`, la base de datos rechaza cualquier intento de borrado o modificación, venga de donde venga."*

### Pregunta 2 (Para Fernando): *"¿Qué pasa si un banco falla solo por 3 segundos y regresa? ¿El sistema abre 50 tickets?"*
> **Respuesta sencilla (Fernando):**  
> *"No, profesor. Implementamos una regla de negocio y un índice único: si el banco ya tiene un ticket abierto, los nuevos eventos de desconexión se agregan a la bitácora del mismo ticket. Así evitamos saturar al operador con duplicados."*

### Pregunta 3 (Para Joel): *"¿Para qué usan Mockito en las pruebas si ya tienen PostgreSQL?"*
> **Respuesta sencilla (Joel):**  
> *"Mockito nos permite simular la base de datos en memoria para que las pruebas unitarias se ejecuten en milisegundos sin depender de que el servidor esté encendido. Para las pruebas finales conectamos la base de datos real, pero con Mockito garantizamos que la lógica interna de Java funcione al 100% de forma rápida e independiente."*
