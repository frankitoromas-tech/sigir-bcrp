package pe.gob.bcrp.sigir.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import pe.gob.bcrp.sigir.domain.entity.HistorialEstado;
import pe.gob.bcrp.sigir.service.IncidenteService;
import pe.gob.bcrp.sigir.web.dto.CambioEstadoDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteRegistroDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidentes")
@Tag(name = "Incidentes", description = "Endpoints para la gestión, categorización y máquina de estados de incidentes")
public class IncidenteController {

    private final IncidenteService incidenteService;

    public IncidenteController(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los incidentes registrados")
    public ResponseEntity<List<IncidenteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(incidenteService.listarTodos());
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar todos los incidentes activos (no cerrados) en el ecosistema de pagos")
    public ResponseEntity<List<IncidenteResponseDTO>> listarActivos() {
        return ResponseEntity.ok(incidenteService.listarActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle completo de un incidente por ID")
    public ResponseEntity<IncidenteResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(incidenteService.obtenerPorId(id));
    }

    @PostMapping({"", "/manual"})
    @Operation(summary = "Registrar manualmente un incidente (Fraude o Manipulación de Información)")
    public ResponseEntity<IncidenteResponseDTO> registrarManual(
            @Valid @RequestBody IncidenteRegistroDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String usuario = (userDetails != null) ? userDetails.getUsername() : "operador.ad";
        IncidenteResponseDTO creado = incidenteService.registrarIncidenteManual(dto, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Transicionar estado del incidente en el ciclo de vida normativo")
    public ResponseEntity<IncidenteResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String usuario = (userDetails != null) ? userDetails.getUsername() : "operador.ad";
        IncidenteResponseDTO actualizado = incidenteService.cambiarEstado(id, dto, usuario);
        return ResponseEntity.ok(actualizado);
    }

    @GetMapping("/{id}/trazabilidad")
    @Operation(summary = "Obtener la bitácora inmutable de historial de estados del incidente")
    public ResponseEntity<List<HistorialEstado>> obtenerTrazabilidad(@PathVariable Long id) {
        return ResponseEntity.ok(incidenteService.obtenerTrazabilidad(id));
    }
}
