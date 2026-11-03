package pe.gob.bcrp.sigir.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.bcrp.sigir.domain.entity.CategoriaIncidente;
import pe.gob.bcrp.sigir.domain.entity.EntidadFinanciera;
import pe.gob.bcrp.sigir.domain.entity.HistorialEstado;
import pe.gob.bcrp.sigir.domain.entity.Incidente;
import pe.gob.bcrp.sigir.domain.enums.EstadoIncidente;
import pe.gob.bcrp.sigir.domain.enums.OrigenDeteccion;
import pe.gob.bcrp.sigir.domain.enums.Severidad;
import pe.gob.bcrp.sigir.repository.CategoriaIncidenteRepository;
import pe.gob.bcrp.sigir.repository.EntidadFinancieraRepository;
import pe.gob.bcrp.sigir.repository.HistorialEstadoRepository;
import pe.gob.bcrp.sigir.repository.IncidenteRepository;
import pe.gob.bcrp.sigir.web.dto.CambioEstadoDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteRegistroDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteResponseDTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class IncidenteService implements IIncidenteService {

    private static final Logger log = LoggerFactory.getLogger(IncidenteService.class);
    private static final AtomicLong CONTADOR_TICKETS = new AtomicLong(10001);

    private final IncidenteRepository incidenteRepository;
    private final EntidadFinancieraRepository entidadRepository;
    private final CategoriaIncidenteRepository categoriaRepository;
    private final HistorialEstadoRepository historialRepository;

    public IncidenteService(IncidenteRepository incidenteRepository,
                            EntidadFinancieraRepository entidadRepository,
                            CategoriaIncidenteRepository categoriaRepository,
                            HistorialEstadoRepository historialRepository) {
        this.incidenteRepository = incidenteRepository;
        this.entidadRepository = entidadRepository;
        this.categoriaRepository = categoriaRepository;
        this.historialRepository = historialRepository;
    }

    @Transactional(readOnly = true)
    public List<IncidenteResponseDTO> listarTodos() {
        return incidenteRepository.findAll().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IncidenteResponseDTO> listarActivos() {
        return incidenteRepository.findAll().stream()
                .filter(i -> i.getEstadoActual() != EstadoIncidente.CERRADO)
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncidenteResponseDTO obtenerPorId(Long id) {
        Incidente inc = incidenteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado con ID: " + id));
        return mapearADto(inc);
    }

    @Transactional(readOnly = true)
    public boolean existeIncidenteAbiertoParaEntidad(Long idEntidad) {
        return incidenteRepository.existeIncidenteAbiertoParaEntidad(idEntidad);
    }

    @Transactional
    public IncidenteResponseDTO registrarIncidenteManual(IncidenteRegistroDTO dto, String usuario) {
        EntidadFinanciera entidad = entidadRepository.findById(dto.getIdEntidad())
                .orElseThrow(() -> new IllegalArgumentException("Entidad no encontrada con ID: " + dto.getIdEntidad()));

        CategoriaIncidente categoria = categoriaRepository.findByCodigoNormativo(dto.getCodigoCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no válida: " + dto.getCodigoCategoria()));

        if (incidenteRepository.existeIncidenteAbiertoParaEntidad(entidad.getIdEntidad())) {
            throw new IllegalStateException("La entidad ya cuenta con un incidente activo no cerrado.");
        }

        String ticket = generarCodigoTicket();

        Incidente inc = Incidente.builder()
                .codigoTicket(ticket)
                .entidad(entidad)
                .categoria(categoria)
                .severidad(dto.getSeveridad())
                .origenDeteccion(OrigenDeteccion.MANUAL_OPERADOR)
                .estadoActual(EstadoIncidente.REGISTRADO)
                .fechaHoraInicio(dto.getFechaHoraInicio())
                .fechaHoraDeteccion(LocalDateTime.now())
                .servicioAfectado(dto.getServicioAfectado())
                .descripcionDetallada(dto.getDescripcionDetallada())
                .impactoEstimadoUsuarios(dto.getImpactoEstimadoUsuarios())
                .usuarioCreador(usuario)
                .build();

        Incidente guardado = incidenteRepository.save(inc);

        // Registro de Auditoría Inmutable
        registrarHistorial(guardado, null, EstadoIncidente.REGISTRADO, usuario, "Registro manual ingresado por operador NOC.");

        log.info("Incidente creado manualmente: Ticket {} por usuario {}", ticket, usuario);
        return mapearADto(guardado);
    }

    @Transactional
    public Incidente registrarIncidenteAutomatico(EntidadFinanciera entidad, String motivoFalla, String trazaError) {
        CategoriaIncidente catDisp = categoriaRepository.findByCodigoNormativo("DISP_SERV")
                .orElseGet(() -> categoriaRepository.save(
                        CategoriaIncidente.builder()
                                .codigoNormativo("DISP_SERV")
                                .nombre("Disponibilidad de Servicios")
                                .descripcion("Caída o interrupción de APIs")
                                .esDeteccionAutomatica(true)
                                .build()
                ));

        String ticket = generarCodigoTicket();

        Incidente inc = Incidente.builder()
                .codigoTicket(ticket)
                .entidad(entidad)
                .categoria(catDisp)
                .severidad(Severidad.CRITICA)
                .origenDeteccion(OrigenDeteccion.AUTOMATICO)
                .estadoActual(EstadoIncidente.REGISTRADO)
                .fechaHoraInicio(LocalDateTime.now().minusMinutes(1))
                .fechaHoraDeteccion(LocalDateTime.now())
                .servicioAfectado("SWITCH_PAGOS_INTEROPERABLES")
                .descripcionDetallada("Caída detectada automáticamente por el monitor de telemetría. Motivo: " + motivoFalla + " | Detalle: " + trazaError)
                .impactoEstimadoUsuarios(1000)
                .usuarioCreador("SISTEMA_TELEMETRIA_DAEMON")
                .build();

        Incidente guardado = incidenteRepository.save(inc);

        registrarHistorial(guardado, null, EstadoIncidente.REGISTRADO, "SISTEMA_TELEMETRIA_DAEMON", "Auto-Detección por sondeo de salud fallido.");

        log.warn("Incidente automático registrado: Ticket {} para entidad {}", ticket, entidad.getNombreComercial());
        return guardado;
    }

    @Transactional
    public IncidenteResponseDTO cambiarEstado(Long idIncidente, CambioEstadoDTO dto, String usuario) {
        Incidente inc = incidenteRepository.findById(idIncidente)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado con ID: " + idIncidente));

        EstadoIncidente estadoAnterior = inc.getEstadoActual();
        EstadoIncidente estadoNuevo = dto.getNuevoEstado();

        validarTransicionEstado(estadoAnterior, estadoNuevo);

        inc.setEstadoActual(estadoNuevo);

        if (estadoNuevo == EstadoIncidente.RESUELTO || estadoNuevo == EstadoIncidente.CERRADO) {
            inc.setFechaHoraSolucion(dto.getFechaHoraSolucion() != null ? dto.getFechaHoraSolucion() : LocalDateTime.now());
        }

        Incidente actualizado = incidenteRepository.save(inc);
        registrarHistorial(actualizado, estadoAnterior, estadoNuevo, usuario, dto.getComentarioTecnico());

        log.info("Incidente {} avanzó de {} a {} por {}", inc.getCodigoTicket(), estadoAnterior, estadoNuevo, usuario);
        return mapearADto(actualizado);
    }

    @Transactional(readOnly = true)
    public List<HistorialEstado> obtenerTrazabilidad(Long idIncidente) {
        return historialRepository.findByIncidenteIdIncidenteOrderByFechaTransicionAsc(idIncidente);
    }

    private void registrarHistorial(Incidente inc, EstadoIncidente ant, EstadoIncidente nuevo, String usuario, String comentario) {
        HistorialEstado h = HistorialEstado.builder()
                .incidente(inc)
                .estadoAnterior(ant != null ? ant.name() : null)
                .estadoNuevo(nuevo.name())
                .fechaTransicion(LocalDateTime.now())
                .usuarioResponsable(usuario)
                .comentarioTecnico(comentario)
                .build();
        historialRepository.save(h);
    }

    private void validarTransicionEstado(EstadoIncidente actual, EstadoIncidente destino) {
        if (actual == destino) {
            throw new IllegalArgumentException("El incidente ya se encuentra en estado: " + actual);
        }

        boolean valida = false;
        switch (actual) {
            case REGISTRADO -> valida = (destino == EstadoIncidente.EN_EVALUACION || destino == EstadoIncidente.EN_MITIGACION);
            case EN_EVALUACION -> valida = (destino == EstadoIncidente.EN_MITIGACION || destino == EstadoIncidente.RESUELTO);
            case EN_MITIGACION -> valida = (destino == EstadoIncidente.RESUELTO);
            case RESUELTO -> valida = (destino == EstadoIncidente.CERRADO || destino == EstadoIncidente.EN_MITIGACION);
            case CERRADO -> valida = false; // Estado terminal inmutable
        }

        if (!valida) {
            throw new IllegalStateException("Transición inválida de " + actual + " hacia " + destino);
        }
    }

    private String generarCodigoTicket() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long correlativo = CONTADOR_TICKETS.getAndIncrement();
        return "INC-" + fecha + "-" + correlativo;
    }

    private IncidenteResponseDTO mapearADto(Incidente i) {
        return IncidenteResponseDTO.builder()
                .idIncidente(i.getIdIncidente())
                .codigoTicket(i.getCodigoTicket())
                .idEntidad(i.getEntidad().getIdEntidad())
                .codigoBcrpEntidad(i.getEntidad().getCodigoBcrp())
                .nombreEntidad(i.getEntidad().getNombreComercial())
                .codigoCategoria(i.getCategoria().getCodigoNormativo())
                .nombreCategoria(i.getCategoria().getNombre())
                .severidad(i.getSeveridad())
                .origenDeteccion(i.getOrigenDeteccion())
                .estadoActual(i.getEstadoActual())
                .fechaHoraInicio(i.getFechaHoraInicio())
                .fechaHoraDeteccion(i.getFechaHoraDeteccion())
                .fechaHoraSolucion(i.getFechaHoraSolucion())
                .servicioAfectado(i.getServicioAfectado())
                .descripcionDetallada(i.getDescripcionDetallada())
                .impactoEstimadoUsuarios(i.getImpactoEstimadoUsuarios())
                .usuarioCreador(i.getUsuarioCreador())
                .fechaCreacion(i.getFechaCreacion())
                .build();
    }
}
