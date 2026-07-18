export function guardarSesion(token, usuario) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function actualizarUsuarioLocal(usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function obtenerToken() {
    return localStorage.getItem("token");
}

export function obtenerUsuario() {
    const usuario = localStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) : null;
}

export function haySesion() {
    return Boolean(obtenerToken());
}

export function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
}
