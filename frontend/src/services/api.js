import axios from "axios";

import { obtenerToken, cerrarSesion } from "./auth";

const api = axios.create({

    baseURL: "http://localhost:3000/api"

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
