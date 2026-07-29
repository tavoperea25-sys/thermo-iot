import axios from "axios";

import { obtenerToken, cerrarSesion } from "./auth";

// La URL del backend se arma de dos formas posibles:
//
// 1. Si defines VITE_API_URL (en un .env dentro de frontend/), se
//    usa esa, tal cual — pensado para cuando el sitio se despliegue
//    en un servidor real, con un dominio o IP fija distinto a "el
//    mismo equipo donde corre el navegador".
//
// 2. Si no la defines (el caso normal en desarrollo), se arma sola
//    usando el mismo host con el que cargaste la página. Así, si
//    entras desde tu PC como "localhost:5173", las peticiones van a
//    "localhost:3000"; si entras desde tu celular como
//    "192.168.1.50:5173" (misma red WiFi), van solas a
//    "192.168.1.50:3000" — sin tener que configurar nada a mano.

const apiBaseUrl =
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname}:3000/api`;

const api = axios.create({

    baseURL: apiBaseUrl

});

api.interceptors.request.use((config) => {

    const token = obtenerToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

// Rutas donde un 401 es una respuesta esperada del formulario
// (credenciales incorrectas), no una sesión vencida.
const RUTAS_401_ESPERADO = [
    "/auth/login",
    "/auth/register",
    "/auth/password"
];

api.interceptors.response.use(

    (response) => response,

    (error) => {

        const url = error.config?.url || "";
        const esEsperado = RUTAS_401_ESPERADO.some((r) => url.includes(r));

        const yaEstaEnLogin = window.location.pathname.startsWith("/login");

        if (error.response?.status === 401 && !esEsperado && !yaEstaEnLogin) {

            cerrarSesion();
            window.location.href = "/login?expirada=1";

        }

        return Promise.reject(error);

    }

);

export default api;
