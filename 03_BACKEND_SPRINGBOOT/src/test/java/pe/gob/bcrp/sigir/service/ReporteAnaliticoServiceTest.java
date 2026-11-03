package pe.gob.bcrp.sigir.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.gob.bcrp.sigir.domain.entity.EntidadFinanciera;
import pe.gob.bcrp.sigir.domain.entity.Incidente;
import pe.gob.bcrp.sigir.domain.enums.EstadoIncidente;
import pe.gob.bcrp.sigir.domain.enums.Severidad;
import pe.gob.bcrp.sigir.repository.EntidadFinancieraRepository;
import pe.gob.bcrp.sigir.repository.IncidenteRepository;
import pe.gob.bcrp.sigir.web.dto.IndisponibilidadDTO;
import pe.gob.bcrp.sigir.web.dto.KpiDashboardDTO;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Suite de Pruebas Unitarias - ReporteAnaliticoService (KPIs SLA, MTTD, MTTR)")
class ReporteAnaliticoServiceTest {

    @Mock
    private IncidenteRepository incidenteRepository;

    @Mock
    private EntidadFinancieraRepository entidadRepository;

    @InjectMocks
    private ReporteAnaliticoService reporteAnaliticoService;

    private EntidadFinanciera entidadBcp;
    private EntidadFinanciera entidadBbva;
    private Incidente incCerradoCritico;
    private Incidente incCerradoMedio;

    @BeforeEach
    void setUp() {
        entidadBcp = EntidadFinanciera.builder()
                .idEntidad(1L)
                .codigoBcrp("002")
                .nombreComercial("BCP (Yape)")
                .canalInteroperable("BILLETERA_MOVIL")
                .activo(true)
                .build();

        entidadBbva = EntidadFinanciera.builder()
                .idEntidad(2L)
                .codigoBcrp("011")
                .nombreComercial("BBVA Perú (Plin)")
                .canalInteroperable("BILLETERA_MOVIL")
                .activo(true)
                .build();

        LocalDateTime baseTime = LocalDateTime.of(2026, 9, 10, 14, 0);

        // Incidente 1: MTTD = 2 min, MTTR = 60 min
        incCerradoCritico = Incidente.builder()
                .idIncidente(100L)
                .codigoTicket("INC-20260910-10001")
                .entidad(entidadBcp)
                .severidad(Severidad.CRITICA)
                .estadoActual(EstadoIncidente.CERRADO)
                .fechaHoraInicio(baseTime)
                .fechaHoraDeteccion(baseTime.plusMinutes(2))
                .fechaHoraSolucion(baseTime.plusMinutes(60))
                .build();

        // Incidente 2: MTTD = 4 min, MTTR = 30 min
        incCerradoMedio = Incidente.builder()
                .idIncidente(101L)
                .codigoTicket("INC-20260910-10002")
                .entidad(entidadBcp)
                .severidad(Severidad.MEDIA)
                .estadoActual(EstadoIncidente.RESUELTO)
                .fechaHoraInicio(baseTime.plusHours(3))
                .fechaHoraDeteccion(baseTime.plusHours(3).plusMinutes(4))
                .fechaHoraSolucion(baseTime.plusHours(3).plusMinutes(30))
                .build();
    }

    @Test
    @DisplayName("Debe calcular el desglose de indisponibilidad por entidad (MTTD, MTTR y % Uptime SLA)")
    void testIndisponibilidadPorEntidad() {
        when(entidadRepository.findAll()).thenReturn(List.of(entidadBcp, entidadBbva));
        when(incidenteRepository.findByEntidadIdEntidad(1L)).thenReturn(List.of(incCerradoCritico, incCerradoMedio));
        when(incidenteRepository.findByEntidadIdEntidad(2L)).thenReturn(Collections.emptyList());

        List<IndisponibilidadDTO> resultado = reporteAnaliticoService.indisponibilidadPorEntidad(null, null);

        assertNotNull(resultado);
        assertEquals(2, resultado.size());

        IndisponibilidadDTO dtoBcp = resultado.get(0);
        IndisponibilidadDTO dtoBbva = resultado.get(1);

        assertAll("Métricas de indisponibilidad para BCP (Yape)",
                () -> assertEquals("002", dtoBcp.getCodigoBcrp()),
                () -> assertEquals(2L, dtoBcp.getTotalIncidentes()),
                () -> assertEquals(1L, dtoBcp.getIncidentesCriticos()),
                () -> assertEquals(45.0, dtoBcp.getMttrMinutos(), 0.01, "MTTR promedio entre 60 y 30 min debe ser 45.0"),
                () -> assertEquals(3.0, dtoBcp.getMttdMinutos(), 0.01, "MTTD promedio entre 2 y 4 min debe ser 3.0"),
                () -> assertEquals(90L, dtoBcp.getMinutosIndisponibles()),
                () -> assertEquals(99.79, dtoBcp.getUptimePct(), 0.01)
        );

        assertAll("Métricas de disponibilidad 100% SLA para BBVA sin incidentes",
                () -> assertEquals("011", dtoBbva.getCodigoBcrp()),
                () -> assertEquals(0L, dtoBbva.getTotalIncidentes()),
                () -> assertEquals(0.0, dtoBbva.getMttrMinutos()),
                () -> assertEquals(0.0, dtoBbva.getMttdMinutos()),
                () -> assertEquals(100.0, dtoBbva.getUptimePct())
        );
    }

    @Test
    @DisplayName("Debe calcular los KPIs ejecutivos del Dashboard Global (SLA Uptime, MTTD, MTTR, activos y cerrados)")
    void testDashboardGlobalKpis() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 9, 10, 14, 0);
        Incidente incActivo = Incidente.builder()
                .idIncidente(102L)
                .codigoTicket("INC-20260910-10003")
                .entidad(entidadBbva)
                .severidad(Severidad.ALTA)
                .estadoActual(EstadoIncidente.EN_MITIGACION)
                .fechaHoraInicio(LocalDateTime.now().minusMinutes(30))
                .fechaHoraDeteccion(LocalDateTime.now().minusMinutes(24))
                .fechaHoraSolucion(null)
                .build();

        when(entidadRepository.findAll()).thenReturn(List.of(entidadBcp, entidadBbva));
        when(incidenteRepository.findByEntidadIdEntidad(1L)).thenReturn(List.of(incCerradoCritico, incCerradoMedio));
        when(incidenteRepository.findByEntidadIdEntidad(2L)).thenReturn(List.of(incActivo));
        when(incidenteRepository.findAll()).thenReturn(List.of(incCerradoCritico, incCerradoMedio, incActivo));

        KpiDashboardDTO kpi = reporteAnaliticoService.dashboardGlobal(null, null);

        assertNotNull(kpi);
        assertAll("Validación de KPIs ejecutivos globales",
                () -> assertEquals(3L, kpi.getTotalIncidentes()),
                () -> assertEquals(2L, kpi.getCerrados()),
                () -> assertEquals(1L, kpi.getActivos()),
                () -> assertEquals(45.0, kpi.getMttrGlobalMinutos(), 0.01),
                () -> assertEquals(4.0, kpi.getMttdGlobalMinutos(), 0.01, "Promedio MTTD (2 + 4 + 6) / 3 = 4.0 min"),
                () -> assertTrue(kpi.getUptimeGlobalPct() > 99.0 && kpi.getUptimeGlobalPct() <= 100.0),
                () -> assertEquals(2, kpi.getPorEntidad().size())
        );
    }

    @Test
    @DisplayName("Debe filtrar correctamente las métricas de indisponibilidad cuando se especifica rango de fechas")
    void testDashboardConFiltroRangoFechas() {
        LocalDateTime desde = LocalDateTime.of(2026, 9, 10, 13, 0);
        LocalDateTime hasta = LocalDateTime.of(2026, 9, 10, 15, 0);

        when(entidadRepository.findAll()).thenReturn(List.of(entidadBcp));
        when(incidenteRepository.findByEntidadIdEntidad(1L)).thenReturn(List.of(incCerradoCritico, incCerradoMedio));
        when(incidenteRepository.findAll()).thenReturn(List.of(incCerradoCritico, incCerradoMedio));

        KpiDashboardDTO kpi = reporteAnaliticoService.dashboardGlobal(desde, hasta);

        assertEquals(1L, kpi.getTotalIncidentes(), "Solo el primer incidente cae dentro de la ventana 13:00 - 15:00");
        assertEquals(60.0, kpi.getMttrGlobalMinutos(), 0.01);
        assertEquals(2.0, kpi.getMttdGlobalMinutos(), 0.01);
    }
}
