package pe.gob.bcrp.sigir.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.gob.bcrp.sigir.domain.entity.EntidadFinanciera;
import pe.gob.bcrp.sigir.domain.entity.Incidente;
import pe.gob.bcrp.sigir.domain.enums.EstadoIncidente;
import pe.gob.bcrp.sigir.domain.enums.Severidad;
import pe.gob.bcrp.sigir.repository.EntidadFinancieraRepository;
import pe.gob.bcrp.sigir.repository.IncidenteRepository;
import pe.gob.bcrp.sigir.web.dto.EntidadSaludDTO;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Suite de Pruebas Unitarias - EntidadFinancieraService")
class EntidadFinancieraServiceTest {

    @Mock
    private EntidadFinancieraRepository entidadRepository;

    @Mock
    private IncidenteRepository incidenteRepository;

    private EntidadFinancieraService entidadService;

    private EntidadFinanciera entidadBcp;
    private EntidadFinanciera entidadInterbank;

    @BeforeEach
    void setUp() {
        entidadService = new EntidadFinancieraService(entidadRepository, incidenteRepository);

        entidadBcp = EntidadFinanciera.builder()
                .idEntidad(1L)
                .codigoBcrp("002")
                .razonSocial("Banco de Crédito del Perú")
                .nombreComercial("BCP (Yape)")
                .canalInteroperable("BILLETERA_MOVIL")
                .urlHealthcheck("https://api.yape.pe/health")
                .activo(true)
                .build();

        entidadInterbank = EntidadFinanciera.builder()
                .idEntidad(2L)
                .codigoBcrp("003")
                .razonSocial("Banco Internacional del Perú")
                .nombreComercial("Interbank (Plin)")
                .canalInteroperable("BILLETERA_MOVIL")
                .urlHealthcheck("https://api.plin.pe/health")
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe listar el monitoreo de salud operativa marcando SALUDABLE cuando no existen incidentes activos")
    void testObtenerMonitoreoSaludSinIncidentes() {
        when(entidadRepository.findByActivoTrue()).thenReturn(List.of(entidadBcp, entidadInterbank));
        when(incidenteRepository.findIncidentesAbiertosPorEntidad(1L)).thenReturn(Collections.emptyList());
        when(incidenteRepository.findIncidentesAbiertosPorEntidad(2L)).thenReturn(Collections.emptyList());

        List<EntidadSaludDTO> resultado = entidadService.obtenerMonitoreoSalud();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertAll("Verificación de salud operativa sin incidentes",
                () -> assertEquals("002", resultado.get(0).getCodigoBcrp()),
                () -> assertEquals("SALUDABLE", resultado.get(0).getEstadoSalud()),
                () -> assertEquals(0, resultado.get(0).getIncidentesActivos()),
                () -> assertTrue(resultado.get(0).getLatenciaMs() >= 18),
                () -> assertEquals("SALUDABLE", resultado.get(1).getEstadoSalud())
        );
    }

    @Test
    @DisplayName("Debe detectar incidentes activos críticos y degradados en el listado de salud operativa")
    void testObtenerMonitoreoSaludConIncidentesActivos() {
        Incidente incCritico = Incidente.builder()
                .idIncidente(10L)
                .entidad(entidadBcp)
                .severidad(Severidad.CRITICA)
                .estadoActual(EstadoIncidente.EN_MITIGACION)
                .build();

        Incidente incMedia = Incidente.builder()
                .idIncidente(11L)
                .entidad(entidadInterbank)
                .severidad(Severidad.MEDIA)
                .estadoActual(EstadoIncidente.EN_EVALUACION)
                .build();

        when(entidadRepository.findByActivoTrue()).thenReturn(List.of(entidadBcp, entidadInterbank));
        when(incidenteRepository.findIncidentesAbiertosPorEntidad(1L)).thenReturn(List.of(incCritico));
        when(incidenteRepository.findIncidentesAbiertosPorEntidad(2L)).thenReturn(List.of(incMedia));

        List<EntidadSaludDTO> resultado = entidadService.obtenerMonitoreoSalud();

        assertEquals(2, resultado.size());
        EntidadSaludDTO saludBcp = resultado.get(0);
        EntidadSaludDTO saludIbk = resultado.get(1);

        assertAll("Detección de estados CAIDO y DEGRADADO según severidad de incidentes abiertos",
                () -> assertEquals("CAIDO", saludBcp.getEstadoSalud()),
                () -> assertEquals(1, saludBcp.getIncidentesActivos()),
                () -> assertEquals(0, saludBcp.getLatenciaMs()),
                () -> assertEquals("DEGRADADO", saludIbk.getEstadoSalud()),
                () -> assertEquals(1, saludIbk.getIncidentesActivos()),
                () -> assertEquals(480, saludIbk.getLatenciaMs())
        );
    }

    @Test
    @DisplayName("Debe rechazar el registro de una nueva entidad si el código BCRP ya se encuentra registrado")
    void testGuardarEntidadDuplicadaLanzaExcepcion() {
        EntidadFinanciera nueva = EntidadFinanciera.builder()
                .codigoBcrp("002")
                .nombreComercial("Duplicado BCP")
                .build();

        when(entidadRepository.existsByCodigoBcrp("002")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> entidadService.guardar(nueva));
        assertTrue(ex.getMessage().contains("002"));
        verify(entidadRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe obtener una entidad por ID o lanzar IllegalArgumentException cuando no existe")
    void testObtenerPorIdYNoEncontrado() {
        when(entidadRepository.findById(1L)).thenReturn(Optional.of(entidadBcp));
        when(entidadRepository.findById(99L)).thenReturn(Optional.empty());

        EntidadFinanciera encontrada = entidadService.obtenerPorId(1L);
        assertEquals("BCP (Yape)", encontrada.getNombreComercial());

        assertThrows(IllegalArgumentException.class, () -> entidadService.obtenerPorId(99L));
    }
}
