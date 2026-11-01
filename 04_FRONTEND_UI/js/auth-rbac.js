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
                    reject(new Error('Usuario no registrado en el directorio institucional del BCRP.'));
                    return;
                }
                if (cred.password !== password) {
                    reject(new Error('Contraseña incorrecta para el usuario institucional.'));
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

    toggleMenuUsuario(event) {
        if (event) {
            event.stopPropagation();
        }
        const dropdown = document.getElementById('headerUserDropdown');
        const trigger = document.getElementById('btnUserMenuTrigger');
        const popover = document.getElementById('userMenuPopover');
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('active');
        if (isOpen) {
            this.cerrarMenuUsuario();
        } else {
            dropdown.classList.add('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            if (popover) popover.setAttribute('aria-hidden', 'false');
            if (window.SoundFX && typeof window.SoundFX.playPop === 'function') {
                window.SoundFX.playPop();
            }
        }
    },

    cerrarMenuUsuario() {
        const dropdown = document.getElementById('headerUserDropdown');
        const trigger = document.getElementById('btnUserMenuTrigger');
        const popover = document.getElementById('userMenuPopover');
        if (!dropdown) return;
        dropdown.classList.remove('active');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (popover) popover.setAttribute('aria-hidden', 'true');
    },

    aplicarPermisosEnUI(rol) {
        // 1. Elementos del Dropdown de Usuario Unificado (FinTech Standard)
        const headerAvatar = document.getElementById('headerUserAvatar');
        const headerName = document.getElementById('headerUserName');
        const popoverAvatar = document.getElementById('popoverUserAvatar');
        const popoverName = document.getElementById('popoverUserName');
        const popoverRole = document.getElementById('popoverUserRole');
        const popoverEmail = document.getElementById('popoverUserEmail');

        if (headerAvatar) headerAvatar.textContent = rol.avatar;
        if (headerName) {
            const partes = (rol.nombreCompleto || '').split(' ');
            headerName.textContent = partes.length >= 2 ? `${partes[0]} ${partes[1]}` : rol.nombreCompleto;
        }
        if (popoverAvatar) popoverAvatar.textContent = rol.avatar;
        if (popoverName) popoverName.textContent = rol.nombreCompleto;
        if (popoverRole) popoverRole.textContent = rol.cargo;
        if (popoverEmail) popoverEmail.textContent = rol.email;

        // Compatibilidad con selectores de sesiones anteriores
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

        // Eliminar botón salir suelto del header si existiera (ahora integrado en el popover)
        const btnSalirViejo = document.getElementById('btnCerrarSesionHeader');
        if (btnSalirViejo) {
            btnSalirViejo.remove();
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
        this.ultimoFoco = document.activeElement;
        let modal = document.getElementById('modalSelectorRoles');
        if (!modal) {
            this.crearModalRolesDOM();
            modal = document.getElementById('modalSelectorRoles');
        }
        if (modal) {
            modal.classList.add('active');
            setTimeout(() => {
                const firstCard = modal.querySelector('.rbac-role-card');
                if (firstCard) firstCard.focus();
            }, 60);
        }
    },

    cerrarModalRoles() {
        const modal = document.getElementById('modalSelectorRoles');
        if (modal) modal.classList.remove('active');
        if (this.ultimoFoco && typeof this.ultimoFoco.focus === 'function') {
            this.ultimoFoco.focus();
            this.ultimoFoco = null;
        }
    },

    crearModalRolesDOM() {
        const modal = document.createElement('div');
        modal.id = 'modalSelectorRoles';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box rbac-modal-box" role="dialog" aria-modal="true" aria-label="Control de Acceso Institucional BCRP">
                <div class="modal-header">
                    <div>
                        <h3 style="margin:0; font-size:1.15rem; color:#F8FAFC; display:flex; align-items:center; gap:8px;">
                            <span style="color:#E2B357;">🏛️</span> Control de Acceso Institucional BCRP
                        </h3>
                        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#94A3B8;">Alterna entre los perfiles autorizados para evaluar las restricciones de la interfaz:</p>
                    </div>
                    <button class="modal-close" aria-label="Cerrar selector de roles" onclick="AuthRBAC.cerrarModalRoles()">&times;</button>
                </div>
                <div class="rbac-roles-list">
                    <div class="rbac-role-card" tabindex="0" role="button" aria-label="Seleccionar perfil: Frank Vargas Huamán, Arquitecto de Software" onclick="AuthRBAC.establecerRol('ARQUITECTO'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('ARQUITECTO'); AuthRBAC.cerrarModalRoles();}">
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

                    <div class="rbac-role-card" tabindex="0" role="button" aria-label="Seleccionar perfil: Fernando Romero o Joel Olaya, Operador NOC" onclick="AuthRBAC.establecerRol('OPERADOR'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('OPERADOR'); AuthRBAC.cerrarModalRoles();}">
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

                    <div class="rbac-role-card" tabindex="0" role="button" aria-label="Seleccionar perfil: Prof. Zamata, Auditor Regulatorio BCRP" onclick="AuthRBAC.establecerRol('AUDITOR'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('AUDITOR'); AuthRBAC.cerrarModalRoles();}">
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
        modal.addEventListener('click', (e) => {
            if (e.target === modal) AuthRBAC.cerrarModalRoles();
        });
        document.body.appendChild(modal);

        // Escape para cerrar modal de roles
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (modal.classList.contains('active')) {
                    AuthRBAC.cerrarModalRoles();
                }
            }
        });
    },

    inicializar() {
        // Ejecutar barrera de autenticación
        if (!this.verificarBarreraAcceso()) {
            return;
        }

        const rol = this.obtenerRolActual();
        this.aplicarPermisosEnUI(rol);

        // Inicializar trigger del Dropdown de Usuario Unificado
        const userTrigger = document.getElementById('btnUserMenuTrigger');
        if (userTrigger) {
            userTrigger.addEventListener('click', (e) => this.toggleMenuUsuario(e));
        }

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('headerUserDropdown');
            if (dropdown && dropdown.classList.contains('active')) {
                if (!dropdown.contains(e.target)) {
                    this.cerrarMenuUsuario();
                }
            }
        });

        // Cerrar dropdown con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                this.cerrarMenuUsuario();
            }
        });

        // Click y teclado en tarjetas de sesión legadas (si existieran)
        const userCard = document.querySelector('.user-profile-badge') || 
                         document.querySelector('.user-session-card') || 
                         document.querySelector('.ad-session-card');
        if (userCard) {
            userCard.style.cursor = 'pointer';
            userCard.setAttribute('tabindex', '0');
            userCard.setAttribute('role', 'button');
            userCard.setAttribute('aria-label', 'Cambiar rol institucional activo');
            userCard.setAttribute('title', 'Haz clic o pulsa Enter para cambiar de rol institucional');
            userCard.addEventListener('click', () => this.abrirModalRoles());
            userCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.abrirModalRoles();
                }
            });
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
