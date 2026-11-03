package pe.gob.bcrp.sigir.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.converter.json.ProblemDetailJacksonMixin;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pe.gob.bcrp.sigir.domain.enums.EstadoIncidente;
import pe.gob.bcrp.sigir.domain.enums.OrigenDeteccion;
import pe.gob.bcrp.sigir.domain.enums.Severidad;
import pe.gob.bcrp.sigir.service.IncidenteService;
import pe.gob.bcrp.sigir.web.dto.CambioEstadoDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteRegistroDTO;
import pe.gob.bcrp.sigir.web.dto.IncidenteResponseDTO;
import pe.gob.bcrp.sigir.web.exception.GlobalExceptionHandler;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Suite de Pruebas de Controlador REST - IncidenteController & RFC 7807 GlobalExceptionHandler")
class IncidenteControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private IncidenteService incidenteService;

    @InjectMocks
    private IncidenteController incidenteController;

    private IncidenteResponseDTO incidenteActivoDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.addMixIn(ProblemDetail.class, ProblemDetailJacksonMixin.class);

        mockMvc = MockMvcBuilders.standaloneSetup(incidenteController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        incidenteActivoDto = IncidenteResponseDTO.builder()
                .idIncidente(100L)
                .codigoTicket("INC-20260910-10001")
                .idEntidad(1L)
                .codigoBcrpEntidad("002")
                .nombreEntidad("BCP (Yape)")
                .codigoCategoria("DISP_SERV")
                .nombreCategoria("Disponibilidad de Servicios")
                .severidad(Severidad.CRITICA)
                .origenDeteccion(OrigenDeteccion.AUTOMATICO)
                .estadoActual(EstadoIncidente.REGISTRADO)
                .fechaHoraInicio(LocalDateTime.of(2026, 9, 10, 10, 0))
                .fechaHoraDeteccion(LocalDateTime.of(2026, 9, 10, 10, 1))
                .servicioAfectado("SWITCH_PAGOS_INTEROPERABLES")
                .descripcionDetallada("Caída de nodo transaccional")
                .impactoEstimadoUsuarios(1500)
                .usuarioCreador("SISTEMA_TELEMETRIA_DAEMON")
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/incidentes/activos - Debe retornar HTTP 200 OK con el listado de incidentes activos")
    void testListarIncidentesActivos() throws Exception {
        when(incidenteService.listarActivos()).thenReturn(List.of(incidenteActivoDto));

        mockMvc.perform(get("/api/v1/incidentes/activos")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idIncidente").value(100))
                .andExpect(jsonPath("$[0].codigoTicket").value("INC-20260910-10001"))
                .andExpect(jsonPath("$[0].nombreEntidad").value("BCP (Yape)"))
                .andExpect(jsonPath("$[0].estadoActual").value("REGISTRADO"));
    }

    @Test
    @DisplayName("POST /api/v1/incidentes - Debe registrar un nuevo incidente y retornar HTTP 201 CREATED")
    void testRegistrarIncidentePostEndpoint() throws Exception {
        IncidenteRegistroDTO registroDto = IncidenteRegistroDTO.builder()
                .idEntidad(1L)
                .codigoCategoria("DISP_SERV")
                .severidad(Severidad.CRITICA)
                .fechaHoraInicio(LocalDateTime.of(2026, 9, 10, 10, 0))
                .servicioAfectado("SWITCH_PAGOS_INTEROPERABLES")
                .descripcionDetallada("Caída de nodo transaccional")
                .impactoEstimadoUsuarios(1500)
                .build();

        when(incidenteService.registrarIncidenteManual(any(IncidenteRegistroDTO.class), any(String.class)))
                .thenReturn(incidenteActivoDto);

        mockMvc.perform(post("/api/v1/incidentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registroDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigoTicket").value("INC-20260910-10001"))
                .andExpect(jsonPath("$.severidad").value("CRITICA"));
    }

    @Test
    @DisplayName("PATCH /api/v1/incidentes/{id}/estado - Debe transicionar estado y retornar HTTP 200 OK")
    void testCambiarEstadoIncidente() throws Exception {
        CambioEstadoDTO cambioDto = CambioEstadoDTO.builder()
                .nuevoEstado(EstadoIncidente.EN_MITIGACION)
                .comentarioTecnico("Conmutación al nodo secundario de contingencia CCE")
                .build();

        IncidenteResponseDTO actualizadoDto = IncidenteResponseDTO.builder()
                .idIncidente(100L)
                .codigoTicket("INC-20260910-10001")
                .nombreEntidad("BCP (Yape)")
                .estadoActual(EstadoIncidente.EN_MITIGACION)
                .build();

        when(incidenteService.cambiarEstado(eq(100L), any(CambioEstadoDTO.class), any(String.class)))
                .thenReturn(actualizadoDto);

        mockMvc.perform(patch("/api/v1/incidentes/100/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambioDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idIncidente").value(100))
                .andExpect(jsonPath("$.estadoActual").value("EN_MITIGACION"));
    }

    @Test
    @DisplayName("RFC 7807 ProblemDetail - Debe retornar 400 Bad Request con metadatos normativos BCRP ante IllegalArgumentException")
    void testProblemDetailEnIllegalArgumentException() throws Exception {
        when(incidenteService.obtenerPorId(999L))
                .thenThrow(new IllegalArgumentException("Incidente no encontrado con ID: 999"));

        mockMvc.perform(get("/api/v1/incidentes/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Solicitud Inválida o Regla de Negocio Rechazada"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("Incidente no encontrado con ID: 999"))
                .andExpect(jsonPath("$.normativa").value("Circular BCRP N° 0014-2023"))
                .andExpect(jsonPath("$.sistema").value("SIGIR - Switch CCE"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("RFC 7807 ProblemDetail - Debe retornar 404 Not Found ante EntityNotFoundException")
    void testProblemDetailEnEntityNotFoundException() throws Exception {
        when(incidenteService.obtenerPorId(404L))
                .thenThrow(new EntityNotFoundException("Entidad o ticket inexistente en base de datos regulatoria"));

        mockMvc.perform(get("/api/v1/incidentes/404")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Recurso Regulatorio No Encontrado"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.normativa").value("Circular BCRP N° 0014-2023"))
                .andExpect(jsonPath("$.sistema").value("SIGIR - Switch CCE"));
    }

    @Test
    @DisplayName("RFC 7807 ProblemDetail - Debe retornar 400 Bad Request con mapa invalidParams cuando falla Bean Validation (@Valid)")
    void testProblemDetailEnMethodArgumentNotValidException() throws Exception {
        IncidenteRegistroDTO dtoInvalido = new IncidenteRegistroDTO();

        mockMvc.perform(post("/api/v1/incidentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Error de Validación de Datos de Entrada"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.normativa").value("Circular BCRP N° 0014-2023"))
                .andExpect(jsonPath("$.sistema").value("SIGIR - Switch CCE"))
                .andExpect(jsonPath("$.invalidParams.idEntidad").exists())
                .andExpect(jsonPath("$.invalidParams.codigoCategoria").exists());
    }
}
