package pe.gob.bcrp.sigir.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.bcrp.sigir.domain.entity.EntidadFinanciera;
import pe.gob.bcrp.sigir.domain.entity.Incidente;
import pe.gob.bcrp.sigir.domain.enums.Severidad;
import pe.gob.bcrp.sigir.repository.EntidadFinancieraRepository;
import pe.gob.bcrp.sigir.repository.IncidenteRepository;
import pe.gob.bcrp.sigir.web.dto.EntidadSaludDTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntidadFinancieraService {

    private final EntidadFinancieraRepository entidadRepository;
    private final IncidenteRepository incidenteRepository;

    public EntidadFinancieraService(EntidadFinancieraRepository entidadRepository) {
        this(entidadRepository, null);
    }

    @Autowired
    public EntidadFinancieraService(EntidadFinancieraRepository entidadRepository,
                                    IncidenteRepository incidenteRepository) {
        this.entidadRepository = entidadRepository;
        this.incidenteRepository = incidenteRepository;
    }

    @Transactional(readOnly = true)
    public List<EntidadFinanciera> listarTodas() {
        return entidadRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<EntidadFinanciera> listarActivas() {
        return entidadRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public EntidadFinanciera obtenerPorId(Long id) {
        return entidadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entidad financiera no encontrada con ID: " + id));
    }

    @Transactional
    public EntidadFinanciera guardar(EntidadFinanciera entidad) {
        if (entidad.getIdEntidad() == null && entidadRepository.existsByCodigoBcrp(entidad.getCodigoBcrp())) {
            throw new IllegalArgumentException("Ya existe una entidad registrada con el código BCRP: " + entidad.getCodigoBcrp());
        }
        return entidadRepository.save(entidad);
    }

    @Transactional(readOnly = true)
    public List<EntidadSaludDTO> obtenerMonitoreoSalud() {
        List<EntidadFinanciera> activas = entidadRepository.findByActivoTrue();
        String ahora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        return activas.stream().map(e -> {
            List<Incidente> abiertos = (incidenteRepository != null && e.getIdEntidad() != null)
                    ? incidenteRepository.findIncidentesAbiertosPorEntidad(e.getIdEntidad())
                    : Collections.emptyList();
            int cantActivos = abiertos != null ? abiertos.size() : 0;
            String estadoSalud = "SALUDABLE";
            int latencia = 18 + (int) (Math.random() * 25);

            if (cantActivos > 0) {
                boolean tieneCritico = abiertos.stream().anyMatch(i -> i.getSeveridad() == Severidad.CRITICA);
                estadoSalud = tieneCritico ? "CAIDO" : "DEGRADADO";
                latencia = tieneCritico ? 0 : 480;
            }

            return EntidadSaludDTO.builder()
                    .idEntidad(e.getIdEntidad())
                    .codigoBcrp(e.getCodigoBcrp())
                    .nombreComercial(e.getNombreComercial())
                    .canalInteroperable(e.getCanalInteroperable())
                    .estadoSalud(estadoSalud)
                    .latenciaMs(latencia)
                    .incidentesActivos(cantActivos)
                    .ultimoSondeo(ahora)
                    .build();
        }).collect(Collectors.toList());
    }
}
