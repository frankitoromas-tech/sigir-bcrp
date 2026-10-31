/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE GESTIÓN DE INCIDENTES REGULATORIOS (SIGIR - BCRP)
 * Módulo de Autenticación, Control de Acceso (RBAC) & Barrera de Seguridad
 * Autor: Frank Emiliano Vargas Huamán (@frankitoromas-tech)
 * ==========================================================================
 */

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (typeof window !== 'undefined' && !window.escapeHTML) {
    window.escapeHTML = escapeHTML;
}

const CREDENCIALES_DEMO = {
    'frank.vargas@bcrp.gob.pe': {
        password: 'Bcrp2026!',
        rolId: 'ARQUITECTO'
    },
    'operador.noc@bcrp.gob.pe': {
        password: 'Operador2026!',
        rolId: 'OPERADOR'
    },
    'auditor.zamata@bcrp.gob.pe': {
        password: 'Auditor2026!',
        rolId: 'AUDITOR'
    }
};

const ROLES_BCRP = {
    ARQUITECTO: {
        id: 'ARQUITECTO',
        nombreCompleto: 'Frank Vargas Huamán',
        email: 'frank.vargas@bcrp.gob.pe',
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
        email: 'operador.noc@bcrp.gob.pe',
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
        email: 'auditor.zamata@bcrp.gob.pe',
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
    KEY_AUTH: 'sigir_bcrp_authenticated',
    KEY_ROLE: 'sigir_bcrp_active_role',
    KEY_USER: 'sigir_bcrp_user_email',

    estaAutenticado() {
        try {
            return sessionStorage.getItem(this.KEY_AUTH) === 'true';
        } catch (e) {
            return false;
        }
    },

    obtenerRolActual() {
        try {
            const guardado = sessionStorage.getItem(this.KEY_ROLE);
            if (guardado && ROLES_BCRP[guardado]) {
                return ROLES_BCRP[guardado];
            }
        } catch (e) {}
        return ROLES_BCRP.ARQUITECTO;
    },

    verificarBarreraAcceso() {
        const rutaActual = window.location.pathname.toLowerCase();
        const esPaginaLogin = rutaActual.endsWith('login.html');

        // Si no está autenticado y no está en login.html, redirige a login
        if (!this.estaAutenticado() && !esPaginaLogin) {
            // Guardar ruta previa para redirección tras login
            sessionStorage.setItem('sigir_redirect_after_login', window.location.href);
            window.location.href = 'login.html';
            return false;
        }

        // Si ya está autenticado y entra a login.html, enviarlo directo a index.html
        if (this.estaAutenticado() && esPaginaLogin) {
            window.location.href = 'index.html';
            return true;
        }

        return true;
    },

    async iniciarSesion(email, password, otp) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const cred = CREDENCIALES_DEMO[email.trim().toLowerCase()];
                if (!cred) {
                    reject(new Error('Usuario no registrado en el Active Directory del BCRP.'));
                    return;
                }
                if (cred.password !== password) {
                    reject(new Error('Contraseña incorrecta para el dominio BCRP.LOCAL.'));
                    return;
                }
                if (otp && otp.trim().length !== 6) {
                    reject(new Error('El Token Digital BCRP debe contener exactamente 6 dígitos.'));
                    return;
                }

                sessionStorage.setItem(this.KEY_AUTH, 'true');
                sessionStorage.setItem(this.KEY_ROLE, cred.rolId);
                sessionStorage.setItem(this.KEY_USER, email);

                resolve(ROLES_BCRP[cred.rolId]);
            }, 450);
        });
    },

    iniciarSesionRapida(rolId) {
        if (!ROLES_BCRP[rolId]) return;
        const rol = ROLES_BCRP[rolId];
        sessionStorage.setItem(this.KEY_AUTH, 'true');
        sessionStorage.setItem(this.KEY_ROLE, rolId);
        sessionStorage.setItem(this.KEY_USER, rol.email);

        if (window.SoundFX && typeof window.SoundFX.playSuccess === 'function') {
            window.SoundFX.playSuccess();
        }

        const destino = sessionStorage.getItem('sigir_redirect_after_login') || 'index.html';
        sessionStorage.removeItem('sigir_redirect_after_login');
        window.location.href = destino;
    },

    cerrarSesion() {
        try {
            sessionStorage.removeItem(this.KEY_AUTH);
            sessionStorage.removeItem(this.KEY_ROLE);
            sessionStorage.removeItem(this.KEY_USER);
        } catch (e) {}

        if (window.SoundFX && typeof window.SoundFX.playClick === 'function') {
            window.SoundFX.playClick();
        }

        window.location.href = 'login.html';
    },

    establecerRol(rolId) {
        if (!ROLES_BCRP[rolId]) return;
        sessionStorage.setItem(this.KEY_ROLE, rolId);
        const rol = ROLES_BCRP[rolId];
        this.aplicarPermisosEnUI(rol);

        if (window.SoundFX && typeof window.SoundFX.playSuccess === 'function') {
            window.SoundFX.playSuccess();
        }

        this.mostrarNotificacionRol(rol);
    },

    aplicarPermisosEnUI(rol) {
        const userNameElem = document.querySelector('.user-info .user-name') || document.querySelector('.user-meta .user-name');
        const userRoleElem = document.querySelector('.user-info .user-role') || document.querySelector('.user-meta .user-ad-domain');
        const userAvatarElem = document.querySelector('.user-avatar');

        if (userNameElem) userNameElem.textContent = rol.nombreCompleto;
        if (userRoleElem) userRoleElem.innerHTML = `<span class="status-dot online"></span> ${escapeHTML(rol.cargo)}`;
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

        // Píldora de Rol Activo y Botón Cerrar Sesión en Header
        let sessionContainer = document.querySelector('.header-right');
        if (sessionContainer && !document.getElementById('btnCerrarSesionHeader')) {
            const btnLogout = document.createElement('button');
            btnLogout.id = 'btnCerrarSesionHeader';
            btnLogout.type = 'button';
            btnLogout.className = 'btn-logout-header';
            btnLogout.title = 'Cerrar Sesión Activa';
            btnLogout.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Salir</span>
            `;
            btnLogout.onclick = () => AuthRBAC.cerrarSesion();
            sessionContainer.appendChild(btnLogout);
        }
    },

    mostrarNotificacionRol(rol) {
        const toast = document.createElement('div');
        toast.className = 'rbac-toast-notification';
        const nombreSafe = escapeHTML(rol.nombreCompleto);
        const cargoSafe = escapeHTML(rol.cargo);
        const nivelSafe = escapeHTML(rol.nivelAcceso);
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.2rem;">${rol.avatar === 'FV' ? '👑' : (rol.avatar === 'PZ' ? '⚖️' : '👨‍💻')}</span>
                <div>
                    <div style="font-size:0.85rem; font-weight:700; color:#F8FAFC;">Perfil Activo: ${nombreSafe}</div>
                    <div style="font-size:0.75rem; color:#94A3B8;">${cargoSafe} &bull; ${nivelSafe}</div>
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
                        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#94A3B8;">Alterna entre los perfiles autorizados para evaluar las restricciones de la interfaz:</p>
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
                            Permite simular fallas en tiempo real, crear incidentes, gestionar mitigaciones y generar reportes oficiales SFT.
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
                            Atención de alertas, registro de tickets de mesa de ayuda y seguimiento de contingencias de pago.
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
                            Modo de inspección forense. Supervisión del SLA de disponibilidad y verificación de firmas criptográficas SHA-256.
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    inicializar() {
        // Ejecutar barrera de autenticación
        if (!this.verificarBarreraAcceso()) {
            return;
        }

        const rol = this.obtenerRolActual();
        this.aplicarPermisosEnUI(rol);

        // Click en la tarjeta de sesión abre el selector de perfiles
        const userCard = document.querySelector('.user-profile-badge') || 
                         document.querySelector('.user-session-card') || 
                         document.querySelector('.ad-session-card');
        if (userCard) {
            userCard.style.cursor = 'pointer';
            userCard.setAttribute('title', 'Haz clic para cambiar de rol o ver permisos');
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
