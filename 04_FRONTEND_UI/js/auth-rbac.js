/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Módulo de Autenticación y Control de Acceso Basado en Roles (RBAC)
 * Autor: Frank Emiliano Vargas Huamán (@frankitoromas-tech)
 * ==========================================================================
 */

const ROLES_BCRP = {
    ARQUITECTO: {
        id: 'ARQUITECTO',
        nombreCompleto: 'Frank Vargas Huamán',
        cargo: 'Arquitecto de Software & NOC Lead',
        badge: '👑 SUPERADMIN / NOC LEAD',
        nivelAcceso: 'Control Total y Simulación',
        avatar: 'FV',
        colorBadge: '#E2B357',
        permisos: {
            simularFalla: true,
            crearIncidente: true,
            mitigarIncidente: true,
            cerrarIncidente: true,
            generarSFT: true,
            exportarAuditoria: true,
            configuracionAvanzada: true
        },
        descripcion: 'Acceso total para demostración, simulación de fallas y gobierno de contingencias.'
    },
    OPERADOR: {
        id: 'OPERADOR',
        nombreCompleto: 'Fernando Romero / Joel Olaya',
        cargo: 'Operador NOC & Mesa de Ayuda',
        badge: '👨‍💻 OPERADOR NOC',
        nivelAcceso: 'Operación y Mesa de Ayuda',
        avatar: 'OP',
        colorBadge: '#38BDF8',
        permisos: {
            simularFalla: false,
            crearIncidente: true,
            mitigarIncidente: true,
            cerrarIncidente: false,
            generarSFT: true,
            exportarAuditoria: false,
            configuracionAvanzada: false
        },
        descripcion: 'Gestión operativa de tickets, mitigación de fallas y monitoreo de enlace.'
    },
    AUDITOR: {
        id: 'AUDITOR',
        nombreCompleto: 'Prof. Zamata',
        cargo: 'Auditor Regulatorio BCRP / Jurado Evaluador',
        badge: '⚖️ AUDITOR REGULATORIO BCRP',
        nivelAcceso: 'Modo Inspección y No Repudio',
        avatar: 'PZ',
        colorBadge: '#10B981',
        permisos: {
            simularFalla: false,
            crearIncidente: false,
            mitigarIncidente: false,
            cerrarIncidente: false,
            generarSFT: true,
            exportarAuditoria: true,
            configuracionAvanzada: false
        },
        descripcion: 'Inspección de trazabilidad forense, verificación de firmas SHA-256 y cumplimiento de SLA.'
    }
};

const AuthRBAC = {
    KEY_STORAGE: 'sigir_bcrp_active_role',

    obtenerRolActual() {
        try {
            const guardado = sessionStorage.getItem(this.KEY_STORAGE);
            if (guardado && ROLES_BCRP[guardado]) {
                return ROLES_BCRP[guardado];
            }
        } catch (e) {
            console.warn('Storage no disponible, usando rol predeterminado.');
        }
        return ROLES_BCRP.ARQUITECTO;
    },

    establecerRol(rolId) {
        if (!ROLES_BCRP[rolId]) return;
        try {
            sessionStorage.setItem(this.KEY_STORAGE, rolId);
        } catch (e) {}

        const rol = ROLES_BCRP[rolId];
        this.aplicarPermisosEnUI(rol);

        if (window.SoundFX && typeof window.SoundFX.playSuccess === 'function') {
            window.SoundFX.playSuccess();
        }

        this.mostrarNotificacionRol(rol);
    },

    aplicarPermisosEnUI(rol) {
        // Actualizar datos de usuario en la cabecera
        const userNameElem = document.querySelector('.user-info .user-name');
        const userRoleElem = document.querySelector('.user-info .user-role');
        const userAvatarElem = document.querySelector('.user-avatar');

        if (userNameElem) userNameElem.textContent = rol.nombreCompleto;
        if (userRoleElem) userRoleElem.textContent = rol.cargo;
        if (userAvatarElem) userAvatarElem.textContent = rol.avatar;

        // Botón Simular Falla
        const btnSimular = document.getElementById('btnSimularCaida');
        if (btnSimular) {
            if (rol.permisos.simularFalla) {
                btnSimular.disabled = false;
                btnSimular.style.opacity = '1';
                btnSimular.removeAttribute('title');
            } else {
                btnSimular.disabled = true;
                btnSimular.style.opacity = '0.45';
                btnSimular.setAttribute('title', `Acción restringida para el perfil: ${rol.cargo}`);
            }
        }

        // Botón Nuevo Incidente Manual
        const btnNuevo = document.getElementById('btnNuevoManual');
        if (btnNuevo) {
            if (rol.permisos.crearIncidente) {
                btnNuevo.disabled = false;
                btnNuevo.style.opacity = '1';
                btnNuevo.removeAttribute('title');
            } else {
                btnNuevo.disabled = true;
                btnNuevo.style.opacity = '0.45';
                btnNuevo.setAttribute('title', `Solo el personal de operaciones puede registrar incidentes.`);
            }
        }

        // Píldora de Rol Activo en Header
        let pillRol = document.getElementById('rbacRolePill');
        if (!pillRol) {
            const userBox = document.querySelector('.user-profile-badge') || document.querySelector('.user-session-card');
            if (userBox) {
                pillRol = document.createElement('div');
                pillRol.id = 'rbacRolePill';
                pillRol.className = 'rbac-role-pill';
                userBox.parentNode.insertBefore(pillRol, userBox.nextSibling);
            }
        }

        if (pillRol) {
            pillRol.innerHTML = `
                <span class="rbac-indicator-dot" style="background:${rol.colorBadge}"></span>
                <span style="font-weight:700; color:${rol.colorBadge}; font-size:0.75rem;">${rol.badge}</span>
                <button type="button" class="rbac-btn-switch" onclick="AuthRBAC.abrirModalRoles()" title="Cambiar rol de usuario">Cambiar Rol</button>
            `;
        }
    },

    mostrarNotificacionRol(rol) {
        const toast = document.createElement('div');
        toast.className = 'rbac-toast-notification';
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.2rem;">${rol.avatar === 'FV' ? '👑' : (rol.avatar === 'PZ' ? '⚖️' : '👨‍💻')}</span>
                <div>
                    <div style="font-size:0.85rem; font-weight:700; color:#F8FAFC;">Perfil Activo: ${rol.nombreCompleto}</div>
                    <div style="font-size:0.75rem; color:#94A3B8;">${rol.cargo} &bull; ${rol.nivelAcceso}</div>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 50);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    },

    abrirModalRoles() {
        let modal = document.getElementById('modalSelectorRoles');
        if (!modal) {
            this.crearModalRolesDOM();
            modal = document.getElementById('modalSelectorRoles');
        }
        if (modal) {
            modal.classList.add('active');
        }
    },

    cerrarModalRoles() {
        const modal = document.getElementById('modalSelectorRoles');
        if (modal) modal.classList.remove('active');
    },

    crearModalRolesDOM() {
        const modal = document.createElement('div');
        modal.id = 'modalSelectorRoles';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box rbac-modal-box">
                <div class="modal-header">
                    <div>
                        <h3 style="margin:0; font-size:1.15rem; color:#F8FAFC; display:flex; align-items:center; gap:8px;">
                            <span style="color:#E2B357;">🏛️</span> Control de Acceso Institucional BCRP
                        </h3>
                        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#94A3B8;">Selecciona un perfil para experimentar la plataforma según permisos asignados:</p>
                    </div>
                    <button class="modal-close" onclick="AuthRBAC.cerrarModalRoles()">&times;</button>
                </div>
                <div class="rbac-roles-list">
                    <div class="rbac-role-card" onclick="AuthRBAC.establecerRol('ARQUITECTO'); AuthRBAC.cerrarModalRoles();">
                        <div class="rbac-card-header">
                            <span class="rbac-avatar" style="background:rgba(226,179,87,0.15); color:#E2B357; border:1px solid #E2B357;">FV</span>
                            <div>
                                <h4 style="margin:0; color:#F8FAFC; font-size:0.95rem;">Frank Vargas Huamán</h4>
                                <span style="font-size:0.75rem; color:#E2B357; font-weight:600;">Arquitecto de Software &amp; NOC Lead</span>
                            </div>
                            <span class="rbac-tag-full">Acceso Total</span>
                        </div>
                        <p style="margin:8px 0 0 0; font-size:0.78rem; color:#CBD5E1;">
                            Permite simular fallas de enlace en tiempo real, crear y mitigar incidentes, y compilar reportes SFT oficiales.
                        </p>
                    </div>

                    <div class="rbac-role-card" onclick="AuthRBAC.establecerRol('OPERADOR'); AuthRBAC.cerrarModalRoles();">
                        <div class="rbac-card-header">
                            <span class="rbac-avatar" style="background:rgba(56,189,248,0.15); color:#38BDF8; border:1px solid #38BDF8;">OP</span>
                            <div>
                                <h4 style="margin:0; color:#F8FAFC; font-size:0.95rem;">Fernando Romero / Joel Olaya</h4>
                                <span style="font-size:0.75rem; color:#38BDF8; font-weight:600;">Operador NOC &amp; Mesa de Ayuda</span>
                            </div>
                            <span class="rbac-tag-ops">Operativo</span>
                        </div>
                        <p style="margin:8px 0 0 0; font-size:0.78rem; color:#CBD5E1;">
                            Gestión de tickets, atención de alertas y mitigación de problemas en pasarelas interbancarias.
                        </p>
                    </div>

                    <div class="rbac-role-card" onclick="AuthRBAC.establecerRol('AUDITOR'); AuthRBAC.cerrarModalRoles();">
                        <div class="rbac-card-header">
                            <span class="rbac-avatar" style="background:rgba(16,185,129,0.15); color:#10B981; border:1px solid #10B981;">PZ</span>
                            <div>
                                <h4 style="margin:0; color:#F8FAFC; font-size:0.95rem;">Prof. Zamata</h4>
                                <span style="font-size:0.75rem; color:#10B981; font-weight:600;">Auditor Regulatorio BCRP / Jurado</span>
                            </div>
                            <span class="rbac-tag-audit">Solo Lectura</span>
                        </div>
                        <p style="margin:8px 0 0 0; font-size:0.78rem; color:#CBD5E1;">
                            Modo de inspección forense. Supervisión del SLA de disponibilidad, trazabilidad y verificación de firmas criptográficas SHA-256.
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    inicializar() {
        const rol = this.obtenerRolActual();
        this.aplicarPermisosEnUI(rol);

        // Click en la tarjeta de sesión abre el selector
        const userCard = document.querySelector('.user-profile-badge') || document.querySelector('.user-session-card');
        if (userCard) {
            userCard.style.cursor = 'pointer';
            userCard.setAttribute('title', 'Haz clic para cambiar de rol');
            userCard.addEventListener('click', () => this.abrirModalRoles());
        }
    }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthRBAC.inicializar());
} else {
    AuthRBAC.inicializar();
}

window.AuthRBAC = AuthRBAC;
