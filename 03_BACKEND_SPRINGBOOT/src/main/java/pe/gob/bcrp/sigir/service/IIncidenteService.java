package pe.gob.bcrp.sigir.service;

import pe.gob.bcrp.sigir.domain.entity.EntidadFinanciera;
import pe.gob.bcrp.sigir.domain.entity.HistorialEstado;
import pe.gob.bcrp.sigir.domain.entity.Incidente;
import pe.gob.bcrp.sigir.web.dto.CambioEstadoDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteRegistroDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteResponseDTO;

import java.util.List;

/**
 * Puerto de Entrada (Inbound Port) para la Gestión del Ciclo de Vida de Incidentes.
 * Aplica principios de Arquitectura Hexagonal y Clean Architecture.
 */
public interface IIncidenteService {

    List<IncidenteResponseDTO> listarTodos();

    List<IncidenteResponseDTO> listarActivos();

    IncidenteResponseDTO obtenerPorId(Long id);

    boolean existeIncidenteAbiertoParaEntidad(Long idEntidad);

    IncidenteResponseDTO registrarIncidenteManual(IncidenteRegistroDTO dto, String usuario);

    Incidente registrarIncidenteAutomatico(EntidadFinanciera entidad, String motivoFalla, String trazaError);

    IncidenteResponseDTO cambiarEstado(Long idIncidente, CambioEstadoDTO dto, String usuario);

    List<HistorialEstado> obtenerTrazabilidad(Long idIncidente);
}
