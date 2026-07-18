const rateLimit = require("express-rate-limit");

// Límite de intentos de login: máximo 5 intentos por IP cada
// 15 minutos. Después de eso, se bloquea temporalmente aunque
// la contraseña sea correcta — protege contra ataques de fuerza
// bruta (probar contraseñas una tras otra automáticamente).

const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,
    max: 5,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        mensaje: "Demasiados intentos de inicio de sesión. Espera 15 minutos e intenta de nuevo."
    },

    // No contamos los logins exitosos contra el límite — solo
    // los fallidos son los que importan para detectar fuerza bruta.

    skipSuccessfulRequests: true

});

// Límite más relajado para registro — evita que un script cree
// cientos de cuentas falsas en poco tiempo, sin molestar a un
// usuario normal que se equivoca llenando el formulario.

const registerLimiter = rateLimit({

    windowMs: 60 * 60 * 1000,
    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        mensaje: "Demasiados intentos de registro desde esta red. Intenta de nuevo más tarde."
    }

});

module.exports = { loginLimiter, registerLimiter };
