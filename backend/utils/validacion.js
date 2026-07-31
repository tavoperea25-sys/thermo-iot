const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Los máximos coinciden con las columnas VARCHAR de schema.sql —
// evita que MySQL rechace el INSERT con un error críptico cuando
// alguien manda un campo absurdamente largo.

function validarRegistro({ nombre, correo, usuario, password }) {

    if (!nombre || !nombre.trim()) {
        return "El nombre es obligatorio";
    }

    if (nombre.length > 150) {
        return "El nombre es demasiado largo";
    }

    if (!correo || !REGEX_CORREO.test(correo)) {
        return "El correo no es válido";
    }

    if (correo.length > 150) {
        return "El correo es demasiado largo";
    }

    if (!usuario || !usuario.trim()) {
        return "El nombre de usuario es obligatorio";
    }

    if (usuario.length > 100) {
        return "El nombre de usuario es demasiado largo";
    }

    if (!password || password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
    }

    return null;

}

module.exports = { validarRegistro };
