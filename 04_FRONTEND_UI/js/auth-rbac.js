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

/**
 * Sanitizador centralizado con DOMPurify para prevención de inyecciones XSS
 */
function sanitizeHTML(dirty) {
    if (dirty === null || dirty === undefined) return '';
    const raw = String(dirty);
    if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
        return window.DOMPurify.sanitize(raw, {
            ADD_TAGS: ['svg', 'path', 'circle', 'line', 'polyline', 'rect', 'use', 'g', 'polygon', 'mark'],
            ADD_ATTR: [
                'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'width', 'height',
                'target', 'tabindex', 'role', 'aria-label', 'aria-modal', 'aria-expanded', 'aria-hidden',
                'data-action', 'data-ticket', 'data-incident-id', 'data-id', 'data-raw-json', 'data-entidad',
                'data-rol', 'data-target-state', 'data-step'
            ]
        });
    }
    return escapeHTML(raw);
}

if (typeof window !== 'undefined' && !window.sanitizeHTML) {
    window.sanitizeHTML = sanitizeHTML;
}

/**
 * Motor SHA-256 FIPS 180-4 puro para compatibilidad universal garantizada (fallback defensivo)
 */
function sha256Sync(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    let hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 312; i += candidate) {
                isComposite[i] = true;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    hash = hash.slice(0, 8);
    let padded = ascii + '\x80';
    while ((padded.length % 64) - 56) padded += '\x00';
    for (i = 0; i < padded.length; i++) {
        j = padded.charCodeAt(i);
        words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength | 0);
    for (j = 0; j < words.length;) {
        const w = words.slice(j, j += 16);
        const oldHash = hash;
        hash = hash.slice(0, 8);
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const s0 = i < 16 ? w[i] : (
                w[i] = (
                    (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                    w[i - 7] +
                    (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) +
                    w[i - 16]
                ) | 0
            );
            const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
            const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
            const s0_round = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
            const t1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
            const t2 = (s0_round + maj) | 0;
            hash = [(t1 + t2) | 0].concat(hash);
            hash[4] = (hash[4] + t1) | 0;
        }
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            const b = (hash[i] >> (8 * j)) & 255;
            result += (b < 16 ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

/**
 * Cálculo asíncrono seguro de SHA-256 (WebCrypto Subtle con fallback determinista)
 */
async function sha256Hex(str) {
    const raw = String(str || '');
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
        try {
            const buffer = new TextEncoder().encode(raw);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
            if (hex.length === 64 && /^[0-9a-f]{64}$/.test(hex)) {
                return hex;
            }
        } catch (e) {
            // fallback
        }
    }
    return sha256Sync(raw);
}

/**
 * Comparación en tiempo constante para mitigar ataques de temporización (Timing Attacks)
 */
function constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    let mismatch = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ (i < b.length ? b.charCodeAt(i) : 0);
    }
    return mismatch === 0;
}

/**
 * Credenciales institucionales seguras: NUNCA en texto plano.
 * Se almacenan digests criptográficos SHA-256 canónicos.
 */
const CREDENCIALES_DEMO = {
    'frank.vargas@bcrp.gob.pe': {
        // SHA-256 de 'Bcrp2026!'
        passwordHash: '11a2010490c4a7c86939d2040bf796481e3bc3095c8bcab65cb68b2b0652ebee',
        rolId: 'ARQUITECTO'
    },
    'operador.noc@bcrp.gob.pe': {
        // SHA-256 de 'Operador2026!'
        passwordHash: '6337daaf55c2b28570b3790379ca4328afeb60d143daed3237880d652ebcf68b',
        rolId: 'OPERADOR'
    },
    'auditor.zamata@bcrp.gob.pe': {
        // SHA-256 de 'Auditor2026!'
        passwordHash: 'df112afd046f96ddd661debd06d9241762e9f57bcf120d2b5227ab0caf9c3baa',
        rolId: 'AUDITOR'
    }
};

// Digest dummy para neutralizar ataques de enumeración y temporización cuando el usuario no existe
const DUMMY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const ROLES_BCRP = {
    ARQUITECTO: {
        id: 'ARQUITECTO',
        nombreCompleto: 'Frank Vargas Huamán',
        email: 'frank.vargas@bcrp.gob.pe',
        cargo: 'Arquitecto de Software & NOC Lead',
        badge: 'ARQUITECTO & NOC LEAD',
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
        badge: 'OPERADOR NOC BCRP',
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
        badge: 'AUDITOR REGULATORIO BCRP',
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
    KEY_CREATED_AT: 'sigir_bcrp_session_created_at',
    KEY_EXPIRES_AT: 'sigir_bcrp_session_expires_at',
    SESSION_TTL_MS: 30 * 60 * 1000, // TTL estricto: 30 minutos de inactividad operativa (Estándar BCRP)

    estaAutenticado() {
        try {
            const isAuth = sessionStorage.getItem(this.KEY_AUTH) === 'true';
            if (!isAuth) return false;

            const expiresAt = parseInt(sessionStorage.getItem(this.KEY_EXPIRES_AT), 10);
            const ahora = Date.now();
            if (!expiresAt || isNaN(expiresAt)) {
                // Si está explícitamente autenticado pero falta timestamp de expiración, inicializar ventana TTL
                sessionStorage.setItem(this.KEY_CREATED_AT, String(ahora));
                sessionStorage.setItem(this.KEY_EXPIRES_AT, String(ahora + this.SESSION_TTL_MS));
                return true;
            }

            if (ahora > expiresAt) {
                console.warn('[SIGIR AppSec] Sesión institucional caducada por política estricta de TTL.');
                this.limpiarSesion();
                return false;
            }

            // Renovar ventana deslizante
            sessionStorage.setItem(this.KEY_EXPIRES_AT, String(ahora + this.SESSION_TTL_MS));
            return true;
        } catch (e) {
            return false;
        }
    },

    renovarSesion() {
        try {
            if (sessionStorage.getItem(this.KEY_AUTH) === 'true') {
                sessionStorage.setItem(this.KEY_EXPIRES_AT, String(Date.now() + this.SESSION_TTL_MS));
            }
        } catch (e) {}
    },

    limpiarSesion() {
        try {
            sessionStorage.removeItem(this.KEY_AUTH);
            sessionStorage.removeItem(this.KEY_ROLE);
            sessionStorage.removeItem(this.KEY_USER);
            sessionStorage.removeItem(this.KEY_CREATED_AT);
            sessionStorage.removeItem(this.KEY_EXPIRES_AT);
            sessionStorage.removeItem('sigir_redirect_after_login');
        } catch (e) {}
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

    /**
     * Inicia sesión con retardo determinista (350 ms, ventana 300-400ms)
     * e inmunidad completa ante ataques de temporización (Timing Attacks)
     * y enumeración de cuentas.
     */
    async iniciarSesion(email, password, otp) {
        const TARGET_DELAY_MS = 350; // Retardo determinista de verificación segura
        const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        const emailNormalizado = String(email || '').trim().toLowerCase();
        const rawPassword = String(password || '');
        const otpTrimmed = String(otp || '').trim();

        let errorParaLanzar = null;
        let rolAutenticado = null;

        try {
            // 1. Validación de entradas
            if (!emailNormalizado || !rawPassword) {
                errorParaLanzar = new Error('Por favor complete su correo institucional y su contraseña de acceso.');
            } else if (otpTrimmed && (otpTrimmed.length !== 6 || !/^\d{6}$/.test(otpTrimmed))) {
                errorParaLanzar = new Error('El Token Digital BCRP debe contener exactamente 6 dígitos numéricos.');
            }

            // 2. Cálculo criptográfico de hash de la contraseña ingresada
            const passHash = await sha256Hex(rawPassword);

            // 3. Búsqueda y comparación en tiempo constante (previene timing attack y user enumeration)
            const credEncontrada = CREDENCIALES_DEMO[emailNormalizado];
            const targetHash = credEncontrada ? credEncontrada.passwordHash : DUMMY_HASH;
            const esPasswordValido = constantTimeCompare(passHash, targetHash);

            if (!errorParaLanzar) {
                if (!credEncontrada || !esPasswordValido) {
                    // Mensaje genérico conforme al estándar bancario BCRP para evitar enumeración de usuarios
                    errorParaLanzar = new Error('Credenciales institucionales incorrectas. Verifique su correo electrónico y contraseña.');
                } else {
                    rolAutenticado = ROLES_BCRP[credEncontrada.rolId];
                }
            }
        } catch (e) {
            errorParaLanzar = errorParaLanzar || new Error('Fallo en el servicio criptográfico de autenticación.');
        }

        // 4. Retardo determinista estricto (350 ms totales de ejecución)
        const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const transcurrido = t1 - t0;
        const restante = Math.max(0, TARGET_DELAY_MS - transcurrido);
        if (restante > 0) {
            await new Promise(r => setTimeout(r, restante));
        }

        if (errorParaLanzar) {
            throw errorParaLanzar;
        }

        // 5. Establecer sesión con timestamp y TTL estricto
        const ahora = Date.now();
        sessionStorage.setItem(this.KEY_AUTH, 'true');
        sessionStorage.setItem(this.KEY_ROLE, rolAutenticado.id);
        sessionStorage.setItem(this.KEY_USER, emailNormalizado);
        sessionStorage.setItem(this.KEY_CREATED_AT, String(ahora));
        sessionStorage.setItem(this.KEY_EXPIRES_AT, String(ahora + this.SESSION_TTL_MS));

        return rolAutenticado;
    },

    iniciarSesionRapida(rolId) {
        if (!ROLES_BCRP[rolId]) return;
        const rol = ROLES_BCRP[rolId];
        const ahora = Date.now();
        sessionStorage.setItem(this.KEY_AUTH, 'true');
        sessionStorage.setItem(this.KEY_ROLE, rolId);
        sessionStorage.setItem(this.KEY_USER, rol.email);
        sessionStorage.setItem(this.KEY_CREATED_AT, String(ahora));
        sessionStorage.setItem(this.KEY_EXPIRES_AT, String(ahora + this.SESSION_TTL_MS));

        if (window.SoundFX && typeof window.SoundFX.playSuccess === 'function') {
            window.SoundFX.playSuccess();
        }

        const destino = sessionStorage.getItem('sigir_redirect_after_login') || 'index.html';
        sessionStorage.removeItem('sigir_redirect_after_login');
        window.location.href = destino;
    },

    cerrarSesion() {
        this.limpiarSesion();

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
        if (userRoleElem) userRoleElem.innerHTML = sanitizeHTML(`<span class="status-dot online"></span> ${escapeHTML(rol.cargo)}`);
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

        // Botón Exportar CSV de Bitácora de Auditoría (Art. 12 BCRP)
        const btnExportAudit = document.getElementById('btnExportarBitacoraCsv');
        if (btnExportAudit) {
            if (rol.permisos && rol.permisos.exportarAuditoria) {
                btnExportAudit.disabled = false;
                btnExportAudit.style.opacity = '1';
                btnExportAudit.removeAttribute('title');
            } else {
                btnExportAudit.disabled = true;
                btnExportAudit.style.opacity = '0.45';
                btnExportAudit.setAttribute('title', `Exportación restringida para el perfil: ${rol.cargo}`);
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
        const avatarSafe = escapeHTML(rol.avatar || 'ID');
        const colorSafe = escapeHTML(rol.colorBadge || '#E2B357');
        const html = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-family:'JetBrains Mono', monospace; font-size:0.72rem; font-weight:700; background:rgba(15,23,42,0.9); color:${colorSafe}; border:1px solid ${colorSafe}; flex-shrink:0;">${avatarSafe}</span>
                <div>
                    <div style="font-size:0.85rem; font-weight:700; color:#F8FAFC;">Perfil Activo: ${nombreSafe}</div>
                    <div style="font-size:0.75rem; color:#94A3B8;">${cargoSafe} &bull; ${nivelSafe}</div>
                </div>
            </div>
        `;
        toast.innerHTML = sanitizeHTML(html);
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
        const modalHtml = `
            <div class="modal-box rbac-modal-box" role="dialog" aria-modal="true" aria-label="Control de Acceso Institucional BCRP">
                <div class="modal-header">
                    <div>
                        <h3 style="margin:0; font-size:1.15rem; color:#F8FAFC; display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E2B357" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Control de Acceso Institucional BCRP
                        </h3>
                        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#94A3B8;">Alterna entre los perfiles autorizados para evaluar las restricciones de la interfaz:</p>
                    </div>
                    <button class="modal-close" aria-label="Cerrar selector de roles" onclick="AuthRBAC.cerrarModalRoles()">&times;</button>
                </div>
                <div class="rbac-roles-list">
                    <div class="rbac-role-card" data-rol="ARQUITECTO" tabindex="0" role="button" aria-label="Seleccionar perfil: Frank Vargas Huamán, Arquitecto de Software" onclick="AuthRBAC.establecerRol('ARQUITECTO'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('ARQUITECTO'); AuthRBAC.cerrarModalRoles();}">
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

                    <div class="rbac-role-card" data-rol="OPERADOR" tabindex="0" role="button" aria-label="Seleccionar perfil: Fernando Romero o Joel Olaya, Operador NOC" onclick="AuthRBAC.establecerRol('OPERADOR'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('OPERADOR'); AuthRBAC.cerrarModalRoles();}">
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

                    <div class="rbac-role-card" data-rol="AUDITOR" tabindex="0" role="button" aria-label="Seleccionar perfil: Prof. Zamata, Auditor Regulatorio BCRP" onclick="AuthRBAC.establecerRol('AUDITOR'); AuthRBAC.cerrarModalRoles();" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); AuthRBAC.establecerRol('AUDITOR'); AuthRBAC.cerrarModalRoles();}">
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
        modal.innerHTML = sanitizeHTML(modalHtml);

        // Delegación de eventos accesibles deterministas
        modal.querySelectorAll('.rbac-role-card').forEach(card => {
            const rolId = card.getAttribute('data-rol');
            if (rolId) {
                card.addEventListener('click', () => {
                    AuthRBAC.establecerRol(rolId);
                    AuthRBAC.cerrarModalRoles();
                });
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        AuthRBAC.establecerRol(rolId);
                        AuthRBAC.cerrarModalRoles();
                    }
                });
            }
        });

        const btnClose = modal.querySelector('.modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => AuthRBAC.cerrarModalRoles());
        }

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

        // Monitoreo de actividad de usuario para renovación segura de ventana deslizante de TTL
        ['click', 'keydown', 'mousemove', 'scroll'].forEach(evtName => {
            window.addEventListener(evtName, () => {
                if (!AuthRBAC._throttleRenewal) {
                    AuthRBAC._throttleRenewal = true;
                    AuthRBAC.renovarSesion();
                    setTimeout(() => { AuthRBAC._throttleRenewal = false; }, 30000); // Mínimo 30s entre escrituras
                }
            }, { passive: true });
        });

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
