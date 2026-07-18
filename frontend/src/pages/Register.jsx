import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";

import api from "../services/api";
import { haySesion } from "../services/auth";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";

const Register = () => {

    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        if (haySesion()) {
            navigate("/", { replace: true });
        }

    }, [navigate]);

    const manejarSubmit = async (evento) => {

        evento.preventDefault();

        setError("");
        setExito("");

        if (password !== confirmar) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setCargando(true);

        try {

            await api.post("/auth/register", {
                nombre,
                correo,
                usuario,
                password
            });

            setExito("Cuenta creada. Redirigiendo al login...");

            setTimeout(() => navigate("/login", { replace: true }), 1200);

        } catch (err) {

            const mensaje =
                err.response?.data?.mensaje ||
                err.response?.data?.sqlMessage ||
                "No se pudo crear la cuenta";

            setError(mensaje);

        } finally {

            setCargando(false);

        }

    };

    return (

        <AuthLayout>

            <form className="auth-card" onSubmit={manejarSubmit}>

                <span className="auth-card-eyebrow">Comienza ahora</span>
                <h2>Crea tu cuenta</h2>
                <span className="auth-card-subtitle">
                    Regístrate para monitorear tu incubadora
                </span>

                {error && <div className="auth-error">{error}</div>}
                {exito && <div className="auth-success">{exito}</div>}

                <label htmlFor="nombre">Nombre completo</label>
                <input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    autoFocus
                />

                <label htmlFor="correo">Correo</label>
                <input
                    id="correo"
                    type="email"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                />

                <label htmlFor="usuario">Nombre de usuario</label>
                <input
                    id="usuario"
                    type="text"
                    placeholder="usuario123"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                />

                <div className="auth-campos-lado-a-lado">

                    <div>
                        <label htmlFor="password">Contraseña</label>
                        <PasswordInput
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <PasswordStrength password={password} />
                    </div>

                    <div>
                        <label htmlFor="confirmar">Confirmar</label>
                        <PasswordInput
                            id="confirmar"
                            placeholder="••••••••"
                            value={confirmar}
                            onChange={(e) => setConfirmar(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                </div>

                <button type="submit" disabled={cargando}>
                    {cargando
                        ? (<><Loader2 size={16} className="spin" /> Creando cuenta...</>)
                        : (<><UserPlus size={16} /> Crear cuenta</>)
                    }
                </button>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>

            </form>

        </AuthLayout>

    );

};

export default Register;
