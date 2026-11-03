package pe.gob.bcrp.sigir.web.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones estandarizado bajo RFC 7807 (ProblemDetail de Spring Boot 3).
 * Enriquece las respuestas de error con metadatos de trazabilidad regulatoria BCRP.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String NORMATIVA_BCRP = "Circular BCRP N° 0014-2023";
    private static final String SISTEMA_SIGIR = "SIGIR - Switch CCE";

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Solicitud Inválida o Regla de Negocio Rechazada");
        problem.setType(URI.create("https://sigir.bcrp.gob.pe/errors/bad-request"));
        enriquecerMetadatosNormativos(problem, request);
        return problem;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Conflicto en Máquina de Estados o Incidente Activo");
        problem.setType(URI.create("https://sigir.bcrp.gob.pe/errors/state-conflict"));
        enriquecerMetadatosNormativos(problem, request);
        return problem;
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso Regulatorio No Encontrado");
        problem.setType(URI.create("https://sigir.bcrp.gob.pe/errors/not-found"));
        enriquecerMetadatosNormativos(problem, request);
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Error de validación en los campos obligatorios del payload regulatorio."
        );
        problem.setTitle("Error de Validación de Datos de Entrada");
        problem.setType(URI.create("https://sigir.bcrp.gob.pe/errors/validation-error"));

        Map<String, String> invalidParams = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valor inválido",
                        (msg1, msg2) -> msg1
                ));
        problem.setProperty("invalidParams", invalidParams);
        enriquecerMetadatosNormativos(problem, request);
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralException(Exception ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage() != null ? ex.getMessage() : "Error interno no controlado en el servidor SIGIR."
        );
        problem.setTitle("Error Interno del Sistema de Gestión de Incidentes");
        problem.setType(URI.create("https://sigir.bcrp.gob.pe/errors/internal-server-error"));
        enriquecerMetadatosNormativos(problem, request);
        return problem;
    }

    private void enriquecerMetadatosNormativos(ProblemDetail problem, HttpServletRequest request) {
        problem.setProperty("normativa", NORMATIVA_BCRP);
        problem.setProperty("sistema", SISTEMA_SIGIR);
        problem.setProperty("timestamp", Instant.now().toString());
        if (request != null && request.getRequestURI() != null) {
            problem.setInstance(URI.create(request.getRequestURI()));
        }
    }
}
