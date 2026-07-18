import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";

import api from "../services/api";
import { guardarSesion, haySesion } from "../services/auth";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

const Login = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const [correo, setCorreo] = useState(
        localStorage.getItem("correo_recordado") || ""
    );

    const [password, setPassword] = useState("");
    const [recordarme, setRecordarme] = useState(
        Boolean(localStorage.getItem("correo_recordado"))
    );

    const [error, setError] = useState(
        searchParams.get("expirada")
            ? "Tu sesión expiró. Vuelve a iniciar sesión para continuar."
            : ""
    );

    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        // Si ya hay una sesión activa, no tiene sentido mostrar el login.
        // (Salvo que venga de una sesión recién expirada, ese caso ya
        // se limpió la sesión antes de llegar aquí).

        if (haySesion()) {
            navigate("/", { replace: true });
        }

    }, [navigate]);

    useEffect(() => {

        // Limpiamos el parámetro de la URL para que no reaparezca
        // el mensaje si el usuario recarga la página manualmente.

        if (searchParams.get("expirada")) {
            setSearchParams({}, { replace: true });
        }

    }, []);

    const manejarSubmit = async (evento) => {

        evento.preventDefault();

        setError("");
        setCargando(true);

        try {

            const respuesta = await api.post("/auth/login", {
                correo,
                password
            });

            guardarSesion(respuesta.data.token, respuesta.data.usuario);

            if (recordarme) {
                localStorage.setItem("correo_recordado", correo);
            } else {
                localStorage.removeItem("correo_recordado");
            }

            navigate("/", { replace: true });

        } catch (err) {

            const mensaje =
                err.response?.data?.mensaje ||
                "No se pudo conectar con el servidor";

            setError(mensaje);

        } finally {

            setCargando(false);

        }

    };

    return (

        <AuthLayout>

            <form className="auth-card" onSubmit={manejarSubmit}>

                <span className="auth-card-eyebrow">Accede a tu cuenta</span>
                <h2>Inicia sesión</h2>
                <span className="auth-card-subtitle">
                    Ingresa tus credenciales para continuar
                </span>

                {error && <div className="auth-error">{error}</div>}

                <label htmlFor="correo">Correo</label>
                <input
                    id="correo"
                    type="email"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoFocus
                />

                <label htmlFor="password">Contraseña</label>
                <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />

                <label className="auth-checkbox">
                    <input
                        type="checkbox"
                        checked={recordarme}
                        onChange={(e) => setRecordarme(e.target.checked)}
                    />
                    Recordar mi correo
                </label>

                <button type="submit" disabled={cargando}>
                    {cargando
                        ? (<><Loader2 size={16} className="spin" /> Ingresando...</>)
                        : (<><LogIn size={16} /> Ingresar</>)
                    }
                </button>

                <p className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Crea una</Link>
                </p>

            </form>

        </AuthLayout>

    );

};

export default Login;
